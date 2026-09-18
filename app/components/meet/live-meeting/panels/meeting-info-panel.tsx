'use client';

import {
  formatDisplayDate,
  formatTime24to12,
} from '@/lib/calendar/date-utils';
import { Meeting } from '@/lib/meet/types';
import {
  Calendar,
  Check,
  Clock,
  Copy,
  Globe,
  Info,
  Link as LinkIcon,
  Phone,
  ShieldCheck,
  User,
  X,
} from 'lucide-react';
import React, { useState } from 'react';
import { toast } from 'sonner';

type MeetingInfoPanelProps = {
  meeting: Meeting;
  onClose: () => void;
};

export function MeetingInfoPanel({ meeting, onClose }: MeetingInfoPanelProps) {
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedDialIn, setCopiedDialIn] = useState(false);

  const handleCopyLink = () => {
    navigator.clipboard?.writeText(meeting.meetingUrl);
    setCopiedLink(true);
    toast.success('Meeting link copied');
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleCopyDialIn = () => {
    navigator.clipboard?.writeText('+1 415-555-0132 PIN: 849201#');
    setCopiedDialIn(true);
    toast.success('Dial-in info copied');
    setTimeout(() => setCopiedDialIn(false), 2000);
  };

  const [dateStr, timeStr] = meeting.scheduledStart.split('T');

  return (
    <aside className="w-80 shrink-0 border-l border-border bg-card flex flex-col h-full overflow-hidden text-foreground select-none">
      {/* Header */}
      <div className="h-14 border-b border-border px-4 flex items-center justify-between bg-card shrink-0">
        <div className="flex items-center gap-2">
          <Info size={16} className="text-primary" />
          <h3 className="font-bold text-sm">Meeting Details</h3>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground"
        >
          <X size={16} />
        </button>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar text-xs">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
            Title
          </span>
          <h4 className="font-bold text-sm text-foreground mt-0.5">{meeting.title}</h4>
          {meeting.description && (
            <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
              {meeting.description}
            </p>
          )}
        </div>

        <div className="space-y-2 pt-3 border-t border-border">
          <span className="block font-bold text-[10px] uppercase tracking-wider text-muted-foreground">
            Schedule
          </span>
          <div className="flex items-center gap-2 text-foreground font-medium">
            <Clock size={13} className="text-primary" />
            <span>
              {formatDisplayDate(dateStr)} · {timeStr ? formatTime24to12(timeStr.slice(0, 5)) : 'Live'}
            </span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Globe size={13} />
            <span>{meeting.timezone}</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <User size={13} />
            <span>Host: {meeting.organizerName} ({meeting.organizerEmail})</span>
          </div>
        </div>

        {/* Meeting Link & Dial-In */}
        <div className="space-y-3 pt-3 border-t border-border">
          <span className="block font-bold text-[10px] uppercase tracking-wider text-muted-foreground">
            Joining Info
          </span>

          <div className="p-3 rounded-xl border border-border bg-background space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-foreground truncate max-w-[180px]">
                {meeting.meetingUrl}
              </span>
              <button
                onClick={handleCopyLink}
                className="p-1 rounded hover:bg-muted text-primary"
                title="Copy link"
              >
                {copiedLink ? <Check size={14} /> : <Copy size={14} />}
              </button>
            </div>
            <p className="text-[10px] text-muted-foreground font-mono">
              Meeting Code: {meeting.meetingCode}
            </p>
          </div>

          <div className="p-3 rounded-xl border border-border bg-background space-y-1">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 font-semibold text-foreground">
                <Phone size={13} />
                <span>Dial-in: +1 415-555-0132</span>
              </div>
              <button
                onClick={handleCopyDialIn}
                className="p-1 rounded hover:bg-muted text-primary"
                title="Copy dial-in"
              >
                {copiedDialIn ? <Check size={14} /> : <Copy size={14} />}
              </button>
            </div>
            <p className="text-[10px] text-muted-foreground font-mono">PIN: 849 201#</p>
          </div>
        </div>

        {/* Security & Infrastructure Provider */}
        <div className="pt-3 border-t border-border space-y-2">
          <span className="block font-bold text-[10px] uppercase tracking-wider text-muted-foreground">
            Conferencing Infrastructure
          </span>
          <div className="p-3 rounded-xl bg-muted/30 border border-border/80 text-[11px] space-y-1 text-muted-foreground">
            <div className="flex items-center gap-1.5 font-bold text-foreground">
              <ShieldCheck size={14} className="text-emerald-500" />
              <span>Provider: {meeting.provider === 'google_meet' ? 'Google Meet Enterprise' : 'Codin WebRTC'}</span>
            </div>
            <p className="text-[10px]">
              Encrypted in transit. Compliant with HIPAA, GDPR & SOC2.
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
}
