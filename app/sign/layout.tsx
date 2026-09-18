'use client';

import { QueryProvider } from '@/lib/api/query-provider';
import { SignSidebar } from '@/lib/features/sign/components/sign-sidebar';
import { WorkspaceProvider } from '@/lib/stores/workspace-context';
import { ReactNode } from 'react';

export default function SignLayout({ children }: { children: ReactNode }) {
  return (
    <QueryProvider>
      <WorkspaceProvider>
        <div className="flex h-screen w-full">
          <SignSidebar />
          <main className="flex-1 overflow-hidden">{children}</main>
        </div>
      </WorkspaceProvider>
    </QueryProvider>
  );
}
