'use client';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { sendEmailAction } from '@/lib/db/actions';
import { ExclamationTriangleIcon } from '@radix-ui/react-icons';
import { Bold, Clock3, Expand, Italic, Paperclip, PenLine, Smile, Trash2, Underline, X } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Suspense, useActionState, useState } from 'react';

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="compose-field"><span>{label}</span>{children}</label>;
}

export default function ComposePage() {
  return <Suspense fallback={<main className="compose-backdrop" />}><ComposeContent /></Suspense>;
}

function ComposeContent() {
  const { name } = useParams<{ name: string }>();
  const [showRecipients, setShowRecipients] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [state, formAction, pending] = useActionState(sendEmailAction, { error: '', previous: { recipientEmail: '', subject: '', body: '' } });
  const isProduction = process.env.NEXT_PUBLIC_VERCEL_ENV === 'production';

  return <main className={`compose-backdrop ${isFullscreen ? 'is-fullscreen' : ''}`}><section className="compose-modal" role="dialog" aria-modal="true" aria-labelledby="compose-title">
    <header className="compose-header"><div className="compose-title"><span className="compose-logo">C</span><div><span className="eyebrow">Codin Mail</span><h1 id="compose-title">New message</h1></div></div><div className="compose-header-actions"><button type="button" className="compose-icon" onClick={() => setIsFullscreen((value) => !value)} aria-label={isFullscreen ? 'Exit full screen compose' : 'Open full screen compose'}><Expand size={16} /></button><Link href={`/f/${name}`} className="compose-icon" aria-label="Close compose window"><X size={17} /></Link></div></header>
    {state.error && <div className="compose-error"><Alert variant="destructive"><ExclamationTriangleIcon className="h-4 w-4" /><AlertTitle>Message not sent</AlertTitle><AlertDescription>{state.error}</AlertDescription></Alert></div>}
    <form action={formAction} className="compose-form"><input type="hidden" name="returnTo" value={name} /><div className="compose-recipient-row"><Field label="To"><input type="email" name="recipientEmail" autoFocus required defaultValue={state.previous.recipientEmail?.toString()} placeholder="recipient@company.com" /></Field><button type="button" className="recipient-options" onClick={() => setShowRecipients((value) => !value)} aria-expanded={showRecipients}>{showRecipients ? 'Hide fields' : 'Cc / Bcc'}</button></div>
      {showRecipients && <div className="compose-extra-fields"><Field label="Cc"><input type="text" name="cc" placeholder="Add recipients" /></Field><Field label="Bcc"><input type="text" name="bcc" placeholder="Add hidden recipients" /></Field></div>}
      <Field label="Subject"><input type="text" name="subject" required defaultValue={state.previous.subject?.toString()} placeholder="Subject" /></Field>
      <div className="editor-wrap"><div className="editor-toolbar" aria-label="Formatting tools"><button type="button" aria-label="Bold"><Bold size={15} /></button><button type="button" aria-label="Italic"><Italic size={15} /></button><button type="button" aria-label="Underline"><Underline size={15} /></button><span className="toolbar-divider" /><button type="button" aria-label="Attach file"><Paperclip size={15} /></button><button type="button" aria-label="Add emoji"><Smile size={15} /></button></div><textarea name="body" required defaultValue={state.previous.body?.toString()} placeholder="Write your message..." onKeyDown={(event) => { if ((event.metaKey || event.ctrlKey) && event.key === 'Enter') { event.preventDefault(); event.currentTarget.form?.requestSubmit(); } }} /></div>
      <footer className="compose-footer"><div className="compose-footer-actions"><button type="submit" className="compose-send" disabled={pending || isProduction}><PenLine size={15} /> {pending ? 'Sending...' : 'Send'}</button><button type="button" className="compose-schedule" disabled={isProduction}><Clock3 size={15} /> Schedule</button></div><div className="compose-footer-actions"><button type="button" className="compose-muted" disabled={isProduction} aria-label="Attach file"><Paperclip size={17} /></button><Link href={`/f/${name}`} className="compose-muted" aria-label="Discard draft"><Trash2 size={17} /></Link></div></footer>
    </form>
  </section></main>;
}
