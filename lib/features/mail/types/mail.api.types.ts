export type {
  Mailbox,
  Folder,
  Thread,
  ThreadListItem,
  Message,
  Draft,
  Attachment,
  Label,
} from "./mail.types";

import type { ThreadListItem, Message } from "./mail.types";

export interface ThreadListResponse {
  threads: ThreadListItem[];
  nextCursor?: string;
}

export interface SearchResponse {
  messages: Message[];
  nextCursor?: string;
}

export interface ListThreadsQuery {
  mailboxId?: string;
  folder?: string;
  isRead?: boolean;
  isStarred?: boolean;
  labelId?: string;
  q?: string;
  limit?: number;
  cursor?: string;
}

export interface ListMessagesQuery {
  limit?: number;
  cursor?: string;
}

export interface SearchQuery {
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
}

export interface CreateDraftData {
  mailboxId: string;
  threadId?: string;
  to: string[];
  cc?: string[];
  bcc?: string[];
  subject: string;
  textBody?: string;
  htmlBody?: string;
  inReplyTo?: string;
  references?: string[];
  replyContext?: Record<string, unknown>;
  forwardContext?: Record<string, unknown>;
}

export interface UpdateDraftData {
  to?: string[];
  cc?: string[];
  bcc?: string[];
  subject?: string;
  textBody?: string;
  htmlBody?: string;
  inReplyTo?: string;
  references?: string[];
  replyContext?: Record<string, unknown>;
  forwardContext?: Record<string, unknown>;
  version?: number;
}

export interface SendMailPayload {
  mailboxId: string;
  to: string[];
  cc?: string[];
  bcc?: string[];
  subject: string;
  bodyText?: string;
  bodyHtml?: string;
}

export interface SendMailResult {
  messageId: string;
  rfcMessageId: string;
  outboxId: string;
  status: "queued";
}

export interface BatchMessageAction {
  messageIds: string[];
  action: "markRead" | "markUnread" | "star" | "unstar" | "archive" | "trash" | "restore" | "delete" | "move";
  folder?: string;
  labelId?: string;
}
