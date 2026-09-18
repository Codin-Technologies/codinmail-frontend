import { getApiMode } from '@/lib/api/config';
import type { DomainApi } from './domain.types';
import { MockDomainApi } from './domain.mock';

let instance: DomainApi | null = null;
let currentMode: 'mock' | 'real' | 'custom' = 'mock';

export async function getDomainApi(): Promise<DomainApi> {
  const mode = getApiMode();
  if (instance === null || (mode !== currentMode && currentMode !== 'custom')) {
    currentMode = mode;
    if (mode === 'real') {
      const { CodinDomainApi } = await import('./domain.real');
      instance = new CodinDomainApi();
    } else {
      instance = new MockDomainApi();
    }
  }
  return instance;
}

export function setDomainApi(api: DomainApi): void {
  instance = api;
  currentMode = 'custom';
}

export function resetDomainApi(): void {
  instance = null;
  currentMode = 'mock';
}
