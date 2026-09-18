'use client';

import {
  formatDateToISO,
  formatDisplayDate,
  formatTime24to12,
} from '@/lib/calendar/date-utils';
import { MOCK_PARTICIPANTS } from '@/lib/calendar/mock-data';
import { solveParticipantAvailability } from '@/lib/calendar/storage';
import {
  AvailabilitySlot,
  CalendarEvent,
  CalendarItem,
  Participant,
} from '@/lib/calendar/types';
import {
  AlertCircle,
  Calendar as CalendarIcon,
  Check,
  CheckCircle2,
  Clock,
  Plus,
  Sparkles,
  UserCheck,
  Users,
  X,
} from 'lucide-react';
import React, { useState } from 'react';

type SchedulingAssistantModalProps = {
  allEvents: CalendarEvent[];
  calendars: CalendarItem[];
  onSelectSlotToCreate: (slot: {
    startDate: string;
    startTime: string;
    endDate: string;
    endTime: string;
    participants: Participant[];
  }) => void;
  onClose: () => void;
};

export function SchedulingAssistantModal({
  allEvents,
  calendars,
  onSelectSlotToCreate,
  onClose,
}: SchedulingAssistantModalProps) {
  const [selectedParticipantIds, setSelectedParticipantIds] = useState<string[]>([
    'user-self',
    'user-maya',
    'user-lee',
  ]);
  const [durationMinutes, setDurationMinutes] = useState<number>(60);
  const [targetDates, setTargetDates] = useState<string[]>([
    '2026-08-25',
    '2026-08-26',
    '2026-08-27',
  ]);

  const handleToggleParticipant = (id: string) => {
    if (id === 'user-self') return; // Keep self
    setSelectedParticipantIds((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
    );
  };

  const slots: AvailabilitySlot[] = solveParticipantAvailability(
    selectedParticipantIds,
    targetDates,
    durationMinutes,
    allEvents
  );

  const selectedParticipants = MOCK_PARTICIPANTS.filter((p) =>
    selectedParticipantIds.includes(p.id)
  );

  const handleBookSlot = (slot: AvailabilitySlot) => {
    onSelectSlotToCreate({
      startDate: slot.date,
      startTime: slot.startTime,
      endDate: slot.date,
      endTime: slot.endTime,
      participants: selectedParticipants,
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div
        className="w-full max-w-2xl max-h-[90vh] rounded-2xl border border-border bg-card shadow-2xl overflow-hidden text-foreground animate-in fade-in zoom-in-95 flex flex-col"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="h-14 border-b border-border px-6 flex items-center justify-between bg-card shrink-0">
          <div className="flex items-center gap-2">
            <UserCheck size={18} className="text-primary" />
            <h3 className="font-bold text-base text-foreground">
              Scheduling Assistant — Find a Time
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
        <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar text-xs">
          {/* Controls: Participants & Duration */}
          <div className="space-y-4 p-4 rounded-xl border border-border bg-muted/20">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-2">
                Select Attendees to Coordinate
              </label>
              <div className="flex flex-wrap gap-2">
                {MOCK_PARTICIPANTS.map((p) => {
                  const isSelected = selectedParticipantIds.includes(p.id);
                  return (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => handleToggleParticipant(p.id)}
                      className={`px-3 py-1.5 rounded-lg border text-xs font-semibold flex items-center gap-1.5 transition-all ${
                        isSelected
                          ? 'bg-primary text-white border-primary shadow-xs'
                          : 'bg-card border-border text-foreground hover:bg-muted'
                      }`}
                    >
                      <span>{p.name}</span>
                      {isSelected && <Check size={13} className="stroke-[3]" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Duration Selector */}
            <div className="flex items-center justify-between gap-4 pt-2 border-t border-border/60">
              <span className="font-bold text-foreground">Meeting Duration:</span>
              <div className="flex items-center gap-1">
                {[15, 30, 45, 60, 90].map((mins) => (
                  <button
                    key={mins}
                    type="button"
                    onClick={() => setDurationMinutes(mins)}
                    className={`px-2.5 py-1 rounded-md text-xs font-bold transition-colors ${
                      durationMinutes === mins
                        ? 'bg-accent text-accent-foreground border border-primary/30'
                        : 'border border-border bg-card text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    {mins}m
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Results: Ranked Available Slots */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                Optimal Suggested Meeting Slots ({slots.length})
              </span>
              <span className="text-[10px] text-muted-foreground">
                Evaluated against {selectedParticipantIds.length} calendars
              </span>
            </div>

            <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
              {slots.map((slot, idx) => {
                const isOptimal = slot.score === 100;
                return (
                  <div
                    key={`${slot.date}-${slot.startTime}`}
                    className={`p-3.5 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-all ${
                      isOptimal
                        ? 'border-emerald-200 bg-emerald-50/40 dark:bg-emerald-950/20 dark:border-emerald-800'
                        : 'border-border bg-card hover:bg-muted/30'
                    }`}
                  >
                    <div className="flex items-start gap-3 min-w-0">
                      <div
                        className={`w-9 h-9 rounded-xl grid place-items-center shrink-0 font-bold ${
                          isOptimal
                            ? 'bg-emerald-600 text-white'
                            : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                        }`}
                      >
                        {isOptimal ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <strong className="text-sm text-foreground">
                            {formatDisplayDate(slot.date)}
                          </strong>
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              isOptimal
                                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                                : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                            }`}
                          >
                            {isOptimal ? 'All Available' : '1 Potential Conflict'}
                          </span>
                        </div>

                        <p className="text-xs text-muted-foreground font-mono mt-0.5 flex items-center gap-1">
                          <Clock size={12} />
                          {formatTime24to12(slot.startTime)} – {formatTime24to12(slot.endTime)} ({durationMinutes} mins)
                        </p>

                        {slot.conflicts.length > 0 && (
                          <p className="text-[10px] text-amber-700 dark:text-amber-400 mt-1">
                            Busy: {slot.conflicts.map((c) => c.participantName).join(', ')}
                          </p>
                        )}
                      </div>
                    </div>

                    <button
                      onClick={() => handleBookSlot(slot)}
                      className="px-4 py-2 rounded-lg bg-primary text-white text-xs font-bold shadow hover:opacity-90 transition-opacity shrink-0 flex items-center justify-center gap-1.5"
                    >
                      <Plus size={14} />
                      <span>Select Slot</span>
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-border bg-card flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg border border-border text-xs font-semibold hover:bg-muted text-foreground"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
