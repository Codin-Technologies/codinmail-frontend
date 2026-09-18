'use client';

import {
  formatDisplayDate,
  formatTime24to12,
} from '@/lib/calendar/date-utils';
import { Meeting } from '@/lib/meet/types';
import {
  ArrowLeft,
  Calendar,
  CheckCircle2,
  CheckSquare,
  Clock,
  Download,
  FileText,
  Mail,
  MessageCircle,
  Play,
  Share2,
  Sparkles,
  Users,
  Video,
} from 'lucide-react';
import React, { useState } from 'react';
import { toast } from 'sonner';

type PostMeetingSummaryProps = {
  meeting: Meeting;
  onBackToDashboard: () => void;
  onOpenEmailComposer?: (draft: { subject: string; recipients: string[]; body: string }) => void;
};

export function PostMeetingSummary({
  meeting,
  onBackToDashboard,
  onOpenEmailComposer,
}: PostMeetingSummaryProps) {
  const [isPlayingRecording, setIsPlayingRecording] = useState(false);
  const [dateStr, timeStr] = meeting.scheduledStart.split('T');

  const handleOpenEmail = () => {
    if (meeting.aiSummary?.followUpEmailDraft && onOpenEmailComposer) {
      onOpenEmailComposer(meeting.aiSummary.followUpEmailDraft);
    } else {
      toast.success('Follow-up draft copied to clipboard');
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-y-auto bg-background text-foreground custom-scrollbar select-none p-6 md:p-10">
      <div className="max-w-4xl w-full mx-auto space-y-8">
        {/* Top Header */}
        <div className="flex items-center justify-between pb-6 border-b border-border">
          <button
            onClick={onBackToDashboard}
            className="flex items-center gap-2 text-xs font-bold text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft size={16} />
            <span>Back to Meet Dashboard</span>
          </button>

          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 uppercase">
              Meeting Concluded
            </span>
          </div>
        </div>

        {/* Meeting Title & Meta Banner */}
        <div className="rounded-3xl border border-border bg-card p-6 md:p-8 space-y-4 shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <span className="text-[10px] font-bold tracking-widest text-primary uppercase">
                Permanent Meeting Record
              </span>
              <h1 className="text-2xl md:text-3xl font-extrabold text-foreground tracking-tight mt-1">
                {meeting.title}
              </h1>
            </div>

            <button
              onClick={handleOpenEmail}
              className="px-5 py-2.5 rounded-xl bg-primary text-white text-xs font-bold flex items-center gap-2 shadow hover:opacity-90 transition-opacity self-start md:self-auto shrink-0"
            >
              <Mail size={15} />
              <span>Draft Follow-up in Mail</span>
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-6 text-xs text-muted-foreground pt-4 border-t border-border font-medium">
            <span className="flex items-center gap-1.5 text-foreground font-semibold">
              <Calendar size={14} className="text-primary" />
              <span>{formatDisplayDate(dateStr)}</span>
            </span>
            <span className="flex items-center gap-1.5">
              <Clock size={14} />
              <span>
                {timeStr ? formatTime24to12(timeStr.slice(0, 5)) : ''} ({meeting.durationMinutes || 45} mins)
              </span>
            </span>
            <span className="flex items-center gap-1.5">
              <Users size={14} />
              <span>{meeting.participants.length} participants</span>
            </span>
          </div>
        </div>

        {/* Recording Player (if available) */}
        {meeting.recording && (
          <div className="rounded-3xl border border-border bg-gray-950 overflow-hidden shadow-xl space-y-3">
            <div className="aspect-video w-full relative flex items-center justify-center bg-gray-900">
              {isPlayingRecording ? (
                <div className="w-full h-full flex flex-col items-center justify-center p-8 text-center text-white space-y-3">
                  <div className="w-12 h-12 rounded-full bg-primary/30 border border-primary text-primary grid place-items-center animate-pulse">
                    <Video size={24} />
                  </div>
                  <p className="font-bold text-sm">Playing Encrypted Meeting Recording</p>
                  <span className="text-xs text-white/70 font-mono">04:18 / {meeting.recording.durationMinutes}:00</span>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-3">
                  <button
                    onClick={() => setIsPlayingRecording(true)}
                    className="w-16 h-16 rounded-full bg-primary text-white grid place-items-center shadow-2xl hover:scale-105 transition-transform"
                  >
                    <Play size={24} className="ml-1" />
                  </button>
                  <p className="text-xs font-semibold text-white/80">
                    Watch Meeting Recording ({meeting.recording.durationMinutes} min · {meeting.recording.size})
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* AI Summary & Decisions */}
        {meeting.aiSummary && (
          <div className="rounded-3xl border border-amber-200 bg-amber-50/60 dark:bg-amber-950/30 dark:border-amber-800/60 p-6 md:p-8 space-y-5">
            <div className="flex items-center gap-2 text-amber-900 dark:text-amber-300 font-extrabold text-base">
              <Sparkles size={20} />
              <span>AI Executive Summary & Decisions</span>
            </div>

            <p className="text-xs md:text-sm text-foreground/90 leading-relaxed font-medium">
              {meeting.aiSummary.summary}
            </p>

            <div className="space-y-2 pt-4 border-t border-amber-200/60 dark:border-amber-800/40">
              <span className="block font-bold text-[11px] uppercase tracking-wider text-amber-900 dark:text-amber-300">
                Key Decisions Agreed Upon
              </span>
              <div className="space-y-1.5">
                {meeting.aiSummary.keyDecisions.map((dec, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl border border-border bg-card flex items-start gap-2.5 text-xs font-medium"
                  >
                    <CheckCircle2 size={15} className="text-emerald-500 shrink-0 mt-0.5" />
                    <span>{dec}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Action Items to Tasks */}
        <div className="rounded-3xl border border-border bg-card p-6 md:p-8 space-y-4 shadow-sm">
          <div className="flex items-center justify-between">
            <h3 className="font-extrabold text-base text-foreground flex items-center gap-2">
              <CheckSquare size={18} className="text-primary" />
              <span>Action Items & Tasks ({meeting.tasks.length})</span>
            </h3>
            <span className="text-xs text-muted-foreground">
              Synced with Codin Tasks
            </span>
          </div>

          <div className="space-y-2">
            {meeting.tasks.map((task) => (
              <div
                key={task.id}
                className="p-3.5 rounded-xl border border-border bg-background flex items-center justify-between gap-3 text-xs"
              >
                <div className="flex items-center gap-3">
                  <span
                    className={`w-4 h-4 rounded border flex items-center justify-center ${
                      task.completed ? 'bg-primary border-primary text-white' : 'border-muted-foreground'
                    }`}
                  >
                    {task.completed && <CheckCircle2 size={12} />}
                  </span>
                  <span className={`font-semibold ${task.completed ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
                    {task.title}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-muted-foreground text-[11px]">
                  {task.assigneeName && <span>{task.assigneeName}</span>}
                  {task.dueDate && <span className="font-mono">{task.dueDate}</span>}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Attachments and Chat Transcript Recap */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Files */}
          <div className="rounded-3xl border border-border bg-card p-6 space-y-3">
            <h3 className="font-bold text-sm text-foreground flex items-center gap-2">
              <FileText size={16} className="text-primary" />
              <span>Referenced Files ({meeting.files.length})</span>
            </h3>
            <div className="space-y-2">
              {meeting.files.map((file) => (
                <div
                  key={file.id}
                  className="p-3 rounded-xl border border-border bg-background flex items-center justify-between gap-2 text-xs"
                >
                  <span className="font-bold truncate text-foreground">{file.name}</span>
                  <button
                    onClick={() => toast.success(`Downloading ${file.name}`)}
                    className="p-1 text-muted-foreground hover:text-foreground"
                  >
                    <Download size={14} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Chat Transcript */}
          <div className="rounded-3xl border border-border bg-card p-6 space-y-3">
            <h3 className="font-bold text-sm text-foreground flex items-center gap-2">
              <MessageCircle size={16} className="text-primary" />
              <span>Meeting Chat Transcript ({meeting.messages.length})</span>
            </h3>
            <div className="space-y-2 max-h-48 overflow-y-auto pr-1 text-xs custom-scrollbar">
              {meeting.messages.map((msg) => (
                <div key={msg.id} className="p-2 rounded-lg bg-background border border-border space-y-0.5">
                  <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                    <strong>{msg.senderName}</strong>
                    <span>{msg.timestamp}</span>
                  </div>
                  <p className="text-foreground">{msg.content}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
