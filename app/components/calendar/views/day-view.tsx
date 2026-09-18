'use client';

import {
  calculateDurationMinutes,
  DAYS_OF_WEEK_FULL,
  formatDateToISO,
  formatTime24to12,
  formatTimeSlot,
  MONTH_NAMES,
} from '@/lib/calendar/date-utils';
import { CalendarEvent, CalendarItem } from '@/lib/calendar/types';
import {
  CheckSquare,
  Clock,
  ExternalLink,
  FileText,
  MapPin,
  Plus,
  Users,
  Video,
} from 'lucide-react';
import React, { useEffect, useRef } from 'react';

type DayViewProps = {
  currentDate: Date;
  events: CalendarEvent[];
  calendars: CalendarItem[];
  onSelectEvent: (event: CalendarEvent) => void;
  onQuickCreateAtSlot: (dateISO: string, time24: string) => void;
};

const HOUR_HEIGHT = 70;
const START_HOUR = 7;
const END_HOUR = 22;
const TOTAL_HOURS = END_HOUR - START_HOUR;

export function DayView({
  currentDate,
  events,
  calendars,
  onSelectEvent,
  onQuickCreateAtSlot,
}: DayViewProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const dateISO = formatDateToISO(currentDate);

  const calendarMap = new Map<string, CalendarItem>();
  calendars.forEach((c) => calendarMap.set(c.id, c));

  const visibleCalendarIds = new Set(calendars.filter((c) => c.isVisible).map((c) => c.id));
  const dayEvents = events.filter(
    (evt) => visibleCalendarIds.has(evt.calendarId) && evt.startDate === dateISO
  );

  const allDayEvents = dayEvents.filter((e) => e.allDay);
  const timedEvents = dayEvents.filter((e) => !e.allDay && e.startTime && e.endTime);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = (9 - START_HOUR) * HOUR_HEIGHT;
    }
  }, [dateISO]);

  const hours = Array.from({ length: TOTAL_HOURS }, (_, i) => START_HOUR + i);

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-background select-none">
      {/* Day Overview Top Bar */}
      <div className="p-4 border-b border-border bg-card flex items-center justify-between">
        <div>
          <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
            {DAYS_OF_WEEK_FULL[currentDate.getDay()]}
          </span>
          <h2 className="text-xl font-extrabold tracking-tight text-foreground">
            {MONTH_NAMES[currentDate.getMonth()]} {currentDate.getDate()},{' '}
            {currentDate.getFullYear()}
          </h2>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground font-medium">
            {dayEvents.length} {dayEvents.length === 1 ? 'event' : 'events'} scheduled
          </span>
        </div>
      </div>

      {/* All-Day Events Banner */}
      {allDayEvents.length > 0 && (
        <div className="p-3 border-b border-border bg-muted/20 flex items-center gap-3">
          <span className="text-[10px] font-bold tracking-wider text-muted-foreground uppercase">
            All-Day
          </span>
          <div className="flex flex-wrap gap-2">
            {allDayEvents.map((evt) => {
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
                  className="px-3 py-1 rounded-lg text-xs font-bold border shadow-xs"
                >
                  {evt.title}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Hourly Timeline */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto flex relative custom-scrollbar">
        {/* Time Axis */}
        <div className="w-20 shrink-0 border-r border-border bg-card p-2 text-right text-xs text-muted-foreground font-mono">
          {hours.map((hour) => (
            <div
              key={hour}
              style={{ height: `${HOUR_HEIGHT}px` }}
              className="relative -top-2.5 pr-2"
            >
              {formatTimeSlot(hour)}
            </div>
          ))}
        </div>

        {/* Day Column */}
        <div
          className="flex-1 relative"
          style={{ height: `${TOTAL_HOURS * HOUR_HEIGHT}px` }}
        >
          {/* Background Grid Lines */}
          <div className="absolute inset-0 pointer-events-none">
            {hours.map((hour, idx) => (
              <div
                key={hour}
                style={{ top: `${idx * HOUR_HEIGHT}px`, height: `${HOUR_HEIGHT}px` }}
                className="absolute inset-x-0 border-t border-border/60"
              />
            ))}
          </div>

          {/* Clickable Slots */}
          {hours.map((hour) => (
            <div
              key={hour}
              onClick={() => {
                const timeStr = `${String(hour).padStart(2, '0')}:00`;
                onQuickCreateAtSlot(dateISO, timeStr);
              }}
              style={{ height: `${HOUR_HEIGHT}px` }}
              className="hover:bg-primary/5 cursor-pointer transition-colors"
              title={`Click to schedule at ${formatTimeSlot(hour)}`}
            />
          ))}

          {/* Timed Event Cards */}
          {timedEvents.map((evt) => {
            const [sh, sm] = evt.startTime!.split(':').map(Number);
            const durationMins = calculateDurationMinutes(evt.startTime!, evt.endTime!);
            const startFraction = sh + sm / 60 - START_HOUR;
            if (startFraction < 0) return null;

            const topPx = startFraction * HOUR_HEIGHT;
            const heightPx = Math.max(36, (durationMins / 60) * HOUR_HEIGHT - 4);

            const cal = calendarMap.get(evt.calendarId);
            const color = cal?.color || {
              bg: '#eff6ff',
              border: '#60a5fa',
              text: '#1e40af',
              dot: '#2563eb',
            };

            return (
              <div
                key={evt.id}
                onClick={() => onSelectEvent(evt)}
                style={{
                  top: `${topPx}px`,
                  height: `${heightPx}px`,
                  backgroundColor: color.bg,
                  borderColor: color.border,
                  color: color.text,
                }}
                className="absolute inset-x-3 z-10 rounded-xl p-3 border shadow-sm cursor-pointer overflow-hidden transition-all hover:shadow-md"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: color.dot }}
                      />
                      <h4 className="font-bold text-sm truncate">{evt.title}</h4>
                      {cal && (
                        <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded-full bg-white/80 dark:bg-black/40 border border-current">
                          {cal.name}
                        </span>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-4 text-xs opacity-85 mt-1 font-medium">
                      <span className="flex items-center gap-1">
                        <Clock size={12} />
                        {formatTime24to12(evt.startTime)} – {formatTime24to12(evt.endTime)} ({durationMins}m)
                      </span>
                      {evt.location && (
                        <span className="flex items-center gap-1 truncate">
                          <MapPin size={12} />
                          {evt.location}
                        </span>
                      )}
                      {evt.participants.length > 0 && (
                        <span className="flex items-center gap-1">
                          <Users size={12} />
                          {evt.participants.length} attendees
                        </span>
                      )}
                    </div>
                  </div>

                  {evt.meetingUrl && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        window.open(evt.meetingUrl, '_blank');
                      }}
                      className="px-3 py-1.5 rounded-lg bg-primary text-white text-xs font-bold flex items-center gap-1.5 shadow hover:opacity-90 transition-opacity"
                    >
                      <Video size={13} />
                      <span>Join Call</span>
                    </button>
                  )}
                </div>

                {/* Additional details for larger height */}
                {heightPx > 80 && evt.description && (
                  <p className="text-xs opacity-80 mt-2 line-clamp-2 leading-relaxed">
                    {evt.description}
                  </p>
                )}

                {/* Quick Attachments / Tasks summary */}
                {heightPx > 110 && (evt.attachments.length > 0 || evt.tasks.length > 0) && (
                  <div className="flex items-center gap-4 mt-2 pt-2 border-t border-current/20 text-xs opacity-85">
                    {evt.attachments.length > 0 && (
                      <span className="flex items-center gap-1">
                        <FileText size={12} />
                        {evt.attachments.length} attachment{evt.attachments.length > 1 ? 's' : ''}
                      </span>
                    )}
                    {evt.tasks.length > 0 && (
                      <span className="flex items-center gap-1">
                        <CheckSquare size={12} />
                        {evt.tasks.filter((t) => t.completed).length}/{evt.tasks.length} tasks
                      </span>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
