import { Copy, Download, Share2, Star, Trash2, FolderInput } from 'lucide-react';

export function BulkActionBar({
  count,
  onDownload,
  onMove,
  onCopy,
  onShare,
  onStar,
  onDelete,
  onClear,
}: {
  count: number;
  onDownload: () => void;
  onMove: () => void;
  onCopy: () => void;
  onShare: () => void;
  onStar: () => void;
  onDelete: () => void;
  onClear: () => void;
}) {
  if (count === 0) return null;
  return (
    <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-border bg-card px-3 py-2">
      <p className="text-xs font-semibold">{count} selected</p>
      <div className="flex flex-wrap gap-1">
        <BarButton icon={Download} label="Download" onClick={onDownload} />
        <BarButton icon={FolderInput} label="Move" onClick={onMove} />
        <BarButton icon={Copy} label="Copy" onClick={onCopy} />
        <BarButton icon={Share2} label="Share" onClick={onShare} />
        <BarButton icon={Star} label="Star" onClick={onStar} />
        <BarButton icon={Trash2} label="Delete" onClick={onDelete} />
        <button onClick={onClear} className="rounded-md px-2 py-1.5 text-xs font-semibold text-muted-foreground hover:bg-muted">
          Clear
        </button>
      </div>
    </div>
  );
}

function BarButton({ icon: Icon, label, onClick }: { icon: typeof Download; label: string; onClick: () => void }) {
  return (
    <button onClick={onClick} className="inline-flex items-center gap-1.5 rounded-md px-2 py-1.5 text-xs font-semibold hover:bg-muted">
      <Icon size={13} />
      {label}
    </button>
  );
}
