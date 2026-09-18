import { ChevronRight } from 'lucide-react';
import { CodinFolder } from '@/lib/files/types';

export function FilesBreadcrumbs({
  rootLabel,
  path,
  onRoot,
  onSelect,
}: {
  rootLabel: string;
  path: CodinFolder[];
  onRoot: () => void;
  onSelect: (folderId: string) => void;
}) {
  return (
    <nav aria-label="Folder location" className="flex min-w-0 flex-wrap items-center gap-0.5 text-xs">
      <button onClick={onRoot} className="rounded px-1.5 py-1 font-semibold text-muted-foreground hover:bg-muted hover:text-foreground">
        {rootLabel}
      </button>
      {path.map((folder) => (
        <span key={folder.id} className="flex items-center gap-0.5">
          <ChevronRight size={12} className="text-muted-foreground" />
          <button
            onClick={() => onSelect(folder.id)}
            className="rounded px-1.5 py-1 font-semibold text-foreground hover:bg-muted"
          >
            {folder.name}
          </button>
        </span>
      ))}
    </nav>
  );
}
