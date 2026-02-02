export interface CalendlyUser {
  uri: string;
  name: string;
  slug: string;
  email: string;
  scheduling_url: string;
  timezone: string;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface CalendlyEventType {
  uri: string;
  name: string;
  active: boolean;
  booking_method: string;
  slug: string;
  scheduling_url: string;
  duration: number;
  kind: string;
  type: string;
  color: string;
  created_at: string;
  updated_at: string;
  description_plain: string | null;
  description_html: string | null;
}

export interface CalendlyAvailableTime {
  status: string;
  invitees_remaining: number;
  start_time: string;
  scheduling_url: string;
}

export interface CalendlyScheduledEvent {
  uri: string;
  name: string;
  status: string;
  start_time: string;
  end_time: string;
  event_type: string;
  location: {
    type: string;
    location?: string;
  };
  invitees_counter: {
    total: number;
    active: number;
    limit: number;
  };
  created_at: string;
  updated_at: string;
  event_memberships: Array<{
    user: string;
  }>;
}

export interface CalendlyInvitee {
  uri: string;
  email: string;
  name: string;
  status: string;
  questions_and_answers: Array<{
    question: string;
    answer: string;
  }>;
  timezone: string;
  event: string;
  created_at: string;
  updated_at: string;
  cancel_url: string;
  reschedule_url: string;
}

export interface GetAvailableTimesParams {
  eventTypeUri: string;
  startTime: string;
  endTime: string;
}

export interface CalendlyConfig {
  apiKey: string;
  baseUrl: string;
}
