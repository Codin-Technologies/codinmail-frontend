'use client';

import { CodinFolder } from '@/lib/files/types';
import { X } from 'lucide-react';
import { useState } from 'react';

export function SaveToFilesDialog({
  fileName,
  folders,
  onClose,
  onSave,
}: {
  fileName: string;
  folders: CodinFolder[];
  onClose: () => void;
  onSave: (folderId: string | null) => void;
}) {
  const [target, setTarget] = useState('fld-abc');
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" role="dialog" aria-modal="true">
      <form
        className="w-full max-w-sm rounded-lg border border-border bg-card p-4"
        onSubmit={(e) => {
          e.preventDefault();
          onSave(target === 'root' ? null : target);
        }}
      >
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold">Save to Codin Files</h2>
          <button type="button" onClick={onClose} className="grid h-8 w-8 place-items-center rounded-md hover:bg-muted" aria-label="Close">
            <X size={16} />
          </button>
        </div>
        <p className="mb-3 text-xs text-muted-foreground">
          Save <span className="font-semibold text-foreground">{fileName}</span> as a reference in Files rather than creating an extra copy when possible.
        </p>
        <label className="block text-xs font-semibold">
          Save to
          <select value={target} onChange={(e) => setTarget(e.target.value)} className="mt-1 h-9 w-full rounded-md border border-border bg-background px-2">
            <option value="root">My Files</option>
            {folders.filter((f) => !f.deletedAt).map((f) => (
              <option key={f.id} value={f.id}>
                {f.name}
              </option>
            ))}
          </select>
        </label>
        <div className="mt-4 flex justify-end gap-2">
          <button type="button" onClick={onClose} className="h-9 rounded-md border border-border px-3 text-xs font-semibold">
            Cancel
          </button>
          <button type="submit" className="h-9 rounded-md bg-primary px-3 text-xs font-semibold text-primary-foreground">
            Save
          </button>
        </div>
      </form>
    </div>
  );
}
