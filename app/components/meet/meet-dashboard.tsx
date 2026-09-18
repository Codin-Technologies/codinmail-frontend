'use client';

import { Meeting, MeetingParticipant } from '@/lib/meet/types';
import {
  Calendar,
  Check,
  Clock,
  Copy,
  FileText,
  Link2,
  Search,
  Sparkles,
  Users,
  Video,
  Zap,
} from 'lucide-react';
import React, { useState } from 'react';
import { toast } from 'sonner';

type MeetDashboardProps = {
  meetings: Meeting[];
  currentUser: MeetingParticipant;
  onStartInstantMeeting: () => void;
  onOpenNewMeetingModal: () => void;
  onOpenJoinModal: () => void;
  onJoinByCode: (codeOrUrl: string) => void;
  onJoinMeeting: (meeting: Meeting) => void;
  onViewMeetingSummary: (meeting: Meeting) => void;
};

type DashboardTab = 'upcoming' | 'today' | 'my_meetings' | 'history';

function formatShortTime(isoString: string) {
  try {
    const t = isoString.split('T')[1]?.slice(0, 5);
    if (!t) return '';
    const [h, m] = t.split(':').map(Number);
    const ampm = h >= 12 ? 'PM' : 'AM';
    const hr = h % 12 || 12;
    return `${hr}:${String(m).padStart(2, '0')} ${ampm}`;
  } catch {
    return '';
  }
}

function formatShortDate(isoString: string) {
  try {
    const d = new Date(isoString.split('T')[0]);
    const today = new Date('2026-08-24');
    const diff = Math.round((d.getTime() - today.getTime()) / 86400000);
    if (diff === 0) return 'Today';
    if (diff === 1) return 'Tomorrow';
    if (diff === -1) return 'Yesterday';
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  } catch {
    return '';
  }
}

const STATUS_CONFIG: Record<string, { label: string; dot: string; bg: string; text: string }> = {
  in_progress: { label: 'Live', dot: 'bg-primary', bg: 'bg-primary/10', text: 'text-primary' },
  upcoming: { label: 'Upcoming', dot: 'bg-foreground/40', bg: 'bg-muted', text: 'text-foreground' },
  scheduled: { label: 'Scheduled', dot: 'bg-foreground/30', bg: 'bg-muted', text: 'text-muted-foreground' },
  ended: { label: 'Ended', dot: 'bg-muted-foreground', bg: 'bg-muted/50', text: 'text-muted-foreground' },
  cancelled: { label: 'Cancelled', dot: 'bg-muted-foreground', bg: 'bg-muted/50', text: 'text-muted-foreground' },
};

