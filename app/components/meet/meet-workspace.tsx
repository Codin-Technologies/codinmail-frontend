'use client';

import {
  CURRENT_USER,
  DEFAULT_DEVICE_SETTINGS,
} from '@/lib/meet/mock-data';
import {
  generateInstantMeeting,
  loadDeviceSettings,
  loadMeetings,
  saveDeviceSettings,
  saveMeetings,
} from '@/lib/meet/storage';
import {
  DeviceSettings,
  Meeting,
  MeetingParticipant,
} from '@/lib/meet/types';
import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { MeetingRoom } from './live-meeting/meeting-room';
import { MeetDashboard } from './meet-dashboard';
import { JoinMeetingModal } from './modals/join-meeting-modal';
import { NewMeetingModal } from './modals/new-meeting-modal';
import { PostMeetingSummary } from './post-meeting-summary';
import { PreJoinScreen } from './pre-join-screen';

type MeetScreenState = 'dashboard' | 'pre_join' | 'live_room' | 'post_summary';

type MeetWorkspaceProps = {
  initialMeetingId?: string;
  onOpenEmailComposer?: (draft: { subject: string; recipients: string[]; body: string }) => void;
};

export function MeetWorkspace({
  initialMeetingId,
  onOpenEmailComposer,
}: MeetWorkspaceProps) {
  const [screen, setScreen] = useState<MeetScreenState>('dashboard');
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [activeMeeting, setActiveMeeting] = useState<Meeting | null>(null);
  const [currentUser, setCurrentUser] = useState<MeetingParticipant>(CURRENT_USER);
  const [deviceSettings, setDeviceSettings] = useState<DeviceSettings>(DEFAULT_DEVICE_SETTINGS);

  // Modals
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);

  // Load Initial State
  useEffect(() => {
    const loadedMeetings = loadMeetings();
    setMeetings(loadedMeetings);
    setDeviceSettings(loadDeviceSettings());

    if (initialMeetingId) {
      const found = loadedMeetings.find((m) => m.id === initialMeetingId || m.meetingCode === initialMeetingId);
      if (found) {
        setActiveMeeting(found);
        setScreen('pre_join');
      }
    }
  }, [initialMeetingId]);

  const handleUpdateMeetings = (updatedList: Meeting[]) => {
    setMeetings(updatedList);
    saveMeetings(updatedList);
  };

  const handleUpdateDeviceSettings = (newSettings: DeviceSettings) => {
    setDeviceSettings(newSettings);
    saveDeviceSettings(newSettings);
  };

  const handleStartInstantMeeting = () => {
    const instantMeeting = generateInstantMeeting(currentUser);
    handleUpdateMeetings([instantMeeting, ...meetings]);
    setActiveMeeting(instantMeeting);
    setScreen('pre_join');
  };

  const handleSelectMeetingToJoin = (meeting: Meeting) => {
    setActiveMeeting(meeting);
    setScreen('pre_join');
  };

  const handleJoinByCode = (codeOrUrl: string) => {
    const query = codeOrUrl.trim().toLowerCase();
    const found = meetings.find(
      (m) =>
        m.meetingCode.toLowerCase() === query ||
        m.id.toLowerCase() === query ||
        m.meetingUrl.toLowerCase().includes(query)
    );

    if (found) {
      setActiveMeeting(found);
      setScreen('pre_join');
    } else {
      const customMeeting: Meeting = {
        id: `meet-direct-${Date.now()}`,
        title: `Meeting (${codeOrUrl})`,
        organizerId: 'remote',
        organizerName: 'Meeting Organizer',
        organizerEmail: 'organizer@codin.io',
        provider: 'google_meet',
        providerMeetingId: `gmeet-${Date.now()}`,
        meetingCode: codeOrUrl,
        meetingUrl: `https://meet.google.com/${codeOrUrl}`,
        scheduledStart: new Date().toISOString(),
        scheduledEnd: new Date(Date.now() + 60 * 60000).toISOString(),
        timezone: 'America/New_York (EDT)',
        status: 'in_progress',
        participants: [currentUser],
        messages: [],
        files: [],
        tasks: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      handleUpdateMeetings([customMeeting, ...meetings]);
      setActiveMeeting(customMeeting);
      setScreen('pre_join');
    }
  };

  const handleEnterLiveRoom = (participant: MeetingParticipant) => {
    if (!activeMeeting) return;
    setCurrentUser(participant);

    // Update active meeting participants
    const hasSelf = activeMeeting.participants.some((p) => p.id === participant.id);
    const updatedParticipants = hasSelf
      ? activeMeeting.participants.map((p) => (p.id === participant.id ? participant : p))
      : [...activeMeeting.participants, participant];

    const updatedMeeting: Meeting = {
      ...activeMeeting,
      status: 'in_progress',
      participants: updatedParticipants,
      actualStartTime: activeMeeting.actualStartTime || new Date().toISOString(),
    };

    setActiveMeeting(updatedMeeting);
    handleUpdateMeetings(meetings.map((m) => (m.id === updatedMeeting.id ? updatedMeeting : m)));
    setScreen('live_room');
  };

  const handleLeaveLiveRoom = () => {
    if (!activeMeeting) {
      setScreen('dashboard');
      return;
    }

    // Conclude meeting and transition to post-meeting summary
    const endedMeeting: Meeting = {
      ...activeMeeting,
      status: 'ended',
      actualEndTime: new Date().toISOString(),
      durationMinutes: 45,
      recording: {
        id: `rec-${Date.now()}`,
        meetingId: activeMeeting.id,
        durationMinutes: 45,
        recordedAt: 'Just now',
        size: '124 MB',
        status: 'ready',
      },
      aiSummary: activeMeeting.aiSummary || {
        summary:
          'Discussion concluded successfully. Decisions and action items logged to Codin platform records.',
        keyDecisions: ['Confirmed project schedule and architecture deliverables.'],
        extractedActionItems: [
          {
            title: 'Send follow-up communication to all participants',
            assignee: currentUser.name,
            dueDate: '2026-08-25',
          },
        ],
        followUpEmailDraft: {
          subject: `Meeting Summary: ${activeMeeting.title}`,
          recipients: activeMeeting.participants.map((p) => p.email),
          body: `Hi everyone,\n\nThank you for joining ${activeMeeting.title}. The action items and recording are available in the Codin Meet workspace.\n\nBest,\n${currentUser.name}`,
        },
        sentiment: 'productive',
      },
    };

    setActiveMeeting(endedMeeting);
    handleUpdateMeetings(meetings.map((m) => (m.id === endedMeeting.id ? endedMeeting : m)));
    setScreen('post_summary');
    toast.success('Call ended. Viewing meeting summary.');
  };

  const handleViewSummary = (meeting: Meeting) => {
    setActiveMeeting(meeting);
    setScreen('post_summary');
  };

  const handleCreateNewMeeting = (newMeeting: Meeting) => {
    handleUpdateMeetings([newMeeting, ...meetings]);
  };

  return (
    <div className="flex-1 flex flex-col h-full w-full overflow-hidden bg-background">
      {/* View Router */}
      {screen === 'dashboard' && (
        <MeetDashboard
          meetings={meetings}
          currentUser={currentUser}
          onStartInstantMeeting={handleStartInstantMeeting}
          onOpenNewMeetingModal={() => setIsNewModalOpen(true)}
          onOpenJoinModal={() => setIsJoinModalOpen(true)}
          onJoinByCode={(code) => {
            handleJoinByCode(code);
            setIsJoinModalOpen(false);
          }}
          onJoinMeeting={handleSelectMeetingToJoin}
          onViewMeetingSummary={handleViewSummary}
        />
      )}

      {screen === 'pre_join' && activeMeeting && (
        <PreJoinScreen
          meeting={activeMeeting}
          currentUser={currentUser}
          deviceSettings={deviceSettings}
          onUpdateDeviceSettings={handleUpdateDeviceSettings}
          onJoinNow={handleEnterLiveRoom}
          onBack={() => setScreen('dashboard')}
        />
      )}

      {screen === 'live_room' && activeMeeting && (
        <MeetingRoom
          meeting={activeMeeting}
          currentUser={currentUser}
          deviceSettings={deviceSettings}
          onUpdateMeeting={(updated) => {
            setActiveMeeting(updated);
            handleUpdateMeetings(meetings.map((m) => (m.id === updated.id ? updated : m)));
          }}
          onLeaveMeeting={handleLeaveLiveRoom}
          onOpenEmailComposer={onOpenEmailComposer}
        />
      )}

      {screen === 'post_summary' && activeMeeting && (
        <PostMeetingSummary
          meeting={activeMeeting}
          onBackToDashboard={() => setScreen('dashboard')}
          onOpenEmailComposer={onOpenEmailComposer}
        />
      )}

      {/* New Meeting Modal */}
      {isNewModalOpen && (
        <NewMeetingModal
          currentUser={currentUser}
          onCreateMeeting={handleCreateNewMeeting}
          onClose={() => setIsNewModalOpen(false)}
        />
      )}

      {/* Join Meeting Modal */}
      {isJoinModalOpen && (
        <JoinMeetingModal
          onJoinByCode={handleJoinByCode}
          onClose={() => setIsJoinModalOpen(false)}
        />
      )}
    </div>
  );
}
