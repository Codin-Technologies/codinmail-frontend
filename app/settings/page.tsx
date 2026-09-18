'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  UserRound,
  ShieldCheck,
  Mail,
  BriefcaseBusiness,
  ChevronDown,
  LogOut,
  Users,
  Globe2,
  Plus,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/lib/stores/auth-context';
import { useWorkspace } from '@/lib/stores/workspace-context';
import { DomainsTabContent } from './domains-tab';

type SettingsTab = 'profile' | 'security' | 'workspace' | 'members' | 'domains' | 'mailboxes';

export default function SettingsPage() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const { activeWorkspace, workspaces, switchWorkspace } = useWorkspace();
  const [tab, setTab] = useState<SettingsTab>('profile');
  const [profileName, setProfileName] = useState(user?.displayName ?? '');
  const [saved, setSaved] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    if (!user) router.push('/sign-in');
  }, [user, router]);

  const tabs: { id: SettingsTab; label: string; icon: typeof UserRound }[] = [
    { id: 'profile', label: 'Profile', icon: UserRound },
    { id: 'security', label: 'Security', icon: ShieldCheck },
    { id: 'workspace', label: 'Workspace', icon: BriefcaseBusiness },
    { id: 'members', label: 'Members', icon: Users },
    { id: 'domains', label: 'Domains', icon: Globe2 },
    { id: 'mailboxes', label: 'Mailboxes', icon: Mail },
  ];

  const handleLogout = async () => {
    await logout();
    router.push('/sign-in');
  };

  const renderContent = () => {
    if (!activeWorkspace) {
      return <div className="text-sm text-muted-foreground">Select a workspace to view settings.</div>;
    }

    switch (tab) {
      case 'profile':
        return (
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-semibold text-foreground">Profile</h3>
              <p className="text-xs text-muted-foreground">Your public identity across Codin.</p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-xs font-medium text-foreground">Name</label>
                <input
                  value={profileName}
                  onChange={(e) => setProfileName(e.target.value)}
                  className="h-9 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium text-foreground">Codin ID</label>
                <input
                  value={user?.codinId ?? ''}
                  disabled
                  className="h-9 w-full rounded-lg border border-input bg-muted px-3 text-sm text-muted-foreground"
                />
                <p className="mt-1 text-[11px] text-muted-foreground">Cannot be changed</p>
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium text-foreground">Account email</label>
                <input
                  value={user?.email ?? ''}
                  disabled
                  className="h-9 w-full rounded-lg border border-input bg-muted px-3 text-sm text-muted-foreground"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium text-foreground">Timezone</label>
                <select className="h-9 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20">
                  <option>Africa/Nairobi</option>
                  <option>America/New_York</option>
                  <option>Europe/London</option>
                </select>
              </div>
            </div>
            <div className="flex items-center justify-end gap-2 border-t border-border pt-4">
              {saved && <span className="text-xs text-emerald-700">Saved</span>}
              <Button onClick={() => setSaved(true)} className="h-9 text-xs font-semibold">
                Save changes
              </Button>
            </div>
          </div>
        );

      case 'security':
        return (
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-semibold text-foreground">Security</h3>
              <p className="text-xs text-muted-foreground">Password, sessions, and account protection.</p>
            </div>
            <section className="rounded-lg border border-border bg-card p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs font-medium text-foreground">Password</div>
                  <div className="text-[11px] text-muted-foreground">Last changed 30 days ago</div>
                </div>
                <Button variant="outline" className="h-8 text-xs">Change Password</Button>
              </div>
              <div className="border-t border-border pt-3 flex items-center justify-between">
                <div>
                  <div className="text-xs font-medium text-foreground">Two-factor authentication</div>
                  <div className="text-[11px] text-muted-foreground">Not enabled</div>
                </div>
                <Button variant="outline" className="h-8 text-xs">Enable</Button>
              </div>
              <div className="border-t border-border pt-3 flex items-center justify-between">
                <div>
                  <div className="text-xs font-medium text-foreground">Active sessions</div>
                  <div className="text-[11px] text-muted-foreground">Windows · Chrome</div>
                </div>
                <Button variant="outline" className="h-8 text-xs">Sign out others</Button>
              </div>
            </section>
          </div>
        );

      case 'workspace':
        return (
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-semibold text-foreground">Workspace settings</h3>
              <p className="text-xs text-muted-foreground">General settings for {activeWorkspace.name}.</p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-xs font-medium text-foreground">Workspace name</label>
                <input
                  defaultValue={activeWorkspace.name}
                  className="h-9 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium text-foreground">Workspace slug</label>
                <input
                  defaultValue={activeWorkspace.slug}
                  disabled
                  className="h-9 w-full rounded-lg border border-input bg-muted px-3 text-sm text-muted-foreground"
                />
              </div>
            </div>
            <div className="flex items-center justify-end gap-2 border-t border-border pt-4">
              <Button className="h-9 text-xs font-semibold">Save changes</Button>
            </div>
          </div>
        );

      case 'members':
        return (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-foreground">Members</h3>
                <p className="text-xs text-muted-foreground">People in this workspace.</p>
              </div>
              <Button className="h-8 text-xs font-semibold">
                <Users className="mr-1.5 h-3.5 w-3.5" />
                Invite
              </Button>
            </div>
            <div className="space-y-2">
              {[
                { name: 'Kelvin Kijazi', email: 'kelvin@example.com', role: 'Owner' },
                { name: 'John Smith', email: 'john@fleetco.example', role: 'Admin' },
                { name: 'Mary Jones', email: 'mary@fleetco.example', role: 'Member' },
              ].map((member) => (
                <div key={member.email} className="flex items-center justify-between rounded-lg border border-border bg-card px-4 py-3">
                  <div>
                    <div className="text-xs font-medium text-foreground">{member.name}</div>
                    <div className="text-[11px] text-muted-foreground">{member.email}</div>
                  </div>
                  <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground">{member.role}</span>
                </div>
              ))}
            </div>
          </div>
        );

      case 'domains':
        return (
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-semibold text-foreground">Domains</h3>
              <p className="text-xs text-muted-foreground">Email domains for this workspace.</p>
            </div>
            <DomainsTabContent activeWorkspace={activeWorkspace} />
          </div>
        );

      case 'mailboxes':
        return (
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-semibold text-foreground">Mailboxes</h3>
              <p className="text-xs text-muted-foreground">Connected email accounts for this workspace.</p>
            </div>
            <div className="rounded-lg border border-dashed border-border bg-card p-6 text-center">
              <Mail className="mx-auto h-8 w-8 text-muted-foreground" />
              <h4 className="mt-3 text-sm font-semibold text-foreground">No mailboxes connected</h4>
              <p className="mt-1 text-xs text-muted-foreground">Connect an email account to start managing email from this workspace.</p>
              <div className="mt-4 flex justify-center gap-2">
                <Button onClick={() => router.push('/mailbox/connect')} className="h-8 text-xs font-semibold">
                  Connect Email
                </Button>
                <Button variant="outline" onClick={() => router.push('/f/inbox')} className="h-8 text-xs">
                  Maybe later
                </Button>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  if (!user) return null;

  return (
    <div className="flex min-h-screen bg-background">
      <aside className="flex w-60 flex-col border-r border-border bg-card p-3">
        <div className="mb-4 flex items-center gap-2 px-2">
          <div className="grid h-8 w-8 place-items-center rounded-md bg-primary text-sm font-bold text-primary-foreground">C</div>
          <span className="text-xs font-semibold tracking-tight">CODIN</span>
        </div>
        <nav className="space-y-1">
          {tabs.map((item) => (
            <button
              key={item.id}
              onClick={() => setTab(item.id)}
              className={`flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-xs ${tab === item.id ? 'bg-accent font-semibold text-accent-foreground' : 'text-muted-foreground hover:bg-muted hover:text-foreground'}`}
            >
              <item.icon size={15} />
              {item.label}
            </button>
          ))}
        </nav>
        <div className="mt-auto border-t border-border pt-3">
          <div className="relative">
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-xs text-muted-foreground hover:bg-muted hover:text-foreground"
            >
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-primary">
                {user?.displayName?.[0]?.toUpperCase() ?? '?'}
              </div>
              <div className="min-w-0 flex-1">
                <div className="truncate font-medium text-foreground">{user?.displayName}</div>
                <div className="truncate text-[11px]">@{user.codinId}</div>
              </div>
              <ChevronDown className="h-3.5 w-3.5 shrink-0" />
            </button>
            {menuOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setMenuOpen(false)} />
                <div className="absolute bottom-10 left-0 z-50 w-56 rounded-lg border border-border bg-card p-2 shadow-xl">
                  <div className="border-b border-border px-2 py-2">
                    <div className="text-xs font-semibold text-foreground">{user?.displayName}</div>
                    <div className="text-[11px] text-muted-foreground">@{user.codinId}</div>
                  </div>
                  <button onClick={() => { setMenuOpen(false); router.push('/settings/account'); }} className="flex h-8 w-full items-center gap-2 rounded px-2 text-left text-xs text-foreground hover:bg-muted">
                    <Mail className="h-3.5 w-3.5 text-muted-foreground" />
                    Account Settings
                  </button>
                  <button onClick={handleLogout} className="flex h-8 w-full items-center gap-2 rounded px-2 text-left text-xs text-muted-foreground hover:bg-muted hover:text-foreground">
                    <LogOut className="h-3.5 w-3.5" />
                    Sign Out
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </aside>

      <main className="min-w-0 flex-1 overflow-auto p-6 lg:p-8">
        <div className="mx-auto max-w-3xl">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <div className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                {activeWorkspace?.name}
              </div>
              <h1 className="mt-1 text-xl font-semibold tracking-tight text-foreground">
                {tabs.find((t) => t.id === tab)?.label}
              </h1>
            </div>
            {activeWorkspace && (
              <div className="relative">
                <select
                  value={activeWorkspace.id}
                  onChange={(e) => switchWorkspace(e.target.value)}
                  className="h-9 rounded-lg border border-input bg-background px-3 pr-8 text-xs outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                >
                  {workspaces.map((ws) => (
                    <option key={ws.id} value={ws.id}>{ws.name}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground pointer-events-none" />
              </div>
            )}
          </div>
          {renderContent()}
        </div>
      </main>
    </div>
  );
}
