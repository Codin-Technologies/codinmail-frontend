export type MeetingProviderType = 'google_meet' | 'codin' | 'teams' | 'zoom';

export type MeetingStatus = 'scheduled' | 'upcoming' | 'waiting' | 'in_progress' | 'ended' | 'cancelled';

export type ParticipantRole = 'host' | 'co_host' | 'participant' | 'guest';
export type ParticipantResponseStatus = 'accepted' | 'tentative' | 'declined' | 'pending';

export type MeetingParticipant = {
  id: string;
  userId?: string;
  name: string;
  email: string;
  avatar?: string;
  role: ParticipantRole;
  responseStatus: ParticipantResponseStatus;
  joinedAt?: string;
  leftAt?: string;
  isMuted: boolean;
  isVideoOn: boolean;
  isHandRaised?: boolean;
  isScreenSharing?: boolean;
  isSpeaking?: boolean;
  audioLevel?: number; // 0 to 100
  connectionQuality?: 'good' | 'fair' | 'poor';
};

export type MeetingMessage = {
  id: string;
  meetingId: string;
  senderId: string;
  senderName: string;
  senderAvatar?: string;
  content: string;
  timestamp: string;
  attachments?: {
    id: string;
    name: string;
    size: string;
    type: string;
    url?: string;
  }[];
};

export type MeetingFile = {
  id: string;
  meetingId: string;
  name: string;
  size: string;
  type: string;
  uploadedBy: string;
  uploadedAt: string;
  url?: string;
};

export type MeetingTask = {
  id: string;
  meetingId: string;
  title: string;
  completed: boolean;
  assigneeName?: string;
  assigneeAvatar?: string;
  dueDate?: string;
  priority?: 'low' | 'medium' | 'high';
};

export type MeetingNote = {
  id: string;
  meetingId: string;
  agendaItems: string[];
  notesContent: string;
  decisions: string[];
  updatedAt: string;
};

export type MeetingAISummary = {
  summary: string;
  keyDecisions: string[];
  extractedActionItems: {
    title: string;
    assignee?: string;
    dueDate?: string;
  }[];
  followUpEmailDraft?: {
    subject: string;
    recipients: string[];
    body: string;
  };
  sentiment?: 'productive' | 'collaborative' | 'inconclusive';
  topicsDiscussed?: string[];
};

export type MeetingRecording = {
  id: string;
  meetingId: string;
  durationMinutes: number;
  recordedAt: string;
  size: string;
  videoUrl?: string;
  status: 'recording' | 'processing' | 'ready';
};

export type Meeting = {
  id: string;
  title: string;
  description?: string;
  organizerId: string;
  organizerName: string;
  organizerEmail: string;
  provider: MeetingProviderType;
  providerMeetingId: string;
  meetingCode: string; // e.g. "abc-defg-hij"
  meetingUrl: string;
  calendarEventId?: string;
  scheduledStart: string; // ISO date-time or YYYY-MM-DDTHH:mm
  scheduledEnd: string;
  actualStartTime?: string;
  actualEndTime?: string;
  durationMinutes?: number;
  timezone: string;
  status: MeetingStatus;
  participants: MeetingParticipant[];
  messages: MeetingMessage[];
  files: MeetingFile[];
  tasks: MeetingTask[];
  notes?: MeetingNote;
  aiSummary?: MeetingAISummary;
  recording?: MeetingRecording;
  isPasswordProtected?: boolean;
  password?: string;
  allowGuests?: boolean;
  createdAt: string;
  updatedAt: string;
};

export type DeviceSettings = {
  microphoneId: string;
  cameraId: string;
  speakerId: string;
  isMicMuted: boolean;
  isVideoOff: boolean;
  isNoiseSuppressionEnabled: boolean;
  isVirtualBackgroundEnabled: boolean;
  virtualBackgroundStyle?: 'blur' | 'office' | 'studio' | 'gradient';
  mirrorCamera: boolean;
};

export type MeetingLayoutMode = 'grid' | 'speaker' | 'presentation';
export type MeetingActivePanel = 'none' | 'participants' | 'chat' | 'files' | 'notes' | 'tasks' | 'ai' | 'info' | 'settings';
