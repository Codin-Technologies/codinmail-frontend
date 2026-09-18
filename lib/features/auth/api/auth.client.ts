import { getApiMode } from '@/lib/api/config';
import type { AuthApi } from './auth.types';
import { MockAuthApi } from './auth.mock';

let instance: AuthApi | null = null;
let currentMode: 'mock' | 'real' | 'custom' = 'mock';

export async function getAuthApi(): Promise<AuthApi> {
  const mode = getApiMode();
  if (instance === null || (mode !== currentMode && currentMode !== 'custom')) {
    currentMode = mode;
    if (mode === 'real') {
      const { CodinAuthApi } = await import('./auth.real');
      instance = new CodinAuthApi();
    } else {
      instance = new MockAuthApi();
    }
  }
  return instance;
}

export function setAuthApi(api: AuthApi): void {
  instance = api;
  currentMode = 'custom';
}

export function resetAuthApi(): void {
  instance = null;
  currentMode = 'mock';
}
