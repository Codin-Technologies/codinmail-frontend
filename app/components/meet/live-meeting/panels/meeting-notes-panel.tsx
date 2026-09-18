'use client';

import { MeetingNote } from '@/lib/meet/types';
import {
  Check,
  Edit3,
  FileCheck,
  Plus,
  Save,
  Sparkles,
  X,
} from 'lucide-react';
import React, { useState } from 'react';
import { toast } from 'sonner';

type MeetingNotesPanelProps = {
  notes?: MeetingNote;
  onSaveNotes: (notes: MeetingNote) => void;
  onClose: () => void;
};

export function MeetingNotesPanel({
  notes,
  onSaveNotes,
  onClose,
}: MeetingNotesPanelProps) {
  const [content, setContent] = useState(notes?.notesContent || '');
  const [agenda, setAgenda] = useState<string[]>(notes?.agendaItems || ['1. Review Objectives', '2. Discussion & Q&A', '3. Action Items']);
  const [newAgendaInput, setNewAgendaInput] = useState('');
  const [isSaved, setIsSaved] = useState(false);

  const handleSave = () => {
    onSaveNotes({
      id: notes?.id || `notes-${Date.now()}`,
      meetingId: notes?.meetingId || '',
      agendaItems: agenda,
      notesContent: content,
      decisions: notes?.decisions || [],
      updatedAt: 'Just now',
    });
    setIsSaved(true);
    toast.success('Meeting notes saved');
    setTimeout(() => setIsSaved(false), 2000);
  };

  const handleAddAgenda = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAgendaInput.trim()) return;
    setAgenda((prev) => [...prev, `${prev.length + 1}. ${newAgendaInput.trim()}`]);
    setNewAgendaInput('');
  };

  return (
    <aside className="w-80 shrink-0 border-l border-border bg-card flex flex-col h-full overflow-hidden text-foreground select-none">
      {/* Header */}
      <div className="h-14 border-b border-border px-4 flex items-center justify-between bg-card shrink-0">
        <div className="flex items-center gap-2">
          <Edit3 size={16} className="text-primary" />
          <h3 className="font-bold text-sm">Meeting Notes</h3>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={handleSave}
            className="p-1.5 rounded-lg hover:bg-muted text-primary hover:text-primary transition-colors flex items-center gap-1 text-xs font-bold"
            title="Save notes"
          >
            {isSaved ? <Check size={14} /> : <Save size={14} />}
            <span>{isSaved ? 'Saved' : 'Save'}</span>
          </button>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground"
          >
            <X size={16} />
          </button>
        </div>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar text-xs">
        {/* Agenda Section */}
        <div className="space-y-2">
          <span className="block font-bold text-[10px] uppercase tracking-wider text-muted-foreground">
            Agenda Topics
          </span>
          <div className="space-y-1">
            {agenda.map((item, idx) => (
              <div
                key={idx}
                className="p-2 rounded-lg border border-border bg-background text-foreground/90 font-medium"
              >
                {item}
              </div>
            ))}
          </div>

          {/* Add Agenda item */}
          <form onSubmit={handleAddAgenda} className="flex gap-1.5 pt-1">
            <input
              type="text"
              value={newAgendaInput}
              onChange={(e) => setNewAgendaInput(e.target.value)}
              placeholder="Add agenda point..."
              className="flex-1 h-7 rounded-lg border border-border bg-background px-2 text-xs outline-none focus:border-primary"
            />
            <button
              type="submit"
              disabled={!newAgendaInput.trim()}
              className="h-7 px-2.5 rounded-lg bg-muted hover:bg-card text-foreground font-semibold text-[11px] border border-border disabled:opacity-40"
            >
              Add
            </button>
          </form>
        </div>

        {/* Live Collaborative Notes Editor */}
        <div className="space-y-2 pt-2 border-t border-border">
          <span className="block font-bold text-[10px] uppercase tracking-wider text-muted-foreground">
            Live Meeting Minutes
          </span>
          <textarea
            rows={10}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Type notes, decisions, and highlights as the call progresses..."
            className="w-full rounded-xl border border-border bg-background p-3 text-xs text-foreground placeholder:text-muted-foreground outline-none focus:border-primary leading-relaxed resize-none font-medium custom-scrollbar"
          />
        </div>
      </div>
    </aside>
  );
}
