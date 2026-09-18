import { Meeting, MeetingParticipant, MeetingProviderType, MeetingStatus } from './types';

export type CreateMeetingParams = {
  title: string;
  description?: string;
  scheduledStart: string;
  scheduledEnd: string;
  organizerEmail: string;
  organizerName: string;
  participants: { name: string; email: string }[];
};

export type ProviderMeetingResult = {
  providerMeetingId: string;
  meetingCode: string;
  meetingUrl: string;
  provider: MeetingProviderType;
  providerDetails: {
    sipUri?: string;
    dialInNumber?: string;
    pin?: string;
  };
};

export type JoinMeetingResult = {
  success: boolean;
  meetingUrl: string;
  token?: string;
  iceServers?: any[];
  error?: string;
};

export interface IMeetingProvider {
  readonly providerType: MeetingProviderType;
  readonly displayName: string;
  createMeeting(params: CreateMeetingParams): Promise<ProviderMeetingResult>;
  joinMeeting(meetingId: string, participant: MeetingParticipant): Promise<JoinMeetingResult>;
  endMeeting(meetingId: string): Promise<boolean>;
  getMeetingStatus(meetingId: string): Promise<MeetingStatus>;
}

// Google Meet Adapter (Infrastructure Provider)
export class GoogleMeetProviderAdapter implements IMeetingProvider {
  readonly providerType: MeetingProviderType = 'google_meet';
  readonly displayName: string = 'Google Meet';

  async createMeeting(params: CreateMeetingParams): Promise<ProviderMeetingResult> {
    // Generate formatted 10-char Google Meet code (xxx-yyyy-zzz)
    const part1 = Math.random().toString(36).substring(2, 5);
    const part2 = Math.random().toString(36).substring(2, 6);
    const part3 = Math.random().toString(36).substring(2, 5);
    const meetingCode = `${part1}-${part2}-${part3}`;
    const meetingUrl = `https://meet.google.com/${meetingCode}`;

    return {
      providerMeetingId: `gmeet-${Date.now()}`,
      meetingCode,
      meetingUrl,
      provider: 'google_meet',
      providerDetails: {
        dialInNumber: '+1 415-555-0132',
        pin: `${Math.floor(100000 + Math.random() * 900000)}#`,
      },
    };
  }

  async joinMeeting(meetingId: string, participant: MeetingParticipant): Promise<JoinMeetingResult> {
    return {
      success: true,
      meetingUrl: `https://meet.google.com/${meetingId}`,
      token: `gmeet-jwt-${Date.now()}`,
    };
  }

  async endMeeting(meetingId: string): Promise<boolean> {
    return true;
  }

  async getMeetingStatus(meetingId: string): Promise<MeetingStatus> {
    return 'in_progress';
  }
}

// Codin Native WebRTC Adapter
export class CodinNativeProviderAdapter implements IMeetingProvider {
  readonly providerType: MeetingProviderType = 'codin';
  readonly displayName: string = 'Codin Meet (Native)';

  async createMeeting(params: CreateMeetingParams): Promise<ProviderMeetingResult> {
    const meetingCode = `cdn-${Math.random().toString(36).substring(2, 6)}-${Math.random().toString(36).substring(2, 6)}`;
    const meetingUrl = `https://meet.codin.io/${meetingCode}`;

    return {
      providerMeetingId: `cdn-${Date.now()}`,
      meetingCode,
      meetingUrl,
      provider: 'codin',
      providerDetails: {
        dialInNumber: '+1 800-555-2634',
        pin: `${Math.floor(1000 + Math.random() * 9000)}#`,
      },
    };
  }

  async joinMeeting(meetingId: string, participant: MeetingParticipant): Promise<JoinMeetingResult> {
    return {
      success: true,
      meetingUrl: `https://meet.codin.io/${meetingId}`,
      token: `cdn-session-${Date.now()}`,
    };
  }

  async endMeeting(meetingId: string): Promise<boolean> {
    return true;
  }

  async getMeetingStatus(meetingId: string): Promise<MeetingStatus> {
    return 'in_progress';
  }
}

// Factory to resolve selected provider
export function getMeetingProviderAdapter(type: MeetingProviderType): IMeetingProvider {
  switch (type) {
    case 'google_meet':
      return new GoogleMeetProviderAdapter();
    case 'codin':
    default:
      return new CodinNativeProviderAdapter();
  }
}
