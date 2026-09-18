'use client';

import {
  calculateDurationMinutes,
  DAYS_OF_WEEK_FULL,
  formatDateToISO,
  formatTime24to12,
  formatTimeSlot,
  getWeekDays,
} from '@/lib/calendar/date-utils';
import { CalendarEvent, CalendarItem } from '@/lib/calendar/types';
import { Clock, MapPin, Video } from 'lucide-react';
import React, { useEffect, useRef } from 'react';

type WeekViewProps = {
  currentDate: Date;
  events: CalendarEvent[];
  calendars: CalendarItem[];
  onSelectEvent: (event: CalendarEvent) => void;
  onSelectDate: (date: Date) => void;
  onQuickCreateAtSlot: (dateISO: string, time24: string) => void;
};

const HOUR_HEIGHT = 60; // 60px per hour
const START_HOUR = 7;   // 7 AM
const END_HOUR = 22;    // 10 PM
const TOTAL_HOURS = END_HOUR - START_HOUR;

export function WeekView({
  currentDate,
  events,
  calendars,
  onSelectEvent,
  onSelectDate,
  onQuickCreateAtSlot,
}: WeekViewProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const todayISO = formatDateToISO(new Date(2026, 7, 24)); // Demo reference date

  const weekDays = getWeekDays(currentDate, todayISO);

  const calendarMap = new Map<string, CalendarItem>();
  calendars.forEach((c) => calendarMap.set(c.id, c));

  // Filter events for this week
  const visibleCalendarIds = new Set(calendars.filter((c) => c.isVisible).map((c) => c.id));
  const weekDateStrings = new Set(weekDays.map((d) => d.dateString));

  const weekEvents = events.filter(
    (evt) => visibleCalendarIds.has(evt.calendarId) && weekDateStrings.has(evt.startDate)
  );

  const allDayEvents = weekEvents.filter((e) => e.allDay);
  const timedEvents = weekEvents.filter((e) => !e.allDay && e.startTime && e.endTime);

  // Auto-scroll to 9 AM on initial mount
  useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = (9 - START_HOUR) * HOUR_HEIGHT;
    }
  }, []);

  const hours = Array.from({ length: TOTAL_HOURS }, (_, i) => START_HOUR + i);

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-background select-none">
      {/* Week Header: 7 Days */}
      <div className="flex border-b border-border bg-card shrink-0">
        {/* Left corner for time axis spacer */}
        <div className="w-16 shrink-0 border-r border-border p-2 flex flex-col justify-end text-[10px] text-muted-foreground font-mono">
          EDT
        </div>

        {/* 7 Day Column Headers */}
        <div className="flex-1 grid grid-cols-7 divide-x divide-border">
          {weekDays.map((day) => {
            const isToday = day.isToday;
            const isSelected = day.dateString === formatDateToISO(currentDate);

            return (
              <button
                key={day.dateString}
                onClick={() => onSelectDate(day.date)}
                className={`p-2 text-center transition-colors flex flex-col items-center hover:bg-muted/30 ${
                  isSelected ? 'bg-muted/10' : ''
                }`}
              >
                <span className="text-[11px] font-semibold text-muted-foreground uppercase">
                  {DAYS_OF_WEEK_FULL[day.date.getDay()].slice(0, 3)}
                </span>
                <span
                  className={`w-7 h-7 rounded-full mt-0.5 flex items-center justify-center text-sm font-bold transition-all ${
                    isToday
                      ? 'bg-primary text-white shadow-sm'
                      : isSelected
                      ? 'bg-accent text-accent-foreground font-bold'
                      : 'text-foreground'
                  }`}
                >
                  {day.dayNumber}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* All-Day Events Section if any exist */}
      {allDayEvents.length > 0 && (
        <div className="flex border-b border-border bg-muted/20 shrink-0 min-h-[34px]">
          <div className="w-16 shrink-0 border-r border-border p-1.5 text-[10px] font-bold text-muted-foreground flex items-center justify-center">
            ALL-DAY
          </div>
          <div className="flex-1 grid grid-cols-7 divide-x divide-border p-1 gap-1">
            {weekDays.map((day) => {
              const dayAllDay = allDayEvents.filter((e) => e.startDate === day.dateString);
              return (
                <div key={day.dateString} className="space-y-1">
                  {dayAllDay.map((evt) => {
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
                        className="w-full text-left px-2 py-0.5 rounded text-[11px] font-bold border truncate block"
                      >
                        {evt.title}
                      </button>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Scrollable Hourly Time Grid */}
      <div
        ref={scrollContainerRef}
        className="flex-1 overflow-y-auto overflow-x-hidden flex relative custom-scrollbar"
      >
        {/* Left Time Axis */}
        <div className="w-16 shrink-0 border-r border-border bg-card select-none text-[10px] text-muted-foreground font-mono">
          {hours.map((hour) => (
            <div
              key={hour}
              style={{ height: `${HOUR_HEIGHT}px` }}
              className="relative -top-2.5 text-right pr-2"
            >
              {formatTimeSlot(hour)}
            </div>
          ))}
        </div>

        {/* 7 Day Time Columns */}
        <div className="flex-1 grid grid-cols-7 divide-x divide-border relative">
          {/* Background Hour Lines */}
          <div className="absolute inset-0 pointer-events-none">
            {hours.map((hour, idx) => (
              <div
                key={hour}
                style={{ top: `${idx * HOUR_HEIGHT}px`, height: `${HOUR_HEIGHT}px` }}
                className="absolute inset-x-0 border-t border-border/60"
              />
            ))}
          </div>

          {/* Current Time Indicator Red Line for Today (Simulated for Demo at 10:15 AM) */}
          {weekDays.some((d) => d.isToday) && (
            <div
              style={{
                top: `${(10.25 - START_HOUR) * HOUR_HEIGHT}px`,
                left: `${(weekDays.findIndex((d) => d.isToday) / 7) * 100}%`,
                width: `${100 / 7}%`,
              }}
              className="absolute z-20 pointer-events-none flex items-center"
            >
              <span className="w-2.5 h-2.5 rounded-full bg-red-600 ring-2 ring-red-200 -ml-1.5" />
              <div className="h-[2px] w-full bg-red-600" />
            </div>
          )}

          {/* Day Column Slots */}
          {weekDays.map((day) => {
            const dayTimedEvents = timedEvents.filter((e) => e.startDate === day.dateString);

            return (
              <div
                key={day.dateString}
                className="relative h-full"
                style={{ height: `${TOTAL_HOURS * HOUR_HEIGHT}px` }}
              >
                {/* Clickable Empty Hour Slots */}
                {hours.map((hour) => (
                  <div
                    key={hour}
                    onClick={() => {
                      const timeStr = `${String(hour).padStart(2, '0')}:00`;
                      onQuickCreateAtSlot(day.dateString, timeStr);
                    }}
                    style={{ height: `${HOUR_HEIGHT}px` }}
                    className="hover:bg-primary/5 cursor-pointer transition-colors"
                    title={`Click to add event on ${day.dateString} at ${formatTimeSlot(hour)}`}
                  />
                ))}

                {/* Render Timed Event Cards on this Day Column */}
                {dayTimedEvents.map((evt) => {
                  const [sh, sm] = evt.startTime!.split(':').map(Number);
                  const durationMins = calculateDurationMinutes(evt.startTime!, evt.endTime!);

                  const startFraction = sh + sm / 60 - START_HOUR;
                  if (startFraction < 0) return null; // Out of visible bounds

                  const topPx = startFraction * HOUR_HEIGHT;
                  const heightPx = Math.max(26, (durationMins / 60) * HOUR_HEIGHT - 2);

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
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectEvent(evt);
                      }}
                      style={{
                        top: `${topPx}px`,
                        height: `${heightPx}px`,
                        backgroundColor: color.bg,
                        borderColor: color.border,
                        color: color.text,
                      }}
                      className="absolute inset-x-1 z-10 rounded-lg p-1.5 border shadow-sm cursor-pointer overflow-hidden transition-transform hover:scale-[1.01] hover:z-20"
                    >
                      <div className="flex items-start justify-between gap-1 leading-tight">
                        <span className="font-bold text-[11px] truncate">{evt.title}</span>
                        {evt.meetingUrl && (
                          <Video size={12} className="shrink-0 opacity-80" />
                        )}
                      </div>

                      <div className="flex items-center gap-1 text-[10px] opacity-80 mt-0.5 font-mono">
                        <Clock size={10} className="shrink-0" />
                        <span>
                          {formatTime24to12(evt.startTime)} – {formatTime24to12(evt.endTime)}
                        </span>
                      </div>

                      {heightPx > 48 && evt.location && (
                        <div className="flex items-center gap-1 text-[10px] opacity-75 mt-1 truncate">
                          <MapPin size={10} className="shrink-0" />
                          <span className="truncate">{evt.location}</span>
                        </div>
                      )}

                      {heightPx > 64 && evt.participants.length > 1 && (
                        <div className="flex items-center -space-x-1 mt-1.5">
                          {evt.participants.slice(0, 3).map((p) => (
                            <span
                              key={p.id}
                              className="w-4 h-4 rounded-full bg-card text-[8px] font-bold border border-border flex items-center justify-center text-foreground"
                              title={p.name}
                            >
                              {p.name.charAt(0)}
                            </span>
                          ))}
                          {evt.participants.length > 3 && (
                            <span className="text-[8px] font-bold pl-1.5">
                              +{evt.participants.length - 3}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
