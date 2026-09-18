export type CalendarCategory = 'personal' | 'shared' | 'other' | 'external';

export type CalendarColor = {
  id: string;
  name: string;
  bg: string;
  border: string;
  text: string;
  dot: string;
};

export type CalendarItem = {
  id: string;
  name: string;
  color: CalendarColor;
  category: CalendarCategory;
  description?: string;
  isVisible: boolean;
  isDefault?: boolean;
  isReadOnly?: boolean;
  ownerName: string;
  ownerEmail: string;
  sharedWithCount?: number;
  syncSource?: 'google' | 'outlook' | 'apple' | 'local';
  lastSyncedAt?: string;
};

export type ParticipantRole = 'organizer' | 'required' | 'optional';
export type ParticipantStatus = 'accepted' | 'tentative' | 'declined' | 'pending';

export type Participant = {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: ParticipantRole;
  status: ParticipantStatus;
  jobTitle?: string;
  department?: string;
};

export type RecurrenceFrequency = 'none' | 'daily' | 'weekly' | 'biweekly' | 'monthly' | 'yearly' | 'custom';

export type RecurrenceRule = {
  frequency: RecurrenceFrequency;
  interval?: number;
  daysOfWeek?: number[]; // 0 = Sun, 1 = Mon ...
  endDate?: string;
  occurrences?: number;
};

export type ReminderMinutes = 0 | 5 | 10 | 15 | 30 | 60 | 1440; // 1440 = 1 day

export type EventAttachment = {
  id: string;
  name: string;
  size: string;
  type: string;
  url?: string;
};

export type ConnectedTask = {
  id: string;
  title: string;
  completed: boolean;
  dueDate?: string;
  assignee?: string;
};

export type ConnectedEmail = {
  id: string;
  subject: string;
  sender: string;
  snippet: string;
  date: string;
};

export type ConnectedChat = {
  channelId: string;
  channelName: string;
  lastMessage: string;
  unreadCount?: number;
};

export type CalendarEvent = {
  id: string;
  calendarId: string;
  title: string;
  description?: string;
  location?: string;
  meetingUrl?: string;
  meetingProvider?: 'meet' | 'zoom' | 'teams' | 'custom';
  
  // Date & Time (ISO Strings: YYYY-MM-DD or YYYY-MM-DDTHH:mm)
  startDate: string; // e.g. "2026-08-24"
  startTime?: string; // e.g. "09:00"
  endDate: string;   // e.g. "2026-08-24"
  endTime?: string;   // e.g. "10:00"
  allDay: boolean;
  timezone: string;

  // Recurrence
  recurrence?: RecurrenceRule;
  recurringEventId?: string;

  // Attendees & Status
  organizer: Participant;
  participants: Participant[];
  currentUserStatus: ParticipantStatus;

  // Metadata
  reminders: ReminderMinutes[];
  availability: 'busy' | 'free' | 'tentative' | 'oof';
  visibility: 'public' | 'private' | 'confidential';

  // Platform Integrations
  attachments: EventAttachment[];
  tasks: ConnectedTask[];
  relatedEmail?: ConnectedEmail;
  relatedChat?: ConnectedChat;
  aiNotes?: {
    summary?: string;
    agenda?: string[];
    actionItems?: string[];
    preparationTips?: string[];
  };

  createdAt: string;
  updatedAt: string;
};

export type CalendarViewType = 'month' | 'week' | 'day' | 'year' | 'agenda';

export type ExternalCalendarSync = {
  id: string;
  provider: 'google' | 'outlook' | 'apple';
  email: string;
  name: string;
  status: 'connected' | 'syncing' | 'error' | 'disconnected';
  lastSynced: string;
  autoSyncIntervalMinutes: number;
  selectedCalendars: string[];
};

export type AvailabilitySlot = {
  date: string;
  startTime: string;
  endTime: string;
  score: number; // 100 = all free, 50 = tentative, 0 = conflict
  conflicts: { participantName: string; status: 'busy' | 'tentative' | 'oof' }[];
};
