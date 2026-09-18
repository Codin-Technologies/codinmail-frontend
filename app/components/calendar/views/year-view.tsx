'use client';

import {
  DAYS_OF_WEEK,
  formatDateToISO,
  getMonthGrid,
  MONTH_NAMES,
  parseISODate,
} from '@/lib/calendar/date-utils';
import { CalendarEvent, CalendarItem, CalendarViewType } from '@/lib/calendar/types';
import React from 'react';

type YearViewProps = {
  currentDate: Date;
  events: CalendarEvent[];
  calendars: CalendarItem[];
  onSelectDate: (date: Date) => void;
  onViewChange: (view: CalendarViewType) => void;
};

export function YearView({
  currentDate,
  events,
  calendars,
  onSelectDate,
  onViewChange,
}: YearViewProps) {
  const year = currentDate.getFullYear();
  const todayISO = formatDateToISO(new Date(2026, 7, 24)); // Demo reference date

  const visibleCalendarIds = new Set(calendars.filter((c) => c.isVisible).map((c) => c.id));
  const activeEvents = events.filter((e) => visibleCalendarIds.has(e.calendarId));

  const eventsCountByDate = new Map<string, number>();
  activeEvents.forEach((e) => {
    const count = eventsCountByDate.get(e.startDate) || 0;
    eventsCountByDate.set(e.startDate, count + 1);
  });

  const months = Array.from({ length: 12 }, (_, i) => i);

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-6 bg-background custom-scrollbar select-none">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {months.map((m) => {
            const grid = getMonthGrid(year, m, todayISO);
            return (
              <div
                key={m}
                className="rounded-xl border border-border bg-card p-3 shadow-2xs hover:border-primary/30 transition-colors"
              >
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-bold text-sm text-foreground">
                    {MONTH_NAMES[m]}
                  </h4>
                  <span className="text-[10px] text-muted-foreground font-mono">
                    {year}
                  </span>
                </div>

                {/* Weekday letters */}
                <div className="grid grid-cols-7 gap-1 text-center text-[9px] font-bold text-muted-foreground mb-1">
                  {DAYS_OF_WEEK.map((d) => (
                    <span key={d}>{d[0]}</span>
                  ))}
                </div>

                {/* Days matrix */}
                <div className="grid grid-cols-7 gap-1 text-center">
                  {grid.slice(0, 35).map((day) => {
                    const eventCount = eventsCountByDate.get(day.dateString) || 0;
                    const isSelected =
                      day.dateString === formatDateToISO(currentDate);

                    return (
                      <button
                        key={day.dateString}
                        onClick={() => {
                          onSelectDate(parseISODate(day.dateString));
                          onViewChange('month');
                        }}
                        className={`h-6 text-[10px] rounded flex flex-col items-center justify-center relative font-medium transition-colors ${
                          !day.isCurrentMonth
                            ? 'text-muted-foreground/30 pointer-events-none'
                            : day.isToday
                            ? 'bg-primary text-white font-bold'
                            : isSelected
                            ? 'bg-accent text-accent-foreground font-bold'
                            : 'text-foreground hover:bg-muted'
                        }`}
                        title={`${day.dateString} (${eventCount} events)`}
                      >
                        <span>{day.dayNumber}</span>
                        {eventCount > 0 && day.isCurrentMonth && (
                          <span
                            className={`w-1 h-1 rounded-full absolute bottom-0.5 ${
                              day.isToday ? 'bg-white' : 'bg-primary'
                            }`}
                          />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
