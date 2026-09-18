'use client';

import { useState } from 'react';
import { ChevronDown, Plus, Users } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useWorkspace } from '@/lib/stores/workspace-context';

export function WorkspaceSwitcher() {
  const router = useRouter();
  const { workspaces, activeWorkspace, switchWorkspace } = useWorkspace();
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 rounded-md px-2 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-muted"
      >
        <span className="grid h-5 w-5 place-items-center rounded bg-primary text-[10px] font-bold text-primary-foreground">
          {activeWorkspace?.name?.[0]?.toUpperCase() ?? 'W'}
        </span>
        <span className="max-w-[120px] truncate">{activeWorkspace?.name ?? 'Workspace'}</span>
        <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute left-0 top-10 z-50 w-64 rounded-lg border border-border bg-card p-2 shadow-xl">
            <div className="border-b border-border px-2 py-2">
              <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Workspaces</div>
            </div>
            <div className="mt-1 max-h-64 overflow-auto">
              {workspaces.map((workspace) => (
                <button
                  key={workspace.id}
                  onClick={() => {
                    switchWorkspace(workspace.id);
                    setOpen(false);
                  }}
                  className={`flex w-full items-center gap-2 rounded-md px-2 py-2 text-left hover:bg-muted ${activeWorkspace?.id === workspace.id ? 'bg-accent' : ''}`}
                >
                  <span className="grid h-7 w-7 place-items-center rounded bg-primary/10 text-xs font-bold text-primary">
                    {workspace.name[0]}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="text-xs font-medium text-foreground">{workspace.name}</div>
                    <div className="text-[11px] text-muted-foreground capitalize">{workspace.role}</div>
                  </div>
                  {activeWorkspace?.id === workspace.id && (
                    <span className="text-[10px] font-medium text-primary">Active</span>
                  )}
                </button>
              ))}
            </div>
            <div className="mt-2 border-t border-border pt-2">
              <button
                onClick={() => { setOpen(false); router.push('/onboarding/create-workspace'); }}
                className="flex w-full items-center gap-2 rounded-md px-2 py-2 text-left text-xs text-foreground hover:bg-muted"
              >
                <Plus className="h-3.5 w-3.5 text-muted-foreground" />
                Create Workspace
              </button>
              <button
                onClick={() => { setOpen(false); router.push('/onboarding/join-workspace'); }}
                className="flex w-full items-center gap-2 rounded-md px-2 py-2 text-left text-xs text-foreground hover:bg-muted"
              >
                <Users className="h-3.5 w-3.5 text-muted-foreground" />
                Join Workspace
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
