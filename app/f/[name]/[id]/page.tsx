"use client";

import { useParams } from "next/navigation";

import { LeftSidebar } from "@/app/components/left-sidebar";
import { ThreadActions } from "@/app/components/thread-actions";
import { useThread } from "@/lib/features/mail/hooks/use-threads";
import { useWorkspace } from "@/lib/stores/workspace-context";

export default function EmailPage() {
  const params = useParams<{ name: string; id: string }>();
  const threadId = params.id;

  const { activeWorkspace } = useWorkspace();
  const workspaceId = activeWorkspace?.id ?? "";

  const {
    data: thread,
    isLoading,
    isError,
  } = useThread(workspaceId, threadId);

  if (!workspaceId || isLoading) {
    return (
      <div className="flex h-full grow">
        <LeftSidebar />

        <div className="grow overflow-auto p-2 sm:p-6">
          <div className="mx-auto max-w-4xl">
            <div className="mx-6 mb-6 h-8 w-2/3 animate-pulse rounded bg-gray-200" />

            <div className="space-y-6">
              <div className="h-32 animate-pulse rounded-lg bg-gray-100" />
              <div className="h-32 animate-pulse rounded-lg bg-gray-100" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (isError || !thread) {
    return (
      <div className="flex h-full grow">
        <LeftSidebar />

        <div className="grow overflow-auto p-2 sm:p-6">
          <div className="mx-auto max-w-4xl">
            <p className="text-sm text-gray-500">
              Unable to load this conversation.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full grow">
      <LeftSidebar />

      <div className="grow overflow-auto p-2 sm:p-6">
        <div className="mx-auto max-w-4xl">
          <div className="mx-6 mb-6 flex flex-col items-start justify-between sm:flex-row">
            <h1 className="mt-4 max-w-2xl grow pr-4 text-2xl font-semibold sm:mt-0">
              {thread.subject}
            </h1>

            <div className="mt-2 flex shrink-0 items-center space-x-1 sm:mt-0">
              <button className="mr-2 cursor-pointer text-sm font-medium text-gray-700">
                Share
              </button>

              <ThreadActions threadId={thread.id} />
            </div>
          </div>

          <div className="space-y-6">
            {thread.messages?.map((message) => (
              <div
                key={message.id}
                className="rounded-lg bg-gray-50 px-6 py-4"
              >
                <div className="mb-2 flex flex-col items-start justify-between sm:flex-row sm:items-center">
                  <div className="font-semibold">
                    {message.sender ?? "Unknown sender"}
                  </div>

                  <div className="text-sm text-gray-500">
                    {message.sentAt
                      ? new Date(message.sentAt).toLocaleString()
                      : ""}
                  </div>
                </div>

                <div className="whitespace-pre-wrap">
                  {message.textBody ?? ""}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}