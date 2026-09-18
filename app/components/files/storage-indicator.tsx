import { formatBytes } from '@/lib/files/format';

export function StorageIndicator({
  used,
  total,
  groups,
  compact,
  onManage,
}: {
  used: number;
  total: number;
  groups: Record<string, number>;
  compact?: boolean;
  onManage?: () => void;
}) {
  const pct = Math.min(100, Math.round((used / total) * 100));
  return (
    <div className={compact ? 'space-y-2' : 'rounded-lg border border-border bg-card p-4'}>
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm font-semibold">Storage</p>
        {onManage && (
          <button onClick={onManage} className="text-xs font-semibold text-primary hover:underline">
            Manage storage
          </button>
        )}
      </div>
      <p className="text-xs text-muted-foreground">
        {formatBytes(used)} used · {formatBytes(total)} total
      </p>
      <div className="h-1.5 overflow-hidden rounded-full bg-muted" aria-hidden>
        <div className="h-full rounded-full bg-primary" style={{ width: `${pct}%` }} />
      </div>
      {!compact && (
        <ul className="mt-3 space-y-1.5 text-xs">
          {Object.entries(groups).map(([label, bytes]) => (
            <li key={label} className="flex justify-between text-muted-foreground">
              <span>{label}</span>
              <span className="tabular-nums text-foreground">{formatBytes(bytes)}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
