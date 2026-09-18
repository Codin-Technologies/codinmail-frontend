'use client';

import { formatBytes, formatRelativeDay, kindLabel } from '@/lib/files/format';
import { folderPath } from '@/lib/files/service';
import { CodinFile, FilesStore } from '@/lib/files/types';
import { PanelRightClose, Share2, Sparkles } from 'lucide-react';
import { FileActivityList } from './file-activity';
import { FileTypeIcon } from './file-type-icon';

export function FileDetailsPanel({
  file,
  store,
  onClose,
  onShare,
  onOpenAi,
}: {
  file: CodinFile;
  store: FilesStore;
  onClose: () => void;
  onShare: () => void;
  onOpenAi: () => void;
}) {
  const path = folderPath(store, file.folderId);
  const activity = store.activity.filter((a) => a.fileId === file.id).slice(0, 6);
  const relations = store.relations.filter((r) => r.fileId === file.id);

  return (
    <aside className="flex h-full w-full flex-col border-t border-border bg-card md:w-80 md:border-l md:border-t-0">
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <p className="truncate text-sm font-semibold">{file.name}</p>
        <button onClick={onClose} className="grid h-8 w-8 place-items-center rounded-md hover:bg-muted" aria-label="Collapse details">
          <PanelRightClose size={16} />
        </button>
      </div>
      <div className="min-h-0 flex-1 space-y-5 overflow-y-auto p-4 text-xs">
        <div className="flex items-center gap-3">
          <FileTypeIcon kind={file.kind} />
          <div>
            <p className="font-semibold">{kindLabel(file.kind)}</p>
            <p className="text-muted-foreground">{formatBytes(file.size)}</p>
          </div>
        </div>
        <Field label="Owner" value={file.ownerName} />
        <Field label="Location" value={path.map((p) => p.name).join(' / ') || 'My Files'} />
        <Field label="Shared with" value={`${file.sharedWithCount} people`} />
        <Field label="Tags" value={file.tags.length ? file.tags.join(', ') : 'None'} />
        <Field label="Last opened" value={formatRelativeDay(file.lastAccessedAt)} />
        {relations.length > 0 && (
          <div>
            <p className="mb-1.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Related work</p>
            <ul className="space-y-1">
              {relations.map((rel) => (
                <li key={rel.id} className="rounded-md bg-muted/60 px-2 py-1.5">
                  <span className="font-semibold">{rel.objectTitle}</span>
                  <span className="ml-1 text-muted-foreground">· {rel.objectType}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
        <div>
          <p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Activity</p>
          <FileActivityList activity={activity} />
        </div>
      </div>
      <div className="flex gap-2 border-t border-border p-3">
        <button onClick={onShare} className="inline-flex h-9 flex-1 items-center justify-center gap-1.5 rounded-md border border-border text-xs font-semibold hover:bg-muted">
          <Share2 size={13} /> Manage access
        </button>
        <button onClick={onOpenAi} className="inline-flex h-9 items-center justify-center gap-1.5 rounded-md bg-primary px-3 text-xs font-semibold text-primary-foreground">
          <Sparkles size={13} /> AI
        </button>
      </div>
    </aside>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className="mt-0.5 text-foreground">{value}</p>
    </div>
  );
}
