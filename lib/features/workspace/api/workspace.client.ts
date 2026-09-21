import type { WorkspaceApi } from './workspace.types';
import { CodinWorkspaceApi } from './workspace.real';

let instance: WorkspaceApi | null = null;

export async function getWorkspaceApi(): Promise<WorkspaceApi> {
  if (instance === null) {
    instance = new CodinWorkspaceApi();
  }
  return instance;
}

export function setWorkspaceApi(api: WorkspaceApi): void {
  instance = api;
}

export function resetWorkspaceApi(): void {
  instance = null;
}
