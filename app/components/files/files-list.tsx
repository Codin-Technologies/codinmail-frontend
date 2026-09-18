import { CodinFile, CodinFolder } from '@/lib/files/types';
import { FileRow } from './file-row';
import { FolderRow } from './folder-row';

export function FilesList({
  folders,
  files,
  selectedIds,
  onOpenFolder,
  onOpenFile,
  onToggleSelect,
  onMenu,
}: {
  folders: CodinFolder[];
  files: CodinFile[];
  selectedIds: string[];
  onOpenFolder: (id: string) => void;
  onOpenFile: (id: string) => void;
  onToggleSelect: (id: string, additive: boolean) => void;
  onMenu: (event: React.MouseEvent, id: string, kind: 'file' | 'folder') => void;
}) {
  if (folders.length === 0 && files.length === 0) return null;
  return (
    <div className="overflow-x-auto rounded-lg border border-border bg-card">
      <table className="w-full min-w-[640px]">
        <thead>
          <tr className="border-b border-border bg-background text-left text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
            <th className="w-10 px-3 py-2" />
            <th className="px-2 py-2">Name</th>
            <th className="hidden px-3 py-2 md:table-cell">Modified</th>
            <th className="hidden px-3 py-2 lg:table-cell">Owner</th>
            <th className="hidden px-3 py-2 sm:table-cell">Size</th>
            <th className="w-10 px-2 py-2" />
          </tr>
        </thead>
        <tbody>
          {folders.map((folder) => (
            <FolderRow
              key={folder.id}
              folder={folder}
              selected={selectedIds.includes(folder.id)}
              onOpen={() => onOpenFolder(folder.id)}
              onSelect={(additive) => onToggleSelect(folder.id, additive)}
              onMenu={(event) => onMenu(event, folder.id, 'folder')}
            />
          ))}
          {files.map((file) => (
            <FileRow
              key={file.id}
              file={file}
              selected={selectedIds.includes(file.id)}
              onOpen={() => onOpenFile(file.id)}
              onSelect={(additive) => onToggleSelect(file.id, additive)}
              onMenu={(event) => onMenu(event, file.id, 'file')}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
}
