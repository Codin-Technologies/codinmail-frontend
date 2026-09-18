import { formatBytes, kindFromName, mimeFromKind, uniqueFileName } from './format';
import { loadFilesStore, saveFilesStore } from './storage';
import {
  CodinFile,
  CodinFolder,
  CURRENT_FILES_USER,
  FileActivity,
  FileKind,
  FilesStore,
  PermissionRole,
  SearchFilters,
} from './types';

function persist(store: FilesStore) {
  saveFilesStore(store);
  return store;
}

function stamp() {
  return new Date().toISOString();
}

export function getStore() {
  return loadFilesStore();
}

export function searchFiles(store: FilesStore, query: string, filters: SearchFilters) {
  const q = query.trim().toLowerCase();
  return store.files.filter((file) => {
    if (file.deletedAt) return false;
    if (q) {
      const hay = `${file.name} ${file.description} ${file.tags.join(' ')} ${file.ownerName} ${file.previewText ?? ''}`.toLowerCase();
      if (!hay.includes(q)) return false;
    }
    if (filters.type !== 'all' && file.kind !== filters.type) return false;
    if (filters.owner !== 'all' && file.ownerId !== filters.owner && file.ownerName !== filters.owner) return false;
    if (filters.location !== 'all' && file.folderId !== filters.location) return false;
    if (filters.shared === 'shared' && file.sharedWithCount === 0 && file.accessLevel === 'private') return false;
    if (filters.shared === 'private' && file.accessLevel !== 'private') return false;
    if (filters.date !== 'all') {
      const day = file.updatedAt.slice(0, 10);
      if (filters.date === 'today' && day !== '2026-08-24') return false;
      if (filters.date === 'week' && day < '2026-08-18') return false;
      if (filters.date === 'month' && day < '2026-08-01') return false;
    }
    return true;
  });
}

export function folderPath(store: FilesStore, folderId: string | null): CodinFolder[] {
  const path: CodinFolder[] = [];
  let current = store.folders.find((f) => f.id === folderId);
  while (current) {
    path.unshift(current);
    current = store.folders.find((f) => f.id === current?.parentId);
  }
  return path;
}

export function childrenOf(store: FilesStore, folderId: string | null, workspaceId?: string) {
  const folders = store.folders.filter(
    (f) => !f.deletedAt && f.parentId === folderId && (!workspaceId || f.workspaceId === workspaceId || folderId !== null)
  );
  const files = store.files.filter((f) => !f.deletedAt && f.folderId === folderId);
  return { folders, files };
}

export function createFolder(store: FilesStore, name: string, parentId: string | null, workspaceId = 'ws-personal') {
  const folder: CodinFolder = {
    id: `fld-${Date.now()}`,
    name: name.trim(),
    parentId,
    ownerId: CURRENT_FILES_USER.id,
    workspaceId,
    isStarred: false,
    createdAt: stamp(),
    updatedAt: stamp(),
  };
  store.folders = [folder, ...store.folders];
  return persist(store);
}

export function uploadFiles(store: FilesStore, names: { name: string; size: number }[], folderId: string | null) {
  const existing = store.files.filter((f) => !f.deletedAt && f.folderId === folderId).map((f) => f.name);
  const created: CodinFile[] = names.map((item, index) => {
    const name = uniqueFileName(item.name, existing);
    existing.push(name);
    const kind = kindFromName(name);
    return {
      id: `file-up-${Date.now()}-${index}`,
      name,
      originalName: item.name,
      mimeType: mimeFromKind(kind),
      kind,
      size: item.size,
      storageProvider: 'codin',
      storageKey: `codin/upload/${Date.now()}-${index}`,
      folderId,
      workspaceId: 'ws-personal',
      ownerId: CURRENT_FILES_USER.id,
      ownerName: CURRENT_FILES_USER.name,
      description: '',
      tags: [],
      version: 1,
      isStarred: false,
      accessLevel: 'private',
      createdAt: stamp(),
      updatedAt: stamp(),
      lastAccessedAt: stamp(),
      lastModifiedBy: CURRENT_FILES_USER.name,
      sharedWithCount: 0,
      previewText: kind === 'txt' || kind === 'csv' ? `Uploaded file: ${name}` : undefined,
    };
  });
  store.files = [...created, ...store.files];
  created.forEach((file) => {
    store.activity.unshift({
      id: `act-${file.id}`,
      fileId: file.id,
      userId: CURRENT_FILES_USER.id,
      userName: CURRENT_FILES_USER.name,
      action: 'uploaded this file',
      createdAt: stamp(),
    });
  });
  persist(store);
  return { store, created };
}

export function renameItem(store: FilesStore, id: string, name: string) {
  store.files = store.files.map((f) => (f.id === id ? { ...f, name, updatedAt: stamp() } : f));
  store.folders = store.folders.map((f) => (f.id === id ? { ...f, name, updatedAt: stamp() } : f));
  addActivity(store, id, 'renamed this file');
  return persist(store);
}

export function starItem(store: FilesStore, id: string) {
  store.files = store.files.map((f) => (f.id === id ? { ...f, isStarred: !f.isStarred } : f));
  store.folders = store.folders.map((f) => (f.id === id ? { ...f, isStarred: !f.isStarred } : f));
  return persist(store);
}

export function moveItems(store: FilesStore, ids: string[], folderId: string | null) {
  store.files = store.files.map((f) => (ids.includes(f.id) ? { ...f, folderId, updatedAt: stamp() } : f));
  store.folders = store.folders.map((f) => (ids.includes(f.id) ? { ...f, parentId: folderId, updatedAt: stamp() } : f));
  return persist(store);
}

