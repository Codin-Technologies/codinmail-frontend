'use client';

import { formatBytes, formatDateTime, kindLabel } from '@/lib/files/format';
import { CodinFile, FileRelation, FilesStore } from '@/lib/files/types';
import { folderPath } from '@/lib/files/service';
import { Download, Share2, Sparkles, X } from 'lucide-react';
import { useState } from 'react';
import { FileActivityList } from './file-activity';
import { FileDetails } from './file-details';
import { FileVersions } from './file-versions';
import { AIFileAssistant } from './ai-file-assistant';
import { FileTypeIcon } from './file-type-icon';

type Tab = 'details' | 'activity' | 'versions' | 'related' | 'ai';

export function FilePreview({
  file,
  store,
  onClose,
  onDownload,
  onShare,
  onRestoreVersion,
}: {
  file: CodinFile;
  store: FilesStore;
  onClose: () => void;
  onDownload: () => void;
  onShare: () => void;
  onRestoreVersion: (version: number) => void;
}) {
  const [tab, setTab] = useState<Tab>('details');
  const activity = store.activity.filter((a) => a.fileId === file.id);
  const versions = store.versions.filter((v) => v.fileId === file.id);
  const relations = store.relations.filter((r) => r.fileId === file.id);
  const permissions = store.permissions.filter((p) => p.fileId === file.id);
  const path = folderPath(store, file.folderId);

  return (
    <div className="fixed inset-0 z-50 flex items-stretch justify-center bg-black/40 p-0 sm:items-center sm:p-6" role="dialog" aria-modal="true" aria-label={`Preview ${file.name}`}>
      <div className="flex h-full w-full max-w-5xl flex-col overflow-hidden bg-card sm:h-[min(90vh,840px)] sm:rounded-lg sm:border sm:border-border">
        <header className="flex shrink-0 items-center justify-between gap-3 border-b border-border px-4 py-3">
          <div className="flex min-w-0 items-center gap-2.5">
            <FileTypeIcon kind={file.kind} size="sm" />
            <div className="min-w-0">
              <h2 className="truncate text-sm font-semibold">{file.name}</h2>
              <p className="text-[11px] text-muted-foreground">
                {kindLabel(file.kind)} · {formatBytes(file.size)}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <button onClick={onDownload} className="hidden h-8 items-center gap-1.5 rounded-md border border-border px-2.5 text-xs font-semibold sm:inline-flex hover:bg-muted">
              <Download size={13} /> Download
            </button>
            <button onClick={onShare} className="hidden h-8 items-center gap-1.5 rounded-md border border-border px-2.5 text-xs font-semibold sm:inline-flex hover:bg-muted">
              <Share2 size={13} /> Share
            </button>
            <button onClick={onClose} className="grid h-8 w-8 place-items-center rounded-md hover:bg-muted" aria-label="Close preview">
              <X size={16} />
            </button>
          </div>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto bg-background p-4 sm:p-6">
          <PreviewBody file={file} />
        </div>

        <footer className="shrink-0 border-t border-border bg-card">
          <div className="flex gap-0.5 overflow-x-auto px-2 pt-2" role="tablist">
            {([
              ['details', 'Details'],
              ['activity', 'Activity'],
              ['versions', 'Versions'],
              ['related', 'Related'],
              ['ai', 'AI'],
            ] as const).map(([id, label]) => (
              <button
                key={id}
                role="tab"
                aria-selected={tab === id}
                onClick={() => setTab(id)}
                className={`rounded-t-md px-3 py-2 text-xs font-semibold ${tab === id ? 'bg-background text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
              >
                {id === 'ai' && <Sparkles size={11} className="mr-1 inline" />}
                {label}
              </button>
            ))}
          </div>
          <div className="max-h-56 overflow-y-auto border-t border-border bg-background p-4">
            {tab === 'details' && <FileDetails file={file} path={path} permissions={permissions} />}
            {tab === 'activity' && <FileActivityList activity={activity} />}
            {tab === 'versions' && <FileVersions versions={versions} onRestore={onRestoreVersion} />}
            {tab === 'related' && <RelatedList relations={relations} />}
            {tab === 'ai' && <AIFileAssistant file={file} compact />}
          </div>
        </footer>
      </div>
    </div>
  );
}

function PreviewBody({ file }: { file: CodinFile }) {
  if (file.previewUrl && (file.kind === 'jpg' || file.kind === 'png')) {
    return <img src={file.previewUrl} alt={file.name} className="mx-auto max-h-[52vh] rounded-lg border border-border object-contain" />;
  }
  if (file.kind === 'mp4') {
    return (
      <div className="mx-auto flex max-w-xl flex-col items-center gap-3 rounded-lg border border-border bg-card p-8 text-center">
        <p className="text-sm font-semibold">Video preview</p>
        <p className="text-xs text-muted-foreground">Playback is mocked for this workspace. Download to view the original file.</p>
        <div className="flex h-40 w-full items-center justify-center rounded-md bg-muted text-xs text-muted-foreground">Site walkthrough.mp4</div>
      </div>
    );
  }
  if (file.kind === 'audio') {
    return (
      <div className="mx-auto max-w-md rounded-lg border border-border bg-card p-6 text-center text-sm">
        Audio preview is mocked. Use Download to save the file.
      </div>
    );
  }
  if (file.previewText && (file.kind === 'txt' || file.kind === 'csv' || file.kind === 'pdf' || file.kind === 'docx')) {
    return (
      <pre className="mx-auto max-w-2xl whitespace-pre-wrap rounded-lg border border-border bg-card p-5 font-sans text-sm leading-relaxed text-foreground">
        {file.previewText}
      </pre>
    );
  }
  return (
    <div className="mx-auto flex max-w-md flex-col items-center gap-3 rounded-lg border border-dashed border-border bg-card px-6 py-16 text-center">
      <FileTypeIcon kind={file.kind} size="lg" />
      <p className="text-sm font-semibold">Preview unavailable</p>
      <p className="text-xs text-muted-foreground">This format cannot be previewed in Codin yet.</p>
      <p className="text-[11px] text-muted-foreground">Last opened {formatDateTime(file.lastAccessedAt)}</p>
    </div>
  );
}

function RelatedList({ relations }: { relations: FileRelation[] }) {
  if (relations.length === 0) {
    return <p className="text-xs text-muted-foreground">No related Mail, Meet, Tasks, or Contacts yet.</p>;
  }
  return (
    <ul className="space-y-2">
      {relations.map((rel) => (
        <li key={rel.id} className="flex items-center justify-between rounded-md border border-border bg-card px-3 py-2 text-xs">
          <span>
            <span className="font-semibold">{rel.objectTitle}</span>
            <span className="ml-2 uppercase tracking-wide text-muted-foreground">{rel.objectType}</span>
          </span>
          <span className="text-muted-foreground">{rel.relationType.replace('_', ' ')}</span>
        </li>
      ))}
    </ul>
  );
}

export function FilePreviewUnsupportedNote() {
  return null;
}
