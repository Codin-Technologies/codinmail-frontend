import { formatRelativeDay } from '@/lib/files/format';
import { CodinFolder } from '@/lib/files/types';
import type { MouseEvent } from 'react';
import { Folder, Star, Users } from 'lucide-react';

export function FolderCard({
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
    <div
      role="button"
      tabIndex={0}
      onClick={(e) => {
        if (e.metaKey || e.ctrlKey) onSelect(true);
        else onOpen();
      }}
      onContextMenu={onMenu}
      onKeyDown={(e) => {
        if (e.key === 'Enter') onOpen();
      }}
      className={`flex items-center gap-3 rounded-lg border bg-card p-3 text-left hover:bg-muted/40 ${
        selected ? 'border-primary ring-1 ring-primary/30' : 'border-border'
      }`}
    >
      <span className="grid h-10 w-10 place-items-center rounded-lg bg-muted text-foreground">
        <Folder size={18} />
      </span>
      <span className="min-w-0 flex-1">
        <span className="flex items-center gap-1.5">
          <span className="truncate text-sm font-semibold">{folder.name}</span>
          {folder.isStarred && <Star size={12} className="shrink-0 fill-current" />}
        </span>
        <span className="mt-0.5 flex items-center gap-2 text-[11px] text-muted-foreground">
          {formatRelativeDay(folder.updatedAt)}
          {folder.memberCount ? (
            <span className="inline-flex items-center gap-1">
              <Users size={11} />
              {folder.memberCount} members
            </span>
          ) : null}
        </span>
      </span>
    </div>
  );
}
