import {
  formatDateToISO,
  parseISODate,
} from './date-utils';
import {
  CALENDAR_COLORS,
  INITIAL_CALENDARS,
  INITIAL_EXTERNAL_SYNCS,
  MOCK_PARTICIPANTS,
  generateInitialEvents,
} from './mock-data';
import {
  AvailabilitySlot,
  CalendarEvent,
  CalendarItem,
  ExternalCalendarSync,
  Participant,
} from './types';

const STORAGE_KEYS = {
  EVENTS: 'codin_calendar_events_v2',
  CALENDARS: 'codin_calendar_calendars_v2',
  SYNCS: 'codin_calendar_syncs_v2',
};

export function loadCalendars(): CalendarItem[] {
  if (typeof window === 'undefined') return INITIAL_CALENDARS;
  try {
    const saved = localStorage.getItem(STORAGE_KEYS.CALENDARS);
    if (saved) return JSON.parse(saved);
  } catch (e) {
    console.error('Failed to load calendars', e);
  }
  return INITIAL_CALENDARS;
}

export function saveCalendars(calendars: CalendarItem[]) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEYS.CALENDARS, JSON.stringify(calendars));
  } catch (e) {
    console.error('Failed to save calendars', e);
  }
}

export function loadEvents(): CalendarEvent[] {
  if (typeof window === 'undefined') return generateInitialEvents();
  try {
    const saved = localStorage.getItem(STORAGE_KEYS.EVENTS);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (e) {
    console.error('Failed to load events', e);
  }
  return generateInitialEvents();
}

export function saveEvents(events: CalendarEvent[]) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEYS.EVENTS, JSON.stringify(events));
  } catch (e) {
    console.error('Failed to save events', e);
  }
}

export function loadExternalSyncs(): ExternalCalendarSync[] {
  if (typeof window === 'undefined') return INITIAL_EXTERNAL_SYNCS;
  try {
    const saved = localStorage.getItem(STORAGE_KEYS.SYNCS);
    if (saved) return JSON.parse(saved);
  } catch (e) {
    console.error('Failed to load syncs', e);
  }
  return INITIAL_EXTERNAL_SYNCS;
}

export function saveExternalSyncs(syncs: ExternalCalendarSync[]) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEYS.SYNCS, JSON.stringify(syncs));
  } catch (e) {
    console.error('Failed to save syncs', e);
  }
}

// Conflict Detection Engine
export type ConflictResult = {
  hasConflict: boolean;
  conflictingEvents: CalendarEvent[];
  warningMessage?: string;
};

export function checkEventConflict(
  candidate: {
    id?: string;
    startDate: string;
    startTime?: string;
    endDate: string;
    endTime?: string;
    allDay?: boolean;
  },
  allEvents: CalendarEvent[]
): ConflictResult {
  if (candidate.allDay || !candidate.startTime || !candidate.endTime) {
    return { hasConflict: false, conflictingEvents: [] };
  }

  const [cStartH, cStartM] = candidate.startTime.split(':').map(Number);
  const [cEndH, cEndM] = candidate.endTime.split(':').map(Number);
  const cStartMins = cStartH * 60 + cStartM;
  const cEndMins = cEndH * 60 + cEndM;

  const conflicts = allEvents.filter((event) => {
    if (candidate.id && event.id === candidate.id) return false;
    if (event.allDay || !event.startTime || !event.endTime) return false;
    if (event.startDate !== candidate.startDate) return false;
    if (event.availability === 'free') return false;

    const [eStartH, eStartM] = event.startTime.split(':').map(Number);
    const [eEndH, eEndM] = event.endTime.split(':').map(Number);
    const eStartMins = eStartH * 60 + eStartM;
    const eEndMins = eEndH * 60 + eEndM;

    // Overlap condition: startA < endB && endA > startB
    return cStartMins < eEndMins && cEndMins > eStartMins;
  });

  return {
    hasConflict: conflicts.length > 0,
    conflictingEvents: conflicts,
    warningMessage:
      conflicts.length > 0
        ? `Schedule conflict: You already have "${conflicts[0].title}" (${conflicts[0].startTime}–${conflicts[0].endTime}).`
        : undefined,
  };
}

