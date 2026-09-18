'use client';

import {
  DAYS_OF_WEEK_FULL,
  formatDateToISO,
  formatDisplayDate,
  formatTime24to12,
  MONTH_NAMES,
  parseISODate,
} from '@/lib/calendar/date-utils';
import { CalendarEvent, CalendarItem } from '@/lib/calendar/types';
import {
  CalendarDays,
  CheckCircle2,
  Clock,
  FileText,
  Mail,
  MapPin,
  MessageCircle,
  Plus,
  Sparkles,
  Users,
  Video,
} from 'lucide-react';
import React from 'react';

type AgendaViewProps = {
  events: CalendarEvent[];
  calendars: CalendarItem[];
  onSelectEvent: (event: CalendarEvent) => void;
  onOpenNewEvent: () => void;
};

export function AgendaView({
  events,
  calendars,
  onSelectEvent,
  onOpenNewEvent,
}: AgendaViewProps) {
  const todayISO = formatDateToISO(new Date(2026, 7, 24)); // Demo reference date

  const calendarMap = new Map<string, CalendarItem>();
  calendars.forEach((c) => calendarMap.set(c.id, c));

  const visibleCalendarIds = new Set(calendars.filter((c) => c.isVisible).map((c) => c.id));
  const filteredEvents = events
    .filter((e) => visibleCalendarIds.has(e.calendarId))
    .sort((a, b) => a.startDate.localeCompare(b.startDate) || (a.startTime || '').localeCompare(b.startTime || ''));

  // Group events by date
  const groupedEvents = new Map<string, CalendarEvent[]>();
  filteredEvents.forEach((evt) => {
    const list = groupedEvents.get(evt.startDate) || [];
    list.push(evt);
    groupedEvents.set(evt.startDate, list);
  });

  const dates = Array.from(groupedEvents.keys()).sort();

  if (dates.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-background">
        <div className="w-12 h-12 rounded-2xl bg-muted grid place-items-center text-muted-foreground mb-3">
          <CalendarDays size={24} />
        </div>
        <h3 className="font-bold text-base text-foreground">No upcoming events</h3>
        <p className="text-xs text-muted-foreground max-w-sm mt-1 mb-4">
          Your schedule is currently clear. You can create a new meeting or enable more calendars in the sidebar.
        </p>
        <button
          onClick={onOpenNewEvent}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-white text-xs font-bold shadow hover:opacity-90 transition-opacity"
        >
          <Plus size={14} />
          <span>Create Event</span>
        </button>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-8 bg-background custom-scrollbar">
      <div className="max-w-4xl mx-auto space-y-8">
        {dates.map((dateISO) => {
          const dateObj = parseISODate(dateISO);
          const isToday = dateISO === todayISO;
          const dayEvents = groupedEvents.get(dateISO) || [];

          return (
            <section key={dateISO} className="space-y-3">
              {/* Date Group Header */}
              <div className="flex items-center justify-between pb-2 border-b border-border">
                <div className="flex items-center gap-2.5">
                  <span
                    className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                      isToday
                        ? 'bg-primary text-white'
                        : 'bg-muted text-muted-foreground'
                    }`}
                  >
                    {isToday ? 'TODAY' : DAYS_OF_WEEK_FULL[dateObj.getDay()].toUpperCase()}
                  </span>
                  <h3 className="font-extrabold text-base text-foreground tracking-tight">
                    {MONTH_NAMES[dateObj.getMonth()]} {dateObj.getDate()},{' '}
                    {dateObj.getFullYear()}
                  </h3>
                </div>
                <span className="text-xs text-muted-foreground font-medium">
                  {dayEvents.length} {dayEvents.length === 1 ? 'event' : 'events'}
                </span>
              </div>

              {/* Event Cards for this Day */}
              <div className="space-y-2.5">
                {dayEvents.map((evt) => {
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
                      className="group rounded-xl border border-border bg-card p-4 hover:border-primary/40 hover:shadow-md transition-all cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-4"
                    >
                      {/* Left Side: Time & Calendar Marker */}
                      <div className="flex items-start gap-3 min-w-0">
                        <div
                          className="w-2.5 h-10 rounded-full shrink-0 mt-0.5"
                          style={{ backgroundColor: color.dot }}
                        />
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h4 className="font-bold text-sm text-foreground group-hover:text-primary transition-colors truncate">
                              {evt.title}
                            </h4>
                            {cal && (
                              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-muted text-muted-foreground">
                                {cal.name}
                              </span>
                            )}
                            {evt.recurrence && (
                              <span className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-accent text-accent-foreground">
                                Recurring
                              </span>
                            )}
                          </div>

                          <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground mt-1.5 font-medium">
                            <span className="flex items-center gap-1">
                              <Clock size={12} className="text-primary" />
                              {evt.allDay
                                ? 'All Day'
                                : `${formatTime24to12(evt.startTime)} – ${formatTime24to12(evt.endTime)}`}
                            </span>
                            {evt.location && (
                              <span className="flex items-center gap-1 truncate max-w-xs">
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

                          {evt.description && (
                            <p className="text-xs text-muted-foreground/90 mt-2 line-clamp-2 leading-relaxed">
                              {evt.description}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Right Side: Cross-Platform Badges & Join CTA */}
                      <div className="flex items-center gap-2 shrink-0 md:self-center">
                        {evt.relatedEmail && (
                          <span
                            className="p-1.5 rounded-lg border border-border bg-muted/40 text-muted-foreground hover:text-foreground"
                            title="Linked with Email"
                          >
                            <Mail size={13} />
                          </span>
                        )}
                        {evt.relatedChat && (
                          <span
                            className="p-1.5 rounded-lg border border-border bg-muted/40 text-muted-foreground hover:text-foreground"
                            title="Linked with Chat"
                          >
                            <MessageCircle size={13} />
                          </span>
                        )}
                        {evt.aiNotes && (
                          <span
                            className="p-1.5 rounded-lg border border-amber-200 bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:border-amber-800"
                            title="AI Meeting Preparation Available"
                          >
                            <Sparkles size={13} />
                          </span>
                        )}

                        {evt.meetingUrl && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              window.open(evt.meetingUrl, '_blank');
                            }}
                            className="px-3.5 py-1.5 rounded-lg bg-primary text-white text-xs font-bold flex items-center gap-1.5 shadow hover:opacity-90 transition-opacity"
                          >
                            <Video size={13} />
                            <span>Join</span>
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}
