'use client';

import React, { createContext, useContext, useReducer, useCallback, useEffect } from 'react';
import type { Workspace, CreateWorkspaceInput } from '@/lib/features/workspace/api/workspace.types';
import { getWorkspaceApi } from '@/lib/features/workspace/api/workspace.client';

interface WorkspaceStateValue {
  activeWorkspace: Workspace | null;
  workspaces: Workspace[];
  status: 'idle' | 'loading' | 'ready';
  error: string | null;
}

type WorkspaceAction =
  | { type: 'SET_LOADING' }
  | { type: 'SET_WORKSPACES'; workspaces: Workspace[] }
  | { type: 'SET_ACTIVE'; workspace: Workspace | null }
  | { type: 'ADD_WORKSPACE'; workspace: Workspace }
  | { type: 'SET_ERROR'; error: string | null }
  | { type: 'CLEAR_ERROR' };

const initialState: WorkspaceStateValue = {
  activeWorkspace: null,
  workspaces: [],
  status: 'idle',
  error: null,
};

function workspaceReducer(state: WorkspaceStateValue, action: WorkspaceAction): WorkspaceStateValue {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, status: 'loading', error: null };
    case 'SET_WORKSPACES':
      return { ...state, workspaces: action.workspaces, status: 'ready', error: null };
    case 'SET_ACTIVE':
      return { ...state, activeWorkspace: action.workspace, status: 'ready' };
    case 'ADD_WORKSPACE':
      return { ...state, workspaces: [...state.workspaces, action.workspace], status: 'ready' };
    case 'SET_ERROR':
      return { ...state, error: action.error, status: 'ready' };
    case 'CLEAR_ERROR':
      return { ...state, error: null };
    default:
      return state;
  }
}

interface CreateWorkspaceRequest {
  name: string;
  slug: string;
  description?: string;
  industry?: string;
  country?: string;
  timezone?: string;
  hasMailbox?: boolean;
}

interface WorkspaceContextValue extends WorkspaceStateValue {
  loadWorkspaces: () => Promise<void>;
  createWorkspace: (input: CreateWorkspaceRequest) => Promise<Workspace | null>;
  joinWorkspace: (code: string) => Promise<{ success: boolean; workspace?: Workspace; error?: string }>;
  switchWorkspace: (workspaceId: string) => void;
  clearError: () => void;
}

const WorkspaceContext = createContext<WorkspaceContextValue | null>(null);

export function WorkspaceProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(workspaceReducer, initialState);

  const loadWorkspaces = useCallback(async (): Promise<void> => {
    dispatch({ type: 'SET_LOADING' });
    try {
      const api = await getWorkspaceApi();
      const workspaces = await api.list();
      dispatch({ type: 'SET_WORKSPACES', workspaces });

      let active: Workspace | null = null;
      const saved = typeof window !== 'undefined' ? localStorage.getItem('codin_active_workspace') : null;
      if (saved) {
        const found = workspaces.find((w) => w.id === saved);
        if (found) {
          active = found;
        }
      }
      if (!active && workspaces.length > 0) {
        active = workspaces[0];
      }

      dispatch({ type: 'SET_ACTIVE', workspace: active });
      if (typeof window !== 'undefined') {
        if (active) {
          localStorage.setItem('codin_active_workspace', active.id);
        } else {
          localStorage.removeItem('codin_active_workspace');
        }
      }
    } catch (error) {
      dispatch({ type: 'SET_ERROR', error: 'Failed to load workspaces' });
    }
  }, []);

  const createWorkspace = useCallback(async (input: CreateWorkspaceRequest): Promise<Workspace | null> => {
    dispatch({ type: 'SET_LOADING' });
    try {
      const api = await getWorkspaceApi();
      const workspaceInput: CreateWorkspaceInput = {
        name: input.name,
        slug: input.slug,
        description: input.description,
      };
      const workspace = await api.create(workspaceInput);
      dispatch({ type: 'ADD_WORKSPACE', workspace });
      dispatch({ type: 'SET_ACTIVE', workspace });
      if (typeof window !== 'undefined') {
        localStorage.setItem('codin_active_workspace', workspace.id);
      }
      return workspace;
    } catch (error) {
      dispatch({ type: 'SET_ERROR', error: 'Failed to create workspace' });
      return null;
    }
  }, []);

  const joinWorkspace = useCallback(async (_code: string): Promise<{
    success: boolean;
    workspace?: Workspace;
    error?: string;
  }> => {
    return { success: false, error: 'Workspace join is not supported by the backend API. Please ask an owner to add you directly.' };
  }, []);

  const switchWorkspace = useCallback((workspaceId: string) => {
    const workspace = state.workspaces.find((w) => w.id === workspaceId);
    if (workspace) {
      dispatch({ type: 'SET_ACTIVE', workspace });
      if (typeof window !== 'undefined') {
        localStorage.setItem('codin_active_workspace', workspaceId);
      }
    }
  }, [state.workspaces]);

  const clearError = useCallback(() => {
    dispatch({ type: 'CLEAR_ERROR' });
  }, []);

  useEffect(() => {
    const saved = typeof window !== 'undefined' ? localStorage.getItem('codin_active_workspace') : null;
    const token = typeof window !== 'undefined' ? localStorage.getItem('codin_access_token') : null;
    if (saved || token) {
      loadWorkspaces();
    }
  }, [loadWorkspaces]);

  return (
    <WorkspaceContext.Provider
      value={{
        ...state,
        loadWorkspaces,
        createWorkspace,
        joinWorkspace,
        switchWorkspace,
        clearError,
      }}
    >
      {children}
    </WorkspaceContext.Provider>
  );
}

export function useWorkspace() {
  const context = useContext(WorkspaceContext);
  if (!context) throw new Error('useWorkspace must be used within a WorkspaceProvider');
  return context;
}
