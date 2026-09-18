import { createInitialFilesStore } from './mock-data';
import { FilesStore, FilesViewMode } from './types';

const STORE_KEY = 'codin_files_store_v1';
const VIEW_KEY = 'codin_files_view_v1';
const DETAILS_KEY = 'codin_files_details_open_v1';

export function loadFilesStore(): FilesStore {
  if (typeof window === 'undefined') return createInitialFilesStore();
  try {
    const saved = localStorage.getItem(STORE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved) as FilesStore;
      if (parsed?.files?.length) return parsed;
    }
  } catch {
    /* ignore */
  }
  return createInitialFilesStore();
}

export function saveFilesStore(store: FilesStore) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORE_KEY, JSON.stringify(store));
  } catch {
    /* ignore */
  }
}

export function loadViewMode(): FilesViewMode {
  if (typeof window === 'undefined') return 'grid';
  const saved = localStorage.getItem(VIEW_KEY);
  return saved === 'list' ? 'list' : 'grid';
}

export function saveViewMode(mode: FilesViewMode) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(VIEW_KEY, mode);
}

export function loadDetailsOpen() {
  if (typeof window === 'undefined') return true;
  return localStorage.getItem(DETAILS_KEY) !== '0';
}

export function saveDetailsOpen(open: boolean) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(DETAILS_KEY, open ? '1' : '0');
}
