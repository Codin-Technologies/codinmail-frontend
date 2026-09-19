'use client';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useMailboxes } from '@/lib/features/mail/hooks/use-mailboxes';
import { useSendMail } from '@/lib/features/mail/hooks/use-mail-actions';
import type { Mailbox } from '@/lib/features/mail/types/mail.types';
import { useWorkspace } from '@/lib/stores/workspace-context';
import { ExclamationTriangleIcon } from '@radix-ui/react-icons';
import {
  Bold,
  Clock3,
  Expand,
  Italic,
  Paperclip,
  PenLine,
  Smile,
  Trash2,
  Underline,
  X,
} from 'lucide-react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { Suspense, useEffect, useMemo, useState } from 'react';

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="compose-field">
      <span>{label}</span>
      {children}
    </label>
  );
}

function parseRecipients(value: string): string[] {
  return value
    .split(/[,\n;]/)
    .map((recipient) => recipient.trim())
    .filter(Boolean);
}

function ComposeContent() {
  const params = useParams<{ name: string }>();
  const router = useRouter();
  const { activeWorkspace } = useWorkspace();

  const folderName = params.name;
  const workspaceId = activeWorkspace?.id ?? '';

  const [showRecipients, setShowRecipients] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const [mailboxId, setMailboxId] = useState('');

  const [recipientEmail, setRecipientEmail] = useState('');
  const [cc, setCc] = useState('');
  const [bcc, setBcc] = useState('');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');

  const [error, setError] = useState('');
  const [isSending, setIsSending] = useState(false);

  const isProduction =
    process.env.NEXT_PUBLIC_VERCEL_ENV === 'production';

  const {
    data: mailboxes = [],
    isLoading: isLoadingMailboxes,
    isError: isMailboxError,
  } = useMailboxes();

  const sendMailMutation = useSendMail(workspaceId);

  /*
   * Select a sensible default mailbox.

   * Prefer an active user mailbox. If none exists,
   * fall back to the first active mailbox.
   */
  const defaultMailbox = useMemo(() => {
    const activeMailboxes = mailboxes.filter(
      (mailbox) => mailbox.status === 'active',
    );

    return (
      activeMailboxes.find(
        (mailbox) => mailbox.mailboxType === 'user',
      ) ??
      activeMailboxes[0] ??
      null
    );
  }, [mailboxes]);

  useEffect(() => {
    if (!mailboxId && defaultMailbox) {
      setMailboxId(defaultMailbox.id);
    }
  }, [defaultMailbox, mailboxId]);

  const selectedMailbox = mailboxes.find(
    (mailbox) => mailbox.id === mailboxId,
  );

  const handleSubmit = async (
    event: React.FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    setError('');

    if (!workspaceId) {
      setError('No active workspace is selected.');
      return;
    }

    if (!mailboxId) {
      setError('No mailbox is available for sending.');
      return;
    }

    const to = parseRecipients(recipientEmail);
    const ccRecipients = parseRecipients(cc);
    const bccRecipients = parseRecipients(bcc);

    if (to.length === 0) {
      setError('Please enter at least one recipient.');
      return;
    }

    if (!subject.trim()) {
      setError('Please enter a subject.');
      return;
    }

    if (!body.trim()) {
      setError('Please enter a message.');
      return;
    }

    setIsSending(true);

    try {
      await sendMailMutation.mutateAsync({
        mailboxId,
        to,
        cc: ccRecipients,
        bcc: bccRecipients,
        subject: subject.trim(),
        bodyText: body,
        bodyHtml: undefined,
      });

      router.push(`/f/${folderName}`);
      router.refresh();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Unable to send the message.',
      );
    } finally {
      setIsSending(false);
    }
  };

  const handleDiscard = () => {
    router.push(`/f/${folderName}`);
  };

  const sendingDisabled =
    isSending ||
    sendMailMutation.isPending ||
    isProduction ||
    !workspaceId ||
    !mailboxId ||
    isLoadingMailboxes;

  return (
    <main
      className={`compose-backdrop ${
        isFullscreen ? 'is-fullscreen' : ''
      }`}
    >
      <section
        className="compose-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="compose-title"
      >
        <header className="compose-header">
          <div className="compose-title">
            <span className="compose-logo">C</span>

            <div>
              <span className="eyebrow">Codin Mail</span>

              <h1 id="compose-title">
                New message
              </h1>
            </div>
          </div>

          <div className="compose-header-actions">
            <button
              type="button"
              className="compose-icon"
              onClick={() =>
                setIsFullscreen((value) => !value)
              }
              aria-label={
                isFullscreen
                  ? 'Exit full screen compose'
                  : 'Open full screen compose'
              }
            >
              <Expand size={16} />
            </button>

            <Link
              href={`/f/${folderName}`}
              className="compose-icon"
              aria-label="Close compose window"
            >
              <X size={17} />
            </Link>
          </div>
        </header>

        {error && (
          <div className="compose-error">
            <Alert variant="destructive">
              <ExclamationTriangleIcon className="h-4 w-4" />

              <AlertTitle>
                Message not sent
              </AlertTitle>

              <AlertDescription>
                {error}
              </AlertDescription>
            </Alert>
          </div>
        )}

        {isMailboxError && !error && (
          <div className="compose-error">
            <Alert variant="destructive">
              <ExclamationTriangleIcon className="h-4 w-4" />

              <AlertTitle>
                Mailbox unavailable
              </AlertTitle>

              <AlertDescription>
                Unable to load a mailbox for this workspace.
              </AlertDescription>
            </Alert>
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="compose-form"
        >
          {mailboxes.length > 1 && (
            <Field label="From">
              <select
                value={mailboxId}
                onChange={(event) =>
                  setMailboxId(event.target.value)
                }
                disabled={isSending}
              >
                {mailboxes
                  .filter(
                    (mailbox) =>
                      mailbox.status === 'active',
                  )
                  .map((mailbox) => (
                    <option
                      key={mailbox.id}
                      value={mailbox.id}
                    >
                      {mailbox.emailAddress}
                    </option>
                  ))}
              </select>
            </Field>
          )}

          {selectedMailbox && mailboxes.length === 1 && (
            <div className="compose-from">
              <span>From</span>
              <span>{selectedMailbox.emailAddress}</span>
            </div>
          )}

          <div className="compose-recipient-row">
            <Field label="To">
              <input
                type="text"
                name="recipientEmail"
                autoFocus
                required
                value={recipientEmail}
                onChange={(event) =>
                  setRecipientEmail(event.target.value)
                }
                placeholder="recipient@company.com"
                disabled={isSending}
              />
            </Field>

            <button
              type="button"
              className="recipient-options"
              onClick={() =>
                setShowRecipients((value) => !value)
              }
              aria-expanded={showRecipients}
            >
              {showRecipients
                ? 'Hide fields'
                : 'Cc / Bcc'}
            </button>
          </div>

          {showRecipients && (
            <div className="compose-extra-fields">
              <Field label="Cc">
                <input
                  type="text"
                  name="cc"
                  value={cc}
                  onChange={(event) =>
                    setCc(event.target.value)
                  }
                  placeholder="Add recipients"
                  disabled={isSending}
                />
              </Field>

              <Field label="Bcc">
                <input
                  type="text"
                  name="bcc"
                  value={bcc}
                  onChange={(event) =>
                    setBcc(event.target.value)
                  }
                  placeholder="Add hidden recipients"
                  disabled={isSending}
                />
              </Field>
            </div>
          )}

          <Field label="Subject">
            <input
              type="text"
              name="subject"
              required
              value={subject}
              onChange={(event) =>
                setSubject(event.target.value)
              }
              placeholder="Subject"
              disabled={isSending}
            />
          </Field>

          <div className="editor-wrap">
            <div
              className="editor-toolbar"
              aria-label="Formatting tools"
            >
              <button
                type="button"
                aria-label="Bold"
                disabled={isSending}
              >
                <Bold size={15} />
              </button>

              <button
                type="button"
                aria-label="Italic"
                disabled={isSending}
              >
                <Italic size={15} />
              </button>

              <button
                type="button"
                aria-label="Underline"
                disabled={isSending}
              >
                <Underline size={15} />
              </button>

              <span className="toolbar-divider" />

              <button
                type="button"
                aria-label="Attach file"
                disabled={isSending}
              >
                <Paperclip size={15} />
              </button>

              <button
                type="button"
                aria-label="Add emoji"
                disabled={isSending}
              >
                <Smile size={15} />
              </button>
            </div>

            <textarea
              name="body"
              required
              value={body}
              onChange={(event) =>
                setBody(event.target.value)
              }
              placeholder="Write your message..."
              disabled={isSending}
              onKeyDown={(event) => {
                if (
                  (event.metaKey || event.ctrlKey) &&
                  event.key === 'Enter'
                ) {
                  event.preventDefault();

                  event.currentTarget.form?.requestSubmit();
                }
              }}
            />
          </div>

          <footer className="compose-footer">
            <div className="compose-footer-actions">
              <button
                type="submit"
                className="compose-send"
                disabled={sendingDisabled}
              >
                <PenLine size={15} />

                {isSending
                  ? 'Sending...'
                  : 'Send'}
              </button>

              <button
                type="button"
                className="compose-schedule"
                disabled
              >
                <Clock3 size={15} />
                Schedule
              </button>
            </div>

            <div className="compose-footer-actions">
              <button
                type="button"
                className="compose-muted"
                disabled
                aria-label="Attach file"
              >
                <Paperclip size={17} />
              </button>

              <button
                type="button"
                className="compose-muted"
                disabled={isSending}
                onClick={handleDiscard}
                aria-label="Discard message"
              >
                <Trash2 size={17} />
              </button>
            </div>
          </footer>
        </form>
      </section>
    </main>
  );
}

export default function ComposePage() {
  return (
    <Suspense
      fallback={
        <main className="compose-backdrop" />
      }
    >
      <ComposeContent />
    </Suspense>
  );
}