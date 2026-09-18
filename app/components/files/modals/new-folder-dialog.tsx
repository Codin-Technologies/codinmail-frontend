'use client';

import { X } from 'lucide-react';
import { useState } from 'react';

export function NewFolderDialog({ onClose, onCreate }: { onClose: () => void; onCreate: (name: string) => void }) {
  const [name, setName] = useState('');
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" role="dialog" aria-modal="true" aria-labelledby="new-folder-title">
      <form
        className="w-full max-w-sm rounded-lg border border-border bg-card p-4"
        onSubmit={(e) => {
          e.preventDefault();
          if (!name.trim()) return;
          onCreate(name.trim());
        }}
      >
        <div className="mb-3 flex items-center justify-between">
          <h2 id="new-folder-title" className="text-sm font-semibold">
            New folder
          </h2>
          <button type="button" onClick={onClose} className="grid h-8 w-8 place-items-center rounded-md hover:bg-muted" aria-label="Close">
            <X size={16} />
          </button>
        </div>
        <label className="text-xs font-semibold">
          Folder name
          <input
            autoFocus
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-1 h-9 w-full rounded-md border border-border bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
        </label>
        <div className="mt-4 flex justify-end gap-2">
          <button type="button" onClick={onClose} className="h-9 rounded-md border border-border px-3 text-xs font-semibold hover:bg-muted">
            Cancel
          </button>
          <button type="submit" disabled={!name.trim()} className="h-9 rounded-md bg-primary px-3 text-xs font-semibold text-primary-foreground disabled:opacity-50">
            Create
          </button>
        </div>
      </form>
    </div>
  );
}