// Natural Language AI Event Parser
export type ParsedNaturalLanguageEvent = {
  title: string;
  startDate: string;
  startTime: string;
  endDate: string;
  endTime: string;
  durationMinutes: number;
  participants: Participant[];
  calendarId: string;
  location?: string;
  confidence: number;
  explanation: string;
};

export function parseNaturalLanguageInput(
  input: string,
  referenceDate: Date = new Date(2026, 7, 24) // Aug 24, 2026 reference default
): ParsedNaturalLanguageEvent {
  const text = input.trim();
  const lower = text.toLowerCase();

  let title = 'New Meeting';
  let targetDate = new Date(referenceDate.getTime());
  let startTime = '14:00';
  let durationMinutes = 60;
  const detectedParticipants: Participant[] = [MOCK_PARTICIPANTS[0]]; // Self
  let calendarId = 'cal-work';
  let location: string | undefined;

  // 1. Participant detection from known mock contacts
  MOCK_PARTICIPANTS.slice(1).forEach((p) => {
    const firstName = p.name.split(' ')[0].toLowerCase();
    const fullName = p.name.toLowerCase();
    if (lower.includes(firstName) || lower.includes(fullName)) {
      if (!detectedParticipants.some((dp) => dp.id === p.id)) {
        detectedParticipants.push(p);
      }
    }
  });

  // 2. Relative date detection
  if (lower.includes('tomorrow')) {
    targetDate.setDate(targetDate.getDate() + 1);
  } else if (lower.includes('next week')) {
    targetDate.setDate(targetDate.getDate() + 7);
  } else if (lower.includes('next monday')) {
    const day = targetDate.getDay();
    const diff = (1 + 7 - day) % 7 || 7;
    targetDate.setDate(targetDate.getDate() + diff);
  } else if (lower.includes('next tuesday') || lower.includes('tuesday')) {
    const day = targetDate.getDay();
    const diff = (2 + 7 - day) % 7 || 7;
    targetDate.setDate(targetDate.getDate() + diff);
  } else if (lower.includes('next wednesday') || lower.includes('wednesday')) {
    const day = targetDate.getDay();
    const diff = (3 + 7 - day) % 7 || 7;
    targetDate.setDate(targetDate.getDate() + diff);
  } else if (lower.includes('next thursday') || lower.includes('thursday')) {
    const day = targetDate.getDay();
    const diff = (4 + 7 - day) % 7 || 7;
    targetDate.setDate(targetDate.getDate() + diff);
  } else if (lower.includes('next friday') || lower.includes('friday')) {
    const day = targetDate.getDay();
    const diff = (5 + 7 - day) % 7 || 7;
    targetDate.setDate(targetDate.getDate() + diff);
  }

  // 3. Time detection (e.g., 3pm, 3:30pm, 15:00, 10am, at 9)
  const timeRegex = /(?:at\s+)?(\d{1,2})(?::(\d{2}))?\s*(am|pm)?/i;
  const matchTime = text.match(timeRegex);
  if (matchTime) {
    let hour = parseInt(matchTime[1], 10);
    const minute = matchTime[2] ? parseInt(matchTime[2], 10) : 0;
    const meridian = matchTime[3]?.toLowerCase();

    if (meridian === 'pm' && hour < 12) hour += 12;
    if (meridian === 'am' && hour === 12) hour = 0;
    if (!meridian && hour >= 1 && hour <= 6) hour += 12; // Infer afternoon for 1-6

    if (hour >= 0 && hour <= 23 && minute >= 0 && minute <= 59) {
      startTime = `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
    }
  }

  // 4. Duration detection (e.g., for 45 mins, for one hour, 30m, 2 hours)
  if (lower.includes('30 min') || lower.includes('30m') || lower.includes('half hour')) {
    durationMinutes = 30;
  } else if (lower.includes('45 min') || lower.includes('45m')) {
    durationMinutes = 45;
  } else if (lower.includes('2 hours') || lower.includes('2h') || lower.includes('120 min')) {
    durationMinutes = 120;
  } else if (lower.includes('15 min') || lower.includes('15m')) {
    durationMinutes = 15;
  } else if (lower.includes('1 hour') || lower.includes('one hour') || lower.includes('60 min')) {
    durationMinutes = 60;
  }

  // 5. Title cleanup
  let cleanTitle = text
    .replace(/(?:tomorrow|next week|next monday|next tuesday|next wednesday|next thursday|next friday|today)/gi, '')
    .replace(/(?:at\s+\d{1,2}(?::\d{2})?\s*(?:am|pm)?|\d{1,2}\s*(?:am|pm))/gi, '')
    .replace(/(?:for\s+(?:\d+|one|half|two)\s*(?:hour|hours|min|mins|minutes|m))/gi, '')
    .replace(/\s+/g, ' ')
    .trim();

  if (cleanTitle.length > 2) {
    // Capitalize first letter
    title = cleanTitle.charAt(0).toUpperCase() + cleanTitle.slice(1);
  } else if (detectedParticipants.length > 1) {
    title = `Sync with ${detectedParticipants.slice(1).map((p) => p.name.split(' ')[0]).join(' & ')}`;
  }

  // Calculate end time
  const [sh, sm] = startTime.split(':').map(Number);
  const totalEndMins = sh * 60 + sm + durationMinutes;
  const endH = Math.floor(totalEndMins / 60) % 24;
  const endM = totalEndMins % 60;
  const endTime = `${String(endH).padStart(2, '0')}:${String(endM).padStart(2, '0')}`;
  const startDate = formatDateToISO(targetDate);
  const endDate = startDate;

  if (lower.includes('zoom') || lower.includes('meet') || lower.includes('call')) {
    location = 'Google Meet (Auto-generated link)';
  } else if (lower.includes('office') || lower.includes('room') || lower.includes('studio')) {
    location = 'Codin HQ - Room 4B';
  }

  return {
    title,
    startDate,
    startTime,
    endDate,
    endTime,
    durationMinutes,
    participants: detectedParticipants,
    calendarId,
    location,
    confidence: 0.94,
    explanation: `Interpreted "${title}" on ${startDate} from ${startTime} to ${endTime} (${durationMinutes}m) with ${detectedParticipants.length} attendees.`,
  };
}

// Scheduling Assistant: Multi-Participant Availability Solver
export function solveParticipantAvailability(
  participantIds: string[],
  dates: string[],
  durationMinutes: number = 60,
  allEvents: CalendarEvent[]
): AvailabilitySlot[] {
  const candidateSlots: AvailabilitySlot[] = [];
  const hoursToCheck = [9, 10, 11, 13, 14, 15, 16, 17];

  dates.forEach((dateStr) => {
    hoursToCheck.forEach((startHour) => {
      const startTime = `${String(startHour).padStart(2, '0')}:00`;
      const endTotalMins = startHour * 60 + durationMinutes;
      const endH = Math.floor(endTotalMins / 60);
      const endM = endTotalMins % 60;
      const endTime = `${String(endH).padStart(2, '0')}:${String(endM).padStart(2, '0')}`;

      // Check conflicts for each participant on this slot
      const conflicts: { participantName: string; status: 'busy' | 'tentative' | 'oof' }[] = [];

      participantIds.forEach((pid) => {
        const participant = MOCK_PARTICIPANTS.find((p) => p.id === pid);
        const pName = participant?.name ?? 'Unknown';

        // Check if participant is in any existing event at this time
        const hasOverlap = allEvents.some((event) => {
          if (event.startDate !== dateStr) return false;
          if (event.allDay) return false;
          if (!event.startTime || !event.endTime) return false;

          const isAttendee =
            event.organizer.id === pid || event.participants.some((p) => p.id === pid);
          if (!isAttendee) return false;

          const [eSh, eSm] = event.startTime.split(':').map(Number);
          const [eEh, eEm] = event.endTime.split(':').map(Number);
          const eStartMins = eSh * 60 + eSm;
          const eEndMins = eEh * 60 + eEm;
          const sStartMins = startHour * 60;
          const sEndMins = endTotalMins;

          return sStartMins < eEndMins && sEndMins > eStartMins;
        });

        if (hasOverlap) {
          conflicts.push({ participantName: pName, status: 'busy' });
        }
      });

      let score = 100;
      if (conflicts.length === 1) score = 65;
      else if (conflicts.length > 1) score = 20;

      candidateSlots.push({
        date: dateStr,
        startTime,
        endTime,
        score,
        conflicts,
      });
    });
  });

  // Sort: highest score first, then earliest date & time
  return candidateSlots.sort((a, b) => b.score - a.score || a.date.localeCompare(b.date) || a.startTime.localeCompare(b.startTime));
}
