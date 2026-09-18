import { DEFAULT_DEVICE_SETTINGS, generateInitialMeetings } from './mock-data';
import {
  DeviceSettings,
  Meeting,
  MeetingMessage,
  MeetingParticipant,
  MeetingTask,
} from './types';

const STORAGE_KEYS = {
  MEETINGS: 'codin_meet_meetings_v1',
  DEVICES: 'codin_meet_devices_v1',
};

export function loadMeetings(): Meeting[] {
  if (typeof window === 'undefined') return generateInitialMeetings();
  try {
    const saved = localStorage.getItem(STORAGE_KEYS.MEETINGS);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (e) {
    console.error('Failed to load meetings', e);
  }
  return generateInitialMeetings();
}

export function saveMeetings(meetings: Meeting[]) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEYS.MEETINGS, JSON.stringify(meetings));
  } catch (e) {
    console.error('Failed to save meetings', e);
  }
}

export function loadDeviceSettings(): DeviceSettings {
  if (typeof window === 'undefined') return DEFAULT_DEVICE_SETTINGS;
  try {
    const saved = localStorage.getItem(STORAGE_KEYS.DEVICES);
    if (saved) return JSON.parse(saved);
  } catch (e) {
    console.error('Failed to load device settings', e);
  }
  return DEFAULT_DEVICE_SETTINGS;
}

export function saveDeviceSettings(settings: DeviceSettings) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEYS.DEVICES, JSON.stringify(settings));
  } catch (e) {
    console.error('Failed to save device settings', e);
  }
}

export function generateInstantMeeting(organizer: MeetingParticipant): Meeting {
  const codePart1 = Math.random().toString(36).substring(2, 5);
  const codePart2 = Math.random().toString(36).substring(2, 6);
  const codePart3 = Math.random().toString(36).substring(2, 5);
  const meetingCode = `${codePart1}-${codePart2}-${codePart3}`;
  const now = new Date();
  const endTime = new Date(now.getTime() + 45 * 60000);

  return {
    id: `meet-instant-${Date.now()}`,
    title: `Instant Meeting (${organizer.name.split(' ')[0]})`,
    description: 'Instant ad-hoc collaboration session.',
    organizerId: organizer.id,
    organizerName: organizer.name,
    organizerEmail: organizer.email,
    provider: 'google_meet',
    providerMeetingId: `gmeet-${Date.now()}`,
    meetingCode,
    meetingUrl: `https://meet.google.com/${meetingCode}`,
    scheduledStart: now.toISOString(),
    scheduledEnd: endTime.toISOString(),
    actualStartTime: now.toISOString(),
    timezone: 'America/New_York (EDT)',
    status: 'in_progress',
    participants: [organizer],
    messages: [
      {
        id: `msg-${Date.now()}`,
        meetingId: `meet-instant-${Date.now()}`,
        senderId: 'system',
        senderName: 'Codin Meet',
        content: 'Welcome to your meeting! You can invite participants, take notes, and share files.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ],
    files: [],
    tasks: [],
    notes: {
      id: `notes-${Date.now()}`,
      meetingId: `meet-instant-${Date.now()}`,
      agendaItems: ['1. Quick Sync & Alignment'],
      notesContent: '',
      decisions: [],
      updatedAt: 'Just now',
    },
    createdAt: now.toISOString(),
    updatedAt: now.toISOString(),
  };
}
