'use client';

import { useAuth } from '@/lib/stores/auth-context';
import { useWorkspace } from '@/lib/stores/workspace-context';
import { useTheme } from '@/lib/stores/theme-context';
import { WorkspaceSwitcher } from '@/app/components/workspace-switcher';
import { MailboxEmptyState } from '@/app/components/mailbox-empty-state';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import {
  Inbox,
  Star,
  Send,
  PenLine,
  Archive,
  Trash2,
  MessageCircle,
  Users,
  CalendarDays,
  Video,
  FileText,
  Check,
  Sparkles,
  Search,
  Settings,
  LogOut,
  ChevronDown,
  PanelLeftClose,
   PanelLeftOpen,
   FileSignature,
 } from 'lucide-react';

type Workspace = 'mail' | 'chat' | 'contacts' | 'calendar' | 'meet' | 'files' | 'tasks' | 'ai' | 'sign';

const globalWorkspaces = [
  { label: 'Mail', value: 'mail' as const, icon: Inbox },
  { label: 'Chat', value: 'chat' as const, icon: MessageCircle },
  { label: 'Contacts', value: 'contacts' as const, icon: Users },
  { label: 'Calendar', value: 'calendar' as const, icon: CalendarDays },
  { label: 'Meet', value: 'meet' as const, icon: Video },
  { label: 'Files', value: 'files' as const, icon: FileText },
  { label: 'Tasks', value: 'tasks' as const, icon: Check },
  { label: 'AI Assistant', value: 'ai' as const, icon: Sparkles },
  { label: 'Sign', value: 'sign' as const, icon: FileSignature },
];

const mailFolders = [
  { label: 'Inbox', icon: Inbox, href: '/f/inbox' },
  { label: 'Starred', icon: Star, href: '/f/starred' },
  { label: 'Sent', icon: Send, href: '/f/sent' },
  { label: 'Drafts', icon: PenLine, href: '/f/drafts' },
  { label: 'Archive', icon: Archive, href: '/f/archive' },
  { label: 'Trash', icon: Trash2, href: '/f/trash' },
];

interface WorkspaceShellProps {
  children: React.ReactNode;
  currentWorkspace?: Workspace;
  hasMailbox?: boolean;
}

export function WorkspaceShell({ children, currentWorkspace = 'mail', hasMailbox = false }: WorkspaceShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();
  const { activeWorkspace, workspaces } = useWorkspace();
  const { accent } = useTheme();
  const [railCollapsed, setRailCollapsed] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  useEffect(() => {
    if (!user) {
      router.push('/sign-in');
    }
  }, [user, router]);

  const handleLogout = async () => {
    await logout();
    router.push('/sign-in');
  };

  if (!user || !activeWorkspace) {
    return <div className="flex min-h-screen items-center justify-center bg-background"><div className="text-sm text-muted-foreground">Loading workspace…</div></div>;
  }

  return (
    <div className="workspace-shell flex h-screen w-full" style={{ '--accent-color': accent } as React.CSSProperties}>
      <GlobalRail
        currentWorkspace={currentWorkspace}
        collapsed={railCollapsed}
        onToggle={() => setRailCollapsed((v) => !v)}
         onWorkspaceChange={(ws) => {
           if (ws === 'mail') router.push('/f/inbox');
           else if (ws === 'chat') router.push('/chat');
           else if (ws === 'calendar') router.push('/calendar');
           else if (ws === 'meet') router.push('/meet');
           else if (ws === 'files') router.push('/files');
           else if (ws === 'tasks') router.push('/tasks');
           else if (ws === 'contacts') router.push('/contacts');
           else if (ws === 'sign') router.push('/sign');
         }}
        profileOpen={profileOpen}
        onProfileToggle={() => setProfileOpen((v) => !v)}
        onLogout={handleLogout}
        router={router}
        user={user}
      />
      {currentWorkspace === 'mail' && !hasMailbox ? (
        <MailboxEmptyState />
      ) : (
        <>
          {currentWorkspace === 'mail' && (
            <ContextSidebar
              collapsed={sidebarCollapsed}
              onToggle={() => setSidebarCollapsed((v) => !v)}
              currentWorkspace={currentWorkspace}
              activeWorkspace={activeWorkspace}
            />
          )}
          <div className="workspace-main flex min-w-0 flex-1 flex-col overflow-hidden">
            {sidebarCollapsed && currentWorkspace === 'mail' && (
              <button
                className="sidebar-expand"
                onClick={() => setSidebarCollapsed(false)}
                aria-label="Expand sidebar"
              >
                <PanelLeftOpen size={16} />
              </button>
            )}
            <main className="flex min-w-0 flex-1 flex-col overflow-hidden">{children}</main>
          </div>
        </>
      )}
    </div>
  );
}

