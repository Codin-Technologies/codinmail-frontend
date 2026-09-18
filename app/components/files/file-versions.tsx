import { formatBytes, formatDateTime } from '@/lib/files/format';
import { FileVersion } from '@/lib/files/types';
import { toast } from 'sonner';

export function FileVersions({
  versions,
  onRestore,
}: {
  versions: FileVersion[];
  onRestore: (version: number) => void;
}) {
  if (versions.length === 0) {
    return <p className="text-xs text-muted-foreground">Version history will appear after the file is updated.</p>;
  }
  return (
    <ul className="space-y-2">
      {versions.map((ver) => (
        <li key={ver.id} className="flex flex-wrap items-center justify-between gap-2 rounded-md border border-border bg-card px-3 py-2 text-xs">
          <div>
            <p className="font-semibold">v{ver.version} · {ver.createdBy}</p>
            <p className="text-muted-foreground">
              {formatDateTime(ver.createdAt)} · {formatBytes(ver.size)}
            </p>
          </div>
          <div className="flex gap-1">
            <button
              className="rounded-md border border-border px-2 py-1 font-semibold hover:bg-muted"
              onClick={() => toast.message(`Previewing version ${ver.version}`)}
            >
              Preview
            </button>
            <button
              className="rounded-md border border-border px-2 py-1 font-semibold hover:bg-muted"
              onClick={() => toast.success(`Downloading version ${ver.version}`)}
            >
              Download
            </button>
            <button className="rounded-md bg-foreground px-2 py-1 font-semibold text-background hover:opacity-90" onClick={() => onRestore(ver.version)}>
              Restore
            </button>
          </div>
        </li>
      ))}
    </ul>
  );
}
