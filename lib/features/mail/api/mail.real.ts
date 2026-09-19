import type { MailApi } from "./mail.api";
import { apiFetch } from "@/lib/api/api-client";
import type {
  Mailbox,
  ThreadListResponse,
  Thread,
  Message,
  Draft,
  Attachment,
  Folder,
  SendMailResult,
  SearchResponse,
  CreateDraftData,
  UpdateDraftData,
  SendMailPayload,
  BatchMessageAction,
} from "../types/mail.api.types";

function filterParams<T extends Record<string, unknown>>(params: T): Record<string, string | number | boolean> {
  const result: Record<string, string | number | boolean> = {};
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null) {
      result[key] = value as string | number | boolean;
    }
  }
  return result;
}

export class CodinMailApi implements MailApi {
  async listMailboxes(workspaceId: string): Promise<Mailbox[]> {
    const result = (await apiFetch(`/workspaces/${workspaceId}/mailboxes`)) as { mailboxes: Mailbox[] };
    return result?.mailboxes ?? [];
  }

  async listThreads(
    workspaceId: string,
    query?: {
      mailboxId?: string;
      folder?: string;
      isRead?: boolean;
      isStarred?: boolean;
      labelId?: string;
      q?: string;
      limit?: number;
      cursor?: string;
    }
  ): Promise<ThreadListResponse> {
    const result = (await apiFetch(`/workspaces/${workspaceId}/threads`, {
      params: filterParams({
        mailboxId: query?.mailboxId,
        folder: query?.folder,
        isRead: query?.isRead,
        isStarred: query?.isStarred,
        labelId: query?.labelId,
        q: query?.q,
        limit: query?.limit,
        cursor: query?.cursor,
      }),
    })) as { data: ThreadListResponse };
    return result?.data ?? { threads: [], nextCursor: undefined };
  }

  async getThread(workspaceId: string, threadId: string): Promise<Thread> {
    const result = (await apiFetch(`/workspaces/${workspaceId}/threads/${threadId}`)) as { data: Thread };
    return result.data;
  }

  async updateThread(
    workspaceId: string,
    threadId: string,
    updates: { isStarred?: boolean; isArchived?: boolean; isDeleted?: boolean }
  ): Promise<Thread> {
    const result = (await apiFetch(`/workspaces/${workspaceId}/threads/${threadId}`, {
      method: "PATCH",
      body: updates,
    })) as { data: Thread };
    return result.data;
  }

  async markThreadRead(workspaceId: string, threadId: string): Promise<void> {
    await apiFetch(`/workspaces/${workspaceId}/threads/${threadId}/read`, { method: "POST" });
  }

  async markThreadUnread(workspaceId: string, threadId: string): Promise<void> {
    await apiFetch(`/workspaces/${workspaceId}/threads/${threadId}/unread`, { method: "POST" });
  }

  async archiveThread(workspaceId: string, threadId: string): Promise<Thread> {
    const result = (await apiFetch(`/workspaces/${workspaceId}/threads/${threadId}/archive`, {
      method: "POST",
    })) as { data: Thread };
    return result.data;
  }

  async trashThread(workspaceId: string, threadId: string): Promise<Thread> {
    const result = (await apiFetch(`/workspaces/${workspaceId}/threads/${threadId}/trash`, {
      method: "POST",
    })) as { data: Thread };
    return result.data;
  }

  async getMessage(workspaceId: string, messageId: string): Promise<Message> {
    const result = (await apiFetch(`/workspaces/${workspaceId}/messages/${messageId}`)) as { data: Message };
    return result.data;
  }

  async updateMessage(
    workspaceId: string,
    messageId: string,
    updates: { isRead?: boolean; isStarred?: boolean; folder?: string; labels?: string[] }
  ): Promise<Message> {
    const result = (await apiFetch(`/workspaces/${workspaceId}/messages/${messageId}`, {
      method: "PATCH",
      body: updates,
    })) as { data: Message };
    return result.data;
  }

