'use client';

import {
  formatDisplayDate,
  formatTime24to12,
} from '@/lib/calendar/date-utils';
import { parseNaturalLanguageInput } from '@/lib/calendar/storage';
import { CalendarEvent, CalendarItem } from '@/lib/calendar/types';
import {
  Bot,
  Calendar as CalendarIcon,
  CheckCircle2,
  Clock,
  MapPin,
  Sparkles,
  Users,
  X,
} from 'lucide-react';
import React, { useEffect, useState } from 'react';

type NaturalLanguageModalProps = {
  calendars: CalendarItem[];
  onConfirm: (eventData: Partial<CalendarEvent>) => void;
  onClose: () => void;
};

const SAMPLE_PROMPTS = [
  'Meeting with Maya Chen tomorrow at 3pm for 45 mins',
  'Design review with Lee next Tuesday at 14:00 for 1 hour',
  'Sprint retro with Delba and Tim on Friday at 10am',
  'Lunch with Sarah Jenkins at 12:30pm on August 28',
];

export function NaturalLanguageModal({
  calendars,
  onConfirm,
  onClose,
}: NaturalLanguageModalProps) {
  const [input, setInput] = useState('Meeting with Maya Chen tomorrow at 3pm for 45 mins');
  const [parsed, setParsed] = useState(() => parseNaturalLanguageInput(input));

  useEffect(() => {
    if (input.trim()) {
      setParsed(parseNaturalLanguageInput(input));
    }
  }, [input]);

  const handleSelectSample = (sample: string) => {
    setInput(sample);
  };

  const handleSchedule = () => {
    onConfirm({
      title: parsed.title,
      startDate: parsed.startDate,
      startTime: parsed.startTime,
      endDate: parsed.endDate,
      endTime: parsed.endTime,
      allDay: false,
      timezone: 'America/New_York (EDT)',
      calendarId: parsed.calendarId || calendars[0]?.id || 'cal-work',
      location: parsed.location,
      participants: parsed.participants,
      currentUserStatus: 'accepted',
      reminders: [15],
      availability: 'busy',
      visibility: 'public',
      attachments: [],
      tasks: [],
      aiNotes: {
        summary: `Created via AI natural language scheduling from prompt: "${input}"`,
      },
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div
        className="w-full max-w-lg rounded-2xl border border-border bg-card shadow-2xl overflow-hidden text-foreground animate-in fade-in zoom-in-95 flex flex-col"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="h-14 border-b border-border px-6 flex items-center justify-between bg-card">
          <div className="flex items-center gap-2">
            <Sparkles size={18} className="text-amber-500" />
            <h3 className="font-bold text-base text-foreground">
              AI Natural-Language Scheduling
            </h3>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5">
          {/* Input Prompt Box */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider">
              Describe your meeting in plain English
            </label>
            <div className="relative">
              <textarea
                rows={3}
                autoFocus
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="e.g. 1:1 with Alex next Monday at 2pm for 30 minutes in Room 4B"
                className="w-full rounded-xl border border-border bg-background p-3.5 text-xs text-foreground placeholder:text-muted-foreground outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 leading-relaxed font-medium"
              />
            </div>

            {/* Quick Sample Prompt Chips */}
            <div className="flex flex-wrap gap-1.5 pt-1">
              {SAMPLE_PROMPTS.map((sample) => (
                <button
                  key={sample}
                  type="button"
                  onClick={() => handleSelectSample(sample)}
                  className="text-[11px] px-2.5 py-1 rounded-full border border-border bg-muted/30 hover:bg-muted text-muted-foreground hover:text-foreground text-left transition-colors"
                >
                  "{sample}"
                </button>
              ))}
            </div>
          </div>

          {/* AI Interpretation Card */}
          <div className="rounded-xl border border-amber-200 bg-amber-50/60 dark:bg-amber-950/30 dark:border-amber-800/60 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800 dark:text-amber-300 flex items-center gap-1.5">
                <Bot size={14} />
                <span>Interpreted Event Details</span>
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                {Math.round(parsed.confidence * 100)}% Match Confidence
              </span>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex items-center gap-2">
                <strong className="text-sm text-foreground">{parsed.title}</strong>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-muted-foreground">
                <div className="flex items-center gap-1.5">
                  <CalendarIcon size={13} className="text-primary" />
                  <span>{formatDisplayDate(parsed.startDate)}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Clock size={13} />
                  <span>
                    {formatTime24to12(parsed.startTime)} – {formatTime24to12(parsed.endTime)} ({parsed.durationMinutes}m)
                  </span>
                </div>
                {parsed.location && (
                  <div className="flex items-center gap-1.5 col-span-2">
                    <MapPin size={13} />
                    <span>{parsed.location}</span>
                  </div>
                )}
              </div>

              {parsed.participants.length > 0 && (
                <div className="pt-2 border-t border-amber-200/60 dark:border-amber-800/40">
                  <span className="text-[10px] font-bold text-muted-foreground block mb-1">
                    Detected Attendees:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {parsed.participants.map((p) => (
                      <span
                        key={p.id}
                        className="px-2 py-0.5 rounded-md bg-white dark:bg-card border border-border text-[11px] font-semibold text-foreground flex items-center gap-1"
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                        <span>{p.name}</span>
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-border bg-card flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg border border-border text-xs font-semibold hover:bg-muted text-foreground"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSchedule}
            className="px-5 py-2 rounded-lg bg-primary text-white text-xs font-bold shadow hover:opacity-90 transition-opacity flex items-center gap-1.5"
          >
            <CheckCircle2 size={14} />
            <span>Confirm & Schedule</span>
          </button>
        </div>
      </div>
    </div>
  );
}
