import { getApiMode } from '@/lib/api/config';
import type { WorkspaceApi } from './workspace.types';
import { MockWorkspaceApi } from './workspace.mock';

let instance: WorkspaceApi | null = null;
let currentMode: 'mock' | 'real' | 'custom' = 'mock';

export async function getWorkspaceApi(): Promise<WorkspaceApi> {
  const mode = getApiMode();
  if (instance === null || (mode !== currentMode && currentMode !== 'custom')) {
    currentMode = mode;
    if (mode === 'real') {
      const { CodinWorkspaceApi } = await import('./workspace.real');
      instance = new CodinWorkspaceApi();
    } else {
      instance = new MockWorkspaceApi();
    }
  }
  return instance;
}

export function setWorkspaceApi(api: WorkspaceApi): void {
  instance = api;
  currentMode = 'custom';
}

export function resetWorkspaceApi(): void {
  instance = null;
  currentMode = 'mock';
}
