import type { DomainApi } from './domain.types';
import { CodinDomainApi } from './domain.real';

let instance: DomainApi | null = null;

export async function getDomainApi(): Promise<DomainApi> {
  if (instance === null) {
    instance = new CodinDomainApi();
  }
  return instance;
}

export function setDomainApi(api: DomainApi): void {
  instance = api;
}

export function resetDomainApi(): void {
  instance = null;
}
