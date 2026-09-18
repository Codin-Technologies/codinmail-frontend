import { formatBytes, formatRelativeDay } from '@/lib/files/format';
import { CodinFile } from '@/lib/files/types';
import type { MouseEvent } from 'react';
import { Star } from 'lucide-react';
import { FileTypeIcon, fileKindShort } from './file-type-icon';

export function FileCard({
  file,
  selected,
  onOpen,
  onSelect,
  onMenu,
}: {
  file: CodinFile;
  selected?: boolean;
  onOpen: () => void;
  onSelect: (additive: boolean) => void;
  onMenu: (event: MouseEvent) => void;
}) {
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={(e) => {
        if (e.metaKey || e.ctrlKey || e.shiftKey) onSelect(true);
        else onOpen();
      }}
      onContextMenu={onMenu}
      onKeyDown={(e) => {
        if (e.key === 'Enter') onOpen();
        if (e.key === ' ') {
          e.preventDefault();
          onSelect(false);
        }
      }}
      className={`group flex flex-col overflow-hidden rounded-lg border bg-card text-left transition-colors hover:bg-muted/40 ${
        selected ? 'border-primary ring-1 ring-primary/30' : 'border-border'
      }`}
    >
      <div className="relative flex h-28 items-center justify-center bg-muted/40">
        {file.previewUrl ? (
          <img src={file.previewUrl} alt="" className="h-full w-full object-cover" />
        ) : (
          <FileTypeIcon kind={file.kind} size="lg" />
        )}
        <span className="absolute left-2 top-2 rounded bg-background/90 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-muted-foreground">
          {fileKindShort(file.kind)}
        </span>
        {file.isStarred && <Star size={12} className="absolute right-2 top-2 fill-current text-foreground" />}
        <input
          type="checkbox"
          checked={!!selected}
          onClick={(e) => e.stopPropagation()}
          onChange={() => onSelect(true)}
          aria-label={`Select ${file.name}`}
          className="absolute right-2 bottom-2 opacity-0 group-hover:opacity-100 focus:opacity-100"
        />
      </div>
      <div className="border-t border-border px-3 py-2.5">
        <p className="truncate text-sm font-semibold text-foreground">{file.name}</p>
        <p className="mt-0.5 text-[11px] text-muted-foreground">
          {formatBytes(file.size)} · {formatRelativeDay(file.updatedAt)}
        </p>
      </div>
    </div>
  );
}
