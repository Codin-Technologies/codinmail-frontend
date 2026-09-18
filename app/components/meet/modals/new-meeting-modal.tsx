'use client';

import { MOCK_PARTICIPANTS_POOL } from '@/lib/meet/mock-data';
import { getMeetingProviderAdapter } from '@/lib/meet/provider-adapter';
import { Meeting, MeetingParticipant, MeetingProviderType } from '@/lib/meet/types';
import {
  Calendar,
  Clock,
  Globe,
  Plus,
  Sparkles,
  Users,
  Video,
  X,
} from 'lucide-react';
import React, { useState } from 'react';
import { toast } from 'sonner';

type NewMeetingModalProps = {
  currentUser: MeetingParticipant;
  onCreateMeeting: (newMeeting: Meeting) => void;
  onClose: () => void;
};

export function NewMeetingModal({
  currentUser,
  onCreateMeeting,
  onClose,
}: NewMeetingModalProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('2026-08-25');
  const [startTime, setStartTime] = useState('14:00');
  const [endTime, setEndTime] = useState('15:00');
  const [provider, setProvider] = useState<MeetingProviderType>('google_meet');
  const [selectedParticipants, setSelectedParticipants] = useState<MeetingParticipant[]>([
    currentUser,
    MOCK_PARTICIPANTS_POOL[1], // Maya
    MOCK_PARTICIPANTS_POOL[2], // Lee
  ]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleToggleParticipant = (p: MeetingParticipant) => {
    if (p.id === currentUser.id) return;
    if (selectedParticipants.some((sp) => sp.id === p.id)) {
      setSelectedParticipants((prev) => prev.filter((sp) => sp.id !== p.id));
    } else {
      setSelectedParticipants((prev) => [...prev, p]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setIsSubmitting(true);
    const adapter = getMeetingProviderAdapter(provider);
    const providerResult = await adapter.createMeeting({
      title: title.trim(),
      description: description.trim() || undefined,
      scheduledStart: `${date}T${startTime}:00`,
      scheduledEnd: `${date}T${endTime}:00`,
      organizerName: currentUser.name,
      organizerEmail: currentUser.email,
      participants: selectedParticipants.map((p) => ({ name: p.name, email: p.email })),
    });

    const newMeeting: Meeting = {
      id: `meet-${Date.now()}`,
      title: title.trim(),
      description: description.trim() || undefined,
      organizerId: currentUser.id,
      organizerName: currentUser.name,
      organizerEmail: currentUser.email,
      provider: providerResult.provider,
      providerMeetingId: providerResult.providerMeetingId,
      meetingCode: providerResult.meetingCode,
      meetingUrl: providerResult.meetingUrl,
      calendarEventId: `evt-${Date.now()}`,
      scheduledStart: `${date}T${startTime}:00`,
      scheduledEnd: `${date}T${endTime}:00`,
      timezone: 'America/New_York (EDT)',
      status: 'scheduled',
      participants: selectedParticipants,
      messages: [],
      files: [],
      tasks: [],
      notes: {
        id: `notes-${Date.now()}`,
        meetingId: `meet-${Date.now()}`,
        agendaItems: ['1. Introductions & Context', '2. Key Discussion', '3. Action Items'],
        notesContent: '',
        decisions: [],
        updatedAt: 'Just now',
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setIsSubmitting(false);
    onCreateMeeting(newMeeting);
    toast.success(`Meeting "${newMeeting.title}" created with ${providerResult.provider}`);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div
        className="w-full max-w-xl rounded-3xl border border-border bg-card shadow-2xl overflow-hidden text-foreground animate-in fade-in zoom-in-95 flex flex-col"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="h-14 border-b border-border px-6 flex items-center justify-between bg-card shrink-0">
          <div className="flex items-center gap-2">
            <Video size={18} className="text-primary" />
            <h3 className="font-bold text-base text-foreground">Schedule New Meeting</h3>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 text-xs custom-scrollbar overflow-y-auto max-h-[80vh]">
          {/* Title */}
          <div>
            <label className="block font-bold text-[10px] uppercase tracking-wider text-muted-foreground mb-1.5">
              Meeting Title *
            </label>
            <input
              type="text"
              required
              autoFocus
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Q3 Architecture Review, Design Sprint"
              className="w-full h-10 rounded-xl border border-border bg-background px-3.5 text-sm font-semibold outline-none focus:border-primary"
            />
          </div>

          {/* Provider Selection */}
          <div className="space-y-1.5">
            <label className="block font-bold text-[10px] uppercase tracking-wider text-muted-foreground">
              Meeting Provider (Infrastructure)
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setProvider('google_meet')}
                className={`p-3 rounded-xl border text-left transition-all ${
                  provider === 'google_meet'
                    ? 'border-primary bg-primary/10 text-primary font-bold shadow-xs'
                    : 'border-border bg-background hover:bg-muted text-foreground'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-md bg-blue-500 text-white font-bold text-[11px] grid place-items-center">
                    G
                  </span>
                  <span>Google Meet</span>
                </div>
                <p className="text-[10px] text-muted-foreground font-normal mt-1">
                  Google conferencing + native Codin notes/tasks
                </p>
              </button>

              <button
                type="button"
                onClick={() => setProvider('codin')}
                className={`p-3 rounded-xl border text-left transition-all ${
                  provider === 'codin'
                    ? 'border-primary bg-primary/10 text-primary font-bold shadow-xs'
                    : 'border-border bg-background hover:bg-muted text-foreground'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-md bg-primary text-white font-bold text-[11px] grid place-items-center">
                    C
                  </span>
                  <span>Codin WebRTC</span>
                </div>
                <p className="text-[10px] text-muted-foreground font-normal mt-1">
                  Direct peer-to-peer enterprise room
                </p>
              </button>
            </div>
          </div>

          {/* Date & Time Grid */}
          <div className="p-3.5 rounded-2xl border border-border bg-muted/20 space-y-3">
            <span className="font-bold text-foreground flex items-center gap-1.5">
              <Clock size={13} className="text-primary" />
              <span>Date & Time</span>
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <div>
                <label className="block text-[10px] text-muted-foreground mb-1">Date</label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full h-9 rounded-lg border border-border bg-background px-2.5 outline-none"
                />
              </div>
              <div>
                <label className="block text-[10px] text-muted-foreground mb-1">Start Time</label>
                <input
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="w-full h-9 rounded-lg border border-border bg-background px-2.5 outline-none"
                />
              </div>
              <div>
                <label className="block text-[10px] text-muted-foreground mb-1">End Time</label>
                <input
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="w-full h-9 rounded-lg border border-border bg-background px-2.5 outline-none"
                />
              </div>
            </div>
          </div>

          {/* Attendees */}
          <div>
            <label className="block font-bold text-[10px] uppercase tracking-wider text-muted-foreground mb-1.5">
              Invite Attendees ({selectedParticipants.length})
            </label>
            <div className="flex flex-wrap gap-1.5 mb-2">
              {selectedParticipants.map((p) => (
                <span
                  key={p.id}
                  className="px-2.5 py-1 rounded-full bg-accent text-accent-foreground text-xs font-semibold flex items-center gap-1.5 border border-primary/20"
                >
                  <span>{p.name}</span>
                  {p.id !== currentUser.id && (
                    <button
                      type="button"
                      onClick={() => handleToggleParticipant(p)}
                      className="hover:text-red-500"
                    >
                      <X size={12} />
                    </button>
                  )}
                </span>
              ))}
            </div>

            {/* Suggestions */}
            <div className="flex flex-wrap gap-1.5">
              {MOCK_PARTICIPANTS_POOL.filter((p) => !selectedParticipants.some((sp) => sp.id === p.id)).map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => handleToggleParticipant(p)}
                  className="px-2 py-0.5 rounded-md border border-border bg-background text-[11px] text-muted-foreground hover:text-foreground hover:bg-muted flex items-center gap-1"
                >
                  <Plus size={10} />
                  <span>{p.name.split(' ')[0]}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block font-bold text-[10px] uppercase tracking-wider text-muted-foreground mb-1.5">
              Agenda & Description
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Outline objectives, pre-read links, and goals..."
              className="w-full rounded-xl border border-border bg-background p-3 text-xs outline-none focus:border-primary leading-relaxed resize-none"
            />
          </div>

          {/* Footer Actions */}
          <div className="pt-4 border-t border-border flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-border text-xs font-semibold hover:bg-muted"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !title.trim()}
              className="px-5 py-2 rounded-xl bg-primary text-white text-xs font-bold shadow hover:opacity-90 disabled:opacity-50 transition-opacity"
            >
              {isSubmitting ? 'Creating...' : 'Create Meeting'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