  async deleteMessage(workspaceId: string, messageId: string): Promise<void> {
    await apiFetch(`/workspaces/${workspaceId}/messages/${messageId}`, { method: "DELETE" });
  }

  async batchMessages(workspaceId: string, action: BatchMessageAction): Promise<{ updatedCount: number }> {
    const result = (await apiFetch(`/workspaces/${workspaceId}/messages/batch`, {
      method: "POST",
      body: action,
    })) as { data: { updatedCount: number } };
    return result.data;
  }

  async createDraft(workspaceId: string, data: CreateDraftData): Promise<Draft> {
    const result = (await apiFetch(`/workspaces/${workspaceId}/drafts`, {
      method: "POST",
      body: data,
    })) as { data: Draft };
    return result.data;
  }

  async listDrafts(workspaceId: string, mailboxId: string): Promise<Draft[]> {
    const result = (await apiFetch(`/workspaces/${workspaceId}/drafts`, {
      params: { mailboxId },
    })) as { data: Draft[] };
    return result?.data ?? [];
  }

  async getDraft(workspaceId: string, draftId: string): Promise<Draft> {
    const result = (await apiFetch(`/workspaces/${workspaceId}/drafts/${draftId}`)) as { data: Draft };
    return result.data;
  }

  async updateDraft(workspaceId: string, draftId: string, data: UpdateDraftData): Promise<Draft> {
    const result = (await apiFetch(`/workspaces/${workspaceId}/drafts/${draftId}`, {
      method: "PATCH",
      body: data,
    })) as { data: Draft };
    return result.data;
  }

  async deleteDraft(workspaceId: string, draftId: string): Promise<void> {
    await apiFetch(`/workspaces/${workspaceId}/drafts/${draftId}`, { method: "DELETE" });
  }

  async sendDraft(workspaceId: string, draftId: string): Promise<{ messageId: string; rfcMessageId: string; outboxId: string }> {
    const result = (await apiFetch(`/workspaces/${workspaceId}/drafts/${draftId}/send`, {
      method: "POST",
    })) as { data: { messageId: string; rfcMessageId: string; outboxId: string } };
    return result.data;
  }

  async sendMail(workspaceId: string, payload: SendMailPayload): Promise<SendMailResult> {
    const result = (await apiFetch(`/workspaces/${workspaceId}/mail/send`, {
      method: "POST",
      body: payload,
    })) as { data: SendMailResult };
    return result.data;
  }

  async search(workspaceId: string, query: {
    q: string;
    mailboxId?: string;
    folder?: string;
    labelId?: string;
    isRead?: boolean;
    isStarred?: boolean;
    dateFrom?: string;
    dateTo?: string;
    limit?: number;
    cursor?: string;
  }): Promise<SearchResponse> {
    const result = (await apiFetch(`/workspaces/${workspaceId}/search`, {
      params: filterParams({
        q: query.q,
        mailboxId: query.mailboxId,
        folder: query.folder,
        labelId: query.labelId,
        isRead: query.isRead,
        isStarred: query.isStarred,
        dateFrom: query.dateFrom,
        dateTo: query.dateTo,
        limit: query.limit,
        cursor: query.cursor,
      }),
    })) as { data: SearchResponse };
    return result.data ?? { messages: [], nextCursor: undefined };
  }

  async listFolders(workspaceId: string, mailboxId: string): Promise<Folder[]> {
    const result = (await apiFetch(`/workspaces/${workspaceId}/folders`, {
      params: { mailboxId },
    })) as { data: Folder[] };
    return result?.data ?? [];
  }

  async getMessageAttachments(workspaceId: string, messageId: string): Promise<Attachment[]> {
    const result = (await apiFetch(`/workspaces/${workspaceId}/messages/${messageId}/attachments`)) as { data: Attachment[] };
    return result?.data ?? [];
  }

  async getAttachment(workspaceId: string, attachmentId: string): Promise<Attachment> {
    const result = (await apiFetch(`/workspaces/${workspaceId}/attachments/${attachmentId}`)) as { data: Attachment };
    return result.data;
  }
}

export const codinMailApi = new CodinMailApi();
