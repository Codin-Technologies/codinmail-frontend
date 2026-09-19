"use client";

import { Inbox, Star, FileText, Send, Archive, Trash, ChevronRight } from "lucide-react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import type { Mailbox } from "../../../lib/features/mail/types/mail.api.types";

interface FolderNavProps {
  mailboxes: Mailbox[];
  activeFolder?: string;
}

const FOLDER_ICONS: Record<string, React.ReactNode> = {
  inbox: <Inbox size={16} />,
  starred: <Star size={16} />,
  drafts: <FileText size={16} />,
  sent: <Send size={16} />,
  archive: <Archive size={16} />,
  trash: <Trash size={16} />,
};

export function FolderNav({ mailboxes, activeFolder }: FolderNavProps) {
  const router = useRouter();
  const pathname = usePathname();
  const folders = [
    { name: "inbox", label: "Inbox" },
    { name: "starred", label: "Starred" },
    { name: "drafts", label: "Drafts" },
    { name: "sent", label: "Sent" },
    { name: "archive", label: "Archive" },
    { name: "trash", label: "Trash" },
  ];

  return (
    <nav className="flex flex-col p-2 space-y-1">
      <div className="flex items-center gap-2 px-2 py-2 text-sm font-semibold text-muted-foreground">
        <Inbox size={16} />
        <span>Mail</span>
      </div>
      {folders.map((folder) => (
        <Link
          key={folder.name}
          href={`/mail/${folder.name}`}
          className={`flex items-center gap-2 rounded-lg px-2 py-2 text-sm transition-colors ${
            activeFolder === folder.name
              ? "bg-muted text-foreground"
              : "text-muted-foreground hover:bg-muted hover:text-foreground"
          }`}
        >
          {FOLDER_ICONS[folder.name] ?? <Inbox size={16} />}
          <span>{folder.label}</span>
        </Link>
      ))}
      {mailboxes.map((mailbox) => (
        <button
          key={mailbox.id}
          onClick={() => router.push(`/mail/${mailbox.emailAddress}`)}
          className="flex items-center gap-2 rounded-lg px-2 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground text-left"
        >
          <span className="text-xs">@{mailbox.emailAddress}</span>
          <ChevronRight size={14} className="ml-auto" />
        </button>
      ))}
    </nav>
  );
}
