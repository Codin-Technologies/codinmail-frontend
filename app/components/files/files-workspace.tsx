'use client';

import { formatBytes, formatRelativeDay } from '@/lib/files/format';
import {
  FILE_KIND_FILTERS,
  childrenOf,
  copyFile,
  createFolder,
  deletePermanent,
  folderPath,
  moveItems,
  renameItem,
  restoreItems,
  restoreVersion,
  searchFiles,
  setLinkAccess,
  shareFile,
  starItem,
  storageBreakdown,
  touchFile,
  trashItems,
  uploadFiles,
} from '@/lib/files/service';
import { loadDetailsOpen, loadFilesStore, loadViewMode, saveDetailsOpen, saveViewMode } from '@/lib/files/storage';
import {
  CodinFile,
  CURRENT_FILES_USER,
  FileKind,
  FilesSection,
  FilesStore,
  FilesViewMode,
  SearchFilters,
  UploadItem,
} from '@/lib/files/types';
import {
  Clock,
  FileText,
  Folder,
  LayoutGrid,
  List,
  PanelRightOpen,
  Search,
  Share2,
  Star,
  Trash2,
  Users,
  Building2,
  HardDrive,
  AlertTriangle,
} from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { toast } from 'sonner';
import { FilesBreadcrumbs } from './breadcrumbs';
import { BulkActionBar } from './bulk-action-bar';
import { FileContextMenu, MenuKind } from './file-context-menu';
import { FileDetailsPanel } from './file-details-panel';
import { FilePreview } from './file-preview';
import { FilesGrid } from './files-grid';
import { FilesList } from './files-list';
import { FileTypeIcon } from './file-type-icon';
import { MoveDialog } from './modals/move-dialog';
import { NewFileMenu } from './modals/new-file-menu';
import { NewFolderDialog } from './modals/new-folder-dialog';
import { ShareDialog } from './modals/share-dialog';
import { UploadDialog } from './modals/upload-dialog';
import { StorageIndicator } from './storage-indicator';

const DEFAULT_FILTERS: SearchFilters = { type: 'all', owner: 'all', location: 'all', shared: 'all', date: 'all' };

