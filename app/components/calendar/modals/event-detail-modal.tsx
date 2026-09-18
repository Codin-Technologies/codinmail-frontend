'use client';

import {
  formatDateToISO,
  formatDisplayDate,
  formatTime24to12,
} from '@/lib/calendar/date-utils';
import {
  CalendarEvent,
  CalendarItem,
  ParticipantStatus,
} from '@/lib/calendar/types';
import {
  AlertCircle,
  ArrowUpRight,
  Bot,
  Calendar as CalendarIcon,
  Check,
  CheckCircle2,
  CheckSquare,
  Clock,
  Copy,
  Download,
  Edit,
  ExternalLink,
  FileText,
  HelpCircle,
  Mail,
  MapPin,
  MessageCircle,
  MoreHorizontal,
  Paperclip,
  Plus,
  Repeat,
  Share2,
  Sparkles,
  Trash2,
  UserCheck,
  Users,
  Video,
  X,
  XCircle,
} from 'lucide-react';
import React, { useState } from 'react';

type EventDetailModalProps = {
  event: CalendarEvent;
  calendars: CalendarItem[];
  onClose: () => void;
  onEdit: (event: CalendarEvent) => void;
  onDuplicate: (event: CalendarEvent) => void;
  onDelete: (eventId: string) => void;
  onUpdateRSVP: (eventId: string, status: ParticipantStatus) => void;
  onToggleTask: (eventId: string, taskId: string) => void;
  onAddTask: (eventId: string, taskTitle: string) => void;
};

type DetailTab = 'overview' | 'email' | 'chat' | 'files' | 'tasks' | 'ai';

