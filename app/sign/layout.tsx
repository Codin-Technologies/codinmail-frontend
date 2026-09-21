'use client';

import { SignSidebar } from '@/lib/features/sign/components/sign-sidebar';
import { ReactNode } from 'react';

export default function SignLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex h-screen w-full">
      <SignSidebar />
      <main className="flex-1 overflow-hidden">{children}</main>
    </div>
  );
}
