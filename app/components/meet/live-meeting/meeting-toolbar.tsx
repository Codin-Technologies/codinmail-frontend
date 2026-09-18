'use client';

import {
  MeetingActivePanel,
  MeetingLayoutMode,
} from '@/lib/meet/types';
import {
  CheckSquare,
  Disc,
  FileText,
  Grid,
  Info,
  Layout,
  MessageCircle,
  Mic,
  MicOff,
  Monitor,
  MoreHorizontal,
  PhoneOff,
  Sparkles,
  Users,
  Video,
  VideoOff,
} from 'lucide-react';
import React, { useState } from 'react';

type MeetingToolbarProps = {
  meetingTitle: string;
  elapsedSeconds: number;
  isMicMuted: boolean;
  isVideoOff: boolean;
  isScreenSharing: boolean;
  isRecording: boolean;
  recordingDurationSeconds: number;
  layoutMode: MeetingLayoutMode;
  activePanel: MeetingActivePanel;
  unreadChatCount: number;
  participantsCount: number;
  onToggleMic: () => void;
  onToggleVideo: () => void;
  onToggleScreenShare: () => void;
  onToggleRecording: () => void;
  onChangeLayoutMode: (mode: MeetingLayoutMode) => void;
  onTogglePanel: (panel: MeetingActivePanel) => void;
  onLeaveMeeting: () => void;
};

function formatDuration(secs: number) {
  const h = Math.floor(secs / 3600);
  const m = Math.floor((secs % 3600) / 60);
  const s = secs % 60;
  if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  return `${m}:${String(s).padStart(2, '0')}`;
}

type ToolbarBtn = {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  danger?: boolean;
  badge?: number;
  onClick: () => void;
};

function CtrlBtn({ icon, label, active, danger, badge, onClick }: ToolbarBtn) {
  return (
    <button
      onClick={onClick}
      title={label}
      aria-label={label}
      className={`relative flex flex-col items-center gap-0.5 px-3 py-2 rounded-xl transition-all text-xs font-medium select-none ${
        danger
          ? 'bg-red-600/10 text-red-600 hover:bg-red-600 hover:text-white'
          : active
          ? 'bg-primary/15 text-primary hover:bg-primary/25'
          : 'text-muted-foreground hover:text-foreground hover:bg-muted'
      }`}
    >
      <span className="w-5 h-5 flex items-center justify-center">{icon}</span>
      {badge !== undefined && badge > 0 && (
        <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-red-600 text-white text-[9px] font-bold flex items-center justify-center">
          {badge > 9 ? '9+' : badge}
        </span>
      )}
    </button>
  );
}

