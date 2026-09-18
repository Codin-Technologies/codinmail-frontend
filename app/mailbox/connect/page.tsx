'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle2, Mail, Server, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { mockMailboxApi } from '@/lib/mock/mailboxes';

type Provider = 'Google' | 'Microsoft 365' | 'Custom IMAP/SMTP' | 'Codin Hosted Email';

export default function ConnectMailboxPage() {
  const router = useRouter();
  const [provider, setProvider] = useState<Provider | null>(null);
  const [step, setStep] = useState<'provider' | 'details' | 'success'>('provider');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [email, setEmail] = useState('');
  const [imapServer, setImapServer] = useState('');
  const [imapPort, setImapPort] = useState('993');
  const [smtpServer, setSmtpServer] = useState('');
  const [smtpPort, setSmtpPort] = useState('587');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const providers: { id: Provider; label: string; description: string }[] = [
    { id: 'Google', label: 'Google', description: 'Connect your Gmail account' },
    { id: 'Microsoft 365', label: 'Microsoft 365', description: 'Connect your Outlook or Exchange account' },
    { id: 'Custom IMAP/SMTP', label: 'Custom IMAP/SMTP', description: 'Connect any IMAP/SMTP mailbox' },
    { id: 'Codin Hosted Email', label: 'Codin Hosted Email', description: 'Use email hosted by Codin' },
  ];

  const handleProviderSelect = (selected: Provider) => {
    setProvider(selected);
    if (selected === 'Custom IMAP/SMTP') {
      setStep('details');
    } else {
      setStep('details');
    }
  };

  const handleConnect = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!provider) return;
    setIsSubmitting(true);
    try {
      await mockMailboxApi.connectMailbox(provider, { email, imapServer, imapPort, smtpServer, smtpPort, username, password });
      setStep('success');
    } catch {
      alert('Failed to connect mailbox. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSkip = () => {
    router.push('/f/inbox');
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-6">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-xl font-extrabold text-primary-foreground">
            C
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Connect your email</h1>
          <p className="mt-2 text-sm text-muted-foreground">Add an email account to this workspace</p>
        </div>

        {step === 'provider' && (
          <div className="space-y-3">
            <p className="text-center text-xs text-muted-foreground">Choose your email provider</p>
            {providers.map((p) => (
              <button
                key={p.id}
                onClick={() => handleProviderSelect(p.id)}
                className="flex w-full items-center gap-3 rounded-xl border border-border bg-card p-4 text-left transition-colors hover:bg-muted"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  {p.id === 'Google' ? 'G' : p.id === 'Microsoft 365' ? 'M' : p.id === 'Custom IMAP/SMTP' ? '@' : 'C'}
                </div>
                <div>
                  <div className="text-sm font-semibold text-foreground">{p.label}</div>
                  <div className="text-xs text-muted-foreground">{p.description}</div>
                </div>
              </button>
            ))}
            <button
              type="button"
              onClick={handleSkip}
              className="mt-4 w-full text-center text-xs text-muted-foreground hover:text-foreground"
            >
              Skip for now
            </button>
          </div>
        )}

        {step === 'details' && provider && (
          <form onSubmit={handleConnect} className="rounded-xl border border-border bg-card p-6 space-y-4">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <ShieldCheck className="h-4 w-4" />
              This connects an existing email mailbox to Codin. It does not create your Codin Account.
            </div>

            {provider === 'Custom IMAP/SMTP' && (
              <>
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-foreground">Email address</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@company.com"
                      className="h-10 w-full rounded-lg border border-input bg-background pl-9 pr-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="mb-1.5 block text-xs font-medium text-foreground">IMAP Server</label>
                    <div className="relative">
                      <Server className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <input
                        type="text"
                        value={imapServer}
                        onChange={(e) => setImapServer(e.target.value)}
                        placeholder="imap.example.com"
                        className="h-10 w-full rounded-lg border border-input bg-background pl-9 pr-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <label className="mb-1.5 block text-xs font-medium text-foreground">IMAP Port</label>
                    <input
                      type="text"
                      value={imapPort}
                      onChange={(e) => setImapPort(e.target.value)}
                      placeholder="993"
                      className="h-10 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="mb-1.5 block text-xs font-medium text-foreground">SMTP Server</label>
                    <div className="relative">
                      <Server className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <input
                        type="text"
                        value={smtpServer}
                        onChange={(e) => setSmtpServer(e.target.value)}
                        placeholder="smtp.example.com"
                        className="h-10 w-full rounded-lg border border-input bg-background pl-9 pr-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <label className="mb-1.5 block text-xs font-medium text-foreground">SMTP Port</label>
                    <input
                      type="text"
                      value={smtpPort}
                      onChange={(e) => setSmtpPort(e.target.value)}
                      placeholder="587"
                      className="h-10 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-medium text-foreground">Username</label>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="you@company.com"
                    className="h-10 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                    required
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-medium text-foreground">Password</label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="h-10 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                    required
                  />
                </div>
              </>
            )}

            {provider !== 'Custom IMAP/SMTP' && (
              <div className="rounded-lg border border-border bg-muted/50 p-4 text-center">
                <p className="text-xs text-muted-foreground">
                  You will be redirected to {provider} to authorize Codin to access your email.
                </p>
              </div>
            )}

            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={() => setStep('provider')} className="h-10 flex-1 text-sm">
                Back
              </Button>
              <Button type="submit" className="h-10 flex-1 text-sm font-semibold" disabled={isSubmitting}>
                {isSubmitting ? 'Connecting…' : 'Connect Email'}
              </Button>
            </div>
          </form>
        )}

        {step === 'success' && (
          <div className="rounded-xl border border-border bg-card p-6 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50 text-emerald-700">
              <CheckCircle2 className="h-6 w-6" />
            </div>
            <h2 className="text-sm font-semibold text-foreground">Email connected</h2>
            <p className="mt-2 text-xs text-muted-foreground">Your {provider} mailbox is now connected to this workspace.</p>
            <Button onClick={() => router.push('/f/inbox')} className="mt-6 h-10 w-full text-sm font-semibold">
              Go to inbox
            </Button>
          </div>
        )}

        {step !== 'success' && (
          <div className="mt-6 text-center">
            <button
              type="button"
              onClick={handleSkip}
              className="text-xs text-muted-foreground hover:text-foreground"
            >
              Skip for now
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
