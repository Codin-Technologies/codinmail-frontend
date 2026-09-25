'use client';

import React, { createContext, useContext, useReducer, useCallback, useEffect } from 'react';
import type { CurrentUser, LoginCredentials, RegisterInput, AuthResult, AuthStatus } from '@/lib/features/auth/api/auth.types';
import { getAuthApi } from '@/lib/features/auth/api/auth.client';

interface AuthState {
  user: CurrentUser | null;
  status: AuthStatus;
  verificationEmail: string | null;
  verificationCode: string | null;
  authError: string | null;
}

type AuthAction =
  | { type: 'SET_LOADING' }
  | { type: 'SET_USER'; user: CurrentUser }
  | { type: 'SET_PENDING_VERIFICATION'; email: string; code?: string }
  | { type: 'SET_AUTH_ERROR'; error: string | null }
  | { type: 'CLEAR_ERROR' }
  | { type: 'LOGOUT' };

function getInitialPendingEmail(): string | null {
  if (typeof window === 'undefined') return null;
  try {
    return sessionStorage.getItem('codin_pending_verification_email');
  } catch {
    return null;
  }
}

const initialState: AuthState = {
  user: null,
  status: 'loading',
  verificationEmail: null,
  verificationCode: null,
  authError: null,
};

function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, status: 'loading', authError: null };
    case 'SET_USER':
      if (typeof window !== 'undefined') {
        try {
          sessionStorage.removeItem('codin_pending_verification_email');
        } catch {}
      }
      return { ...state, user: action.user, status: 'authenticated', authError: null, verificationEmail: null, verificationCode: null };
    case 'SET_PENDING_VERIFICATION':
      if (typeof window !== 'undefined') {
        try {
          sessionStorage.setItem('codin_pending_verification_email', action.email);
        } catch {}
      }
      return { ...state, status: 'pending_verification', verificationEmail: action.email, verificationCode: action.code ?? null, authError: null };
    case 'SET_AUTH_ERROR':
      return { ...state, authError: action.error };
    case 'CLEAR_ERROR':
      return { ...state, authError: null };
    case 'LOGOUT':
      return { ...state, user: null, status: 'unauthenticated', verificationEmail: null, verificationCode: null, authError: null };
    default:
      return state;
  }
}

interface AuthContextValue extends AuthState {
  register: (input: RegisterInput) => Promise<AuthResult>;
  login: (credentials: LoginCredentials) => Promise<AuthResult>;
  verifyEmail: (code: string) => Promise<AuthResult>;
  resendVerification: (targetEmail?: string) => Promise<{ success: boolean; error?: string }>;
  forgotPassword: (email: string) => Promise<{ success: boolean; email: string }>;
  resetPassword: () => Promise<{ success: boolean }>;
  logout: () => Promise<void>;
  clearError: () => void;
  setUser: (user: CurrentUser) => void;
  setPendingVerification: (email: string) => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(authReducer, initialState);

  const login = useCallback(async (credentials: LoginCredentials): Promise<AuthResult> => {
    dispatch({ type: 'SET_LOADING' });
    try {
      const api = await getAuthApi();
      const result = await api.login(credentials);
      if (result.success && result.user) {
        dispatch({ type: 'SET_USER', user: result.user });
      } else if (result.error === 'VERIFICATION_REQUIRED') {
        dispatch({ type: 'SET_PENDING_VERIFICATION', email: credentials.email });
      } else if (result.error) {
        dispatch({ type: 'SET_AUTH_ERROR', error: result.error });
      }
      return result;
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Login failed';
      dispatch({ type: 'SET_AUTH_ERROR', error: msg });
      return { success: false, error: msg };
    }
  }, []);

  const register = useCallback(async (input: RegisterInput): Promise<AuthResult> => {
    dispatch({ type: 'SET_LOADING' });
    try {
      const api = await getAuthApi();
      const result = await api.register(input);
      if (result.success && result.user && !result.error) {
        dispatch({ type: 'SET_USER', user: result.user });
      } else if (result.error === 'VERIFICATION_REQUIRED' || (result.success && !result.user)) {
        dispatch({ type: 'SET_PENDING_VERIFICATION', email: input.email });
      } else if (result.error) {
        dispatch({ type: 'SET_AUTH_ERROR', error: result.error });
      }
      return result;
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Registration failed';
      dispatch({ type: 'SET_AUTH_ERROR', error: msg });
      return { success: false, error: msg };
    }
  }, []);

  const verifyEmail = useCallback(async (code: string): Promise<AuthResult> => {
    const email = state.user?.email ?? state.verificationEmail;
    if (!email) return { success: false, error: 'No user to verify' };
    try {
      const api = await getAuthApi();
      const result = await api.verifyEmail({ id: '', email, displayName: '', firstName: '', lastName: '', status: 'pending', timezone: '', locale: '', authUserId: '' }, code);
      if (result.success && result.user) {
        dispatch({ type: 'SET_USER', user: result.user });
      }
      return result;
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Verification failed';
      return { success: false, error: msg };
    }
  }, [state.user, state.verificationEmail]);

  const resendVerification = useCallback(async (targetEmail?: string): Promise<{ success: boolean; error?: string }> => {
    const email = targetEmail || state.verificationEmail || state.user?.email || getInitialPendingEmail();
    if (!email) return { success: false, error: 'No email address found to resend verification link' };
    try {
      const api = await getAuthApi();
      return await api.resendVerification(email);
    } catch {
      return { success: false, error: 'Failed to resend verification email' };
    }
  }, [state.user?.email, state.verificationEmail]);

  const forgotPassword = useCallback(async (email: string): Promise<{ success: boolean; email: string }> => {
    try {
      const api = await getAuthApi();
      return api.forgotPassword(email);
    } catch {
      return { success: false, email };
    }
  }, []);

  const resetPassword = useCallback(async (): Promise<{ success: boolean }> => {
    try {
      const api = await getAuthApi();
      return api.resetPassword('', '');
    } catch {
      return { success: false };
    }
  }, []);

  const logout = useCallback(async (): Promise<void> => {
    const api = await getAuthApi();
    await api.logout();
    dispatch({ type: 'LOGOUT' });
  }, []);

  const clearError = useCallback(() => {
    dispatch({ type: 'CLEAR_ERROR' });
  }, []);

  const setUser = useCallback((user: CurrentUser) => {
    dispatch({ type: 'SET_USER', user });
  }, []);

  const setPendingVerification = useCallback((email: string) => {
    dispatch({ type: 'SET_PENDING_VERIFICATION', email });
  }, []);

  useEffect(() => {
    let isMounted = true;
    (async () => {
      dispatch({ type: 'SET_LOADING' });
      try {
        const api = await getAuthApi();
        const user = await api.getCurrentUser();
        if (!isMounted) return;
        if (user) {
          dispatch({ type: 'SET_USER', user });
        } else {
          const pendingEmail = getInitialPendingEmail();
          if (pendingEmail && typeof window !== 'undefined' && window.location.pathname.startsWith('/verify-email')) {
            dispatch({ type: 'SET_PENDING_VERIFICATION', email: pendingEmail });
          } else {
            dispatch({ type: 'LOGOUT' });
          }
        }
      } catch {
        if (isMounted) {
          dispatch({ type: 'LOGOUT' });
        }
      }
    })();
    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <AuthContext.Provider
      value={{
        ...state,
        register,
        login,
        verifyEmail,
        resendVerification,
        forgotPassword,
        resetPassword,
        logout,
        clearError,
        setUser,
        setPendingVerification,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
}

