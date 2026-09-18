import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { RouteGuard } from '@/app/components/route-guard';

const mockPush = vi.fn();
const mockReplace = vi.fn();
let currentPathname = '/';

vi.mock('next/navigation', () => ({
  usePathname: () => currentPathname,
  useRouter: () => ({
    push: mockPush,
    replace: mockReplace,
    prefetch: vi.fn(),
  }),
}));

let mockAuthState: {
  status: 'loading' | 'unauthenticated' | 'authenticated' | 'pending_verification';
  user: any;
} = {
  status: 'authenticated',
  user: { id: 'usr-1', email: 'test@example.com' },
};

vi.mock('@/lib/stores/auth-context', () => ({
  useAuth: () => mockAuthState,
}));

let mockWorkspaceState: {
  status: 'idle' | 'loading' | 'ready';
  workspaces: any[];
  activeWorkspace: any;
  loadWorkspaces: () => Promise<void>;
} = {
  status: 'ready',
  workspaces: [{ id: 'ws-1', name: 'Demo Workspace' }],
  activeWorkspace: { id: 'ws-1', name: 'Demo Workspace' },
  loadWorkspaces: vi.fn().mockResolvedValue(undefined),
};

vi.mock('@/lib/stores/workspace-context', () => ({
  useWorkspace: () => mockWorkspaceState,
}));

describe('RouteGuard Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    currentPathname = '/';
    mockAuthState = {
      status: 'authenticated',
      user: { id: 'usr-1', email: 'test@example.com' },
    };
    mockWorkspaceState = {
      status: 'ready',
      workspaces: [{ id: 'ws-1', name: 'Demo Workspace' }],
      activeWorkspace: { id: 'ws-1', name: 'Demo Workspace' },
      loadWorkspaces: vi.fn().mockResolvedValue(undefined),
    };
  });

  it('renders a loading spinner while auth is initializing on protected route', () => {
    mockAuthState.status = 'loading';
    currentPathname = '/dashboard';

    const { container } = render(
      <RouteGuard>
        <div>Protected Content</div>
      </RouteGuard>
    );

    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
    expect(container.querySelector('.animate-spin')).toBeInTheDocument();
    expect(mockReplace).not.toHaveBeenCalled();
  });

  it('redirects unauthenticated user from protected route to /sign-in', () => {
    mockAuthState.status = 'unauthenticated';
    currentPathname = '/dashboard';

    render(
      <RouteGuard>
        <div>Protected Content</div>
      </RouteGuard>
    );

    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
    expect(mockReplace).toHaveBeenCalledWith('/sign-in');
  });

  it('allows access to public paths even when unauthenticated', () => {
    mockAuthState.status = 'unauthenticated';
    currentPathname = '/sign-in';

    render(
      <RouteGuard>
        <div>Sign In Page</div>
      </RouteGuard>
    );

    expect(screen.getByText('Sign In Page')).toBeInTheDocument();
  });

  it('allows access to public recipient signing paths (/sign/r/:token)', () => {
    mockAuthState.status = 'unauthenticated';
    currentPathname = '/sign/r/token-12345';

    render(
      <RouteGuard>
        <div>Recipient Signing Screen</div>
      </RouteGuard>
    );

    expect(screen.getByText('Recipient Signing Screen')).toBeInTheDocument();
  });

  it('redirects user with no workspaces to /onboarding', () => {
    mockAuthState.status = 'authenticated';
    mockWorkspaceState.workspaces = [];
    mockWorkspaceState.activeWorkspace = null;
    mockWorkspaceState.status = 'ready';
    currentPathname = '/dashboard';

    render(
      <RouteGuard>
        <div>Dashboard</div>
      </RouteGuard>
    );

    expect(mockReplace).toHaveBeenCalledWith('/onboarding');
  });

  it('renders children when authenticated with an active workspace', () => {
    mockAuthState.status = 'authenticated';
    mockWorkspaceState.workspaces = [{ id: 'ws-1', name: 'Test' }];
    mockWorkspaceState.activeWorkspace = { id: 'ws-1', name: 'Test' };
    mockWorkspaceState.status = 'ready';
    currentPathname = '/dashboard';

    render(
      <RouteGuard>
        <div>Dashboard</div>
      </RouteGuard>
    );

    expect(screen.getByText('Dashboard')).toBeInTheDocument();
  });
});
