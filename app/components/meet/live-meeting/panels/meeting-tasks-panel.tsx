'use client';

import { MeetingTask } from '@/lib/meet/types';
import {
  CheckSquare,
  Clock,
  Plus,
  Square,
  Trash2,
  User,
  X,
} from 'lucide-react';
import React, { useState } from 'react';
import { toast } from 'sonner';

type MeetingTasksPanelProps = {
  tasks: MeetingTask[];
  onToggleTask: (taskId: string) => void;
  onAddTask: (title: string, assignee?: string, dueDate?: string) => void;
  onDeleteTask: (taskId: string) => void;
  onClose: () => void;
};

export function MeetingTasksPanel({
  tasks,
  onToggleTask,
  onAddTask,
  onDeleteTask,
  onClose,
}: MeetingTasksPanelProps) {
  const [taskTitle, setTaskTitle] = useState('');
  const [assignee, setAssignee] = useState('Alex Morgan');
  const [dueDate, setDueDate] = useState('2026-08-28');
  const [showAddForm, setShowAddForm] = useState(false);

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskTitle.trim()) return;
    onAddTask(taskTitle.trim(), assignee, dueDate);
    setTaskTitle('');
    setShowAddForm(false);
    toast.success('Task created and linked to Codin Tasks');
  };

  return (
    <aside className="w-80 shrink-0 border-l border-border bg-card flex flex-col h-full overflow-hidden text-foreground select-none">
      {/* Header */}
      <div className="h-14 border-b border-border px-4 flex items-center justify-between bg-card shrink-0">
        <div className="flex items-center gap-2">
          <CheckSquare size={16} className="text-primary" />
          <h3 className="font-bold text-sm">Action Items ({tasks.length})</h3>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground"
        >
          <X size={16} />
        </button>
      </div>

      {/* Task List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar text-xs">
        <p className="text-[11px] text-muted-foreground leading-relaxed">
          Action items created here automatically sync into your global Codin Tasks workspace.
        </p>

        {tasks.length === 0 ? (
          <div className="p-8 text-center border border-dashed border-border rounded-2xl bg-muted/10 space-y-2">
            <CheckSquare size={24} className="mx-auto text-muted-foreground" />
            <p className="font-semibold text-muted-foreground">No action items yet</p>
          </div>
        ) : (
          <div className="space-y-2">
            {tasks.map((t) => (
              <div
                key={t.id}
                onClick={() => onToggleTask(t.id)}
                className="p-3 rounded-xl border border-border bg-background hover:border-primary/40 cursor-pointer transition-colors flex items-start justify-between gap-2.5 group"
              >
                <div className="flex items-start gap-2.5 min-w-0">
                  <button
                    type="button"
                    className="mt-0.5 text-primary hover:opacity-80 transition-opacity"
                  >
                    {t.completed ? <CheckSquare size={16} /> : <Square size={16} />}
                  </button>
                  <div className="min-w-0">
                    <p
                      className={`font-semibold text-xs leading-snug ${
                        t.completed ? 'line-through text-muted-foreground' : 'text-foreground'
                      }`}
                    >
                      {t.title}
                    </p>
                    <div className="flex items-center gap-2 text-[10px] text-muted-foreground mt-1">
                      {t.assigneeName && (
                        <span className="flex items-center gap-1">
                          <User size={10} />
                          <span>{t.assigneeName.split(' ')[0]}</span>
                        </span>
                      )}
                      {t.dueDate && (
                        <span className="flex items-center gap-1 font-mono">
                          <Clock size={10} />
                          <span>{t.dueDate}</span>
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteTask(t.id);
                  }}
                  className="opacity-0 group-hover:opacity-100 p-1 text-muted-foreground hover:text-red-500 transition-all"
                  title="Delete action item"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Bottom Add Action */}
      <div className="p-3 border-t border-border bg-card">
        {showAddForm ? (
          <form onSubmit={handleAddSubmit} className="space-y-2 text-xs">
            <input
              type="text"
              required
              autoFocus
              value={taskTitle}
              onChange={(e) => setTaskTitle(e.target.value)}
              placeholder="Action item description..."
              className="w-full h-8 rounded-lg border border-border bg-background px-2.5 outline-none focus:border-primary"
            />
            <div className="grid grid-cols-2 gap-1.5">
              <select
                value={assignee}
                onChange={(e) => setAssignee(e.target.value)}
                className="h-7 rounded-lg border border-border bg-background px-1.5 text-[11px] outline-none"
              >
                <option value="Alex Morgan">Alex Morgan</option>
                <option value="Maya Chen">Maya Chen</option>
                <option value="Lee Robinson">Lee Robinson</option>
                <option value="Delba de Oliveira">Delba</option>
              </select>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="h-7 rounded-lg border border-border bg-background px-1 text-[11px] outline-none"
              />
            </div>
            <div className="flex justify-end gap-1.5 pt-1">
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="px-2.5 py-1 rounded-lg border border-border text-[11px]"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-3 py-1 rounded-lg bg-primary text-white text-[11px] font-bold shadow"
              >
                Save
              </button>
            </div>
          </form>
        ) : (
          <button
            onClick={() => setShowAddForm(true)}
            className="w-full h-9 rounded-xl bg-primary text-white text-xs font-bold flex items-center justify-center gap-2 shadow hover:opacity-90 transition-opacity"
          >
            <Plus size={14} />
            <span>Create Action Item</span>
          </button>
        )}
      </div>
    </aside>
  );
}
