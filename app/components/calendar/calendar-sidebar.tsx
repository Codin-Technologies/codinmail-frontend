'use client';

import {
  formatDateToISO,
  getMonthGrid,
  MONTH_NAMES_SHORT,
  parseISODate,
} from '@/lib/calendar/date-utils';
import {
  CalendarCategory,
  CalendarColor,
  CalendarItem,
  ExternalCalendarSync,
} from '@/lib/calendar/types';
import {
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Cloud,
  Globe,
  MoreHorizontal,
  PanelLeftClose,
  PanelLeftOpen,
  Plus,
  RefreshCw,
  Share2,
  Trash2,
  Users,
} from 'lucide-react';
import React, { useState } from 'react';

type CalendarSidebarProps = {
  currentDate: Date;
  onSelectDate: (date: Date) => void;
  calendars: CalendarItem[];
  onToggleCalendar: (calendarId: string) => void;
  onOpenNewEvent: () => void;
  onOpenSyncModal: () => void;
  onOpenShareModal: (calendar: CalendarItem) => void;
  onOpenAddCalendarModal: () => void;
  externalSyncs: ExternalCalendarSync[];
  collapsed: boolean;
  onToggleCollapse: () => void;
};

export function CalendarSidebar({
  currentDate,
  onSelectDate,
  calendars,
  onToggleCalendar,
  onOpenNewEvent,
  onOpenSyncModal,
  onOpenShareModal,
  onOpenAddCalendarModal,
  externalSyncs,
  collapsed,
  onToggleCollapse,
}: CalendarSidebarProps) {
  // Mini calendar state
  const [miniYear, setMiniYear] = useState(currentDate.getFullYear());
  const [miniMonth, setMiniMonth] = useState(currentDate.getMonth());
  const [activeMenuCalendarId, setActiveMenuCalendarId] = useState<string | null>(null);

  const todayISO = formatDateToISO(new Date(2026, 7, 24)); // Baseline demo date
  const selectedDateISO = formatDateToISO(currentDate);

  const miniGrid = getMonthGrid(miniYear, miniMonth, todayISO);

  const handlePrevMiniMonth = () => {
    if (miniMonth === 0) {
      setMiniMonth(11);
      setMiniYear((y) => y - 1);
    } else {
      setMiniMonth((m) => m - 1);
    }
  };

  const handleNextMiniMonth = () => {
    if (miniMonth === 11) {
      setMiniMonth(0);
      setMiniYear((y) => y + 1);
    } else {
      setMiniMonth((m) => m + 1);
    }
  };

  const myCalendars = calendars.filter((c) => c.category === 'personal');
  const sharedCalendars = calendars.filter((c) => c.category === 'shared');
  const otherCalendars = calendars.filter((c) => c.category === 'other' || c.category === 'external');

  const connectedSync = externalSyncs.find((s) => s.status === 'connected');

  if (collapsed) {
    return (
      <aside className="hidden border-r border-border bg-card p-2 md:flex flex-col items-center gap-3 w-14 shrink-0">
        <button
          onClick={onToggleCollapse}
          className="p-2 text-muted-foreground hover:bg-muted hover:text-foreground rounded-lg transition-colors"
          title="Expand sidebar"
        >
          <PanelLeftOpen size={18} />
        </button>
        <button
          onClick={onOpenNewEvent}
          className="w-10 h-10 rounded-xl bg-primary text-white flex items-center justify-center shadow hover:opacity-90 transition-opacity"
          title="Create new event"
        >
          <Plus size={20} />
        </button>
        <div className="w-8 h-px bg-border my-1" />
        {calendars.slice(0, 4).map((cal) => (
          <button
            key={cal.id}
            onClick={() => onToggleCalendar(cal.id)}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-semibold transition-all relative"
            style={{
              backgroundColor: cal.isVisible ? cal.color.bg : 'transparent',
              color: cal.color.text,
              border: `1.5px solid ${cal.color.border}`,
              opacity: cal.isVisible ? 1 : 0.4,
            }}
            title={`${cal.name} (${cal.isVisible ? 'Visible' : 'Hidden'})`}
          >
            {cal.name.charAt(0)}
          </button>
        ))}
      </aside>
    );
  }

  return (
    <aside className="w-64 shrink-0 border-r border-border bg-card flex flex-col h-full overflow-hidden text-foreground select-none">
      {/* Top Header / Collapse */}
      <div className="h-[70px] border-b border-border flex items-center justify-between px-4">
        <div>
          <span className="text-[10px] font-bold tracking-widest text-muted-foreground uppercase">
            Workspace
          </span>
          <h2 className="text-base font-bold tracking-tight">Calendar</h2>
        </div>
        <button
          onClick={onToggleCollapse}
          className="w-8 h-8 rounded-lg grid place-items-center text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          title="Collapse navigation"
        >
          <PanelLeftClose size={17} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-5 custom-scrollbar">
        {/* Primary New Event CTA */}
        <button
          onClick={onOpenNewEvent}
          className="w-full h-10 rounded-lg bg-primary text-white font-semibold text-xs tracking-wide flex items-center justify-center gap-2 shadow-sm hover:opacity-90 transition-opacity"
        >
          <Plus size={16} />
          <span>New Event</span>
        </button>

        {/* Mini Calendar Picker */}
        <div className="bg-background rounded-xl p-3 border border-border">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-foreground">
              {MONTH_NAMES_SHORT[miniMonth]} {miniYear}
            </span>
            <div className="flex items-center gap-1">
              <button
                onClick={handlePrevMiniMonth}
                className="w-6 h-6 rounded flex items-center justify-center text-muted-foreground hover:bg-muted hover:text-foreground"
                aria-label="Previous month"
              >
                <ChevronLeft size={14} />
              </button>
              <button
                onClick={handleNextMiniMonth}
                className="w-6 h-6 rounded flex items-center justify-center text-muted-foreground hover:bg-muted hover:text-foreground"
                aria-label="Next month"
              >
                <ChevronRight size={14} />
              </button>
            </div>
          </div>

          {/* Mini Calendar Weekday Labels */}
          <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-bold text-muted-foreground mb-1">
            <span>S</span>
            <span>M</span>
            <span>T</span>
            <span>W</span>
            <span>T</span>
            <span>F</span>
            <span>S</span>
          </div>

          {/* Mini Calendar Days Grid */}
          <div className="grid grid-cols-7 gap-1 text-center">
            {miniGrid.slice(0, 35).map((day) => {
              const isSelected = day.dateString === selectedDateISO;
              return (
                <button
                  key={day.dateString}
                  onClick={() => {
                    onSelectDate(parseISODate(day.dateString));
                  }}
                  className={`h-6 text-[11px] rounded flex items-center justify-center font-medium transition-colors ${
                    !day.isCurrentMonth
                      ? 'text-muted-foreground/40'
                      : isSelected
                      ? 'bg-primary text-white font-bold'
                      : day.isToday
                      ? 'bg-accent text-accent-foreground font-bold border border-primary/40'
                      : 'text-foreground hover:bg-muted'
                  }`}
                >
                  {day.dayNumber}
                </button>
              );
            })}
          </div>
        </div>

        {/* Section: MY CALENDARS */}
        <div>
          <div className="flex items-center justify-between px-1 mb-1.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              My Calendars
            </span>
            <button
              onClick={onOpenAddCalendarModal}
              className="w-5 h-5 rounded hover:bg-muted grid place-items-center text-muted-foreground hover:text-foreground"
              title="Add calendar"
            >
              <Plus size={13} />
            </button>
          </div>
          <div className="space-y-0.5">
            {myCalendars.map((cal) => (
              <CalendarSidebarRow
                key={cal.id}
                calendar={cal}
                onToggle={() => onToggleCalendar(cal.id)}
                onShare={() => onOpenShareModal(cal)}
                isMenuOpen={activeMenuCalendarId === cal.id}
                onToggleMenu={() =>
                  setActiveMenuCalendarId((id) => (id === cal.id ? null : cal.id))
                }
              />
            ))}
          </div>
        </div>

        {/* Section: SHARED CALENDARS */}
        <div>
          <div className="flex items-center justify-between px-1 mb-1.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              Shared with Me
            </span>
            <button
              onClick={onOpenAddCalendarModal}
              className="w-5 h-5 rounded hover:bg-muted grid place-items-center text-muted-foreground hover:text-foreground"
              title="Browse shared calendars"
            >
              <Users size={13} />
            </button>
          </div>
          <div className="space-y-0.5">
            {sharedCalendars.map((cal) => (
              <CalendarSidebarRow
                key={cal.id}
                calendar={cal}
                onToggle={() => onToggleCalendar(cal.id)}
                onShare={() => onOpenShareModal(cal)}
                isMenuOpen={activeMenuCalendarId === cal.id}
                onToggleMenu={() =>
                  setActiveMenuCalendarId((id) => (id === cal.id ? null : cal.id))
                }
              />
            ))}
          </div>
        </div>

        {/* Section: OTHER & EXTERNAL CALENDARS */}
        <div>
          <div className="flex items-center justify-between px-1 mb-1.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              External & Other
            </span>
            <button
              onClick={onOpenSyncModal}
              className="w-5 h-5 rounded hover:bg-muted grid place-items-center text-muted-foreground hover:text-foreground"
              title="Connect external calendar"
            >
              <Cloud size={13} />
            </button>
          </div>
          <div className="space-y-0.5">
            {otherCalendars.map((cal) => (
              <CalendarSidebarRow
                key={cal.id}
                calendar={cal}
                onToggle={() => onToggleCalendar(cal.id)}
                onShare={() => onOpenShareModal(cal)}
                isMenuOpen={activeMenuCalendarId === cal.id}
                onToggleMenu={() =>
                  setActiveMenuCalendarId((id) => (id === cal.id ? null : cal.id))
                }
              />
            ))}
          </div>
        </div>

        {/* External Sync Status Card */}
        {connectedSync && (
          <div className="p-2.5 rounded-xl border border-border bg-background flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 min-w-0">
              <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
              <div className="min-w-0">
                <p className="font-semibold text-[11px] truncate text-foreground">
                  {connectedSync.name}
                </p>
                <p className="text-[10px] text-muted-foreground truncate">
                  Synced {connectedSync.lastSynced}
                </p>
              </div>
            </div>
            <button
              onClick={onOpenSyncModal}
              className="p-1 rounded text-muted-foreground hover:text-foreground hover:bg-muted"
              title="Sync Settings"
            >
              <RefreshCw size={13} />
            </button>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-3 border-t border-border flex items-center justify-between text-[11px] text-muted-foreground bg-card">
        <button
          onClick={onOpenSyncModal}
          className="flex items-center gap-1.5 hover:text-foreground font-medium transition-colors"
        >
          <Globe size={13} />
          <span>Sync Accounts</span>
        </button>
        <span className="text-[10px] font-semibold bg-muted px-1.5 py-0.5 rounded">
          v2.4
        </span>
      </div>
    </aside>
  );
}

function CalendarSidebarRow({
  calendar,
  onToggle,
  onShare,
  isMenuOpen,
  onToggleMenu,
}: {
  calendar: CalendarItem;
  onToggle: () => void;
  onShare: () => void;
  isMenuOpen: boolean;
  onToggleMenu: () => void;
}) {
  return (
    <div className="group relative flex items-center justify-between rounded-lg px-2 py-1.5 hover:bg-muted/60 transition-colors">
      <button
        onClick={onToggle}
        className="flex items-center gap-2.5 min-w-0 flex-1 text-left"
      >
        <span
          className="w-3.5 h-3.5 rounded flex items-center justify-center shrink-0 border transition-all"
          style={{
            borderColor: calendar.color.border,
            backgroundColor: calendar.isVisible ? calendar.color.dot : 'transparent',
          }}
        >
          {calendar.isVisible && <Check size={10} className="text-white stroke-[3]" />}
        </span>
        <span
          className={`text-xs truncate ${
            calendar.isVisible ? 'text-foreground font-medium' : 'text-muted-foreground line-through'
          }`}
        >
          {calendar.name}
        </span>
      </button>

      {/* Action Menu */}
      <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-0.5">
        <button
          onClick={onToggleMenu}
          className="w-5 h-5 rounded hover:bg-background flex items-center justify-center text-muted-foreground hover:text-foreground"
          aria-label="More options"
        >
          <MoreHorizontal size={13} />
        </button>
      </div>

      {isMenuOpen && (
        <div
          className="absolute right-2 top-8 z-30 w-44 rounded-lg border border-border bg-card p-1 shadow-lg text-xs"
          onMouseLeave={onToggleMenu}
        >
          <button
            onClick={() => {
              onShare();
              onToggleMenu();
            }}
            className="flex w-full items-center gap-2 rounded px-2 py-1.5 text-left text-foreground hover:bg-muted"
          >
            <Share2 size={13} />
            <span>Share Calendar</span>
          </button>
          <button
            onClick={() => {
              onToggle();
              onToggleMenu();
            }}
            className="flex w-full items-center gap-2 rounded px-2 py-1.5 text-left text-foreground hover:bg-muted"
          >
            <Check size={13} />
            <span>{calendar.isVisible ? 'Hide from View' : 'Show in View'}</span>
          </button>
        </div>
      )}
    </div>
  );
}
