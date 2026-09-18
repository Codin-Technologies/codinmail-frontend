export type FileKind =
  | 'pdf'
  | 'docx'
  | 'xlsx'
  | 'pptx'
  | 'jpg'
  | 'png'
  | 'mp4'
  | 'zip'
  | 'txt'
  | 'csv'
  | 'audio'
  | 'other';

export type AccessLevel = 'private' | 'people' | 'team' | 'organization' | 'public_link';
export type PermissionRole = 'viewer' | 'commenter' | 'editor';
export type RelatedObjectType = 'email' | 'chat' | 'meeting' | 'event' | 'task' | 'contact' | 'project';
export type FilesSection =
  | 'home'
  | 'my_files'
  | 'shared_with_me'
  | 'shared_by_me'
  | 'recent'
  | 'starred'
  | 'trash'
  | 'workspace'
  | 'storage'
  | 'search';
export type FilesViewMode = 'grid' | 'list';
export type UploadStatus = 'queued' | 'uploading' | 'complete' | 'failed' | 'cancelled';

export type FileRelation = {
  id: string;
  fileId: string;
  objectType: RelatedObjectType;
  objectId: string;
  objectTitle: string;
  relationType: string;
};

export type FilePermission = {
  id: string;
  fileId: string;
  userId: string;
  userName: string;
  userEmail: string;
  role: PermissionRole;
  createdAt: string;
};

export type FileActivity = {
  id: string;
  fileId: string;
  userId: string;
  userName: string;
  action: string;
  metadata?: string;
  createdAt: string;
};

export type FileVersion = {
  id: string;
  fileId: string;
  version: number;
  storageKey: string;
  size: number;
  createdBy: string;
  createdAt: string;
};

export type CodinFolder = {
  id: string;
  name: string;
  parentId: string | null;
  ownerId: string;
  workspaceId: string;
  isStarred: boolean;
  memberCount?: number;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
};

export type CodinFile = {
  id: string;
  name: string;
  originalName: string;
  mimeType: string;
  kind: FileKind;
  size: number;
  storageProvider: 'codin' | 's3' | 'r2';
  storageKey: string;
  folderId: string | null;
  workspaceId: string;
  ownerId: string;
  ownerName: string;
  description: string;
  tags: string[];
  version: number;
  isStarred: boolean;
  accessLevel: AccessLevel;
  createdAt: string;
  updatedAt: string;
  lastAccessedAt: string;
  lastModifiedBy: string;
  deletedAt?: string;
  previewText?: string;
  previewUrl?: string;
  sharedByName?: string;
  sharedWithCount: number;
};

export type FileWorkspace = {
  id: string;
  name: string;
  kind: 'personal' | 'organization' | 'team' | 'project';
  memberCount: number;
  description: string;
};

export type UploadItem = {
  id: string;
  name: string;
  size: number;
  progress: number;
  status: UploadStatus;
  error?: string;
};

export type FilesStore = {
  files: CodinFile[];
  folders: CodinFolder[];
  permissions: FilePermission[];
  activity: FileActivity[];
  versions: FileVersion[];
  relations: FileRelation[];
  workspaces: FileWorkspace[];
};

export type SearchFilters = {
  type: FileKind | 'all';
  owner: string | 'all';
  location: string | 'all';
  shared: 'all' | 'shared' | 'private';
  date: 'all' | 'today' | 'week' | 'month';
};

export const CURRENT_FILES_USER = {
  id: 'user-self',
  name: 'Alex Morgan',
  email: 'alex.morgan@codin.io',
};
