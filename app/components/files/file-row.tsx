import { formatBytes, formatRelativeDay } from '@/lib/files/format';
import { CodinFile } from '@/lib/files/types';
import type { MouseEvent } from 'react';
import { MoreHorizontal, Star } from 'lucide-react';
import { FileTypeIcon } from './file-type-icon';

export function FileRow({
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
    <tr
      onClick={(e) => {
        if (e.metaKey || e.ctrlKey) onSelect(true);
        else onOpen();
      }}
      onContextMenu={onMenu}
      className={`cursor-pointer border-b border-border/70 text-xs hover:bg-muted/40 ${selected ? 'bg-primary/5' : ''}`}
    >
      <td className="w-10 px-3 py-2.5" onClick={(e) => e.stopPropagation()}>
        <input type="checkbox" checked={!!selected} onChange={() => onSelect(true)} aria-label={`Select ${file.name}`} />
      </td>
      <td className="px-2 py-2.5">
        <div className="flex min-w-0 items-center gap-2.5">
          <FileTypeIcon kind={file.kind} size="sm" />
          <div className="min-w-0">
            <p className="flex items-center gap-1.5 truncate font-semibold text-foreground">
              {file.name}
              {file.isStarred && <Star size={11} className="shrink-0 fill-current" />}
            </p>
            {file.sharedByName && <p className="text-[11px] text-muted-foreground">Shared by {file.sharedByName}</p>}
          </div>
        </div>
      </td>
      <td className="hidden px-3 py-2.5 text-muted-foreground md:table-cell">{formatRelativeDay(file.updatedAt)}</td>
      <td className="hidden px-3 py-2.5 text-muted-foreground lg:table-cell">{file.ownerName}</td>
      <td className="hidden px-3 py-2.5 text-muted-foreground sm:table-cell">{formatBytes(file.size)}</td>
      <td className="w-10 px-2 py-2.5" onClick={(e) => e.stopPropagation()}>
        <button className="grid h-8 w-8 place-items-center rounded-md hover:bg-muted" aria-label={`More actions for ${file.name}`} onClick={onMenu}>
          <MoreHorizontal size={15} />
        </button>
      </td>
    </tr>
  );
}
