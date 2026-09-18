'use client';

import { usePathname, useRouter } from 'next/navigation';
import {
  Check,
  FileText,
  Inbox,
  LayoutDashboard,
  PenLine,
  Send,
  Settings,
  Users,
  Clock,
  BarChart3,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const signNavItems = [
  { label: 'Dashboard', icon: LayoutDashboard, href: '/sign' },
  { label: 'All Requests', icon: Inbox, href: '/sign/all' },
  { label: 'Drafts', icon: PenLine, href: '/sign/draft' },
  { label: 'Sent', icon: Send, href: '/sign/sent' },
  { label: 'In Progress', icon: Clock, href: '/sign/in-progress' },
  { label: 'Completed', icon: Check, href: '/sign/completed' },
  { label: 'Declined', icon: FileText, href: '/sign/declined' },
  { label: 'Expired', icon: Clock, href: '/sign/expired' },
  { label: 'Settings', icon: Settings, href: '/sign/settings' },
] as const;

export function SignSidebar({
  collapsed = false,
  onToggle,
}: {
  collapsed?: boolean;
  onToggle?: () => void;
}) {
  return (
    <aside
      className={cn(
        'flex h-full flex-col border-r border-border bg-card',
        collapsed ? 'w-[60px]' : 'w-[232px]'
      )}
    >
      <div className="h-14 border-b border-border px-3.5 py-2.5">
        <div className="flex items-center gap-2">
          <span className="grid h-7 w-7 place-items-center rounded-lg bg-primary text-xs font-bold text-primary-foreground">
            S
          </span>
          {!collapsed && <span className="text-sm font-semibold">Sign</span>}
        </div>
      </div>
      <nav className="flex-1 overflow-y-auto py-2">
        {signNavItems.map(({ label, icon: Icon, href }) => (
          <SignNavItem key={href} href={href} label={label} icon={Icon} collapsed={collapsed} />
        ))}
      </nav>
    </aside>
  );
}

function SignNavItem({
  href,
  label,
  icon: Icon,
  collapsed,
}: {
  href: string;
  label: string;
  icon: typeof LayoutDashboard;
  collapsed: boolean;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const active = pathname === href || pathname.startsWith(href + '/');

  return (
    <button
      onClick={() => router.push(href)}
      className={cn(
        'flex w-full items-center gap-2.5 rounded-md mx-2 my-0.5 px-2.5 py-1.5 text-sm font-medium transition-colors',
        active
          ? 'bg-primary/10 text-primary'
          : 'text-muted-foreground hover:bg-muted hover:text-foreground'
      )}
      aria-current={active ? 'page' : undefined}
    >
      <Icon size={16} />
      {!collapsed && <span>{label}</span>}
    </button>
  );
}

export const signNav = signNavItems;
