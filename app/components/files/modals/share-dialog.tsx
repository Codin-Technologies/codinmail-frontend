'use client';

import { CodinFile, PermissionRole } from '@/lib/files/types';
import { X } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

export function ShareDialog({
  file,
  onClose,
  onShare,
  onEnablePublic,
}: {
  file: CodinFile;
  onClose: () => void;
  onShare: (people: { name: string; email: string; role: PermissionRole }[], message: string) => void;
  onEnablePublic: () => void;
}) {
  const [people, setPeople] = useState('');
  const [role, setRole] = useState<PermissionRole>('viewer');
  const [message, setMessage] = useState('');
  const [confirmPublic, setConfirmPublic] = useState(false);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" role="dialog" aria-modal="true" aria-labelledby="share-title">
      <div className="w-full max-w-md rounded-lg border border-border bg-card">
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <h2 id="share-title" className="truncate text-sm font-semibold">
            Share “{file.name}”
          </h2>
          <button onClick={onClose} className="grid h-8 w-8 place-items-center rounded-md hover:bg-muted" aria-label="Close">
            <X size={16} />
          </button>
        </div>
        <form
          className="space-y-3 p-4 text-xs"
          onSubmit={(e) => {
            e.preventDefault();
            const parsed = people
              .split(',')
              .map((s) => s.trim())
              .filter(Boolean)
              .map((entry) => {
                const email = entry.includes('@') ? entry : `${entry.toLowerCase().replace(/\s+/g, '.')}@codin.io`;
                return { name: entry.includes('@') ? entry.split('@')[0] : entry, email, role };
              });
            if (parsed.length === 0) return;
            onShare(parsed, message);
          }}
        >
          <label className="block font-semibold">
            People
            <input
              value={people}
              onChange={(e) => setPeople(e.target.value)}
              placeholder="Add people or groups"
              className="mt-1 h-9 w-full rounded-md border border-border bg-background px-3 outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
          </label>
          <label className="block font-semibold">
            Access
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as PermissionRole)}
              className="mt-1 h-9 w-full rounded-md border border-border bg-background px-2"
            >
              <option value="viewer">Viewer</option>
              <option value="commenter">Commenter</option>
              <option value="editor">Editor</option>
            </select>
          </label>
          <label className="block font-semibold">
            Message
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Optional message"
              rows={2}
              className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
          </label>
          <div className="rounded-md border border-border bg-background p-3">
            <p className="font-semibold">Copy link</p>
            <p className="mt-0.5 text-muted-foreground">https://files.codin.io/d/{file.id}</p>
            <div className="mt-2 flex flex-wrap gap-2">
              <button
                type="button"
                className="h-8 rounded-md border border-border px-2 font-semibold hover:bg-muted"
                onClick={() => {
                  navigator.clipboard?.writeText(`https://files.codin.io/d/${file.id}`);
                  toast.success('Link copied');
                }}
              >
                Copy link
              </button>
              <button type="button" className="h-8 rounded-md border border-border px-2 font-semibold hover:bg-muted" onClick={() => setConfirmPublic(true)}>
                Anyone with the link
              </button>
            </div>
            <p className="mt-2 text-[11px] text-muted-foreground">Expiration, password, and download restriction are mocked for this MVP.</p>
          </div>
          <div className="flex justify-end gap-2 pt-1">
            <button type="button" onClick={onClose} className="h-9 rounded-md border border-border px-3 font-semibold hover:bg-muted">
              Cancel
            </button>
            <button type="submit" className="h-9 rounded-md bg-primary px-3 font-semibold text-primary-foreground">
              Send
            </button>
          </div>
        </form>
      </div>

      {confirmPublic && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/30 p-4">
          <div className="w-full max-w-sm rounded-lg border border-border bg-card p-4">
            <h3 className="text-sm font-semibold">Anyone with the link</h3>
            <p className="mt-2 text-xs text-muted-foreground">This file may be accessible outside your organization.</p>
            <div className="mt-4 flex justify-end gap-2">
              <button className="h-9 rounded-md border border-border px-3 text-xs font-semibold" onClick={() => setConfirmPublic(false)}>
                Cancel
              </button>
              <button
                className="h-9 rounded-md bg-primary px-3 text-xs font-semibold text-primary-foreground"
                onClick={() => {
                  onEnablePublic();
                  setConfirmPublic(false);
                }}
              >
                Enable
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