export function EventDetailModal({
  event,
  calendars,
  onClose,
  onEdit,
  onDuplicate,
  onDelete,
  onUpdateRSVP,
  onToggleTask,
  onAddTask,
}: EventDetailModalProps) {
  const [activeTab, setActiveTab] = useState<DetailTab>('overview');
  const [newTaskInput, setNewTaskInput] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  const cal = calendars.find((c) => c.id === event.calendarId);
  const color = cal?.color || {
    bg: '#eff6ff',
    border: '#60a5fa',
    text: '#1e40af',
    dot: '#2563eb',
  };

  const handleCopyLink = () => {
    if (event.meetingUrl) {
      navigator.clipboard?.writeText(event.meetingUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  const handleAddTaskSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskInput.trim()) return;
    onAddTask(event.id, newTaskInput.trim());
    setNewTaskInput('');
  };

  // Participant counts
  const acceptedCount = event.participants.filter((p) => p.status === 'accepted').length;
  const tentativeCount = event.participants.filter((p) => p.status === 'tentative').length;
  const declinedCount = event.participants.filter((p) => p.status === 'declined').length;
  const pendingCount = event.participants.filter((p) => p.status === 'pending').length;

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div
        className="w-full max-w-2xl max-h-[90vh] rounded-2xl border border-border bg-card shadow-2xl flex flex-col overflow-hidden text-foreground animate-in fade-in zoom-in-95"
        role="dialog"
        aria-modal="true"
      >
        {/* Modal Top Bar */}
        <div className="h-14 border-b border-border px-6 flex items-center justify-between bg-card shrink-0">
          <div className="flex items-center gap-2">
            <span
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: color.dot }}
            />
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              {cal?.name || 'Calendar Event'}
            </span>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => onEdit(event)}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              title="Edit event"
            >
              <Edit size={16} />
            </button>
            <button
              onClick={() => onDuplicate(event)}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              title="Duplicate event"
            >
              <Copy size={16} />
            </button>
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-red-600 hover:bg-red-50 dark:hover:bg-red-950/50 transition-colors"
              title="Delete event"
            >
              <Trash2 size={16} />
            </button>
            <div className="w-px h-4 bg-border mx-1" />
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              title="Close modal"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
          {/* Header Info */}
          <div className="space-y-3">
            <h2 className="text-xl md:text-2xl font-extrabold tracking-tight text-foreground">
              {event.title}
            </h2>

            <div className="flex flex-wrap items-center gap-4 text-xs font-medium text-muted-foreground">
              <span className="flex items-center gap-1.5 text-foreground font-semibold">
                <CalendarIcon size={14} className="text-primary" />
                {formatDisplayDate(event.startDate)}
              </span>

              {!event.allDay && event.startTime && (
                <span className="flex items-center gap-1.5">
                  <Clock size={14} />
                  {formatTime24to12(event.startTime)} – {formatTime24to12(event.endTime)} ({event.timezone})
                </span>
              )}

              {event.allDay && (
                <span className="px-2 py-0.5 rounded bg-muted text-muted-foreground font-bold text-[10px]">
                  ALL-DAY
                </span>
              )}

              {event.recurrence && (
                <span className="flex items-center gap-1 text-primary">
                  <Repeat size={13} />
                  <span className="capitalize">{event.recurrence.frequency} recurring</span>
                </span>
              )}
            </div>

            {event.location && (
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <MapPin size={14} />
                <span>{event.location}</span>
              </div>
            )}
          </div>

          {/* Prominent Video Meeting Banner */}
          {event.meetingUrl && (
            <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary text-white grid place-items-center shrink-0">
                  <Video size={20} />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-foreground">Online Meeting Link</h4>
                  <p className="text-xs text-muted-foreground truncate max-w-xs sm:max-w-md">
                    {event.meetingUrl}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopyLink}
                  className="px-3 py-1.5 rounded-lg border border-border bg-card text-xs font-semibold text-foreground hover:bg-muted transition-colors flex items-center gap-1.5"
                >
                  <Copy size={13} />
                  <span>{copiedLink ? 'Copied!' : 'Copy'}</span>
                </button>
                <button
                  onClick={() => window.open(event.meetingUrl, '_blank')}
                  className="px-4 py-1.5 rounded-lg bg-primary text-white text-xs font-bold flex items-center gap-1.5 shadow hover:opacity-90 transition-opacity"
                >
                  <span>Join Meeting</span>
                  <ArrowUpRight size={14} />
                </button>
              </div>
            </div>
          )}

          {/* User RSVP Action Bar */}
          <div className="rounded-xl border border-border bg-muted/20 p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <span className="text-xs font-bold text-foreground">Going?</span>
              <p className="text-[11px] text-muted-foreground">
                Your response: <strong className="capitalize text-foreground">{event.currentUserStatus}</strong>
              </p>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={() => onUpdateRSVP(event.id, 'accepted')}
                className={`px-3 py-1 rounded-lg text-xs font-bold flex items-center gap-1 transition-all ${
                  event.currentUserStatus === 'accepted'
                    ? 'bg-emerald-600 text-white shadow'
                    : 'border border-border bg-card text-foreground hover:bg-muted'
                }`}
              >
                <CheckCircle2 size={13} />
                <span>Yes</span>
              </button>
              <button
                onClick={() => onUpdateRSVP(event.id, 'tentative')}
                className={`px-3 py-1 rounded-lg text-xs font-bold flex items-center gap-1 transition-all ${
                  event.currentUserStatus === 'tentative'
                    ? 'bg-amber-600 text-white shadow'
                    : 'border border-border bg-card text-foreground hover:bg-muted'
                }`}
              >
                <HelpCircle size={13} />
                <span>Maybe</span>
              </button>
              <button
                onClick={() => onUpdateRSVP(event.id, 'declined')}
                className={`px-3 py-1 rounded-lg text-xs font-bold flex items-center gap-1 transition-all ${
                  event.currentUserStatus === 'declined'
                    ? 'bg-red-600 text-white shadow'
                    : 'border border-border bg-card text-foreground hover:bg-muted'
                }`}
              >
                <XCircle size={13} />
                <span>No</span>
              </button>
            </div>
          </div>

          {/* Cross-Platform Tabs */}
          <div className="border-b border-border flex items-center gap-2 overflow-x-auto text-xs font-semibold">
            {[
              { id: 'overview' as const, label: 'Overview', icon: CalendarIcon },
              { id: 'tasks' as const, label: `Tasks (${event.tasks.length})`, icon: CheckSquare },
              { id: 'files' as const, label: `Files (${event.attachments.length})`, icon: FileText },
              { id: 'email' as const, label: 'Email Context', icon: Mail },
              { id: 'chat' as const, label: 'Chat Context', icon: MessageCircle },
              { id: 'ai' as const, label: 'AI Meeting Prep', icon: Sparkles },
            ].map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={`pb-2.5 px-1 border-b-2 flex items-center gap-1.5 transition-colors whitespace-nowrap ${
                  activeTab === id
                    ? 'border-primary text-primary font-bold'
                    : 'border-transparent text-muted-foreground hover:text-foreground'
                }`}
              >
                <Icon size={14} />
                <span>{label}</span>
              </button>
            ))}
          </div>

          {/* Tab 1: Overview */}
          {activeTab === 'overview' && (
            <div className="space-y-5 text-xs">
              {event.description && (
                <div>
                  <h4 className="font-bold text-foreground mb-1.5 uppercase text-[10px] tracking-wider text-muted-foreground">
                    Description & Agenda
                  </h4>
                  <div className="p-3.5 rounded-xl border border-border bg-background text-foreground/90 whitespace-pre-wrap leading-relaxed">
                    {event.description}
                  </div>
                </div>
              )}

              {/* Attendees & Responses */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-bold text-foreground uppercase text-[10px] tracking-wider text-muted-foreground">
                    Participants ({event.participants.length})
                  </h4>
                  <div className="flex items-center gap-2 text-[10px] text-muted-foreground font-medium">
                    <span className="text-emerald-600 font-bold">{acceptedCount} accepted</span>
                    {tentativeCount > 0 && <span>· {tentativeCount} maybe</span>}
                    {declinedCount > 0 && <span>· {declinedCount} declined</span>}
                    {pendingCount > 0 && <span>· {pendingCount} awaiting</span>}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {event.participants.map((p) => (
                    <div
                      key={p.id}
                      className="p-2.5 rounded-lg border border-border bg-card flex items-center justify-between gap-2"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="w-6 h-6 rounded-full bg-primary/10 text-primary font-bold text-[10px] grid place-items-center shrink-0">
                          {p.name.charAt(0)}
                        </span>
                        <div className="min-w-0">
                          <p className="font-bold truncate text-foreground">{p.name}</p>
                          <p className="text-[10px] text-muted-foreground truncate">{p.jobTitle || p.email}</p>
                        </div>
                      </div>

                      <span
                        className={`text-[10px] font-bold px-1.5 py-0.5 rounded capitalize ${
                          p.status === 'accepted'
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                            : p.status === 'tentative'
                            ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
                            : p.status === 'declined'
                            ? 'bg-red-100 text-red-800 dark:bg-red-950/60 dark:text-red-300'
                            : 'bg-muted text-muted-foreground'
                        }`}
                      >
                        {p.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Tab 2: Tasks */}
          {activeTab === 'tasks' && (
            <div className="space-y-4">
              <div className="space-y-2">
                {event.tasks.map((task) => (
                  <div
                    key={task.id}
                    onClick={() => onToggleTask(event.id, task.id)}
                    className="p-3 rounded-xl border border-border bg-card hover:bg-muted/20 cursor-pointer flex items-center justify-between gap-3 transition-colors"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <input
                        type="checkbox"
                        checked={task.completed}
                        onChange={() => {}} // Handled by parent div
                        className="w-4 h-4 rounded text-primary accent-primary cursor-pointer"
                      />
                      <span
                        className={`text-xs font-medium ${
                          task.completed ? 'line-through text-muted-foreground' : 'text-foreground'
                        }`}
                      >
                        {task.title}
                      </span>
                    </div>
                    {task.dueDate && (
                      <span className="text-[10px] font-mono text-muted-foreground shrink-0">
                        Due {task.dueDate}
                      </span>
                    )}
                  </div>
                ))}
              </div>

              {/* Add New Task Input */}
              <form onSubmit={handleAddTaskSubmit} className="flex gap-2">
                <input
                  type="text"
                  value={newTaskInput}
                  onChange={(e) => setNewTaskInput(e.target.value)}
                  placeholder="Add action item for this meeting..."
                  className="flex-1 h-9 rounded-lg border border-border bg-background px-3 text-xs text-foreground placeholder:text-muted-foreground outline-none focus:border-primary"
                />
                <button
                  type="submit"
                  disabled={!newTaskInput.trim()}
                  className="h-9 px-3 rounded-lg bg-primary text-white text-xs font-bold disabled:opacity-50 flex items-center gap-1"
                >
                  <Plus size={14} />
                  <span>Add Task</span>
                </button>
              </form>
            </div>
          )}

          {/* Tab 3: Files & Attachments */}
          {activeTab === 'files' && (
            <div className="space-y-3">
              {event.attachments.length === 0 ? (
                <p className="text-xs text-muted-foreground text-center py-6">
                  No files attached to this event.
                </p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {event.attachments.map((att) => (
                    <div
                      key={att.id}
                      className="p-3 rounded-xl border border-border bg-card flex items-center justify-between gap-3 hover:border-primary/40 transition-colors"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-8 h-8 rounded-lg bg-muted grid place-items-center text-primary shrink-0">
                          <FileText size={16} />
                        </div>
                        <div className="min-w-0">
                          <p className="font-bold text-xs truncate text-foreground">{att.name}</p>
                          <p className="text-[10px] text-muted-foreground font-mono">
                            {att.size} · {att.type}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => alert(`Downloading ${att.name}...`)}
                        className="p-1.5 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground"
                        title="Download file"
                      >
                        <Download size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Tab 4: Email Context */}
          {activeTab === 'email' && (
            <div className="space-y-4">
              {event.relatedEmail ? (
                <div className="rounded-xl border border-border bg-card p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                      Linked Email Conversation
                    </span>
                    <span className="text-[10px] text-muted-foreground font-mono">
                      {event.relatedEmail.date}
                    </span>
                  </div>
                  <h4 className="font-bold text-sm text-foreground">
                    {event.relatedEmail.subject}
                  </h4>
                  <p className="text-xs text-muted-foreground">
                    <strong>From:</strong> {event.relatedEmail.sender}
                  </p>
                  <p className="text-xs text-foreground/80 bg-background p-3 rounded-lg border border-border/80">
                    "{event.relatedEmail.snippet}"
                  </p>
                  <div className="pt-2 flex justify-end">
                    <button
                      onClick={() => alert('Opening related email in Mail workspace...')}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border text-xs font-semibold hover:bg-muted"
                    >
                      <Mail size={13} />
                      <span>Open in Mail</span>
                    </button>
                  </div>
                </div>
              ) : (
                <p className="text-xs text-muted-foreground text-center py-6">
                  No linked email thread found for this event.
                </p>
              )}
            </div>
          )}

          {/* Tab 5: Chat Context */}
          {activeTab === 'chat' && (
            <div className="space-y-4">
              {event.relatedChat ? (
                <div className="rounded-xl border border-border bg-card p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                      Associated Channel
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                      {event.relatedChat.channelName}
                    </span>
                  </div>
                  <p className="text-xs text-foreground/80 bg-background p-3 rounded-lg border border-border/80">
                    "{event.relatedChat.lastMessage}"
                  </p>
                  <div className="pt-2 flex justify-end">
                    <button
                      onClick={() => alert('Opening related channel in Chat workspace...')}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border text-xs font-semibold hover:bg-muted"
                    >
                      <MessageCircle size={13} />
                      <span>Discuss in Chat</span>
                    </button>
                  </div>
                </div>
              ) : (
                <p className="text-xs text-muted-foreground text-center py-6">
                  No linked chat channel found for this event.
                </p>
              )}
            </div>
          )}

          {/* Tab 6: AI Meeting Preparation */}
          {activeTab === 'ai' && (
            <div className="space-y-4 text-xs">
              <div className="rounded-xl border border-amber-200 bg-amber-50/70 dark:bg-amber-950/30 dark:border-amber-800/60 p-4 space-y-3">
                <div className="flex items-center gap-2 text-amber-800 dark:text-amber-300 font-bold">
                  <Sparkles size={16} />
                  <span>AI Executive Summary & Briefing</span>
                </div>
                <p className="text-foreground/90 leading-relaxed">
                  {event.aiNotes?.summary ||
                    'AI has analyzed previous communications, attendee profiles, and documents to prepare you for this session.'}
                </p>
              </div>

              {event.aiNotes?.agenda && (
                <div>
                  <h4 className="font-bold text-foreground uppercase text-[10px] tracking-wider text-muted-foreground mb-2">
                    Proposed Agenda Topics
                  </h4>
                  <ul className="space-y-1.5">
                    {event.aiNotes.agenda.map((item, idx) => (
                      <li
                        key={idx}
                        className="p-2.5 rounded-lg border border-border bg-card flex items-center gap-2"
                      >
                        <span className="w-4 h-4 rounded-full bg-primary/10 text-primary font-bold text-[10px] grid place-items-center shrink-0">
                          {idx + 1}
                        </span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {event.aiNotes?.preparationTips && (
                <div>
                  <h4 className="font-bold text-foreground uppercase text-[10px] tracking-wider text-muted-foreground mb-2">
                    Key Preparation Notes
                  </h4>
                  <div className="space-y-1.5">
                    {event.aiNotes.preparationTips.map((tip, idx) => (
                      <div
                        key={idx}
                        className="p-2.5 rounded-lg border border-border bg-muted/20 flex items-start gap-2"
                      >
                        <Bot size={14} className="text-primary shrink-0 mt-0.5" />
                        <span className="text-muted-foreground">{tip}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Delete Confirmation Overlay */}
        {showDeleteConfirm && (
          <div className="p-4 border-t border-red-200 bg-red-50 dark:bg-red-950/60 dark:border-red-900 flex items-center justify-between gap-4">
            <div>
              <p className="font-bold text-xs text-red-900 dark:text-red-200">
                Delete this calendar event?
              </p>
              <p className="text-[11px] text-red-700 dark:text-red-300">
                All attendees will be notified of the cancellation.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-3 py-1 rounded-lg border border-border bg-card text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={() => onDelete(event.id)}
                className="px-3 py-1 rounded-lg bg-red-600 text-white text-xs font-bold shadow hover:bg-red-700"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
