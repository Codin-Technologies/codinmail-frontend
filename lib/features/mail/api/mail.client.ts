import type { MailApi } from "./mail.api";
import { CodinMailApi, codinMailApi } from "./mail.real";

let instance: MailApi | null = null;

export async function getMailApi(): Promise<MailApi> {
  if (instance === null) {
    instance = codinMailApi ?? new CodinMailApi();
  }
  return instance as MailApi;
}

export function setMailApi(api: MailApi): void {
  instance = api;
}

export function resetMailApi(): void {
  instance = null;
}
