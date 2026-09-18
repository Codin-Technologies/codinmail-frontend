'use client';

import { CodinFile } from '@/lib/files/types';
import { Copy, Download, Eye, FolderInput, Link2, MoreHorizontal, Pencil, Share2, Star, Trash2 } from 'lucide-react';
import { useEffect, useRef } from 'react';

export type MenuKind = 'file' | 'folder';

export function FileContextMenu({
  x,
  y,
  kind,
  onClose,
  onAction,
}: {
  x: number;
  y: number;
  kind: MenuKind;
  onClose: () => void;
  onAction: (action: string) => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) onClose();
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('mousedown', onDoc);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDoc);
      document.removeEventListener('keydown', onKey);
    };
  }, [onClose]);

  const items =
    kind === 'folder'
      ? [
          { id: 'open', label: 'Open', icon: Eye },
          { id: 'rename', label: 'Rename', icon: Pencil },
          { id: 'move', label: 'Move', icon: FolderInput },
          { id: 'share', label: 'Share', icon: Share2 },
          { id: 'star', label: 'Star', icon: Star },
          { id: 'download', label: 'Download', icon: Download },
          { id: 'workspace', label: 'Add to workspace', icon: MoreHorizontal },
          { id: 'delete', label: 'Delete', icon: Trash2 },
        ]
      : [
          { id: 'open', label: 'Open', icon: Eye },
          { id: 'preview', label: 'Preview', icon: Eye },
          { id: 'download', label: 'Download', icon: Download },
          { id: 'share', label: 'Share', icon: Share2 },
          { id: 'copy-link', label: 'Copy link', icon: Link2 },
          { id: 'rename', label: 'Rename', icon: Pencil },
          { id: 'move', label: 'Move', icon: FolderInput },
          { id: 'copy', label: 'Copy', icon: Copy },
          { id: 'star', label: 'Star', icon: Star },
          { id: 'details', label: 'View details', icon: MoreHorizontal },
          { id: 'activity', label: 'View activity', icon: MoreHorizontal },
          { id: 'versions', label: 'View versions', icon: MoreHorizontal },
          { id: 'delete', label: 'Delete', icon: Trash2 },
        ];

  return (
    <div
      ref={ref}
      role="menu"
      className="fixed z-[60] min-w-48 rounded-lg border border-border bg-card py-1 shadow-lg"
      style={{ left: Math.min(x, window.innerWidth - 220), top: Math.min(y, window.innerHeight - 360) }}
    >
      {items.map((item) => (
        <button
          key={item.id}
          role="menuitem"
          onClick={() => {
            onAction(item.id);
            onClose();
          }}
          className="flex w-full items-center gap-2 px-3 py-1.5 text-left text-xs font-medium hover:bg-muted"
        >
          <item.icon size={13} />
          {item.label}
        </button>
      ))}
    </div>
  );
}

export function FileMoreButton({ file, onOpen }: { file: CodinFile; onOpen: (event: React.MouseEvent) => void }) {
  return (
    <button onClick={onOpen} className="grid h-8 w-8 place-items-center rounded-md hover:bg-muted" aria-label={`More for ${file.name}`}>
      <MoreHorizontal size={15} />
    </button>
  );
}
