'use client';

import {
  addMinutesToTime,
  formatDateToISO,
} from '@/lib/calendar/date-utils';
import { MOCK_PARTICIPANTS } from '@/lib/calendar/mock-data';
import { checkEventConflict } from '@/lib/calendar/storage';
import {
  CalendarEvent,
  CalendarItem,
  Participant,
  RecurrenceFrequency,
  ReminderMinutes,
} from '@/lib/calendar/types';
import {
  AlertTriangle,
  Calendar as CalendarIcon,
  Check,
  Clock,
  Globe,
  MapPin,
  Plus,
  Repeat,
  Sparkles,
  Users,
  Video,
  X,
} from 'lucide-react';
import React, { useEffect, useState } from 'react';

type EventFormModalProps = {
  initialEvent?: Partial<CalendarEvent>;
  calendars: CalendarItem[];
  allEvents: CalendarEvent[];
  onSave: (eventData: Partial<CalendarEvent>) => void;
  onClose: () => void;
};

export function EventFormModal({
  initialEvent,
  calendars,
  allEvents,
  onSave,
  onClose,
}: EventFormModalProps) {
  const [isAdvanced, setIsAdvanced] = useState(false);

  // Form States
  const [title, setTitle] = useState(initialEvent?.title || '');
  const [calendarId, setCalendarId] = useState(
    initialEvent?.calendarId || calendars.find((c) => c.isDefault)?.id || calendars[0]?.id || 'cal-work'
  );
  const [startDate, setStartDate] = useState(
    initialEvent?.startDate || formatDateToISO(new Date(2026, 7, 24))
  );
  const [startTime, setStartTime] = useState(initialEvent?.startTime || '10:00');
  const [endDate, setEndDate] = useState(
    initialEvent?.endDate || initialEvent?.startDate || formatDateToISO(new Date(2026, 7, 24))
  );
  const [endTime, setEndTime] = useState(
    initialEvent?.endTime || addMinutesToTime(initialEvent?.startTime || '10:00', 60)
  );
  const [allDay, setAllDay] = useState(initialEvent?.allDay || false);
  const [location, setLocation] = useState(initialEvent?.location || '');
  const [meetingUrl, setMeetingUrl] = useState(initialEvent?.meetingUrl || '');
  const [description, setDescription] = useState(initialEvent?.description || '');
  const [timezone, setTimezone] = useState(
    initialEvent?.timezone || 'America/New_York (EDT)'
  );
  const [frequency, setFrequency] = useState<RecurrenceFrequency>(
    initialEvent?.recurrence?.frequency || 'none'
  );
  const [selectedParticipants, setSelectedParticipants] = useState<Participant[]>(
    initialEvent?.participants || [MOCK_PARTICIPANTS[0]]
  );
  const [availability, setAvailability] = useState<'busy' | 'free' | 'tentative' | 'oof'>(
    initialEvent?.availability || 'busy'
  );
  const [visibility, setVisibility] = useState<'public' | 'private' | 'confidential'>(
    initialEvent?.visibility || 'public'
  );
  const [reminder, setReminder] = useState<ReminderMinutes>(15);

  // Live Conflict Checking
  const conflict = checkEventConflict(
    {
      id: initialEvent?.id,
      startDate,
      startTime: allDay ? undefined : startTime,
      endDate,
      endTime: allDay ? undefined : endTime,
      allDay,
    },
    allEvents
  );

  const handleAddMeetingLink = (provider: 'meet' | 'zoom' | 'teams') => {
    const randomId = Math.random().toString(36).substring(2, 9);
    if (provider === 'meet') setMeetingUrl(`https://meet.google.com/${randomId}`);
    else if (provider === 'zoom') setMeetingUrl(`https://zoom.us/j/984${randomId}`);
    else setMeetingUrl(`https://teams.microsoft.com/l/meetup-join/${randomId}`);
  };

  const handleToggleParticipant = (p: Participant) => {
    if (selectedParticipants.some((sp) => sp.id === p.id)) {
      if (p.id === 'user-self') return; // Don't remove self
      setSelectedParticipants((prev) => prev.filter((sp) => sp.id !== p.id));
    } else {
      setSelectedParticipants((prev) => [...prev, p]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    onSave({
      id: initialEvent?.id,
      title: title.trim(),
      calendarId,
      startDate,
      startTime: allDay ? undefined : startTime,
      endDate,
      endTime: allDay ? undefined : endTime,
      allDay,
      timezone,
      location: location.trim() || undefined,
      meetingUrl: meetingUrl.trim() || undefined,
      description: description.trim() || undefined,
      recurrence: frequency !== 'none' ? { frequency } : undefined,
      organizer: MOCK_PARTICIPANTS[0],
      participants: selectedParticipants,
      currentUserStatus: 'accepted',
      reminders: [reminder],
      availability,
      visibility,
      attachments: initialEvent?.attachments || [],
      tasks: initialEvent?.tasks || [],
      aiNotes: initialEvent?.aiNotes,
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div
        className="w-full max-w-xl max-h-[92vh] rounded-2xl border border-border bg-card shadow-2xl flex flex-col overflow-hidden text-foreground animate-in fade-in zoom-in-95"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="h-14 border-b border-border px-6 flex items-center justify-between bg-card shrink-0">
          <h3 className="font-bold text-base text-foreground">
            {initialEvent?.id ? 'Edit Event' : 'Create New Event'}
          </h3>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsAdvanced((v) => !v)}
              className="text-xs font-semibold text-primary hover:underline px-2 py-1"
            >
              {isAdvanced ? 'Quick options' : 'More options'}
            </button>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5 custom-scrollbar text-xs">
          {/* Conflict Warning Banner if detected */}
          {conflict.hasConflict && (
            <div className="p-3.5 rounded-xl border border-amber-300 bg-amber-50 dark:bg-amber-950/40 dark:border-amber-800 text-amber-900 dark:text-amber-200 flex items-start gap-2.5">
              <AlertTriangle size={16} className="text-amber-600 shrink-0 mt-0.5" />
              <div className="min-w-0 flex-1">
                <p className="font-bold">{conflict.warningMessage}</p>
                <p className="text-[11px] opacity-80 mt-0.5">
                  You can keep this schedule anyway or adjust the time slot.
                </p>
              </div>
            </div>
          )}

          {/* Event Title */}
          <div>
            <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1.5">
              Title *
            </label>
            <input
              type="text"
              required
              autoFocus
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Add title (e.g. Design Critique, Operations Sync)"
              className="w-full h-10 rounded-xl border border-border bg-background px-3.5 text-sm font-semibold text-foreground placeholder:text-muted-foreground outline-none focus:border-primary focus:ring-1 focus:ring-primary/20"
            />
          </div>

          {/* Calendar Selector */}
          <div>
            <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1.5">
              Calendar
            </label>
            <select
              value={calendarId}
              onChange={(e) => setCalendarId(e.target.value)}
              className="w-full h-9 rounded-lg border border-border bg-background px-3 text-xs font-medium text-foreground outline-none focus:border-primary"
            >
              {calendars.map((cal) => (
                <option key={cal.id} value={cal.id}>
                  {cal.name} ({cal.category})
                </option>
              ))}
            </select>
          </div>

          {/* Date & Time Grid */}
          <div className="space-y-3 p-3.5 rounded-xl border border-border bg-muted/20">
            <div className="flex items-center justify-between">
              <span className="font-bold text-foreground flex items-center gap-1.5">
                <Clock size={14} className="text-primary" />
                <span>Date & Time</span>
              </span>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={allDay}
                  onChange={(e) => setAllDay(e.target.checked)}
                  className="rounded text-primary accent-primary"
                />
                <span className="font-semibold text-muted-foreground">All day</span>
              </label>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <div className="col-span-2 sm:col-span-2">
                <label className="block text-[10px] text-muted-foreground mb-1">Start Date</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => {
                    setStartDate(e.target.value);
                    if (e.target.value > endDate) setEndDate(e.target.value);
                  }}
                  className="w-full h-9 rounded-lg border border-border bg-background px-2.5 text-xs text-foreground outline-none focus:border-primary"
                />
              </div>

              {!allDay && (
                <div className="col-span-2 sm:col-span-2">
                  <label className="block text-[10px] text-muted-foreground mb-1">Start Time</label>
                  <input
                    type="time"
                    value={startTime}
                    onChange={(e) => {
                      setStartTime(e.target.value);
                      setEndTime(addMinutesToTime(e.target.value, 60));
                    }}
                    className="w-full h-9 rounded-lg border border-border bg-background px-2.5 text-xs text-foreground outline-none focus:border-primary"
                  />
                </div>
              )}

              <div className="col-span-2 sm:col-span-2">
                <label className="block text-[10px] text-muted-foreground mb-1">End Date</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full h-9 rounded-lg border border-border bg-background px-2.5 text-xs text-foreground outline-none focus:border-primary"
                />
              </div>

              {!allDay && (
                <div className="col-span-2 sm:col-span-2">
                  <label className="block text-[10px] text-muted-foreground mb-1">End Time</label>
                  <input
                    type="time"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="w-full h-9 rounded-lg border border-border bg-background px-2.5 text-xs text-foreground outline-none focus:border-primary"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Location & Video Call Link */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider">
              Location & Conferencing
            </label>
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <MapPin size={14} className="absolute left-3 top-2.5 text-muted-foreground" />
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="Location or Room (e.g. Conference Room B)"
                  className="w-full h-9 pl-8 pr-3 rounded-lg border border-border bg-background text-xs text-foreground outline-none focus:border-primary"
                />
              </div>
            </div>

            {/* Video Meeting Quick Button */}
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Video size={14} className="absolute left-3 top-2.5 text-primary" />
                <input
                  type="url"
                  value={meetingUrl}
                  onChange={(e) => setMeetingUrl(e.target.value)}
                  placeholder="Video Meeting URL (Google Meet / Zoom)"
                  className="w-full h-9 pl-8 pr-3 rounded-lg border border-border bg-background text-xs text-foreground outline-none focus:border-primary"
                />
              </div>
              {!meetingUrl && (
                <button
                  type="button"
                  onClick={() => handleAddMeetingLink('meet')}
                  className="h-9 px-3 rounded-lg border border-border bg-background hover:bg-muted text-xs font-semibold shrink-0"
                >
                  + Add Meet
                </button>
              )}
            </div>
          </div>

          {/* Participants Autocomplete Chips */}
          <div>
            <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1.5">
              Attendees ({selectedParticipants.length})
            </label>
            <div className="flex flex-wrap gap-1.5 mb-2">
              {selectedParticipants.map((p) => (
                <span
                  key={p.id}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-accent text-accent-foreground font-semibold text-xs border border-primary/20"
                >
                  <span>{p.name}</span>
                  {p.id !== 'user-self' && (
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

            {/* Suggestions from Contacts */}
            <div className="flex flex-wrap gap-1.5">
              {MOCK_PARTICIPANTS.filter((p) => !selectedParticipants.some((sp) => sp.id === p.id)).map((p) => (
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

          {/* Advanced Fields (Recurrence, Reminder, Description) */}
          {isAdvanced && (
            <div className="space-y-4 pt-3 border-t border-border">
              {/* Recurrence */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] text-muted-foreground uppercase font-bold mb-1">
                    Repeat
                  </label>
                  <select
                    value={frequency}
                    onChange={(e) => setFrequency(e.target.value as RecurrenceFrequency)}
                    className="w-full h-9 rounded-lg border border-border bg-background px-2.5 text-xs text-foreground outline-none"
                  >
                    <option value="none">Does not repeat</option>
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="biweekly">Every 2 weeks</option>
                    <option value="monthly">Monthly</option>
                    <option value="yearly">Yearly</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] text-muted-foreground uppercase font-bold mb-1">
                    Reminder
                  </label>
                  <select
                    value={reminder}
                    onChange={(e) => setReminder(Number(e.target.value) as ReminderMinutes)}
                    className="w-full h-9 rounded-lg border border-border bg-background px-2.5 text-xs text-foreground outline-none"
                  >
                    <option value={5}>5 minutes before</option>
                    <option value={10}>10 minutes before</option>
                    <option value={15}>15 minutes before</option>
                    <option value={30}>30 minutes before</option>
                    <option value={60}>1 hour before</option>
                    <option value={1440}>1 day before</option>
                  </select>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-[10px] text-muted-foreground uppercase font-bold mb-1">
                  Description & Agenda
                </label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Add meeting notes, agenda, dial-in info..."
                  className="w-full rounded-xl border border-border bg-background p-3 text-xs text-foreground placeholder:text-muted-foreground outline-none focus:border-primary leading-relaxed"
                />
              </div>
            </div>
          )}

          {/* Footer Actions */}
          <div className="pt-4 border-t border-border flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg border border-border text-xs font-semibold hover:bg-muted text-foreground"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!title.trim()}
              className="px-5 py-2 rounded-lg bg-primary text-white text-xs font-bold shadow hover:opacity-90 disabled:opacity-50 transition-opacity"
            >
              {initialEvent?.id ? 'Save Changes' : 'Schedule Event'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