export function FilesWorkspace({ initialSection }: { initialSection?: FilesSection } = {}) {
  const [store, setStore] = useState<FilesStore | null>(null);
  const [loadError, setLoadError] = useState(false);
  const [section, setSection] = useState<FilesSection>(initialSection ?? 'home');
  const [folderId, setFolderId] = useState<string | null>(null);
  const [workspaceId, setWorkspaceId] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [filters, setFilters] = useState<SearchFilters>(DEFAULT_FILTERS);
  const [view, setView] = useState<FilesViewMode>('grid');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [detailsOpen, setDetailsOpen] = useState(true);
  const [previewId, setPreviewId] = useState<string | null>(null);
  const [shareId, setShareId] = useState<string | null>(null);
  const [menu, setMenu] = useState<{ x: number; y: number; id: string; kind: MenuKind } | null>(null);
  const [newMenu, setNewMenu] = useState(false);
  const [newFolder, setNewFolder] = useState(false);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [uploads, setUploads] = useState<UploadItem[]>([]);
  const [moveOpen, setMoveOpen] = useState(false);
  const [dropOver, setDropOver] = useState(false);
  const [renameId, setRenameId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const folderInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    try {
      setStore(loadFilesStore());
      setView(loadViewMode());
      setDetailsOpen(loadDetailsOpen());
    } catch {
      setLoadError(true);
    }
  }, []);

  const commit = (next: FilesStore) => {
    setStore({ ...next, files: [...next.files], folders: [...next.folders] });
  };

  const activeFile = store?.files.find((f) => selectedIds[0] && f.id === selectedIds[0]) ?? store?.files.find((f) => f.id === previewId);
  const previewFile = store?.files.find((f) => f.id === previewId) ?? null;
  const shareFileItem = store?.files.find((f) => f.id === shareId) ?? null;

  const goFolder = (id: string | null) => {
    setSection('my_files');
    setFolderId(id);
    setSelectedIds([]);
    setWorkspaceId(null);
  };

  const goSection = (next: FilesSection) => {
    setSection(next);
    setFolderId(null);
    setSelectedIds([]);
    if (next !== 'workspace') setWorkspaceId(null);
  };

  const listing = useMemo(() => {
    if (!store) return { folders: [], files: [] as CodinFile[], title: 'Files', empty: { title: '', body: '', action: 'Upload files' } };
    if (section === 'search' || query.trim()) {
      return {
        folders: store.folders.filter((f) => !f.deletedAt && f.name.toLowerCase().includes(query.toLowerCase())),
        files: searchFiles(store, query, filters),
        title: query.trim() ? `Results for “${query}”` : 'Search',
        empty: { title: 'No matching files', body: 'Try a different name, type, or owner.', action: 'Clear search' },
      };
    }
    if (section === 'recent') {
      return {
        folders: [],
        files: [...store.files.filter((f) => !f.deletedAt)].sort((a, b) => b.lastAccessedAt.localeCompare(a.lastAccessedAt)),
        title: 'Recent',
        empty: { title: 'No recent files', body: 'Files you open will appear here, sorted by last opened.', action: 'Go to My Files' },
      };
    }
    if (section === 'starred') {
      return {
        folders: store.folders.filter((f) => !f.deletedAt && f.isStarred),
        files: store.files.filter((f) => !f.deletedAt && f.isStarred),
        title: 'Starred',
        empty: { title: 'No starred files', body: 'Star important files for quick access.', action: 'Browse files' },
      };
    }
    if (section === 'shared_with_me') {
      return {
        folders: [],
        files: store.files.filter((f) => !f.deletedAt && f.ownerId !== CURRENT_FILES_USER.id),
        title: 'Shared with me',
        empty: { title: 'Nothing shared with you yet.', body: 'Files shared by your colleagues will appear here.', action: 'Go home' },
      };
    }
    if (section === 'shared_by_me') {
      return {
        folders: [],
        files: store.files.filter((f) => !f.deletedAt && f.ownerId === CURRENT_FILES_USER.id && f.sharedWithCount > 0),
        title: 'Shared by me',
        empty: { title: 'You have not shared files yet', body: 'Shared files will list people and access level.', action: 'Go home' },
      };
    }
    if (section === 'trash') {
      return {
        folders: store.folders.filter((f) => f.deletedAt),
        files: store.files.filter((f) => f.deletedAt),
        title: 'Trash',
        empty: { title: 'Trash is empty', body: 'Deleted files stay here until you restore or delete them permanently.', action: 'Go home' },
      };
    }
    if (section === 'workspace' && workspaceId) {
      return {
        folders: store.folders.filter((f) => !f.deletedAt && f.workspaceId === workspaceId && f.parentId === null),
        files: store.files.filter((f) => !f.deletedAt && f.workspaceId === workspaceId),
        title: store.workspaces.find((w) => w.id === workspaceId)?.name ?? 'Workspace',
        empty: { title: 'No files in this workspace', body: 'Add files or folders to this team or project.', action: 'Upload files' },
      };
    }
    const kids = childrenOf(store, folderId);
    const rootFolders =
      folderId === null
        ? store.folders.filter((f) => !f.deletedAt && f.parentId === null && f.workspaceId === 'ws-personal')
        : kids.folders;
    const rootFiles =
      folderId === null
        ? store.files.filter((f) => !f.deletedAt && f.folderId === null && f.ownerId === CURRENT_FILES_USER.id)
        : kids.files;
    return {
      folders: rootFolders,
      files: rootFiles,
      title: folderId ? store.folders.find((f) => f.id === folderId)?.name ?? 'Folder' : 'My Files',
      empty: { title: 'No files yet', body: 'Upload your first document to start organizing your work.', action: 'Upload files' },
    };
  }, [store, section, folderId, query, filters, workspaceId]);

  const path = store ? folderPath(store, folderId) : [];
  const storage = store ? storageBreakdown(store) : null;

  const toggleSelect = (id: string, additive: boolean) => {
    setSelectedIds((prev) => {
      if (additive) return prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id];
      return [id];
    });
  };

  const openFile = (id: string) => {
    if (!store) return;
    commit(touchFile(store, id));
    setPreviewId(id);
    setSelectedIds([id]);
  };

  const startUpload = (fileList: FileList | File[]) => {
    if (!store) return;
    const arr = Array.from(fileList);
    const unsupported = arr.filter((f) => f.size > 500 * 1024 * 1024);
    const items: UploadItem[] = arr.map((f, i) => ({
      id: `up-${Date.now()}-${i}`,
      name: f.name,
      size: f.size,
      progress: 0,
      status: f.size > 500 * 1024 * 1024 ? 'failed' : 'uploading',
      error: f.size > 500 * 1024 * 1024 ? 'File is too large' : undefined,
    }));
    setUploads(items);
    setUploadOpen(true);
    const ok = arr.filter((f) => f.size <= 500 * 1024 * 1024);
    if (ok.length === 0) return;
    let progress = 0;
    const timer = window.setInterval(() => {
      progress += 28;
      setUploads((prev) =>
        prev.map((item) =>
          item.status === 'failed'
            ? item
            : { ...item, progress: Math.min(100, progress), status: progress >= 100 ? 'complete' : 'uploading' }
        )
      );
      if (progress >= 100) {
        window.clearInterval(timer);
        const result = uploadFiles(store, ok.map((f) => ({ name: f.name, size: f.size })), folderId);
        commit(result.store);
        toast.success(`${ok.length} file${ok.length === 1 ? '' : 's'} uploaded successfully`);
        if (unsupported.length) toast.error('Some files were skipped as unsupported or too large.');
      }
    }, 220);
  };

  const handleMenuAction = (action: string, id: string, kind: MenuKind) => {
    if (!store) return;
    if (action === 'open' || action === 'preview') {
      if (kind === 'folder') goFolder(id);
      else openFile(id);
    }
    if (action === 'download') toast.success('Download started');
    if (action === 'share') setShareId(id);
    if (action === 'copy-link') {
      navigator.clipboard?.writeText(`https://files.codin.io/d/${id}`);
      toast.success('Link copied');
    }
    if (action === 'star') {
      commit(starItem(store, id));
    }
    if (action === 'copy') commit(copyFile(store, id));
    if (action === 'move') {
      setSelectedIds([id]);
      setMoveOpen(true);
    }
    if (action === 'rename') {
      const item = store.files.find((f) => f.id === id) ?? store.folders.find((f) => f.id === id);
      setRenameId(id);
      setRenameValue(item?.name ?? '');
    }
    if (action === 'delete') {
      commit(trashItems(store, [id]));
      toast.message('Moved to trash');
    }
    if (action === 'details' || action === 'activity' || action === 'versions') {
      setSelectedIds([id]);
      setDetailsOpen(true);
      if (action !== 'details') openFile(id);
    }
    if (action === 'workspace') toast.message('Add to workspace is mocked for this MVP.');
  };

  if (loadError) {
    return (
      <div className="grid h-full place-items-center p-8 text-center">
        <div>
          <p className="text-sm font-semibold">Unable to load folder</p>
          <button className="mt-3 h-9 rounded-md bg-primary px-3 text-xs font-semibold text-primary-foreground" onClick={() => { setLoadError(false); setStore(loadFilesStore()); }}>
            Try again
          </button>
        </div>
      </div>
    );
  }

  if (!store) {
    return (
      <div className="h-full space-y-3 bg-background p-5">
        <div className="h-10 w-48 animate-pulse rounded-md bg-muted" />
        <div className="h-10 animate-pulse rounded-md bg-muted" />
        <div className="grid grid-cols-4 gap-3">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-36 animate-pulse rounded-lg bg-muted" />
          ))}
        </div>
      </div>
    );
  }

  const navItems = [
    { id: 'home' as const, label: 'Home', icon: FileText },
    { id: 'my_files' as const, label: 'My Files', icon: Folder },
    { id: 'shared_with_me' as const, label: 'Shared with Me', icon: Users },
    { id: 'shared_by_me' as const, label: 'Shared by Me', icon: Share2 },
    { id: 'recent' as const, label: 'Recent', icon: Clock },
    { id: 'starred' as const, label: 'Starred', icon: Star },
    { id: 'trash' as const, label: 'Trash', icon: Trash2 },
  ];

  const duplicates = store.files.filter((f) => ['file-proposal', 'file-dup'].includes(f.id) && !f.deletedAt);
  const showDup = section === 'home' || folderId === 'fld-abc';

  return (
    <div
      className="flex h-full min-w-0 flex-1 overflow-hidden bg-background text-foreground"
      onDragOver={(e) => {
        e.preventDefault();
        setDropOver(true);
      }}
      onDragLeave={() => setDropOver(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDropOver(false);
        if (e.dataTransfer.files.length) startUpload(e.dataTransfer.files);
      }}
    >
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <header className="shrink-0 border-b border-border bg-card px-5 py-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="eyebrow">Workspace</p>
              <h1 className="text-xl font-semibold tracking-tight">Files</h1>
              <p className="mt-0.5 text-xs text-muted-foreground">Where the organization&apos;s work lives — with Mail, Meet, Tasks, and Contacts attached.</p>
            </div>
            <div className="relative">
              <button
                onClick={() => setNewMenu((v) => !v)}
                className="inline-flex h-9 items-center rounded-lg bg-primary px-3.5 text-xs font-semibold text-primary-foreground hover:opacity-90"
              >
                + New
              </button>
              {newMenu && (
                <NewFileMenu
                  onClose={() => setNewMenu(false)}
                  onUploadFiles={() => {
                    setNewMenu(false);
                    setUploadOpen(true);
                  }}
                  onUploadFolder={() => {
                    setNewMenu(false);
                    folderInputRef.current?.click();
                  }}
                  onNewFolder={() => {
                    setNewMenu(false);
                    setNewFolder(true);
                  }}
                  onTemplate={(kind) => {
                    setNewMenu(false);
                    toast.message(`Native ${kind} editing is not implemented. A placeholder file was not created.`);
                  }}
                />
              )}
            </div>
          </div>
          <div className="relative mt-4">
            <Search size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                if (e.target.value.trim()) setSection('search');
              }}
              onFocus={() => {
                if (query.trim()) setSection('search');
              }}
              placeholder="Search files, folders and content"
              aria-label="Search files, folders and content"
              className="h-10 w-full rounded-lg border border-border bg-background pl-9 pr-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
          </div>
        </header>

        {dropOver && (
          <div className="pointer-events-none mx-5 mt-3 rounded-lg border border-dashed border-primary bg-primary/5 px-3 py-2 text-center text-xs font-semibold text-primary">
            Drop to upload into this location
          </div>
        )}

        <div className="min-h-0 flex-1 overflow-y-auto">
          <div className="flex flex-col gap-4 p-5">
            <div className="flex flex-wrap gap-1.5 rounded-lg border border-border bg-card p-1.5">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => goSection(item.id)}
                  className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-semibold ${
                    section === item.id ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                  }`}
                >
                  <item.icon size={13} />
                  {item.label}
                </button>
              ))}
              <button
                onClick={() => goSection('workspace')}
                className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-semibold ${
                  section === 'workspace' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                }`}
              >
                <Building2 size={13} />
                Workspaces
              </button>
              <button
                onClick={() => goSection('storage')}
                className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-semibold ${
                  section === 'storage' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                }`}
              >
                <HardDrive size={13} />
                Storage
              </button>
            </div>

            {section === 'home' && (
              <HomeDashboard
                store={store}
                storage={storage!}
                onQuick={goSection}
                onOpenFile={openFile}
                onOpenFolder={goFolder}
                onManageStorage={() => goSection('storage')}
              />
            )}

            {section === 'workspace' && !workspaceId && (
              <WorkspacePicker
                store={store}
                onSelect={(id) => {
                  setWorkspaceId(id);
                  setSection('workspace');
                }}
              />
            )}

            {section === 'storage' && storage && (
              <StorageIndicator used={storage.used} total={storage.total} groups={storage.groups} onManage={() => toast.message('Storage enforcement is informational in this MVP.')} />
            )}

            {section === 'search' && (
              <div className="flex flex-wrap gap-2 rounded-lg border border-border bg-card p-2">
                <FilterSelect
                  label="Type"
                  value={filters.type}
                  onChange={(v) => setFilters((f) => ({ ...f, type: v as FileKind | 'all' }))}
                  options={FILE_KIND_FILTERS.map((k) => ({ id: k.id, label: k.label }))}
                />
                <FilterSelect
                  label="Owner"
                  value={filters.owner}
                  onChange={(v) => setFilters((f) => ({ ...f, owner: v }))}
                  options={[
                    { id: 'all', label: 'Anyone' },
                    { id: CURRENT_FILES_USER.id, label: 'Me' },
                    { id: 'Maya Chen', label: 'Maya Chen' },
                  ]}
                />
                <FilterSelect
                  label="Date modified"
                  value={filters.date}
                  onChange={(v) => setFilters((f) => ({ ...f, date: v as SearchFilters['date'] }))}
                  options={[
                    { id: 'all', label: 'Any time' },
                    { id: 'today', label: 'Today' },
                    { id: 'week', label: 'This week' },
                    { id: 'month', label: 'This month' },
                  ]}
                />
                <FilterSelect
                  label="Shared with"
                  value={filters.shared}
                  onChange={(v) => setFilters((f) => ({ ...f, shared: v as SearchFilters['shared'] }))}
                  options={[
                    { id: 'all', label: 'Any' },
                    { id: 'shared', label: 'Shared' },
                    { id: 'private', label: 'Private' },
                  ]}
                />
              </div>
            )}

            {section !== 'home' && section !== 'storage' && !(section === 'workspace' && !workspaceId) && (
              <>
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <h2 className="text-sm font-semibold">{listing.title}</h2>
                    {(section === 'my_files' || folderId) && (
                      <FilesBreadcrumbs rootLabel="My Files" path={path} onRoot={() => goFolder(null)} onSelect={goFolder} />
                    )}
                  </div>
                  <div className="flex items-center gap-1 rounded-lg border border-border bg-card p-0.5">
                    <button
                      className={`grid h-8 w-8 place-items-center rounded-md ${view === 'grid' ? 'bg-muted' : ''}`}
                      aria-label="Grid view"
                      onClick={() => {
                        setView('grid');
                        saveViewMode('grid');
                      }}
                    >
                      <LayoutGrid size={14} />
                    </button>
                    <button
                      className={`grid h-8 w-8 place-items-center rounded-md ${view === 'list' ? 'bg-muted' : ''}`}
                      aria-label="List view"
                      onClick={() => {
                        setView('list');
                        saveViewMode('list');
                      }}
                    >
                      <List size={14} />
                    </button>
                    <button
                      className="grid h-8 w-8 place-items-center rounded-md"
                      aria-label="Toggle details"
                      onClick={() => {
                        const next = !detailsOpen;
                        setDetailsOpen(next);
                        saveDetailsOpen(next);
                      }}
                    >
                      <PanelRightOpen size={14} />
                    </button>
                  </div>
                </div>

                {showDup && duplicates.length >= 2 && (
                  <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-border bg-card px-3 py-2 text-xs">
                    <span className="inline-flex items-center gap-2 font-semibold">
                      <AlertTriangle size={14} />
                      Potential duplicate · Project Proposal.pdf and Proposal (1).pdf
                    </span>
                    <span className="flex gap-1">
                      <button className="h-8 rounded-md border border-border px-2 font-semibold" onClick={() => openFile('file-proposal')}>
                        Compare
                      </button>
                      <button className="h-8 rounded-md border border-border px-2 font-semibold" onClick={() => toast.message('Kept both files. Nothing was deleted.')}>
                        Keep both
                      </button>
                    </span>
                  </div>
                )}

                <BulkActionBar
                  count={selectedIds.length}
                  onDownload={() => toast.success('Downloading selected files')}
                  onMove={() => setMoveOpen(true)}
                  onCopy={() => {
                    selectedIds.forEach((id) => commit(copyFile(store, id)));
                    toast.success('Copied');
                  }}
                  onShare={() => selectedIds[0] && setShareId(selectedIds[0])}
                  onStar={() => selectedIds.forEach((id) => commit(starItem(store, id)))}
                  onDelete={() => {
                    if (section === 'trash') {
                      if (confirm('Delete permanently? This cannot be undone.')) {
                        commit(deletePermanent(store, selectedIds));
                        setSelectedIds([]);
                      }
                    } else {
                      commit(trashItems(store, selectedIds));
                      setSelectedIds([]);
                      toast.message('Moved to trash');
                    }
                  }}
                  onClear={() => setSelectedIds([])}
                />

                {section === 'trash' && listing.files.length + listing.folders.length > 0 && (
                  <div className="flex gap-2">
                    <button
                      className="h-8 rounded-md border border-border px-3 text-xs font-semibold"
                      onClick={() => {
                        commit(restoreItems(store, selectedIds.length ? selectedIds : listing.files.map((f) => f.id)));
                        toast.success('Restored');
                      }}
                    >
                      Restore
                    </button>
                    <button
                      className="h-8 rounded-md border border-border px-3 text-xs font-semibold"
                      onClick={() => {
                        if (confirm('Delete permanently? This cannot be undone.')) {
                          commit(deletePermanent(store, selectedIds.length ? selectedIds : listing.files.map((f) => f.id)));
                        }
                      }}
                    >
                      Delete permanently
                    </button>
                  </div>
                )}

                {listing.folders.length === 0 && listing.files.length === 0 ? (
                  <EmptyState
                    title={listing.empty.title}
                    body={listing.empty.body}
                    action={listing.empty.action}
                    onAction={() => {
                      if (listing.empty.action === 'Upload files') setUploadOpen(true);
                      else goSection('home');
                    }}
                  />
                ) : view === 'grid' ? (
                  <FilesGrid
                    folders={listing.folders}
                    files={listing.files}
                    selectedIds={selectedIds}
                    onOpenFolder={goFolder}
                    onOpenFile={openFile}
                    onToggleSelect={toggleSelect}
                    onMenu={(event, id, kind) => {
                      event.preventDefault();
                      setMenu({ x: event.clientX, y: event.clientY, id, kind });
                    }}
                  />
                ) : (
                  <FilesList
                    folders={listing.folders}
                    files={listing.files}
                    selectedIds={selectedIds}
                    onOpenFolder={goFolder}
                    onOpenFile={openFile}
                    onToggleSelect={toggleSelect}
                    onMenu={(event, id, kind) => {
                      event.preventDefault();
                      setMenu({ x: event.clientX, y: event.clientY, id, kind });
                    }}
                  />
                )}

                {section === 'shared_by_me' && listing.files.length > 0 && (
                  <ul className="space-y-2">
                    {listing.files.map((file) => (
                      <li key={file.id} className="flex items-center justify-between rounded-lg border border-border bg-card px-3 py-2 text-xs">
                        <button className="flex items-center gap-2 text-left font-semibold" onClick={() => openFile(file.id)}>
                          <FileTypeIcon kind={file.kind} size="sm" />
                          {file.name}
                        </button>
                        <span className="text-muted-foreground">
                          {file.sharedWithCount} people · {store.permissions.find((p) => p.fileId === file.id)?.role ?? 'viewer'} access
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {detailsOpen && activeFile && section !== 'home' && (
        <div className="hidden h-full md:flex">
          <FileDetailsPanel
            file={activeFile}
            store={store}
            onClose={() => {
              setDetailsOpen(false);
              saveDetailsOpen(false);
            }}
            onShare={() => setShareId(activeFile.id)}
            onOpenAi={() => setPreviewId(activeFile.id)}
          />
        </div>
      )}

      {menu && (
        <FileContextMenu
          x={menu.x}
          y={menu.y}
          kind={menu.kind}
          onClose={() => setMenu(null)}
          onAction={(action) => handleMenuAction(action, menu.id, menu.kind)}
        />
      )}
      {previewFile && (
        <FilePreview
          file={previewFile}
          store={store}
          onClose={() => setPreviewId(null)}
          onDownload={() => toast.success(`Downloading ${previewFile.name}`)}
          onShare={() => setShareId(previewFile.id)}
          onRestoreVersion={(version) => {
            commit(restoreVersion(store, previewFile.id, version));
            toast.success(`Restored version ${version}`);
          }}
        />
      )}
      {shareFileItem && (
        <ShareDialog
          file={shareFileItem}
          onClose={() => setShareId(null)}
          onShare={(people, message) => {
            commit(shareFile(store, shareFileItem.id, people, message));
            toast.success('Access granted');
            setShareId(null);
          }}
          onEnablePublic={() => {
            commit(setLinkAccess(store, shareFileItem.id, true));
            toast.message('Public link enabled');
          }}
        />
      )}
      {newFolder && (
        <NewFolderDialog
          onClose={() => setNewFolder(false)}
          onCreate={(name) => {
            commit(createFolder(store, name, folderId, workspaceId ?? 'ws-personal'));
            setNewFolder(false);
            setSection(workspaceId ? 'workspace' : 'my_files');
            toast.success('Folder created');
          }}
        />
      )}
      {uploadOpen && (
        <UploadDialog
          items={uploads}
          dragging={dropOver}
          onClose={() => setUploadOpen(false)}
          onBrowse={() => fileInputRef.current?.click()}
          onFiles={startUpload}
          onCancelAll={() => {
            setUploads((prev) => prev.map((i) => ({ ...i, status: 'cancelled', progress: 0 })));
            toast.message('Uploads cancelled');
          }}
          onRetry={(id) => {
            setUploads((prev) => prev.map((i) => (i.id === id ? { ...i, status: 'uploading', progress: 10, error: undefined } : i)));
            toast.message('Retrying upload');
          }}
        />
      )}
      {moveOpen && (
        <MoveDialog
          folders={store.folders}
          onClose={() => setMoveOpen(false)}
          onMove={(target) => {
            commit(moveItems(store, selectedIds, target));
            setMoveOpen(false);
            toast.success('Moved');
          }}
        />
      )}
      {renameId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <form
            className="w-full max-w-sm rounded-lg border border-border bg-card p-4"
            onSubmit={(e) => {
              e.preventDefault();
              commit(renameItem(store, renameId, renameValue));
              setRenameId(null);
            }}
          >
            <p className="mb-2 text-sm font-semibold">Rename</p>
            <input
              autoFocus
              value={renameValue}
              onChange={(e) => setRenameValue(e.target.value)}
              className="h-9 w-full rounded-md border border-border px-3 text-sm"
            />
            <div className="mt-3 flex justify-end gap-2">
              <button type="button" className="h-9 rounded-md border border-border px-3 text-xs font-semibold" onClick={() => setRenameId(null)}>
                Cancel
              </button>
              <button type="submit" className="h-9 rounded-md bg-primary px-3 text-xs font-semibold text-primary-foreground">
                Save
              </button>
            </div>
          </form>
        </div>
      )}
      <input ref={fileInputRef} type="file" multiple className="hidden" onChange={(e) => e.target.files && startUpload(e.target.files)} />
      <input
        ref={folderInputRef}
        type="file"
        className="hidden"
        // @ts-expect-error webkitdirectory is valid in Chromium
        webkitdirectory=""
        onChange={(e) => e.target.files && startUpload(e.target.files)}
      />
    </div>
  );
}

function FilterSelect({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: { id: string; label: string }[];
}) {
  return (
    <label className="flex items-center gap-1.5 text-[11px] font-semibold text-muted-foreground">
      {label}
      <select value={value} onChange={(e) => onChange(e.target.value)} className="h-8 rounded-md border border-border bg-background px-2 text-foreground">
        {options.map((o) => (
          <option key={o.id} value={o.id}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
  );
}

function EmptyState({ title, body, action, onAction }: { title: string; body: string; action: string; onAction: () => void }) {
  return (
    <div className="flex flex-col items-center gap-2 rounded-lg border border-dashed border-border bg-card px-6 py-16 text-center">
      <Folder size={22} className="text-muted-foreground" />
      <p className="text-sm font-semibold">{title}</p>
      <p className="max-w-sm text-xs text-muted-foreground">{body}</p>
      <button onClick={onAction} className="mt-2 h-9 rounded-md bg-primary px-3 text-xs font-semibold text-primary-foreground">
        {action}
      </button>
    </div>
  );
}

function HomeDashboard({
  store,
  storage,
  onQuick,
  onOpenFile,
  onOpenFolder,
  onManageStorage,
}: {
  store: FilesStore;
  storage: ReturnType<typeof storageBreakdown>;
  onQuick: (section: FilesSection) => void;
  onOpenFile: (id: string) => void;
  onOpenFolder: (id: string) => void;
  onManageStorage: () => void;
}) {
  const recent = [...store.files.filter((f) => !f.deletedAt)].sort((a, b) => b.lastAccessedAt.localeCompare(a.lastAccessedAt)).slice(0, 6);
  const myFolders = store.folders.filter((f) => !f.deletedAt && f.parentId === null && f.workspaceId === 'ws-personal');
  return (
    <>
      <section>
        <h2 className="mb-2 text-sm font-semibold">Quick access</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { id: 'recent' as const, label: 'Recent', icon: Clock },
            { id: 'shared_with_me' as const, label: 'Shared with Me', icon: Users },
            { id: 'starred' as const, label: 'Starred', icon: Star },
            { id: 'trash' as const, label: 'Trash', icon: Trash2 },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => onQuick(item.id)}
              className="flex items-center gap-3 rounded-lg border border-border bg-card p-4 text-left hover:bg-muted/40"
            >
              <span className="grid h-9 w-9 place-items-center rounded-lg bg-muted">
                <item.icon size={16} />
              </span>
              <span className="text-sm font-semibold">{item.label}</span>
            </button>
          ))}
        </div>
      </section>
      <section>
        <h2 className="mb-2 text-sm font-semibold">My Files</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {myFolders.map((folder) => (
            <button
              key={folder.id}
              onClick={() => onOpenFolder(folder.id)}
              className="flex items-center gap-3 rounded-lg border border-border bg-card p-4 text-left hover:bg-muted/40"
            >
              <span className="grid h-9 w-9 place-items-center rounded-lg bg-muted">
                <Folder size={16} />
              </span>
              <span>
                <span className="block text-sm font-semibold">{folder.name}</span>
                <span className="text-[11px] text-muted-foreground">{formatRelativeDay(folder.updatedAt)}</span>
              </span>
            </button>
          ))}
        </div>
      </section>
      <section>
        <div className="mb-2 flex items-center justify-between">
          <h2 className="text-sm font-semibold">Recent files</h2>
          <button className="text-xs font-semibold text-primary hover:underline" onClick={() => onQuick('recent')}>
            View all
          </button>
        </div>
        <div className="divide-y divide-border rounded-lg border border-border bg-card">
          {recent.map((file) => (
            <button key={file.id} onClick={() => onOpenFile(file.id)} className="flex w-full items-center gap-3 px-3 py-2.5 text-left hover:bg-muted/40">
              <FileTypeIcon kind={file.kind} size="sm" />
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-semibold">{file.name}</span>
                <span className="text-[11px] text-muted-foreground">
                  Opened {formatRelativeDay(file.lastAccessedAt)} · {formatBytes(file.size)}
                </span>
              </span>
            </button>
          ))}
        </div>
      </section>
      <StorageIndicator used={storage.used} total={storage.total} groups={storage.groups} compact onManage={onManageStorage} />
    </>
  );
}

function WorkspacePicker({ store, onSelect }: { store: FilesStore; onSelect: (id: string) => void }) {
  const teams = store.workspaces.filter((w) => w.kind === 'team');
  const projects = store.workspaces.filter((w) => w.kind === 'project');
  const top = store.workspaces.filter((w) => w.kind === 'personal' || w.kind === 'organization');
  return (
    <div className="space-y-5">
      <section>
        <h2 className="mb-2 text-sm font-semibold">Workspaces</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {top.map((ws) => (
            <button key={ws.id} onClick={() => onSelect(ws.id)} className="rounded-lg border border-border bg-card p-4 text-left hover:bg-muted/40">
              <p className="text-sm font-semibold">{ws.name}</p>
              <p className="mt-0.5 text-xs text-muted-foreground">{ws.description}</p>
              <p className="mt-2 text-[11px] text-muted-foreground">{ws.memberCount} members</p>
            </button>
          ))}
        </div>
      </section>
      <section>
        <h2 className="mb-2 text-sm font-semibold">Teams</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {teams.map((ws) => (
            <button key={ws.id} onClick={() => onSelect(ws.id)} className="rounded-lg border border-border bg-card p-4 text-left hover:bg-muted/40">
              <p className="text-sm font-semibold">{ws.name}</p>
              <p className="text-[11px] text-muted-foreground">{ws.memberCount} members</p>
            </button>
          ))}
        </div>
      </section>
      <section>
        <h2 className="mb-2 text-sm font-semibold">Projects</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((ws) => (
            <button key={ws.id} onClick={() => onSelect(ws.id)} className="rounded-lg border border-border bg-card p-4 text-left hover:bg-muted/40">
              <p className="text-sm font-semibold">{ws.name}</p>
              <p className="mt-0.5 text-xs text-muted-foreground">{ws.description}</p>
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}
