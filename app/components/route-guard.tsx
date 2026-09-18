'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useAuth } from '@/lib/stores/auth-context';
import { useWorkspace } from '@/lib/stores/workspace-context';

const PUBLIC_PATHS = ['/sign-in', '/sign-up', '/forgot-password', '/reset-password', '/verify-email'];

function isPublicPath(pathname: string): boolean {
  if (PUBLIC_PATHS.includes(pathname)) return true;
  if (pathname.startsWith('/sign/r/')) return true;
  return false;
}

export function RouteGuard({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { status: authStatus, user } = useAuth();
  const { workspaces, activeWorkspace, status: workspaceStatus, loadWorkspaces } = useWorkspace();

  const isPublic = isPublicPath(pathname);
  const isAuthPage =
    pathname.startsWith('/sign-in') ||
    pathname.startsWith('/sign-up') ||
    pathname.startsWith('/forgot-password') ||
    pathname.startsWith('/reset-password');
  const isSettingsPage = pathname.startsWith('/settings');
  const isOnboardingPage = pathname.startsWith('/onboarding');
  const isWorkspaceSelectPage = pathname.startsWith('/workspaces/select');

  // Trigger workspace loading as soon as authenticated user is present
  useEffect(() => {
    if (authStatus === 'authenticated' && user && workspaceStatus === 'idle') {
      loadWorkspaces();
    }
  }, [authStatus, user, workspaceStatus, loadWorkspaces]);

  // Route protection and redirection
  useEffect(() => {
    if (authStatus === 'loading') {
      return;
    }

    if (authStatus === 'unauthenticated' && !isPublic) {
      router.replace('/sign-in');
      return;
    }

    if (authStatus === 'pending_verification') {
      if (pathname !== '/verify-email') {
        router.replace('/verify-email');
      }
      return;
    }

    if (authStatus === 'authenticated') {
      // If on an auth page, redirect away
      if (isAuthPage) {
        if (workspaces.length === 0 && workspaceStatus === 'ready') {
          router.replace('/onboarding');
        } else if (activeWorkspace) {
          router.replace('/');
        } else if (workspaces.length > 0) {
          router.replace('/workspaces/select');
        } else {
          router.replace('/');
        }
        return;
      }

      // App page checks once workspaces are loaded
      if (!isPublic && !isSettingsPage && !isOnboardingPage && !isWorkspaceSelectPage) {
        if (workspaceStatus === 'ready') {
          if (workspaces.length === 0) {
            router.replace('/onboarding');
          } else if (!activeWorkspace) {
            router.replace('/workspaces/select');
          }
        }
      }
    }
  }, [
    authStatus,
    pathname,
    router,
    isPublic,
    isAuthPage,
    isSettingsPage,
    isOnboardingPage,
    isWorkspaceSelectPage,
    workspaceStatus,
    workspaces.length,
    activeWorkspace,
  ]);

  // Prevent flash of protected content while auth is initializing
  if (authStatus === 'loading' && !isPublic) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center bg-background">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  // Prevent flash while unauthenticated user on protected route is being redirected
  if (authStatus === 'unauthenticated' && !isPublic) {
    return null;
  }

  // Prevent flash of workspace app shell while workspace status is loading on protected route
  if (
    authStatus === 'authenticated' &&
    workspaceStatus === 'loading' &&
    !isPublic &&
    !isSettingsPage &&
    !isOnboardingPage &&
    !isWorkspaceSelectPage
  ) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center bg-background">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  return <>{children}</>;
}