export function MeetDashboard({
  meetings,
  currentUser,
  onStartInstantMeeting,
  onOpenNewMeetingModal,
  onOpenJoinModal,
  onJoinByCode,
  onJoinMeeting,
  onViewMeetingSummary,
}: MeetDashboardProps) {
  const [activeTab, setActiveTab] = useState<DashboardTab>('upcoming');
  const [searchQuery, setSearchQuery] = useState('');
  const [joinCode, setJoinCode] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const todayStr = '2026-08-24';

  const tabCounts = {
    upcoming: meetings.filter((m) => m.status !== 'ended' && m.status !== 'cancelled').length,
    today: meetings.filter((m) => m.scheduledStart.startsWith(todayStr) && m.status !== 'ended').length,
    my_meetings: meetings.filter((m) => m.organizerId === currentUser.id).length,
    history: meetings.filter((m) => m.status === 'ended').length,
  };

  const filtered = meetings.filter((m) => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      if (
        !m.title.toLowerCase().includes(q) &&
        !m.organizerName.toLowerCase().includes(q) &&
        !m.participants.some((p) => p.name.toLowerCase().includes(q))
      ) {
        return false;
      }
    }
    if (activeTab === 'today') return m.scheduledStart.startsWith(todayStr) && m.status !== 'ended';
    if (activeTab === 'upcoming') return m.status !== 'ended' && m.status !== 'cancelled';
    if (activeTab === 'my_meetings') return m.organizerId === currentUser.id;
    if (activeTab === 'history') return m.status === 'ended';
    return true;
  });

  const handleCopy = (m: Meeting, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard?.writeText(m.meetingUrl);
    setCopiedId(m.id);
    toast.success('Link copied');
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleJoinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!joinCode.trim()) {
      onOpenJoinModal();
      return;
    }
    onJoinByCode(joinCode.trim());
  };

  const TABS: { id: DashboardTab; label: string }[] = [
    { id: 'upcoming', label: 'Upcoming' },
    { id: 'today', label: 'Today' },
    { id: 'my_meetings', label: 'Created by me' },
    { id: 'history', label: 'Past' },
  ];

  return (
    <div className="flex h-full w-full flex-col overflow-hidden bg-background text-foreground">
      <header className="shrink-0 border-b border-border bg-card px-5 py-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="eyebrow">Workspace</p>
            <h1 className="text-xl font-semibold tracking-tight text-foreground">Meet</h1>
            <p className="mt-0.5 text-xs text-muted-foreground">Start, join, and review meetings without leaving Codin.</p>
          </div>
          <button
            onClick={onOpenNewMeetingModal}
            className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-primary px-3.5 text-xs font-semibold text-primary-foreground hover:opacity-90"
          >
            + New
          </button>
        </div>

        <div className="relative mt-4">
          <Search size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search meetings, people, or codes"
            aria-label="Search meetings"
            className="h-10 w-full rounded-lg border border-border bg-background pl-9 pr-3 text-sm text-foreground outline-none placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring"
          />
        </div>
      </header>

      <div className="min-h-0 flex-1 overflow-y-auto">
        <div className="flex flex-col gap-4 p-5">
          <section aria-label="Quick actions" className="grid gap-3 sm:grid-cols-3">
            <button
              onClick={onStartInstantMeeting}
              className="flex items-start gap-3 rounded-lg border border-border bg-card p-4 text-left transition-colors hover:bg-muted/50"
            >
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
                <Zap size={16} />
              </span>
              <span>
                <span className="block text-sm font-semibold text-foreground">Start instant meeting</span>
                <span className="mt-0.5 block text-xs text-muted-foreground">Open a room now with your camera and mic.</span>
              </span>
            </button>
            <button
              onClick={onOpenJoinModal}
              className="flex items-start gap-3 rounded-lg border border-border bg-card p-4 text-left transition-colors hover:bg-muted/50"
            >
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-muted text-foreground">
                <Link2 size={16} />
              </span>
              <span>
                <span className="block text-sm font-semibold text-foreground">Join with a code</span>
                <span className="mt-0.5 block text-xs text-muted-foreground">Enter a Codin or Google Meet invite.</span>
              </span>
            </button>
            <button
              onClick={onOpenNewMeetingModal}
              className="flex items-start gap-3 rounded-lg border border-border bg-card p-4 text-left transition-colors hover:bg-muted/50"
            >
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-muted text-foreground">
                <Calendar size={16} />
              </span>
              <span>
                <span className="block text-sm font-semibold text-foreground">Schedule meeting</span>
                <span className="mt-0.5 block text-xs text-muted-foreground">Create an invite and add it to Calendar.</span>
              </span>
            </button>
          </section>

          <form
            onSubmit={handleJoinSubmit}
            className="flex flex-col gap-2 rounded-lg border border-border bg-card p-2 sm:flex-row sm:items-center"
          >
            <div className="relative min-w-0 flex-1">
              <Link2 size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value)}
                placeholder="Paste a meeting code or URL"
                aria-label="Meeting code or URL"
                className="h-10 w-full rounded-md border-0 bg-transparent pl-9 pr-3 text-sm outline-none placeholder:text-muted-foreground"
              />
            </div>
            <button
              type="submit"
              className="h-10 shrink-0 rounded-md bg-foreground px-4 text-xs font-semibold text-background hover:opacity-90"
            >
              Join
            </button>
          </form>

          <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-border bg-card px-2 py-1.5">
            <div className="flex flex-wrap gap-0.5" role="tablist" aria-label="Meeting lists">
              {TABS.map((tab) => (
                <button
                  key={tab.id}
                  role="tab"
                  aria-selected={activeTab === tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`rounded-md px-3 py-1.5 text-xs font-semibold transition-colors ${
                    activeTab === tab.id
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                  }`}
                >
                  {tab.label}
                  <span className={`ml-1.5 tabular-nums ${activeTab === tab.id ? 'opacity-80' : 'opacity-60'}`}>
                    {tabCounts[tab.id]}
                  </span>
                </button>
              ))}
            </div>
            <p className="px-2 text-[11px] text-muted-foreground">
              {filtered.length} {filtered.length === 1 ? 'meeting' : 'meetings'}
            </p>
          </div>

          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-border bg-card px-6 py-16 text-center">
              <div className="grid h-12 w-12 place-items-center rounded-lg border border-border bg-background">
                <Video size={22} className="text-muted-foreground" />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">No meetings here</p>
                <p className="mt-0.5 text-xs text-muted-foreground">Schedule one or start an instant meeting.</p>
              </div>
              <button
                onClick={onOpenNewMeetingModal}
                className="mt-1 rounded-lg bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground hover:opacity-90"
              >
                + New meeting
              </button>
            </div>
          ) : (
            <ul className="grid gap-3">
              {filtered.map((m) => {
                const isLive = m.status === 'in_progress';
                const isEnded = m.status === 'ended';
                const cfg = STATUS_CONFIG[m.status] ?? STATUS_CONFIG.scheduled;

                return (
                  <li key={m.id}>
                    <article
                      onClick={() => (isEnded ? onViewMeetingSummary(m) : onJoinMeeting(m))}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          isEnded ? onViewMeetingSummary(m) : onJoinMeeting(m);
                        }
                      }}
                      role="button"
                      tabIndex={0}
                      className="group cursor-pointer rounded-lg border border-border bg-card p-4 text-left transition-colors hover:bg-muted/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className={`inline-block h-2 w-2 rounded-full ${cfg.dot} ${isLive ? 'animate-pulse' : ''}`} />
                            <h2 className="truncate text-sm font-semibold text-foreground group-hover:text-primary">
                              {m.title}
                            </h2>
                            {m.aiSummary && <Sparkles size={12} className="shrink-0 text-muted-foreground" aria-label="AI summary available" />}
                            <span className={`inline-flex items-center rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${cfg.bg} ${cfg.text}`}>
                              {cfg.label}
                            </span>
                          </div>
                          {m.description && (
                            <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{m.description}</p>
                          )}
                          <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-muted-foreground">
                            <span className="inline-flex items-center gap-1.5">
                              <Clock size={12} />
                              {formatShortDate(m.scheduledStart)} · {formatShortTime(m.scheduledStart)}
                            </span>
                            <span className="inline-flex items-center gap-1.5">
                              <Users size={12} />
                              {m.participants.length} attendees
                            </span>
                            <span className="font-mono text-[11px]">{m.meetingCode}</span>
                            <span>{m.provider === 'google_meet' ? 'Google Meet' : 'Codin'}</span>
                          </div>
                          <div className="mt-3 flex items-center -space-x-1.5">
                            {m.participants.slice(0, 5).map((p) => (
                              <span
                                key={p.id}
                                title={p.name}
                                className="flex h-7 w-7 items-center justify-center overflow-hidden rounded-full border-2 border-card bg-muted text-[9px] font-bold text-muted-foreground"
                              >
                                {p.avatar ? (
                                  <img src={p.avatar} alt="" className="h-full w-full object-cover" />
                                ) : (
                                  p.name.charAt(0)
                                )}
                              </span>
                            ))}
                            {m.participants.length > 5 && (
                              <span className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-card bg-muted text-[9px] font-bold text-muted-foreground">
                                +{m.participants.length - 5}
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="flex shrink-0 items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                          <button
                            onClick={(e) => handleCopy(m, e)}
                            className="grid h-9 w-9 place-items-center rounded-lg border border-border text-muted-foreground hover:bg-muted hover:text-foreground"
                            title="Copy meeting link"
                            aria-label="Copy meeting link"
                          >
                            {copiedId === m.id ? <Check size={14} /> : <Copy size={14} />}
                          </button>
                          {isEnded ? (
                            <button
                              onClick={() => onViewMeetingSummary(m)}
                              className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-border bg-background px-3 text-xs font-semibold text-foreground hover:bg-muted"
                            >
                              <FileText size={13} />
                              Summary
                            </button>
                          ) : (
                            <button
                              onClick={() => onJoinMeeting(m)}
                              className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-primary px-3 text-xs font-semibold text-primary-foreground hover:opacity-90"
                            >
                              <Video size={13} />
                              {isLive ? 'Join live' : 'Join'}
                            </button>
                          )}
                        </div>
                      </div>
                    </article>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
