import { formatDateTime } from '@/lib/files/format';
import { FileActivity } from '@/lib/files/types';

export function FileActivityList({ activity }: { activity: FileActivity[] }) {
  if (activity.length === 0) {
    return <p className="text-xs text-muted-foreground">No activity recorded yet.</p>;
  }
  return (
    <ol className="space-y-3">
      {activity.map((item) => (
        <li key={item.id} className="flex gap-3 text-xs">
          <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-foreground" />
          <div>
            <p>
              <span className="font-semibold">{item.userName}</span> {item.action}
            </p>
            {item.metadata && <p className="text-muted-foreground">{item.metadata}</p>}
            <p className="text-[11px] text-muted-foreground">{formatDateTime(item.createdAt)}</p>
          </div>
        </li>
      ))}
    </ol>
  );
}
