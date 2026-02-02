import { Router, Request, Response } from 'express';
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
    const days = parseInt(req.query.days as string) || 7;

    const eventTypeUri = `https://api.calendly.com/event_types/${eventTypeId}`;
    const availableTimes = await calendlyService.getAvailableTimesForNextDays(eventTypeUri, days);

    const groupedByDate: Record<string, Array<{ time: string; schedulingUrl: string }>> = {};
    
    for (const slot of availableTimes) {
      const date = new Date(slot.start_time);
      const dateKey = date.toISOString().split('T')[0];
      
      if (!groupedByDate[dateKey]) {
        groupedByDate[dateKey] = [];
      }
      
      groupedByDate[dateKey].push({
        time: date.toLocaleTimeString('fr-FR', { 
          hour: '2-digit', 
          minute: '2-digit',
          timeZone: 'Europe/Paris',
        }),
        schedulingUrl: slot.scheduling_url,
      });
    }

    res.json({
      success: true,
      availableTimes: groupedByDate,
      totalSlots: availableTimes.length,
    });
  } catch (error) {
    console.error('Calendly get available times error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get available times',
    });
  }
});

router.post('/webhook', async (req: Request, res: Response) => {
  try {
    const event = req.body;
    console.log('Calendly webhook received:', event.event);

    switch (event.event) {
      case 'invitee.created':
        console.log('New booking created:', event.payload);
        break;
      case 'invitee.canceled':
        console.log('Booking canceled:', event.payload);
        break;
      default:
        console.log('Unknown event type:', event.event);
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Calendly webhook error:', error);
    res.status(500).json({ success: false });
  }
});

export default router;
