'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { BriefcaseBusiness, Plus, Users, ChevronDown, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/lib/stores/auth-context';
import { useWorkspace } from '@/lib/stores/workspace-context';

export default function OnboardingPage() {
  const router = useRouter();
  const { user, status, logout } = useAuth();
  const { workspaces, activeWorkspace, status: workspaceStatus, createWorkspace, joinWorkspace } = useWorkspace();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showJoinForm, setShowJoinForm] = useState(false);
  const [name, setName] = useState('');
  const [joinCode, setJoinCode] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [isJoining, setIsJoining] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [joinResult, setJoinResult] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.replace('/sign-in');
    }
  }, [status, router]);

  useEffect(() => {
    if (workspaceStatus === 'ready' && activeWorkspace) {
      router.replace(`/f/inbox`);
    }
  }, [workspaceStatus, activeWorkspace, router]);

  if (status === 'loading' || workspaceStatus === 'loading') {
    return <div className="flex min-h-screen items-center justify-center bg-background"><div className="text-sm text-muted-foreground">Loading workspace…</div></div>;
  }

  const handleCreateWorkspace = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!name.trim()) {
      setError('Workspace name is required.');
      return;
    }
    setIsCreating(true);
    try {
      const slug = name.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
      await createWorkspace({ name: name.trim(), slug, industry: 'Technology', country: 'Kenya', timezone: 'Africa/Nairobi', hasMailbox: false });
    } catch {
      setError('Failed to create workspace. Please try again.');
    } finally {
      setIsCreating(false);
    }
  };

  const handleJoinWorkspace = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setJoinResult(null);
    if (!joinCode.trim()) {
      setError('Enter an invitation code.');
      return;
    }
    setIsJoining(true);
    try {
      const result = await joinWorkspace(joinCode.trim());
      if (result.success) {
        setJoinResult({ type: 'success', message: `You joined ${result.workspace?.name ?? 'the workspace'}.` });
      } else {
        setJoinResult({ type: 'error', message: result.error || 'Failed to join workspace.' });
      }
    } catch {
      setJoinResult({ type: 'error', message: 'Something went wrong. Please try again.' });
    } finally {
      setIsJoining(false);
    }
  };

  const openWorkspace = (workspaceId: string) => {
    router.push(`/f/inbox`);
  };

  if (showCreateForm) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background p-6">
        <div className="w-full max-w-md">
          <div className="mb-8 text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-xl font-extrabold text-primary-foreground">
              C
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">Create your workspace</h1>
            <p className="mt-2 text-sm text-muted-foreground">A workspace is where your team works together</p>
          </div>

          <form onSubmit={handleCreateWorkspace} className="rounded-xl border border-border bg-card p-6 space-y-4">
            {error && (
              <div className="flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-xs text-destructive">
                {error}
              </div>
            )}

            <div>
              <label className="mb-1.5 block text-xs font-medium text-foreground">Workspace Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Codin Technology"
                className="h-10 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                required
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-medium text-foreground">Workspace URL / Slug</label>
              <input
                type="text"
                value={name.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')}
                readOnly
                className="h-10 w-full rounded-lg border border-input bg-muted px-3 text-sm text-muted-foreground"
              />
              <p className="mt-1 text-[11px] text-muted-foreground">Auto-generated from workspace name</p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1.5 block text-xs font-medium text-foreground">Industry</label>
                <select className="h-10 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20">
                  <option>Technology</option>
                  <option>Logistics</option>
                  <option>Finance</option>
                  <option>Healthcare</option>
                  <option>Education</option>
                  <option>Other</option>
                </select>
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium text-foreground">Country</label>
                <select className="h-10 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20">
                  <option>Kenya</option>
                  <option>United States</option>
                  <option>United Kingdom</option>
                  <option>Germany</option>
                  <option>Other</option>
                </select>
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-medium text-foreground">Timezone</label>
              <select className="h-10 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20">
                <option>Africa/Nairobi</option>
                <option>America/New_York</option>
                <option>Europe/London</option>
                <option>Europe/Berlin</option>
              </select>
            </div>

            <Button type="submit" className="h-10 w-full text-sm font-semibold" disabled={isCreating}>
              {isCreating ? 'Creating workspace…' : 'Create Workspace'}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <button
              type="button"
              onClick={() => setShowCreateForm(false)}
              className="text-xs text-muted-foreground hover:text-foreground"
            >
              Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (showJoinForm) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background p-6">
        <div className="w-full max-w-md">
          <div className="mb-8 text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-xl font-extrabold text-primary-foreground">
              C
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">Join a Workspace</h1>
            <p className="mt-2 text-sm text-muted-foreground">Enter the invitation code shared with you</p>
          </div>

          <form onSubmit={handleJoinWorkspace} className="rounded-xl border border-border bg-card p-6 space-y-4">
            {error && (
              <div className="flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-xs text-destructive">
                {error}
              </div>
            )}

            {joinResult && (
              <div className={`flex items-center gap-2 rounded-lg border p-3 text-xs ${joinResult.type === 'success' ? 'border-emerald-200 bg-emerald-50 text-emerald-800' : 'border-destructive/30 bg-destructive/5 text-destructive'}`}>
                {joinResult.type === 'success' ? <CheckCircle2 className="h-4 w-4 shrink-0" /> : <span className="text-sm">⚠️</span>}
                {joinResult.message}
              </div>
            )}

            <div>
              <label className="mb-1.5 block text-xs font-medium text-foreground">Invitation code</label>
              <input
                type="text"
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value)}
                placeholder="e.g. codin-workspace-2026"
                className="h-10 w-full rounded-lg border border-input bg-background px-3 text-sm uppercase tracking-wider outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
              <p className="mt-1 text-[11px] text-muted-foreground">Ask your workspace admin for the invitation code</p>
            </div>

            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={() => { setShowJoinForm(false); setJoinResult(null); }} className="h-10 flex-1 text-sm">
                Back
              </Button>
            <Button type="submit" className="h-10 flex-1 text-sm font-semibold" disabled={isJoining}>
              {isJoining ? 'Joining…' : 'Join Workspace'}
            </Button>
            </div>
          </form>

          <div className="mt-6 text-center">
            <button
              type="button"
              onClick={() => setShowJoinForm(false)}
              className="text-xs text-muted-foreground hover:text-foreground"
            >
              Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-6">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-xl font-extrabold text-primary-foreground">
            C
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Welcome to Codin</h1>
          <p className="mt-2 text-sm text-muted-foreground">Let&apos;s get your workspace ready</p>
          {user && (
            <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-muted px-3 py-1.5 text-xs text-muted-foreground">
              <span className="font-medium text-foreground">{user.name}</span>
              <span>·</span>
              <span>@{user.codinId}</span>
            </div>
          )}
        </div>

        {workspaces.length === 0 ? (
          <div className="space-y-3">
            <p className="text-center text-sm text-muted-foreground">You don&apos;t have any workspaces yet. Create one to get started.</p>

            <button
              onClick={() => setShowCreateForm(true)}
              className="flex w-full items-center gap-3 rounded-xl border border-border bg-card p-4 text-left transition-colors hover:bg-muted"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Plus className="h-5 w-5" />
              </div>
              <div>
                <div className="text-sm font-semibold text-foreground">Create a Workspace</div>
                <div className="text-xs text-muted-foreground">Start a new workspace for you and your team</div>
              </div>
            </button>

            <button
              onClick={() => setShowJoinForm(true)}
              className="flex w-full items-center gap-3 rounded-xl border border-border bg-card p-4 text-left transition-colors hover:bg-muted"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Users className="h-5 w-5" />
              </div>
              <div>
                <div className="text-sm font-semibold text-foreground">Join a Workspace</div>
                <div className="text-xs text-muted-foreground">Enter an invitation code to join an existing workspace</div>
              </div>
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-center text-sm text-muted-foreground">Choose a workspace to continue</p>

            {workspaces.map((workspace) => (
              <button
                key={workspace.id}
                onClick={() => openWorkspace(workspace.id)}
                className="flex w-full items-center gap-3 rounded-xl border border-border bg-card p-4 text-left transition-colors hover:bg-muted"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary text-lg font-bold text-primary-foreground">
                  {workspace.name[0]}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <div className="truncate text-sm font-semibold text-foreground">{workspace.name}</div>
                    <span className="shrink-0 rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-muted-foreground capitalize">
                      {workspace.role}
                    </span>
                  </div>
                  <div className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
                    <span>@{workspace.slug}</span>
                  </div>
                </div>
                <ChevronDown className="h-4 w-4 -rotate-90 text-muted-foreground" />
              </button>
            ))}

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setShowCreateForm(true)}
                className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-dashed border-border py-2.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                <Plus className="h-3.5 w-3.5" />
                Create Workspace
              </button>
              <button
                onClick={() => setShowJoinForm(true)}
                className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-dashed border-border py-2.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                <Users className="h-3.5 w-3.5" />
                Join Workspace
              </button>
            </div>
          </div>
        )}

        <div className="mt-8 text-center">
          <button
            type="button"
            onClick={() => {
              logout();
              router.push('/sign-in');
            }}
            className="text-xs text-muted-foreground hover:text-foreground"
          >
            Sign out
          </button>
        </div>
      </div>
    </div>
  );
}