export function MeetingToolbar({
  meetingTitle,
  elapsedSeconds,
  isMicMuted,
  isVideoOff,
  isScreenSharing,
  isRecording,
  recordingDurationSeconds,
  layoutMode,
  activePanel,
  unreadChatCount,
  participantsCount,
  onToggleMic,
  onToggleVideo,
  onToggleScreenShare,
  onToggleRecording,
  onChangeLayoutMode,
  onTogglePanel,
  onLeaveMeeting,
}: MeetingToolbarProps) {
  const [showMore, setShowMore] = useState(false);

  return (
    <footer className="relative h-16 border-t border-border bg-card flex items-center justify-between px-4 shrink-0 z-30">
      {/* Left — title + timer */}
      <div className="flex items-center gap-3 w-1/3 min-w-0">
        <div className="min-w-0">
          <p className="text-xs font-bold text-foreground truncate max-w-[180px]">{meetingTitle}</p>
          <p className="text-[11px] font-mono text-muted-foreground">{formatDuration(elapsedSeconds)}</p>
        </div>
        {isRecording && (
          <div className="flex items-center gap-1.5 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 px-2 py-0.5 rounded-full text-[10px] font-bold text-red-600 dark:text-red-400">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
            {formatDuration(recordingDurationSeconds)}
          </div>
        )}
      </div>

      {/* Center — core controls */}
      <div className="flex items-center gap-1">
        <CtrlBtn
          icon={isMicMuted ? <MicOff size={18} /> : <Mic size={18} />}
          label={isMicMuted ? 'Unmute' : 'Mute'}
          active={isMicMuted}
          danger={isMicMuted}
          onClick={onToggleMic}
        />
        <CtrlBtn
          icon={isVideoOff ? <VideoOff size={18} /> : <Video size={18} />}
          label={isVideoOff ? 'Start video' : 'Stop video'}
          active={isVideoOff}
          danger={isVideoOff}
          onClick={onToggleVideo}
        />
        <CtrlBtn
          icon={<Monitor size={18} />}
          label={isScreenSharing ? 'Stop sharing' : 'Share screen'}
          active={isScreenSharing}
          onClick={onToggleScreenShare}
        />

        <div className="w-px h-6 bg-border mx-2" />

        <CtrlBtn
          icon={<Users size={18} />}
          label="Participants"
          active={activePanel === 'participants'}
          badge={participantsCount}
          onClick={() => onTogglePanel(activePanel === 'participants' ? 'none' : 'participants')}
        />
        <CtrlBtn
          icon={<MessageCircle size={18} />}
          label="Chat"
          active={activePanel === 'chat'}
          badge={unreadChatCount}
          onClick={() => onTogglePanel(activePanel === 'chat' ? 'none' : 'chat')}
        />
        <CtrlBtn
          icon={<FileText size={18} />}
          label="Files"
          active={activePanel === 'files'}
          onClick={() => onTogglePanel(activePanel === 'files' ? 'none' : 'files')}
        />
        <CtrlBtn
          icon={<Layout size={18} />}
          label="Notes"
          active={activePanel === 'notes'}
          onClick={() => onTogglePanel(activePanel === 'notes' ? 'none' : 'notes')}
        />
        <CtrlBtn
          icon={<CheckSquare size={18} />}
          label="Tasks"
          active={activePanel === 'tasks'}
          onClick={() => onTogglePanel(activePanel === 'tasks' ? 'none' : 'tasks')}
        />
        <CtrlBtn
          icon={<Sparkles size={18} />}
          label="AI Assistant"
          active={activePanel === 'ai'}
          onClick={() => onTogglePanel(activePanel === 'ai' ? 'none' : 'ai')}
        />
        <CtrlBtn
          icon={<Info size={18} />}
          label="Meeting info"
          active={activePanel === 'info'}
          onClick={() => onTogglePanel(activePanel === 'info' ? 'none' : 'info')}
        />

        <div className="relative">
          <CtrlBtn
            icon={<MoreHorizontal size={18} />}
            label="More options"
            onClick={() => setShowMore(v => !v)}
          />
          {showMore && (
            <div
              className="absolute bottom-14 left-1/2 -translate-x-1/2 w-48 rounded-xl border border-border bg-card shadow-xl py-1 z-50 text-xs animate-in fade-in zoom-in-95"
              onMouseLeave={() => setShowMore(false)}
            >
              <button
                onClick={() => { onToggleRecording(); setShowMore(false); }}
                className="w-full flex items-center gap-2.5 px-3 py-2 hover:bg-muted text-foreground font-medium"
              >
                <Disc size={14} className={isRecording ? 'text-red-500' : 'text-muted-foreground'} />
                {isRecording ? 'Stop Recording' : 'Start Recording'}
              </button>
              <button
                onClick={() => { onChangeLayoutMode(layoutMode === 'grid' ? 'speaker' : 'grid'); setShowMore(false); }}
                className="w-full flex items-center gap-2.5 px-3 py-2 hover:bg-muted text-foreground font-medium"
              >
                <Grid size={14} className="text-muted-foreground" />
                {layoutMode === 'grid' ? 'Speaker View' : 'Grid View'}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Right — Leave */}
      <div className="flex justify-end w-1/3">
        <button
          onClick={onLeaveMeeting}
          className="h-9 px-4 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold flex items-center gap-2 transition-colors shadow-sm"
        >
          <PhoneOff size={15} />
          <span>Leave</span>
        </button>
      </div>
    </footer>
  );
}
