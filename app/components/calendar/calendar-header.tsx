'use client';

import {
  DAYS_OF_WEEK_FULL,
  formatDateToISO,
  MONTH_NAMES,
  MONTH_NAMES_SHORT,
} from '@/lib/calendar/date-utils';
import { CalendarViewType } from '@/lib/calendar/types';
import {
  CalendarDays,
  CalendarPlus,
  ChevronLeft,
  ChevronRight,
  Filter,
  Plus,
  RefreshCw,
  Search,
  Settings,
  Sparkles,
  UserCheck,
  X,
} from 'lucide-react';
import React from 'react';

type CalendarHeaderProps = {
  currentDate: Date;
  view: CalendarViewType;
  onViewChange: (view: CalendarViewType) => void;
  onNavigatePrev: () => void;
  onNavigateNext: () => void;
  onNavigateToday: () => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onOpenNewEvent: () => void;
  onOpenNaturalLanguageModal: () => void;
  onOpenSchedulingAssistant: () => void;
  onOpenSyncModal: () => void;
  eventsCount: number;
};

export function CalendarHeader({
  currentDate,
  view,
  onViewChange,
  onNavigatePrev,
  onNavigateNext,
  onNavigateToday,
  searchQuery,
  onSearchChange,
  onOpenNewEvent,
  onOpenNaturalLanguageModal,
  onOpenSchedulingAssistant,
  onOpenSyncModal,
  eventsCount,
}: CalendarHeaderProps) {
  // Format Title based on View
  const getHeaderTitle = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    if (view === 'month') {
      return `${MONTH_NAMES[month]} ${year}`;
    }

    if (view === 'week') {
      const dayOfWeek = currentDate.getDay();
      const startOfWeek = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate() - dayOfWeek);
      const endOfWeek = new Date(startOfWeek.getFullYear(), startOfWeek.getMonth(), startOfWeek.getDate() + 6);

      if (startOfWeek.getMonth() === endOfWeek.getMonth()) {
        return `${MONTH_NAMES_SHORT[startOfWeek.getMonth()]} ${startOfWeek.getDate()} – ${endOfWeek.getDate()}, ${year}`;
      }
      return `${MONTH_NAMES_SHORT[startOfWeek.getMonth()]} ${startOfWeek.getDate()} – ${MONTH_NAMES_SHORT[endOfWeek.getMonth()]} ${endOfWeek.getDate()}, ${year}`;
    }

    if (view === 'day') {
      return `${DAYS_OF_WEEK_FULL[currentDate.getDay()]}, ${MONTH_NAMES[month]} ${currentDate.getDate()}, ${year}`;
    }

    if (view === 'year') {
      return `${year}`;
    }

    // Agenda
    return `${MONTH_NAMES[month]} ${year} · Agenda`;
  };

  return (
    <header className="h-[70px] border-b border-border bg-card px-4 md:px-6 flex items-center justify-between gap-4 shrink-0 select-none">
      {/* Left: Navigation Controls & Title */}
      <div className="flex items-center gap-3 md:gap-4 min-w-0">
        <div className="flex items-center gap-1">
          <button
            onClick={onNavigateToday}
            className="h-8 px-3 rounded-lg border border-border bg-background text-xs font-semibold text-foreground hover:bg-muted transition-colors"
          >
            Today
          </button>
          <div className="flex items-center">
            <button
              onClick={onNavigatePrev}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              aria-label="Previous period"
            >
              <ChevronLeft size={18} />
            </button>
            <button
              onClick={onNavigateNext}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              aria-label="Next period"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>

        <h1 className="text-base md:text-lg font-bold tracking-tight text-foreground truncate">
          {getHeaderTitle()}
        </h1>
      </div>

      {/* Center/Right: Search & View Switcher */}
      <div className="flex items-center gap-2 md:gap-3">
        {/* Search Bar */}
        <div className="hidden lg:flex items-center h-8 w-56 rounded-lg border border-border bg-background px-2.5 text-xs text-muted-foreground focus-within:border-primary focus-within:ring-1 focus-within:ring-primary/20">
          <Search size={14} className="shrink-0 mr-2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search events, attendees..."
            className="w-full bg-transparent text-foreground placeholder:text-muted-foreground outline-none text-xs"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              className="p-0.5 hover:text-foreground"
            >
              <X size={12} />
            </button>
          )}
        </div>

        {/* View Switcher Segmented Control */}
        <div className="flex items-center p-1 rounded-lg border border-border bg-background text-xs font-medium">
          {(['day', 'week', 'month', 'year', 'agenda'] as CalendarViewType[]).map((v) => (
            <button
              key={v}
              onClick={() => onViewChange(v)}
              className={`px-2.5 py-1 rounded capitalize transition-all ${
                view === v
                  ? 'bg-card text-foreground font-bold shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {v}
            </button>
          ))}
        </div>

        {/* Scheduling Assistant Button */}
        <button
          onClick={onOpenSchedulingAssistant}
          className="hidden sm:inline-flex items-center gap-1.5 h-8 px-2.5 rounded-lg border border-border bg-background text-xs font-semibold text-foreground hover:bg-muted transition-colors"
          title="Find available times for multiple participants"
        >
          <UserCheck size={14} className="text-primary" />
          <span className="hidden xl:inline">Find a Time</span>
        </button>

        {/* Natural Language AI Button */}
        <button
          onClick={onOpenNaturalLanguageModal}
          className="inline-flex items-center gap-1.5 h-8 px-2.5 rounded-lg border border-border bg-background text-xs font-semibold text-foreground hover:bg-muted transition-colors"
          title="Create event with AI natural language"
        >
          <Sparkles size={14} className="text-amber-500" />
          <span className="hidden md:inline">AI Schedule</span>
        </button>

        {/* New Event CTA */}
        <button
          onClick={onOpenNewEvent}
          className="inline-flex items-center gap-1.5 h-8 px-3 rounded-lg bg-primary text-white text-xs font-bold shadow-sm hover:opacity-90 transition-opacity"
        >
          <Plus size={15} />
          <span className="hidden sm:inline">New Event</span>
        </button>
      </div>
    </header>
  );
}
