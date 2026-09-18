'use client';

import {
  DAYS_OF_WEEK,
  formatDateToISO,
  formatTime24to12,
  getMonthGrid,
  parseISODate,
} from '@/lib/calendar/date-utils';
import { CalendarEvent, CalendarItem } from '@/lib/calendar/types';
import {
  Calendar as CalendarIcon,
  Check,
  Clock,
  MoreHorizontal,
  Plus,
  Video,
  X,
} from 'lucide-react';
import React, { useState } from 'react';

type MonthViewProps = {
  currentDate: Date;
  events: CalendarEvent[];
  calendars: CalendarItem[];
  onSelectEvent: (event: CalendarEvent) => void;
  onSelectDate: (date: Date) => void;
  onQuickCreateAtDate: (dateISO: string) => void;
};

export function MonthView({
  currentDate,
  events,
  calendars,
  onSelectEvent,
  onSelectDate,
  onQuickCreateAtDate,
}: MonthViewProps) {
  const [selectedDayOverflow, setSelectedDayOverflow] = useState<{
    dateString: string;
    events: CalendarEvent[];
  } | null>(null);

  const todayISO = formatDateToISO(new Date(2026, 7, 24)); // Baseline Demo Date
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const grid = getMonthGrid(year, month, todayISO);

  const calendarMap = new Map<string, CalendarItem>();
  calendars.forEach((c) => calendarMap.set(c.id, c));

  // Map events to day string
  const eventsByDay = new Map<string, CalendarEvent[]>();
  events.forEach((evt) => {
    // Only include visible calendars
    const cal = calendarMap.get(evt.calendarId);
    if (cal && !cal.isVisible) return;

    const list = eventsByDay.get(evt.startDate) || [];
    list.push(evt);
    eventsByDay.set(evt.startDate, list);
  });

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-background select-none relative">
      {/* Weekday Header */}
      <div className="grid grid-cols-7 border-b border-border bg-card text-center text-xs font-semibold text-muted-foreground shrink-0 py-2">
        {DAYS_OF_WEEK.map((day, idx) => (
          <div key={day} className={idx === 0 || idx === 6 ? 'text-muted-foreground/70' : ''}>
            {day}
          </div>
        ))}
      </div>

      {/* Month Days Grid (6 rows x 7 cols) */}
      <div className="flex-1 grid grid-cols-7 grid-rows-6 min-h-0 bg-border gap-[1px]">
        {grid.map((cell) => {
          const dayEvents = eventsByDay.get(cell.dateString) || [];
          const visibleEvents = dayEvents.slice(0, 3);
          const overflowCount = dayEvents.length - 3;
          const isSelected = cell.dateString === formatDateToISO(currentDate);

          return (
            <div
              key={cell.dateString}
              onClick={(e) => {
                // If clicked on cell background, open quick create
                if (e.target === e.currentTarget) {
                  onQuickCreateAtDate(cell.dateString);
                }
              }}
              className={`flex flex-col p-1.5 min-h-0 overflow-hidden transition-colors relative group ${
                !cell.isCurrentMonth
                  ? 'bg-muted/30 text-muted-foreground/50'
                  : 'bg-card text-foreground hover:bg-muted/10'
              } ${isSelected ? 'ring-2 ring-primary/60 ring-inset z-10' : ''}`}
            >
              {/* Day Number Header */}
              <div className="flex items-center justify-between mb-1">
                <button
                  onClick={() => onSelectDate(cell.date)}
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold transition-colors ${
                    cell.isToday
                      ? 'bg-primary text-white font-bold shadow-sm'
                      : isSelected
                      ? 'bg-accent text-accent-foreground font-bold'
                      : 'hover:bg-muted text-foreground'
                  }`}
                >
                  {cell.dayNumber}
                </button>

                {/* Quick Add Button on Cell Hover */}
                <button
                  onClick={() => onQuickCreateAtDate(cell.dateString)}
                  className="opacity-0 group-hover:opacity-100 transition-opacity w-5 h-5 rounded hover:bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground"
                  title="Add event on this day"
                >
                  <Plus size={13} />
                </button>
              </div>

              {/* Events List in Day Cell */}
              <div className="flex-1 flex flex-col gap-1 overflow-hidden">
                {visibleEvents.map((evt) => {
                  const cal = calendarMap.get(evt.calendarId);
                  const color = cal?.color || {
                    bg: '#eff6ff',
                    border: '#60a5fa',
                    text: '#1e40af',
                    dot: '#2563eb',
                  };

                  return (
                    <button
                      key={evt.id}
                      onClick={() => onSelectEvent(evt)}
                      style={{
                        backgroundColor: color.bg,
                        borderColor: color.border,
                        color: color.text,
                      }}
                      className="w-full text-left px-1.5 py-0.5 rounded text-[11px] font-medium border truncate flex items-center gap-1 hover:brightness-95 transition-all shadow-2xs"
                      title={`${evt.title} (${evt.allDay ? 'All Day' : evt.startTime})`}
                    >
                      <span
                        className="w-1.5 h-1.5 rounded-full shrink-0"
                        style={{ backgroundColor: color.dot }}
                      />
                      {!evt.allDay && evt.startTime && (
                        <span className="opacity-75 text-[10px] shrink-0 font-mono">
                          {formatTime24to12(evt.startTime)}
                        </span>
                      )}
                      <span className="truncate">{evt.title}</span>
                      {evt.meetingUrl && <Video size={10} className="shrink-0 ml-auto opacity-70" />}
                    </button>
                  );
                })}

                {/* Overflow +N more indicator */}
                {overflowCount > 0 && (
                  <button
                    onClick={() =>
                      setSelectedDayOverflow({
                        dateString: cell.dateString,
                        events: dayEvents,
                      })
                    }
                    className="text-[10px] font-bold text-primary hover:underline text-left px-1 mt-auto"
                  >
                    + {overflowCount} more
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Overflow Day Events Modal / Popover */}
      {selectedDayOverflow && (
        <div className="absolute inset-0 z-40 bg-black/20 flex items-center justify-center p-4">
          <div className="w-full max-w-sm rounded-xl border border-border bg-card p-4 shadow-xl text-foreground animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-border pb-3 mb-3">
              <div className="flex items-center gap-2">
                <CalendarIcon size={16} className="text-primary" />
                <h3 className="font-bold text-sm">
                  {selectedDayOverflow.dateString} Events
                </h3>
              </div>
              <button
                onClick={() => setSelectedDayOverflow(null)}
                className="w-6 h-6 rounded hover:bg-muted grid place-items-center text-muted-foreground hover:text-foreground"
              >
                <X size={15} />
              </button>
            </div>

            <div className="space-y-1.5 max-h-72 overflow-y-auto pr-1">
              {selectedDayOverflow.events.map((evt) => {
                const cal = calendarMap.get(evt.calendarId);
                const color = cal?.color || {
                  bg: '#eff6ff',
                  border: '#60a5fa',
                  text: '#1e40af',
                  dot: '#2563eb',
                };
                return (
                  <button
                    key={evt.id}
                    onClick={() => {
                      setSelectedDayOverflow(null);
                      onSelectEvent(evt);
                    }}
                    style={{
                      backgroundColor: color.bg,
                      borderColor: color.border,
                      color: color.text,
                    }}
                    className="w-full text-left p-2 rounded-lg text-xs font-semibold border flex items-center justify-between gap-2 hover:opacity-90"
                  >
                    <div className="min-w-0">
                      <p className="truncate font-bold">{evt.title}</p>
                      <p className="text-[10px] opacity-80 flex items-center gap-1 mt-0.5">
                        <Clock size={10} />
                        {evt.allDay ? 'All Day' : `${evt.startTime} – ${evt.endTime}`}
                        {evt.location && ` · ${evt.location}`}
                      </p>
                    </div>
                    {evt.meetingUrl && <Video size={13} className="shrink-0" />}
                  </button>
                );
              })}
            </div>

            <div className="mt-4 pt-3 border-t border-border flex justify-end">
              <button
                onClick={() => {
                  const date = selectedDayOverflow.dateString;
                  setSelectedDayOverflow(null);
                  onQuickCreateAtDate(date);
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary text-white text-xs font-bold shadow hover:opacity-90"
              >
                <Plus size={13} />
                <span>Add Event</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
