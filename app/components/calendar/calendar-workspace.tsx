'use client';

import {
  formatDateToISO,
  parseISODate,
} from '@/lib/calendar/date-utils';
import {
  CALENDAR_COLORS,
  MOCK_PARTICIPANTS,
} from '@/lib/calendar/mock-data';
import {
  loadCalendars,
  loadEvents,
  loadExternalSyncs,
  saveCalendars,
  saveEvents,
  saveExternalSyncs,
} from '@/lib/calendar/storage';
import {
  CalendarEvent,
  CalendarItem,
  CalendarViewType,
  ExternalCalendarSync,
  Participant,
  ParticipantStatus,
} from '@/lib/calendar/types';
import { Plus, X } from 'lucide-react';
import React, { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { CalendarHeader } from './calendar-header';
import { CalendarSidebar } from './calendar-sidebar';
import { CalendarSyncModal } from './modals/calendar-sync-modal';
import { EventDetailModal } from './modals/event-detail-modal';
import { EventFormModal } from './modals/event-form-modal';
import { NaturalLanguageModal } from './modals/natural-language-modal';
import { SchedulingAssistantModal } from './modals/scheduling-assistant-modal';
import { ShareCalendarModal } from './modals/share-calendar-modal';
import { AgendaView } from './views/agenda-view';
import { DayView } from './views/day-view';
import { MonthView } from './views/month-view';
import { WeekView } from './views/week-view';
import { YearView } from './views/year-view';

export function CalendarWorkspace() {
  // Calendar Date & View State (Default to August 24, 2026 for rich interactive dataset)
  const [currentDate, setCurrentDate] = useState<Date>(() => new Date(2026, 7, 24));
  const [view, setView] = useState<CalendarViewType>('month');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Data Collections
  const [calendars, setCalendars] = useState<CalendarItem[]>([]);
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [externalSyncs, setExternalSyncs] = useState<ExternalCalendarSync[]>([]);

  // Modals & Active Dialogs
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [formEventData, setFormEventData] = useState<Partial<CalendarEvent> | null>(null);
  const [isNaturalLanguageOpen, setIsNaturalLanguageOpen] = useState(false);
  const [isSchedulingAssistantOpen, setIsSchedulingAssistantOpen] = useState(false);
  const [isSyncModalOpen, setIsSyncModalOpen] = useState(false);
  const [sharingCalendar, setSharingCalendar] = useState<CalendarItem | null>(null);
  const [isAddCalendarOpen, setIsAddCalendarOpen] = useState(false);
  const [newCalendarName, setNewCalendarName] = useState('');
  const [newCalendarColor, setNewCalendarColor] = useState(CALENDAR_COLORS[4]);

  // Load from Storage on mount
  useEffect(() => {
    setCalendars(loadCalendars());
    setEvents(loadEvents());
    setExternalSyncs(loadExternalSyncs());
  }, []);

  // Sync back to storage on change
  const handleUpdateEvents = (newEvents: CalendarEvent[]) => {
    setEvents(newEvents);
    saveEvents(newEvents);
  };

  const handleUpdateCalendars = (newCalendars: CalendarItem[]) => {
    setCalendars(newCalendars);
    saveCalendars(newCalendars);
  };

  const handleUpdateSyncs = (newSyncs: ExternalCalendarSync[]) => {
    setExternalSyncs(newSyncs);
    saveExternalSyncs(newSyncs);
  };

  // Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is typing in an input or textarea
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.tagName === 'SELECT') {
        return;
      }

      if (e.key === 't' || e.key === 'T') {
        setCurrentDate(new Date(2026, 7, 24));
        toast('Jumped to Today', { duration: 1500 });
      } else if (e.key === 'm' || e.key === 'M') {
        setView('month');
      } else if (e.key === 'w' || e.key === 'W') {
        setView('week');
      } else if (e.key === 'd' || e.key === 'D') {
        setView('day');
      } else if (e.key === 'a' || e.key === 'A') {
        setView('agenda');
      } else if (e.key === 'c' || e.key === 'C') {
        setFormEventData({
          startDate: formatDateToISO(currentDate),
          startTime: '10:00',
          endTime: '11:00',
        });
      } else if (e.key === 'Escape') {
        setSelectedEvent(null);
        setFormEventData(null);
        setIsNaturalLanguageOpen(false);
        setIsSchedulingAssistantOpen(false);
        setIsSyncModalOpen(false);
        setSharingCalendar(null);
        setIsAddCalendarOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentDate]);

  // Date Navigators
  const handleNavigatePrev = () => {
    const d = new Date(currentDate);
    if (view === 'month') d.setMonth(d.getMonth() - 1);
    else if (view === 'week') d.setDate(d.getDate() - 7);
    else if (view === 'day') d.setDate(d.getDate() - 1);
    else if (view === 'year') d.setFullYear(d.getFullYear() - 1);
    else d.setMonth(d.getMonth() - 1);
    setCurrentDate(d);
  };

  const handleNavigateNext = () => {
    const d = new Date(currentDate);
    if (view === 'month') d.setMonth(d.getMonth() + 1);
    else if (view === 'week') d.setDate(d.getDate() + 7);
    else if (view === 'day') d.setDate(d.getDate() + 1);
    else if (view === 'year') d.setFullYear(d.getFullYear() + 1);
    else d.setMonth(d.getMonth() + 1);
    setCurrentDate(d);
  };

  const handleNavigateToday = () => {
    setCurrentDate(new Date(2026, 7, 24));
  };

  // Calendar Visibility Toggle
  const handleToggleCalendar = (id: string) => {
    const updated = calendars.map((c) =>
      c.id === id ? { ...c, isVisible: !c.isVisible } : c
    );
    handleUpdateCalendars(updated);
  };

  // Event Operations (Create/Edit, Duplicate, Delete, RSVP, Tasks)
  const handleSaveEvent = (eventData: Partial<CalendarEvent>) => {
    if (eventData.id) {
      // Edit existing event
      const updated = events.map((e) =>
        e.id === eventData.id ? ({ ...e, ...eventData, updatedAt: new Date().toISOString() } as CalendarEvent) : e
      );
      handleUpdateEvents(updated);
      toast.success('Event updated successfully');
    } else {
      // Create new event
      const newEvent: CalendarEvent = {
        id: `evt-${Date.now()}`,
        calendarId: eventData.calendarId || calendars[0]?.id || 'cal-work',
        title: eventData.title || 'Untitled Event',
        description: eventData.description,
        location: eventData.location,
        meetingUrl: eventData.meetingUrl,
        startDate: eventData.startDate || formatDateToISO(currentDate),
        startTime: eventData.startTime || '10:00',
        endDate: eventData.endDate || eventData.startDate || formatDateToISO(currentDate),
        endTime: eventData.endTime || '11:00',
        allDay: eventData.allDay || false,
        timezone: eventData.timezone || 'America/New_York (EDT)',
        recurrence: eventData.recurrence,
        organizer: MOCK_PARTICIPANTS[0],
        participants: eventData.participants || [MOCK_PARTICIPANTS[0]],
        currentUserStatus: 'accepted',
        reminders: eventData.reminders || [15],
        availability: eventData.availability || 'busy',
        visibility: eventData.visibility || 'public',
        attachments: eventData.attachments || [],
        tasks: eventData.tasks || [],
        aiNotes: eventData.aiNotes,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      handleUpdateEvents([newEvent, ...events]);
      toast.success(`"${newEvent.title}" scheduled`);
    }

    setFormEventData(null);
    setIsNaturalLanguageOpen(false);
    setIsSchedulingAssistantOpen(false);
  };

  const handleDuplicateEvent = (evt: CalendarEvent) => {
    const dup: CalendarEvent = {
      ...evt,
      id: `evt-${Date.now()}`,
      title: `${evt.title} (Copy)`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    handleUpdateEvents([dup, ...events]);
    setSelectedEvent(null);
    toast.success('Event duplicated');
  };

  const handleDeleteEvent = (eventId: string) => {
    handleUpdateEvents(events.filter((e) => e.id !== eventId));
    setSelectedEvent(null);
    toast.success('Event deleted');
  };

  const handleUpdateRSVP = (eventId: string, status: ParticipantStatus) => {
    const updated = events.map((e) =>
      e.id === eventId ? { ...e, currentUserStatus: status } : e
    );
    handleUpdateEvents(updated);
    if (selectedEvent && selectedEvent.id === eventId) {
      setSelectedEvent({ ...selectedEvent, currentUserStatus: status });
    }
    toast.success(`Response recorded: ${status}`);
  };

  const handleToggleTask = (eventId: string, taskId: string) => {
    const updated = events.map((e) => {
      if (e.id === eventId) {
        const tasks = e.tasks.map((t) =>
          t.id === taskId ? { ...t, completed: !t.completed } : t
        );
        return { ...e, tasks };
      }
      return e;
    });
    handleUpdateEvents(updated);
    if (selectedEvent && selectedEvent.id === eventId) {
      const tasks = selectedEvent.tasks.map((t) =>
        t.id === taskId ? { ...t, completed: !t.completed } : t
      );
      setSelectedEvent({ ...selectedEvent, tasks });
    }
  };

  const handleAddTask = (eventId: string, taskTitle: string) => {
    const updated = events.map((e) => {
      if (e.id === eventId) {
        const newTask = {
          id: `tsk-${Date.now()}`,
          title: taskTitle,
          completed: false,
          dueDate: e.startDate,
        };
        return { ...e, tasks: [...e.tasks, newTask] };
      }
      return e;
    });
    handleUpdateEvents(updated);
    if (selectedEvent && selectedEvent.id === eventId) {
      setSelectedEvent({
        ...selectedEvent,
        tasks: [
          ...selectedEvent.tasks,
          {
            id: `tsk-${Date.now()}`,
            title: taskTitle,
            completed: false,
            dueDate: selectedEvent.startDate,
          },
        ],
      });
    }
  };

  // Add Calendar
  const handleCreateNewCalendar = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCalendarName.trim()) return;

    const newCal: CalendarItem = {
      id: `cal-custom-${Date.now()}`,
      name: newCalendarName.trim(),
      color: newCalendarColor,
      category: 'personal',
      isVisible: true,
      ownerName: 'Alex Morgan',
      ownerEmail: 'alex.morgan@codin.io',
    };

    handleUpdateCalendars([...calendars, newCal]);
    setIsAddCalendarOpen(false);
    setNewCalendarName('');
    toast.success(`Calendar "${newCal.name}" created`);
  };

  // External Sync
  const handleToggleSync = (syncId: string) => {
    const updated = externalSyncs.map((s) =>
      s.id === syncId
        ? {
            ...s,
            status: s.status === 'connected' ? ('disconnected' as const) : ('connected' as const),
            lastSynced: 'Just now',
          }
        : s
    );
    handleUpdateSyncs(updated);
  };

  const handleTriggerSyncNow = (syncId: string) => {
    const updated = externalSyncs.map((s) =>
      s.id === syncId ? { ...s, lastSynced: 'Just now', status: 'connected' as const } : s
    );
    handleUpdateSyncs(updated);
    toast.success('Calendar synchronized');
  };

  // Filtered Events based on search
  const filteredEvents = useMemo(() => {
    if (!searchQuery.trim()) return events;
    const term = searchQuery.toLowerCase();
    return events.filter(
      (e) =>
        e.title.toLowerCase().includes(term) ||
        e.description?.toLowerCase().includes(term) ||
        e.location?.toLowerCase().includes(term) ||
        e.participants.some((p) => p.name.toLowerCase().includes(term))
    );
  }, [events, searchQuery]);

  return (
    <div className="flex h-full w-full overflow-hidden bg-background">
      {/* Calendar Secondary Navigation Sidebar */}
      <CalendarSidebar
        currentDate={currentDate}
        onSelectDate={setCurrentDate}
        calendars={calendars}
        onToggleCalendar={handleToggleCalendar}
        onOpenNewEvent={() =>
          setFormEventData({
            startDate: formatDateToISO(currentDate),
            startTime: '10:00',
            endTime: '11:00',
          })
        }
        onOpenSyncModal={() => setIsSyncModalOpen(true)}
        onOpenShareModal={(cal) => setSharingCalendar(cal)}
        onOpenAddCalendarModal={() => setIsAddCalendarOpen(true)}
        externalSyncs={externalSyncs}
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed((v) => !v)}
      />

      {/* Calendar Workspace Main Container */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        {/* Header Toolbar */}
        <CalendarHeader
          currentDate={currentDate}
          view={view}
          onViewChange={setView}
          onNavigatePrev={handleNavigatePrev}
          onNavigateNext={handleNavigateNext}
          onNavigateToday={handleNavigateToday}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onOpenNewEvent={() =>
            setFormEventData({
              startDate: formatDateToISO(currentDate),
              startTime: '10:00',
              endTime: '11:00',
            })
          }
          onOpenNaturalLanguageModal={() => setIsNaturalLanguageOpen(true)}
          onOpenSchedulingAssistant={() => setIsSchedulingAssistantOpen(true)}
          onOpenSyncModal={() => setIsSyncModalOpen(true)}
          eventsCount={filteredEvents.length}
        />

        {/* Calendar View Canvas */}
        <main className="flex-1 min-h-0 relative flex flex-col overflow-hidden">
          {view === 'month' && (
            <MonthView
              currentDate={currentDate}
              events={filteredEvents}
              calendars={calendars}
              onSelectEvent={setSelectedEvent}
              onSelectDate={setCurrentDate}
              onQuickCreateAtDate={(dateISO) =>
                setFormEventData({
                  startDate: dateISO,
                  startTime: '10:00',
                  endTime: '11:00',
                })
              }
            />
          )}

          {view === 'week' && (
            <WeekView
              currentDate={currentDate}
              events={filteredEvents}
              calendars={calendars}
              onSelectEvent={setSelectedEvent}
              onSelectDate={setCurrentDate}
              onQuickCreateAtSlot={(dateISO, timeStr) =>
                setFormEventData({
                  startDate: dateISO,
                  startTime: timeStr,
                })
              }
            />
          )}

          {view === 'day' && (
            <DayView
              currentDate={currentDate}
              events={filteredEvents}
              calendars={calendars}
              onSelectEvent={setSelectedEvent}
              onQuickCreateAtSlot={(dateISO, timeStr) =>
                setFormEventData({
                  startDate: dateISO,
                  startTime: timeStr,
                })
              }
            />
          )}

          {view === 'agenda' && (
            <AgendaView
              events={filteredEvents}
              calendars={calendars}
              onSelectEvent={setSelectedEvent}
              onOpenNewEvent={() =>
                setFormEventData({
                  startDate: formatDateToISO(currentDate),
                  startTime: '10:00',
                  endTime: '11:00',
                })
              }
            />
          )}

          {view === 'year' && (
            <YearView
              currentDate={currentDate}
              events={filteredEvents}
              calendars={calendars}
              onSelectDate={setCurrentDate}
              onViewChange={setView}
            />
          )}
        </main>
      </div>

      {/* Modals & Dialogs */}
      {selectedEvent && (
        <EventDetailModal
          event={selectedEvent}
          calendars={calendars}
          onClose={() => setSelectedEvent(null)}
          onEdit={(evt) => {
            setSelectedEvent(null);
            setFormEventData(evt);
          }}
          onDuplicate={handleDuplicateEvent}
          onDelete={handleDeleteEvent}
          onUpdateRSVP={handleUpdateRSVP}
          onToggleTask={handleToggleTask}
          onAddTask={handleAddTask}
        />
      )}

      {formEventData && (
        <EventFormModal
          initialEvent={formEventData}
          calendars={calendars}
          allEvents={events}
          onSave={handleSaveEvent}
          onClose={() => setFormEventData(null)}
        />
      )}

      {isNaturalLanguageOpen && (
        <NaturalLanguageModal
          calendars={calendars}
          onConfirm={handleSaveEvent}
          onClose={() => setIsNaturalLanguageOpen(false)}
        />
      )}

      {isSchedulingAssistantOpen && (
        <SchedulingAssistantModal
          allEvents={events}
          calendars={calendars}
          onSelectSlotToCreate={(slot) => {
            setIsSchedulingAssistantOpen(false);
            setFormEventData({
              startDate: slot.startDate,
              startTime: slot.startTime,
              endDate: slot.endDate,
              endTime: slot.endTime,
              participants: slot.participants,
            });
          }}
          onClose={() => setIsSchedulingAssistantOpen(false)}
        />
      )}

      {isSyncModalOpen && (
        <CalendarSyncModal
          syncs={externalSyncs}
          onToggleSync={handleToggleSync}
          onTriggerSyncNow={handleTriggerSyncNow}
          onClose={() => setIsSyncModalOpen(false)}
        />
      )}

      {sharingCalendar && (
        <ShareCalendarModal
          calendar={sharingCalendar}
          onClose={() => setSharingCalendar(null)}
        />
      )}

      {/* Add New Custom Calendar Modal */}
      {isAddCalendarOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-sm rounded-2xl border border-border bg-card p-5 shadow-2xl text-foreground animate-in fade-in zoom-in-95 space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="font-bold text-sm">Create New Calendar</h3>
              <button
                onClick={() => setIsAddCalendarOpen(false)}
                className="p-1 rounded text-muted-foreground hover:text-foreground"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleCreateNewCalendar} className="space-y-4 text-xs">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1">
                  Calendar Name
                </label>
                <input
                  type="text"
                  required
                  autoFocus
                  value={newCalendarName}
                  onChange={(e) => setNewCalendarName(e.target.value)}
                  placeholder="e.g. Design Sprints, Client Projects"
                  className="w-full h-9 rounded-lg border border-border bg-background px-3 text-xs text-foreground outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
                  Color Tag
                </label>
                <div className="flex flex-wrap gap-2">
                  {CALENDAR_COLORS.map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => setNewCalendarColor(c)}
                      className={`w-6 h-6 rounded-full border-2 transition-transform ${
                        newCalendarColor.id === c.id ? 'scale-110 shadow-sm' : 'opacity-80'
                      }`}
                      style={{
                        backgroundColor: c.dot,
                        borderColor: newCalendarColor.id === c.id ? 'var(--foreground)' : 'transparent',
                      }}
                      title={c.name}
                    />
                  ))}
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddCalendarOpen(false)}
                  className="px-3 py-1.5 rounded-lg border border-border text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!newCalendarName.trim()}
                  className="px-4 py-1.5 rounded-lg bg-primary text-white text-xs font-bold shadow hover:opacity-90 disabled:opacity-50"
                >
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