export function copyFile(store: FilesStore, id: string) {
  const source = store.files.find((f) => f.id === id);
  if (!source) return persist(store);
  const siblings = store.files.filter((f) => f.folderId === source.folderId).map((f) => f.name);
  const copy: CodinFile = {
    ...source,
    id: `file-copy-${Date.now()}`,
    name: uniqueFileName(source.name, siblings),
    createdAt: stamp(),
    updatedAt: stamp(),
    lastAccessedAt: stamp(),
  };
  store.files = [copy, ...store.files];
  return persist(store);
}

export function trashItems(store: FilesStore, ids: string[]) {
  const at = stamp();
  store.files = store.files.map((f) => (ids.includes(f.id) ? { ...f, deletedAt: at } : f));
  store.folders = store.folders.map((f) => (ids.includes(f.id) ? { ...f, deletedAt: at } : f));
  return persist(store);
}

export function restoreItems(store: FilesStore, ids: string[]) {
  store.files = store.files.map((f) => (ids.includes(f.id) ? { ...f, deletedAt: undefined } : f));
  store.folders = store.folders.map((f) => (ids.includes(f.id) ? { ...f, deletedAt: undefined } : f));
  return persist(store);
}

export function deletePermanent(store: FilesStore, ids: string[]) {
  store.files = store.files.filter((f) => !ids.includes(f.id));
  store.folders = store.folders.filter((f) => !ids.includes(f.id));
  store.activity = store.activity.filter((a) => !ids.includes(a.fileId));
  store.versions = store.versions.filter((v) => !ids.includes(v.fileId));
  store.permissions = store.permissions.filter((p) => !ids.includes(p.fileId));
  store.relations = store.relations.filter((r) => !ids.includes(r.fileId));
  return persist(store);
}

export function touchFile(store: FilesStore, id: string) {
  store.files = store.files.map((f) => (f.id === id ? { ...f, lastAccessedAt: stamp() } : f));
  return persist(store);
}

export function shareFile(store: FilesStore, fileId: string, people: { name: string; email: string; role: PermissionRole }[], message?: string) {
  people.forEach((person) => {
    store.permissions.unshift({
      id: `perm-${Date.now()}-${person.email}`,
      fileId,
      userId: `user-${person.email}`,
      userName: person.name || person.email,
      userEmail: person.email,
      role: person.role,
      createdAt: stamp(),
    });
  });
  store.files = store.files.map((f) =>
    f.id === fileId
      ? {
          ...f,
          accessLevel: f.accessLevel === 'private' ? 'people' : f.accessLevel,
          sharedWithCount: store.permissions.filter((p) => p.fileId === fileId).length,
        }
      : f
  );
  addActivity(store, fileId, `shared this file${message ? ` with a message` : ''}`);
  return persist(store);
}

export function setLinkAccess(store: FilesStore, fileId: string, publicLink: boolean) {
  store.files = store.files.map((f) =>
    f.id === fileId ? { ...f, accessLevel: publicLink ? 'public_link' : f.sharedWithCount > 0 ? 'people' : 'private' } : f
  );
  return persist(store);
}

export function updateFileMeta(store: FilesStore, fileId: string, patch: Partial<Pick<CodinFile, 'description' | 'tags'>>) {
  store.files = store.files.map((f) => (f.id === fileId ? { ...f, ...patch, updatedAt: stamp() } : f));
  return persist(store);
}

export function restoreVersion(store: FilesStore, fileId: string, version: number) {
  const ver = store.versions.find((v) => v.fileId === fileId && v.version === version);
  if (!ver) return persist(store);
  store.files = store.files.map((f) =>
    f.id === fileId ? { ...f, version: ver.version, size: ver.size, updatedAt: stamp(), lastModifiedBy: CURRENT_FILES_USER.name } : f
  );
  addActivity(store, fileId, `restored version ${version}`);
  return persist(store);
}

export function addActivity(store: FilesStore, fileId: string, action: string): FileActivity {
  const activity: FileActivity = {
    id: `act-${Date.now()}`,
    fileId,
    userId: CURRENT_FILES_USER.id,
    userName: CURRENT_FILES_USER.name,
    action,
    createdAt: stamp(),
  };
  store.activity = [activity, ...store.activity];
  return activity;
}

export function storageBreakdown(store: FilesStore) {
  const active = store.files.filter((f) => !f.deletedAt);
  const groups: Record<string, number> = { Documents: 0, Images: 0, Videos: 0, Other: 0 };
  active.forEach((f) => {
    if (['pdf', 'docx', 'xlsx', 'pptx', 'txt', 'csv'].includes(f.kind)) groups.Documents += f.size;
    else if (['jpg', 'png'].includes(f.kind)) groups.Images += f.size;
    else if (f.kind === 'mp4' || f.kind === 'audio') groups.Videos += f.size;
    else groups.Other += f.size;
  });
  const used = Object.values(groups).reduce((a, b) => a + b, 0);
  return { used, total: 100 * 1024 * 1024 * 1024, groups, label: `${formatBytes(used)} used of 100 GB` };
}

export function saveAttachmentToFiles(store: FilesStore, name: string, folderId: string | null) {
  return uploadFiles(store, [{ name, size: 2_400_000 }], folderId);
}

export type FilesApi = {
  list: () => FilesStore;
  search: typeof searchFiles;
};

export const filesApi: FilesApi = {
  list: getStore,
  search: searchFiles,
};

export const FILE_KIND_FILTERS: { id: FileKind | 'all'; label: string }[] = [
  { id: 'all', label: 'Any type' },
  { id: 'pdf', label: 'PDF' },
  { id: 'docx', label: 'Documents' },
  { id: 'xlsx', label: 'Spreadsheets' },
  { id: 'pptx', label: 'Presentations' },
  { id: 'jpg', label: 'Images' },
  { id: 'mp4', label: 'Video' },
];
