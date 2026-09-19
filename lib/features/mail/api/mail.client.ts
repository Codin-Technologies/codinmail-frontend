import { getApiMode } from "@/lib/api/config";
import type { MailApi } from "./mail.api";

let instance: MailApi | null = null;
let currentMode: "mock" | "real" | "custom" = "mock";

export async function getMailApi(): Promise<MailApi> {
  const mode = getApiMode();
  if (instance === null || (mode !== currentMode && currentMode !== "custom")) {
    currentMode = mode;
    if (mode === "real") {
      const { CodinMailApi, codinMailApi } = await import("./mail.real");
      instance = codinMailApi ?? new CodinMailApi();
    } else {
      const { MockMailApi, mockMailApi } = await import("./mail.mock");
      instance = mockMailApi ?? new MockMailApi();
    }
  }
  return instance as MailApi;
}

export function setMailApi(api: MailApi): void {
  instance = api;
  currentMode = "custom";
}

export function resetMailApi(): void {
  instance = null;
  currentMode = "mock";
}
