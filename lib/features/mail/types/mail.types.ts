export interface Mailbox {
  id: string;
  workspaceId: string;
  domainId: string;
  userId: string | null;
  localPart: string;
  emailAddress: string;
  mailboxType: "user" | "shared" | "service";
  status: "active" | "suspended" | "disabled" | "deleted";
  providerType: string;
  providerMailboxId: string | null;
  quotaBytes: number;
  usedBytes: number;
  createdAt: string;
  updatedAt: string;
}

export interface Folder {
  id: string;
  workspaceId: string;
  mailboxId: string;
  name: string;
  parentId: string | null;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface Thread {
  id: string;
  workspaceId: string;
  mailboxId: string;
  subject: string;
  participants: string[];
  latestMessageId: string | null;
  latestMessageAt: string | null;
  messageCount: number;
  unreadCount: number;
  isStarred: boolean;
  isArchived: boolean;
  isDeleted: boolean;
  messages?: Message[];
  createdAt: string;
  updatedAt: string;
}

export interface Message {
  id: string;
  messageId: string;
  threadId: string | null;
  direction: "inbound" | "outbound";
  sender: string;
  recipients: string[];
  cc: string[];
  bcc: string[];
  subject: string | null;
  textBody: string | null;
  htmlBody: string | null;
  status: string;
  isRead: boolean;
  isStarred: boolean;
  folder: string;
  inReplyTo: string | null;
  references: string[];
  sizeBytes: number;
  receivedAt: string | null;
  sentAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ThreadListItem {
  thread: Thread;
  latestMessage: {
    id: string;
    messageId: string;
    sender: string;
    subject: string;
    preview: string;
    receivedAt: string;
    isRead: boolean;
    isStarred: boolean;
    attachmentPresent: boolean;
    labels: Array<{ id: string; name: string; color: string }>;
  };
}

export interface Draft {
  id: string;
  workspaceId: string;
  mailboxId: string;
  threadId: string | null;
  toRecipients: string[];
  ccRecipients: string[];
  bccRecipients: string[];
  subject: string;
  textBody: string | null;
  htmlBody: string | null;
  inReplyTo: string | null;
  references: string[];
  replyContext: Record<string, unknown> | null;
  forwardContext: Record<string, unknown> | null;
  version: number;
  createdAt: string;
  updatedAt: string;
}

export interface Label {
  id: string;
  workspaceId: string;
  mailboxId: string;
  name: string;
  color: string;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface Attachment {
  id: string;
  messageId: string;
  workspaceId: string;
  mailboxId: string;
  filename: string;
  contentType: string;
  sizeBytes: number;
  storageKey: string | null;
  checksumSha256: string | null;
  downloadCount: number;
  createdAt: string;
}

export interface PaginationMeta {
  total: number;
  limit: number;
  offset: number;
}
