'use client';

import { formatBytes } from '@/lib/files/format';
import { UploadItem } from '@/lib/files/types';
import { UploadCloud, X } from 'lucide-react';
import { useRef, useState } from 'react';

export function UploadDialog({
  items,
  onClose,
  onBrowse,
  onFiles,
  onCancelAll,
  onRetry,
  dragging,
}: {
  items: UploadItem[];
  onClose: () => void;
  onBrowse: () => void;
  onFiles: (files: FileList | File[]) => void;
  onCancelAll: () => void;
  onRetry: (id: string) => void;
  dragging?: boolean;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [over, setOver] = useState(false);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" role="dialog" aria-modal="true" aria-labelledby="upload-title">
      <div className="w-full max-w-md rounded-lg border border-border bg-card">
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <h2 id="upload-title" className="text-sm font-semibold">
            Upload files
          </h2>
          <button onClick={onClose} className="grid h-8 w-8 place-items-center rounded-md hover:bg-muted" aria-label="Close">
            <X size={16} />
          </button>
        </div>
        <div className="p-4 space-y-4">
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setOver(true);
            }}
            onDragLeave={() => setOver(false)}
            onDrop={(e) => {
              e.preventDefault();
              setOver(false);
              if (e.dataTransfer.files.length) onFiles(e.dataTransfer.files);
            }}
            className={`flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed px-4 py-10 text-center ${
              over || dragging ? 'border-primary bg-primary/5' : 'border-border bg-background'
            }`}
          >
            <UploadCloud size={22} className="text-muted-foreground" />
            <p className="text-sm font-semibold">Drag files here</p>
            <p className="text-xs text-muted-foreground">or</p>
            <button type="button" onClick={() => inputRef.current?.click()} className="h-9 rounded-md border border-border px-3 text-xs font-semibold hover:bg-muted">
              Browse files
            </button>
            <input ref={inputRef} type="file" multiple className="hidden" onChange={(e) => e.target.files && onFiles(e.target.files)} />
          </div>

          {items.length > 0 && (
            <div>
              <div className="mb-2 flex items-center justify-between">
                <p className="text-xs font-semibold">Uploading</p>
                <button onClick={onCancelAll} className="text-[11px] font-semibold text-muted-foreground hover:text-foreground">
                  Cancel all
                </button>
              </div>
              <ul className="space-y-2">
                {items.map((item) => (
                  <li key={item.id} className="text-xs">
                    <div className="flex justify-between gap-2">
                      <span className="truncate font-medium">{item.name}</span>
                      <span className="tabular-nums text-muted-foreground">
                        {item.status === 'failed' ? 'Failed' : item.status === 'complete' ? '100%' : `${item.progress}%`}
                      </span>
                    </div>
                    <div className="mt-1 h-1 overflow-hidden rounded-full bg-muted">
                      <div className={`h-full ${item.status === 'failed' ? 'bg-destructive' : 'bg-primary'}`} style={{ width: `${item.progress}%` }} />
                    </div>
                    <p className="mt-0.5 text-[11px] text-muted-foreground">
                      {formatBytes(item.size)}
                      {item.error ? ` · ${item.error}` : ''}
                      {item.status === 'failed' && (
                        <button className="ml-2 font-semibold text-primary" onClick={() => onRetry(item.id)}>
                          Retry
                        </button>
                      )}
                    </p>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
