import { Router, Request, Response } from 'express';
import { createHmac, timingSafeEqual } from 'crypto';
import { calendlyService } from './service';

const router = Router();

router.get('/status', (_req: Request, res: Response) => {
  const configured = calendlyService.isConfigured();
  res.json({
    configured,
    message: configured 
      ? 'Calendly is configured and ready' 
      : 'Calendly API key is not configured',
  });
});

router.get('/user', async (_req: Request, res: Response) => {
  try {
    if (!calendlyService.isConfigured()) {
      return res.status(503).json({
        success: false,
        error: 'Calendly is not configured',
      });
    }

    const user = await calendlyService.getCurrentUser();
    res.json({
      success: true,
      user: {
        name: user.name,
        email: user.email,
        schedulingUrl: user.scheduling_url,
        timezone: user.timezone,
      },
    });
  } catch (error) {
    console.error('Calendly get user error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get user',
    });
  }
});

router.get('/event-types', async (_req: Request, res: Response) => {
  try {
    if (!calendlyService.isConfigured()) {
      return res.status(503).json({
        success: false,
        error: 'Calendly is not configured',
      });
    }

    const eventTypes = await calendlyService.getEventTypes();
    res.json({
      success: true,
      eventTypes: eventTypes.map(et => ({
        uri: et.uri,
        name: et.name,
        slug: et.slug,
        duration: et.duration,
        schedulingUrl: et.scheduling_url,
        description: et.description_plain,
        color: et.color,
      })),
    });
  } catch (error) {
    console.error('Calendly get event types error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get event types',
    });
  }
});

router.get('/available-times/:eventTypeId', async (req: Request, res: Response) => {
  try {
    if (!calendlyService.isConfigured()) {
      return res.status(503).json({
        success: false,
        error: 'Calendly is not configured',
      });
    }

    const { eventTypeId } = req.params;
    const { start_date, end_date, timezone } = req.query;

    if (!start_date || !end_date) {
      return res.status(400).json({
        success: false,
        error: 'start_date and end_date query parameters are required (YYYY-MM-DD)',
      });
    }

    const startStr = String(start_date);
    const endStr = String(end_date);
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(startStr) || !dateRegex.test(endStr)) {
      return res.status(400).json({
        success: false,
        error: 'Dates must be in YYYY-MM-DD format',
      });
    }

    const startD = new Date(startStr);
    const endD = new Date(endStr);
    const rangeDays = (endD.getTime() - startD.getTime()) / (1000 * 60 * 60 * 24);
    if (rangeDays < 0 || rangeDays > 31) {
      return res.status(400).json({
        success: false,
        error: 'Date range must be between 0 and 31 days',
      });
    }

    const eventTypeUri = `https://api.calendly.com/event_types/${eventTypeId}`;
    const startISO = new Date(startStr + 'T00:00:00Z').toISOString();
    const endISO = new Date(endStr + 'T23:59:59Z').toISOString();

    const availableTimes = await calendlyService.getAvailableTimesForDateRange(
      eventTypeUri,
      startISO,
      endISO
    );

    const userTimezone = timezone ? String(timezone) : 'UTC';

    const groupedByDate: Record<string, Array<{ time: string; schedulingUrl: string }>> = {};
    
    for (const slot of availableTimes) {
      const date = new Date(slot.start_time);
      
      const dateFormatted = date.toLocaleDateString('en-CA', { timeZone: userTimezone });
      const timeFormatted = date.toLocaleTimeString('fr-FR', { 
        hour: '2-digit', 
        minute: '2-digit',
        timeZone: userTimezone,
      });
      
      if (!groupedByDate[dateFormatted]) {
        groupedByDate[dateFormatted] = [];
      }
      
      groupedByDate[dateFormatted].push({
        time: timeFormatted,
        schedulingUrl: slot.scheduling_url,
      });
    }

    res.json({
      success: true,
      availableTimes: groupedByDate,
      totalSlots: availableTimes.length,
      timezone: userTimezone,
    });
  } catch (error) {
    console.error('Calendly get available times error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get available times',
    });
  }
});

function verifyCalendlySignature(payload: string, signatureHeader: string, signingKey: string): boolean {
  try {
    const parts = signatureHeader.split(',');
    const timestampPart = parts.find(p => p.startsWith('t='));
    const signaturePart = parts.find(p => p.startsWith('v1='));

    if (!timestampPart || !signaturePart) return false;

    const timestamp = timestampPart.slice(2);
    const expectedSig = signaturePart.slice(3);

    const tolerance = 3 * 60 * 1000;
    const now = Date.now();
    const webhookTime = parseInt(timestamp, 10) * 1000;
    if (Math.abs(now - webhookTime) > tolerance) return false;

    const signedPayload = `${timestamp}.${payload}`;
    const computedSig = createHmac('sha256', signingKey).update(signedPayload).digest('hex');

    const expectedBuf = Buffer.from(expectedSig, 'hex');
    const computedBuf = Buffer.from(computedSig, 'hex');
    if (expectedBuf.length !== computedBuf.length) return false;

    return timingSafeEqual(expectedBuf, computedBuf);
  } catch {
    return false;
  }
}

router.post('/webhook', async (req: Request, res: Response) => {
  try {
    const signingKey = process.env.CALENDLY_WEBHOOK_SIGNING_KEY;
    const signatureHeader = req.headers['calendly-webhook-signature'] as string | undefined;

    if (!signingKey) {
      console.warn('Calendly webhook: CALENDLY_WEBHOOK_SIGNING_KEY not configured, rejecting');
      return res.status(503).json({ success: false, error: 'Webhook signing not configured' });
    }

    if (!signatureHeader) {
      console.warn('Calendly webhook: missing signature header');
      return res.status(401).json({ success: false, error: 'Missing signature' });
    }

    const rawBody = req.rawBody instanceof Buffer ? req.rawBody.toString('utf8') : JSON.stringify(req.body);
    if (!verifyCalendlySignature(rawBody, signatureHeader, signingKey)) {
      console.warn('Calendly webhook: invalid signature');
      return res.status(401).json({ success: false, error: 'Invalid signature' });
    }

    const event = req.body;
    console.log('Calendly webhook received:', event.event);

    switch (event.event) {
      case 'invitee.created':
        console.log('New booking created:', JSON.stringify(event.payload?.name), JSON.stringify(event.payload?.email));
        break;
      case 'invitee.canceled':
        console.log('Booking canceled:', JSON.stringify(event.payload?.name));
        break;
      default:
        console.log('Unknown Calendly event type:', event.event);
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Calendly webhook error:', error);
    res.status(500).json({ success: false });
  }
});

export default router;
