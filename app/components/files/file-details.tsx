import { formatDateTime, kindLabel, formatBytes } from '@/lib/files/format';
import { CodinFile, CodinFolder, FilePermission } from '@/lib/files/types';

export function FileDetails({
  file,
  path,
  permissions,
}: {
  file: CodinFile;
  path: CodinFolder[];
  permissions: FilePermission[];
}) {
  const location = path.length ? path.map((p) => p.name).join(' / ') : 'My Files';
  return (
    <dl className="grid grid-cols-1 gap-x-6 gap-y-3 text-xs sm:grid-cols-2">
      <Item label="Type" value={kindLabel(file.kind)} />
      <Item label="Size" value={formatBytes(file.size)} />
      <Item label="Owner" value={file.ownerName} />
      <Item label="Created" value={formatDateTime(file.createdAt)} />
      <Item label="Modified" value={formatDateTime(file.updatedAt)} />
      <Item label="Last modified by" value={file.lastModifiedBy} />
      <Item label="Location" value={location} />
      <Item label="Access" value={file.accessLevel.replace('_', ' ')} />
      <Item label="Version" value={`v${file.version}`} />
      <Item label="Shared with" value={`${file.sharedWithCount} people`} />
      <Item label="Tags" value={file.tags.length ? file.tags.join(', ') : 'None'} />
      <Item label="Description" value={file.description || 'No description'} />
      {permissions.length > 0 && (
        <div className="sm:col-span-2">
          <dt className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">People</dt>
          <dd className="mt-1 flex flex-wrap gap-1">
            {permissions.map((p) => (
              <span key={p.id} className="rounded-md bg-muted px-2 py-0.5 text-[11px]">
                {p.userName} · {p.role}
              </span>
            ))}
          </dd>
        </div>
      )}
    </dl>
  );
}

function Item({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{label}</dt>
      <dd className="mt-0.5 text-foreground">{value}</dd>
    </div>
  );
}
