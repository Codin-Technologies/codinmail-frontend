'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/stores/auth-context';
import { useWorkspace } from '@/lib/stores/workspace-context';
import Loading from './loading';

export default function HomePage() {
  const router = useRouter();
  const { user, status: authStatus } = useAuth();
  const { workspaces, activeWorkspace, status: workspaceStatus } = useWorkspace();

  useEffect(() => {
    if (authStatus === 'loading' || workspaceStatus === 'loading') return;

    if (!user) {
      router.replace('/sign-in');
      return;
    }

    if (workspaces.length === 0) {
      router.replace('/onboarding');
      return;
    }

    if (activeWorkspace) {
      router.replace('/f/inbox');
      return;
    }

    if (workspaces.length > 0 && !activeWorkspace) {
      router.replace('/workspaces/select');
      return;
    }
  }, [user, authStatus, workspaceStatus, workspaces.length, activeWorkspace, router]);

  return <Loading />;
}
