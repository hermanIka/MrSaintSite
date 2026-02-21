import type {
  CalendlyUser,
  CalendlyEventType,
  CalendlyAvailableTime,
  GetAvailableTimesParams,
} from './types';

const CALENDLY_API_URL = 'https://api.calendly.com';

class CalendlyService {
  private apiKey: string | null = null;
  private userUri: string | null = null;

  isConfigured(): boolean {
    return !!process.env.CALENDLY_API_KEY;
  }

  private getHeaders(): Record<string, string> {
    if (!process.env.CALENDLY_API_KEY) {
      throw new Error('CALENDLY_API_KEY is not configured');
    }
    return {
      'Authorization': `Bearer ${process.env.CALENDLY_API_KEY}`,
      'Content-Type': 'application/json',
    };
  }

  async getCurrentUser(): Promise<CalendlyUser> {
    const response = await fetch(`${CALENDLY_API_URL}/users/me`, {
      method: 'GET',
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Failed to get current user: ${error}`);
    }

    const data = await response.json();
    this.userUri = data.resource.uri;
    return data.resource;
  }

  async getEventTypes(): Promise<CalendlyEventType[]> {
    if (!this.userUri) {
      await this.getCurrentUser();
    }

    const response = await fetch(
      `${CALENDLY_API_URL}/event_types?user=${encodeURIComponent(this.userUri!)}`,
      {
        method: 'GET',
        headers: this.getHeaders(),
      }
    );

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Failed to get event types: ${error}`);
    }

    const data = await response.json();
    return data.collection.filter((et: CalendlyEventType) => et.active);
  }

  async getAvailableTimes(params: GetAvailableTimesParams): Promise<CalendlyAvailableTime[]> {
    const { eventTypeUri, startTime, endTime } = params;

    const url = new URL(`${CALENDLY_API_URL}/event_type_available_times`);
    url.searchParams.set('event_type', eventTypeUri);
    url.searchParams.set('start_time', startTime);
    url.searchParams.set('end_time', endTime);

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Failed to get available times: ${error}`);
    }

    const data = await response.json();
    return data.collection;
  }

  async getAvailableTimesForDateRange(
    eventTypeUri: string,
    startDate: string,
    endDate: string
  ): Promise<CalendlyAvailableTime[]> {
    const now = new Date();
    let start = new Date(startDate);
    if (start < now) {
      start = new Date(now.getTime() + 5 * 60 * 1000);
    }

    const end = new Date(endDate);
    const maxEnd = new Date(start.getTime() + 60 * 24 * 60 * 60 * 1000);
    if (end > maxEnd) {
      end.setTime(maxEnd.getTime());
    }

    const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;
    const allSlots: CalendlyAvailableTime[] = [];
    let chunkStart = new Date(start);

    while (chunkStart < end) {
      const chunkEnd = new Date(Math.min(chunkStart.getTime() + SEVEN_DAYS_MS, end.getTime()));

      try {
        const slots = await this.getAvailableTimes({
          eventTypeUri,
          startTime: chunkStart.toISOString(),
          endTime: chunkEnd.toISOString(),
        });
        allSlots.push(...slots);
      } catch (err) {
        console.error(`Failed to fetch slots for chunk ${chunkStart.toISOString()} - ${chunkEnd.toISOString()}:`, err);
      }

      chunkStart = new Date(chunkEnd);
    }

    return allSlots;
  }

  getSchedulingUrl(eventType: CalendlyEventType): string {
    return eventType.scheduling_url;
  }
}

export const calendlyService = new CalendlyService();
