'use client';

import {
  DeviceSettings,
  Meeting,
  MeetingActivePanel,
  MeetingLayoutMode,
  MeetingMessage,
  MeetingNote,
  MeetingParticipant,
} from '@/lib/meet/types';
import React, { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import { ActiveSpeakerView } from './active-speaker-view';
import { MeetingToolbar } from './meeting-toolbar';
import { MeetingAIPanel } from './panels/meeting-ai-panel';
import { MeetingChatPanel } from './panels/meeting-chat-panel';
import { MeetingFilesPanel } from './panels/meeting-files-panel';
import { MeetingInfoPanel } from './panels/meeting-info-panel';
import { MeetingNotesPanel } from './panels/meeting-notes-panel';
import { MeetingTasksPanel } from './panels/meeting-tasks-panel';
import { ParticipantPanel } from './panels/participant-panel';
import { ScreenShareView } from './screen-share-view';
import { VideoGrid } from './video-grid';

type MeetingRoomProps = {
  meeting: Meeting;
  currentUser: MeetingParticipant;
  deviceSettings: DeviceSettings;
  onUpdateMeeting: (updated: Meeting) => void;
  onLeaveMeeting: () => void;
  onOpenEmailComposer?: (draft: { subject: string; recipients: string[]; body: string }) => void;
};

export function MeetingRoom({
  meeting,
  currentUser,
  deviceSettings,
  onUpdateMeeting,
  onLeaveMeeting,
  onOpenEmailComposer,
}: MeetingRoomProps) {
  const [participants, setParticipants] = useState<MeetingParticipant[]>(meeting.participants);
  const [messages, setMessages] = useState<MeetingMessage[]>(meeting.messages);
  const [files, setFiles] = useState(meeting.files);
  const [tasks, setTasks] = useState(meeting.tasks);
  const [notes, setNotes] = useState<MeetingNote | undefined>(meeting.notes);

  const [layoutMode, setLayoutMode] = useState<MeetingLayoutMode>('grid');
  const [pinnedId, setPinnedId] = useState<string | null>(null);
  const [activePanel, setActivePanel] = useState<MeetingActivePanel>('none');
  const [isMicMuted, setIsMicMuted] = useState(deviceSettings.isMicMuted);
  const [isVideoOff, setIsVideoOff] = useState(deviceSettings.isVideoOff);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [unreadChat, setUnreadChat] = useState(0);

  // Elapsed meeting timer
  useEffect(() => {
    const t = setInterval(() => setElapsedSeconds(s => s + 1), 1000);
    return () => clearInterval(t);
  }, []);

  // Recording timer
  useEffect(() => {
    if (!isRecording) return;
    const t = setInterval(() => setRecordingSeconds(s => s + 1), 1000);
    return () => clearInterval(t);
  }, [isRecording]);

  // Audio simulation
  useEffect(() => {
    const t = setInterval(() => {
      setParticipants(prev =>
        prev.map(p => {
          if (p.isMuted) return { ...p, isSpeaking: false, audioLevel: 0 };
          const speaking = Math.random() > 0.65;
          return { ...p, isSpeaking: speaking, audioLevel: speaking ? Math.floor(40 + Math.random() * 50) : 0 };
        })
      );
    }, 2500);
    return () => clearInterval(t);
  }, []);

  const handleToggleMic = () => {
    setIsMicMuted(prev => {
      const next = !prev;
      setParticipants(cur => cur.map(p => p.id === currentUser.id ? { ...p, isMuted: next } : p));
      toast(next ? 'Microphone muted' : 'Microphone on', { duration: 1200 });
      return next;
    });
  };

  const handleToggleVideo = () => {
    setIsVideoOff(prev => {
      const next = !prev;
      setParticipants(cur => cur.map(p => p.id === currentUser.id ? { ...p, isVideoOn: !next } : p));
      toast(next ? 'Camera off' : 'Camera on', { duration: 1200 });
      return next;
    });
  };

  const handleToggleShare = () => {
    setIsScreenSharing(prev => {
      const next = !prev;
      setLayoutMode(next ? 'presentation' : 'grid');
      toast(next ? 'Sharing screen' : 'Stopped sharing', { duration: 1500 });
      return next;
    });
  };

  const handleToggleRecording = () => {
    setIsRecording(prev => {
      if (!prev) setRecordingSeconds(0);
      toast(!prev ? 'Recording started' : 'Recording stopped');
      return !prev;
    });
  };

  const handleSendMessage = (content: string) => {
    const msg: MeetingMessage = {
      id: `msg-${Date.now()}`,
      meetingId: meeting.id,
      senderId: currentUser.id,
      senderName: currentUser.name,
      senderAvatar: currentUser.avatar,
      content,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    const updated = [...messages, msg];
    setMessages(updated);
    onUpdateMeeting({ ...meeting, messages: updated });
  };

  const handleAddFile = (name: string, size: string, type: string) => {
    const f = { id: `file-${Date.now()}`, meetingId: meeting.id, name, size, type, uploadedBy: currentUser.name, uploadedAt: 'Just now' };
    const updated = [...files, f];
    setFiles(updated);
    onUpdateMeeting({ ...meeting, files: updated });
  };

  const handleAddTask = (title: string, assigneeName?: string, dueDate?: string) => {
    const t = { id: `task-${Date.now()}`, meetingId: meeting.id, title, completed: false, assigneeName, dueDate };
    const updated = [...tasks, t];
    setTasks(updated);
    onUpdateMeeting({ ...meeting, tasks: updated });
  };

  const handleToggleTask = (taskId: string) => {
    const updated = tasks.map(t => t.id === taskId ? { ...t, completed: !t.completed } : t);
    setTasks(updated);
    onUpdateMeeting({ ...meeting, tasks: updated });
  };

  const handleDeleteTask = (taskId: string) => {
    const updated = tasks.filter(t => t.id !== taskId);
    setTasks(updated);
    onUpdateMeeting({ ...meeting, tasks: updated });
  };

  const handleSaveNotes = (n: MeetingNote) => {
    setNotes(n);
    onUpdateMeeting({ ...meeting, notes: n });
  };

  const handleAutoAddTasks = (items: { title: string; assignee?: string; dueDate?: string }[]) => {
    const mapped = items.map(item => ({
      id: `task-${Date.now()}-${Math.random()}`,
      meetingId: meeting.id,
      title: item.title,
      completed: false,
      assigneeName: item.assignee,
      dueDate: item.dueDate,
    }));
    const updated = [...tasks, ...mapped];
    setTasks(updated);
    onUpdateMeeting({ ...meeting, tasks: updated });
  };

  const handleInviteUser = (name: string, email: string) => {
    const p: MeetingParticipant = {
      id: `user-inv-${Date.now()}`,
      name, email, role: 'participant', responseStatus: 'accepted',
      isMuted: false, isVideoOn: true, isSpeaking: false, connectionQuality: 'good',
    };
    const updated = [...participants, p];
    setParticipants(updated);
    onUpdateMeeting({ ...meeting, participants: updated });
  };

  const activeSpeaker =
    participants.find(p => p.id === pinnedId) ||
    participants.find(p => p.isSpeaking) ||
    participants[0] ||
    currentUser;

  const togglePanel = (panel: MeetingActivePanel) => {
    setActivePanel(prev => prev === panel ? 'none' : panel);
    if (panel === 'chat') setUnreadChat(0);
  };

  return (
    <div className="flex flex-col h-full w-full bg-gray-950 text-white overflow-hidden">
      {/* Stage */}
      <div className="flex-1 flex min-h-0 overflow-hidden">
        <main className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
          {layoutMode === 'presentation' || isScreenSharing ? (
            <ScreenShareView
              presenter={currentUser}
              isSelfSharing={isScreenSharing}
              participants={participants}
              onStopSharing={() => { setIsScreenSharing(false); setLayoutMode('grid'); }}
            />
          ) : layoutMode === 'speaker' ? (
            <ActiveSpeakerView
              activeSpeaker={activeSpeaker}
              otherParticipants={participants.filter(p => p.id !== activeSpeaker.id)}
              currentUserId={currentUser.id}
              onSelectSpeaker={p => setPinnedId(p.id)}
              onResetLayout={() => { setPinnedId(null); setLayoutMode('grid'); }}
            />
          ) : (
            <VideoGrid
              participants={participants}
              currentUserId={currentUser.id}
              pinnedParticipantId={pinnedId}
              onPinParticipant={id => { setPinnedId(id); if (id) setLayoutMode('speaker'); }}
              onToggleMuteParticipant={pid => setParticipants(prev => prev.map(p => p.id === pid ? { ...p, isMuted: !p.isMuted } : p))}
            />
          )}
        </main>

        {/* Right Side Panels — always dark bg to contrast against video */}
        {activePanel === 'participants' && (
          <div className="border-l border-white/10">
            <ParticipantPanel
              participants={participants}
              currentUserId={currentUser.id}
              meetingCode={meeting.meetingCode}
              onClose={() => setActivePanel('none')}
              onToggleMute={pid => setParticipants(prev => prev.map(p => p.id === pid ? { ...p, isMuted: !p.isMuted } : p))}
              onTogglePin={pid => { setPinnedId(cur => cur === pid ? null : pid); setLayoutMode('speaker'); }}
              pinnedId={pinnedId}
              onInviteUser={handleInviteUser}
            />
          </div>
        )}
        {activePanel === 'chat' && (
          <div className="border-l border-white/10">
            <MeetingChatPanel messages={messages} currentUser={currentUser} onSendMessage={handleSendMessage} onClose={() => setActivePanel('none')} />
          </div>
        )}
        {activePanel === 'files' && (
          <div className="border-l border-white/10">
            <MeetingFilesPanel files={files} onUploadFile={handleAddFile} onClose={() => setActivePanel('none')} />
          </div>
        )}
        {activePanel === 'notes' && (
          <div className="border-l border-white/10">
            <MeetingNotesPanel notes={notes} onSaveNotes={handleSaveNotes} onClose={() => setActivePanel('none')} />
          </div>
        )}
        {activePanel === 'tasks' && (
          <div className="border-l border-white/10">
            <MeetingTasksPanel tasks={tasks} onToggleTask={handleToggleTask} onAddTask={handleAddTask} onDeleteTask={handleDeleteTask} onClose={() => setActivePanel('none')} />
          </div>
        )}
        {activePanel === 'ai' && (
          <div className="border-l border-white/10">
            <MeetingAIPanel meeting={meeting} onAutoAddTasks={handleAutoAddTasks} onOpenEmailComposer={onOpenEmailComposer} onClose={() => setActivePanel('none')} />
          </div>
        )}
        {activePanel === 'info' && (
          <div className="border-l border-white/10">
            <MeetingInfoPanel meeting={meeting} onClose={() => setActivePanel('none')} />
          </div>
        )}
      </div>

      {/* Toolbar */}
      <MeetingToolbar
        meetingTitle={meeting.title}
        elapsedSeconds={elapsedSeconds}
        isMicMuted={isMicMuted}
        isVideoOff={isVideoOff}
        isScreenSharing={isScreenSharing}
        isRecording={isRecording}
        recordingDurationSeconds={recordingSeconds}
        layoutMode={layoutMode}
        activePanel={activePanel}
        unreadChatCount={unreadChat}
        participantsCount={participants.length}
        onToggleMic={handleToggleMic}
        onToggleVideo={handleToggleVideo}
        onToggleScreenShare={handleToggleShare}
        onToggleRecording={handleToggleRecording}
        onChangeLayoutMode={setLayoutMode}
        onTogglePanel={togglePanel}
        onLeaveMeeting={onLeaveMeeting}
      />
    </div>
  );
}
