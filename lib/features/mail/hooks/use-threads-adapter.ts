import type { ThreadListItem, Message } from '../types/mail.api.types';

export interface UIEmail {
  id: string;
  sender: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  body: string | null;
  sentDate: string | null;
}

export interface UIThread {
  id: string;
  subject: string | null;
  lastActivityDate: string | null;
  emails: UIEmail[];
}

export function adaptThreadListItem(item: ThreadListItem): UIThread {
  const { thread, latestMessage } = item;
  return {
    id: thread.id,
    subject: thread.subject,
    lastActivityDate: thread.latestMessageAt,
    emails: [
      {
        id: latestMessage.id,
        sender: {
          id: 'unknown',
          firstName: latestMessage.sender.split(' ')[0] ?? 'Unknown',
          lastName: latestMessage.sender.split(' ').slice(1).join(' ') ?? '',
          email: latestMessage.sender,
        },
        body: latestMessage.preview,
        sentDate: latestMessage.receivedAt,
      },
    ],
  };
}

export function adaptThreadListItems(items: ThreadListItem[]): UIThread[] {
  return items.map(adaptThreadListItem);
}

export function adaptMessage(message: Message): UIEmail {
  return {
    id: message.id,
    sender: {
      id: 'unknown',
      firstName: message.sender.split(' ')[0] ?? 'Unknown',
      lastName: message.sender.split(' ').slice(1).join(' ') ?? '',
      email: message.sender,
    },
    body: message.textBody,
    sentDate: message.sentAt ?? message.receivedAt,
  };
}