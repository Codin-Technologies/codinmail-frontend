import { getApiMode } from '@/lib/api/config';
import type { SignApi } from './sign.api';
import { MockSignApi } from './sign.mock';
import { CodinSignApi } from './sign.real';

let instance: SignApi | null = null;
let currentMode: 'mock' | 'real' | 'custom' = 'mock';

export function getSignApi(): SignApi {
  const mode = getApiMode();
  if (instance === null || (mode !== currentMode && currentMode !== 'custom')) {
    currentMode = mode;
    instance = mode === 'real' ? new CodinSignApi() : new MockSignApi();
  }
  return instance;
}

export function setSignApi(api: SignApi): void {
  instance = api;
  currentMode = 'custom';
}
