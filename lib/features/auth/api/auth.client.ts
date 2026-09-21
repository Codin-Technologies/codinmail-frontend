import type { AuthApi } from './auth.types';
import { CodinAuthApi } from './auth.real';

let instance: AuthApi | null = null;

export async function getAuthApi(): Promise<AuthApi> {
  if (instance === null) {
    instance = new CodinAuthApi();
  }
  return instance;
}

export function setAuthApi(api: AuthApi): void {
  instance = api;
}

export function resetAuthApi(): void {
  instance = null;
}
