import { CodinFile, CodinFolder } from '@/lib/files/types';
import { FileCard } from './file-card';
import { FolderCard } from './folder-card';

export function FilesGrid({
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
    <div className="space-y-5">
      {folders.length > 0 && (
        <section>
          <h3 className="mb-2 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Folders</h3>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {folders.map((folder) => (
              <FolderCard
                key={folder.id}
                folder={folder}
                selected={selectedIds.includes(folder.id)}
                onOpen={() => onOpenFolder(folder.id)}
                onSelect={(additive) => onToggleSelect(folder.id, additive)}
                onMenu={(event) => onMenu(event, folder.id, 'folder')}
              />
            ))}
          </div>
        </section>
      )}
      {files.length > 0 && (
        <section>
          <h3 className="mb-2 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Files</h3>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {files.map((file) => (
              <FileCard
                key={file.id}
                file={file}
                selected={selectedIds.includes(file.id)}
                onOpen={() => onOpenFile(file.id)}
                onSelect={(additive) => onToggleSelect(file.id, additive)}
                onMenu={(event) => onMenu(event, file.id, 'file')}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
