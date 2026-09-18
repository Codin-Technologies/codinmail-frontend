'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { BriefcaseBusiness, ChevronDown, Plus, Users, Mail, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/lib/stores/auth-context';
import { useWorkspace } from '@/lib/stores/workspace-context';

export default function WorkspaceSelectPage() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const { workspaces, activeWorkspace, status, switchWorkspace } = useWorkspace();
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    if (status === 'loading') return;
    if (!user) {
      router.replace('/sign-in');
    }
  }, [user, status, router]);

  useEffect(() => {
    if (activeWorkspace) {
      router.replace(`/f/inbox`);
    }
  }, [activeWorkspace, router]);

  const handleLogout = async () => {
    await logout();
    router.replace('/sign-in');
  };

  if (status === 'loading') {
    return <div className="flex min-h-screen items-center justify-center bg-background"><div className="text-sm text-muted-foreground">Loading workspaces…</div></div>;
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-6">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-xl font-extrabold text-primary-foreground">
            C
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Choose a workspace</h1>
          <p className="mt-2 text-sm text-muted-foreground">Select where you want to work</p>
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
            <p className="text-center text-sm text-muted-foreground">You don&apos;t have access to any workspaces yet.</p>
            <div className="flex gap-2">
              <Link href="/onboarding/create-workspace" className="flex-1">
                <Button className="h-10 w-full text-sm font-semibold">
                  <Plus className="mr-2 h-4 w-4" />
                  Create Workspace
                </Button>
              </Link>
              <Link href="/onboarding/join-workspace" className="flex-1">
                <Button variant="outline" className="h-10 w-full text-sm font-semibold">
                  <Users className="mr-2 h-4 w-4" />
                  Join Workspace
                </Button>
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {workspaces.map((workspace) => (
              <button
                key={workspace.id}
                onClick={() => switchWorkspace(workspace.id)}
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
              <Link href="/onboarding/create-workspace" className="flex-1">
                <Button variant="outline" className="h-9 w-full text-xs font-semibold">
                  <Plus className="mr-1.5 h-3.5 w-3.5" />
                  Create Workspace
                </Button>
              </Link>
              <Link href="/onboarding/join-workspace" className="flex-1">
                <Button variant="outline" className="h-9 w-full text-xs font-semibold">
                  <Users className="mr-1.5 h-3.5 w-3.5" />
                  Join Workspace
                </Button>
              </Link>
            </div>
          </div>
        )}

        <div className="mt-8 flex items-center justify-between border-t border-border pt-4">
          <div className="relative">
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-primary">
                {user?.name?.[0]?.toUpperCase()}
              </div>
              <span>{user?.name}</span>
              <ChevronDown className="h-3.5 w-3.5" />
            </button>

            {menuOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setMenuOpen(false)} />
                <div className="absolute bottom-10 left-0 z-50 w-56 rounded-lg border border-border bg-card p-2 shadow-xl">
                  <div className="border-b border-border px-2 py-2">
                    <div className="text-xs font-semibold text-foreground">{user?.name}</div>
                    <div className="text-[11px] text-muted-foreground">@{user?.codinId}</div>
                    <div className="mt-1 text-[11px] text-muted-foreground">{user?.email}</div>
                  </div>
                  <Link href="/settings/account" onClick={() => setMenuOpen(false)} className="flex h-8 items-center gap-2 rounded px-2 text-xs text-foreground hover:bg-muted">
                    <Mail className="h-3.5 w-3.5 text-muted-foreground" />
                    Account Settings
                  </Link>
                  <button onClick={handleLogout} className="flex h-8 w-full items-center gap-2 rounded px-2 text-left text-xs text-muted-foreground hover:bg-muted hover:text-foreground">
                    <LogOut className="h-3.5 w-3.5" />
                    Sign Out
                  </button>
                </div>
              </>
            )}
          </div>

          <Link href="/sign-in">
            <button className="text-xs text-muted-foreground hover:text-foreground">
              Sign Out
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}
