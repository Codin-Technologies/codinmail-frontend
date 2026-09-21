import type { SignApi } from './sign.api';
import { CodinSignApi } from './sign.real';

let instance: SignApi | null = null;

export function getSignApi(): SignApi {
  if (instance === null) {
    instance = new CodinSignApi();
  }
  return instance;
}

export function setSignApi(api: SignApi): void {
  instance = api;
}