function GlobalRail({ currentWorkspace, collapsed, onToggle, onWorkspaceChange, profileOpen, onProfileToggle, onLogout, router, user }: {
  currentWorkspace: Workspace;
  collapsed: boolean;
  onToggle: () => void;
  onWorkspaceChange: (workspace: Workspace) => void;
  profileOpen: boolean;
  onProfileToggle: () => void;
  onLogout: () => void;
  router: ReturnType<typeof useRouter>;
  user: { name?: string; codinId?: string } | null;
}) {
  return (
    <aside className="global-rail">
      <div className="brand-mark" aria-label="Codin" title="Codin">C</div>
      <div className="rail-contexts">
        {globalWorkspaces.map(({ label, value, icon: Icon }) => (
          <button
            key={value}
            onClick={() => onWorkspaceChange(value)}
            className={`rail-item ${currentWorkspace === value ? 'active' : ''}`}
            aria-label={label}
            title={collapsed ? label : undefined}
          >
            <Icon size={19} />
            {!collapsed && <span>{label}</span>}
          </button>
        ))}
      </div>
      <div className="rail-bottom">
        <button className="rail-item" onClick={onToggle} aria-label={collapsed ? 'Expand' : 'Collapse'} title={collapsed ? 'Expand' : 'Collapse'}>
          {collapsed ? <PanelLeftOpen size={19} /> : <PanelLeftClose size={19} />}
          {!collapsed && <span>{collapsed ? 'Expand' : 'Collapse'}</span>}
        </button>
        <div className="relative">
          <button
            onClick={onProfileToggle}
            className="profile-button rail-profile"
            aria-label="Open account menu"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-xs font-bold text-primary">
              {user?.name?.[0]?.toUpperCase()}
            </div>
            {!collapsed && <ChevronDown size={14} />}
          </button>
          {profileOpen && (
            <>
              <div className="fixed inset-0 z-40" onClick={onProfileToggle} />
              <div className="absolute bottom-11 left-0 z-50 w-52 rounded-lg border border-border bg-card p-2 shadow-xl">
                <div className="border-b border-border px-2 py-2">
                  <div className="text-xs font-semibold text-foreground">{user?.name}</div>
                  <div className="text-[11px] text-muted-foreground">@{user?.codinId}</div>
                </div>
                <button onClick={() => { onProfileToggle(); router.push('/settings/account'); }} className="flex h-8 w-full items-center gap-2 rounded px-2 text-left text-xs text-foreground hover:bg-muted">
                  <Settings size={14} className="text-muted-foreground" />
                  Settings
                </button>
                <button onClick={onLogout} className="flex h-8 w-full items-center gap-2 rounded px-2 text-left text-xs text-muted-foreground hover:bg-muted hover:text-foreground">
                  <LogOut size={14} />
                  Sign Out
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </aside>
  );
}

function ContextSidebar({ collapsed, onToggle, currentWorkspace, activeWorkspace }: { collapsed: boolean; onToggle: () => void; currentWorkspace: Workspace; activeWorkspace: { name?: string } | null }) {
  const isMail = currentWorkspace === 'mail';
  return (
    <aside className="context-sidebar">
      <div className="context-heading">
        <div>
          <span className="eyebrow">{activeWorkspace?.name ?? 'Workspace'}</span>
          <h2>{isMail ? 'Mail' : currentWorkspace}</h2>
        </div>
        <button className="icon-button" onClick={onToggle} aria-label={collapsed ? 'Expand' : 'Collapse'}>
          {collapsed ? <PanelLeftOpen size={17} /> : <PanelLeftClose size={17} />}
        </button>
      </div>
      {isMail ? (
        <>
          <Link href="/f/inbox/new" className="compose-button">
            <PenLine size={16} /> Compose email
          </Link>
          <nav className="context-nav" aria-label="Mail folders">
            <p className="nav-label">Folders</p>
            {mailFolders.map(({ label, icon: Icon, href }) => (
              <Link key={label} href={href} className="context-link">
                <Icon size={16} />
                <span>{label}</span>
              </Link>
            ))}
          </nav>
        </>
      ) : (
        <div className="context-nav">
          <p className="nav-label">Workspace</p>
          <button className="context-link active">
            <FileText size={16} />
            <span>Home</span>
          </button>
        </div>
      )}
      <div className="sidebar-footer">
        <Settings size={15} />
        <span>Codin workspace</span>
      </div>
    </aside>
  );
}
