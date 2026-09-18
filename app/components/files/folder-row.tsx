import { formatRelativeDay } from '@/lib/files/format';
import { CodinFolder } from '@/lib/files/types';
import type { MouseEvent } from 'react';
import { Folder, MoreHorizontal, Star } from 'lucide-react';

export function FolderRow({
  folder,
  selected,
  onOpen,
  onSelect,
  onMenu,
}: {
  folder: CodinFolder;
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
        <input type="checkbox" checked={!!selected} onChange={() => onSelect(true)} aria-label={`Select ${folder.name}`} />
      </td>
      <td className="px-2 py-2.5">
        <div className="flex items-center gap-2.5">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-muted">
            <Folder size={15} />
          </span>
          <span className="flex items-center gap-1.5 font-semibold">
            {folder.name}
            {folder.isStarred && <Star size={11} className="fill-current" />}
          </span>
        </div>
      </td>
      <td className="hidden px-3 py-2.5 text-muted-foreground md:table-cell">{formatRelativeDay(folder.updatedAt)}</td>
      <td className="hidden px-3 py-2.5 text-muted-foreground lg:table-cell">—</td>
      <td className="hidden px-3 py-2.5 text-muted-foreground sm:table-cell">Folder</td>
      <td className="w-10 px-2 py-2.5" onClick={(e) => e.stopPropagation()}>
        <button className="grid h-8 w-8 place-items-center rounded-md hover:bg-muted" aria-label={`More actions for ${folder.name}`} onClick={onMenu}>
          <MoreHorizontal size={15} />
        </button>
      </td>
    </tr>
  );
}
