'use client';

import React, { createContext, useContext, useReducer, useCallback, useEffect } from 'react';
import type { CurrentUser, LoginCredentials, RegisterInput, AuthResult, AuthStatus } from '@/lib/features/auth/api/auth.types';
import { getAuthApi } from '@/lib/features/auth/api/auth.client';

interface AuthState {
  user: CurrentUser | null;
  status: AuthStatus;
  verificationEmail: string | null;
  verificationCode: string | null;
  loginError: string | null;
}

type AuthAction =
  | { type: 'SET_LOADING' }
  | { type: 'SET_USER'; user: CurrentUser }
  | { type: 'SET_PENDING_VERIFICATION'; email: string; code: string }
  | { type: 'SET_LOGIN_ERROR'; error: string | null }
  | { type: 'LOGOUT' };

const initialState: AuthState = {
  user: null,
  status: 'unauthenticated',
  verificationEmail: null,
  verificationCode: null,
  loginError: null,
};

function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, status: 'loading', loginError: null };
    case 'SET_USER':
      return { ...state, user: action.user, status: 'authenticated', loginError: null, verificationEmail: null, verificationCode: null };
    case 'SET_PENDING_VERIFICATION':
      return { ...state, status: 'pending_verification', verificationEmail: action.email, verificationCode: action.code, loginError: null };
    case 'SET_LOGIN_ERROR':
      return { ...state, loginError: action.error, status: 'unauthenticated' };
    case 'LOGOUT':
      return { ...state, user: null, status: 'unauthenticated', verificationEmail: null, verificationCode: null, loginError: null };
    default:
      return state;
  }
}

interface AuthContextValue extends AuthState {
  register: (input: RegisterInput) => Promise<AuthResult>;
  login: (credentials: LoginCredentials) => Promise<AuthResult>;
  verifyEmail: (code: string) => Promise<AuthResult>;
  resendVerification: () => Promise<{ success: boolean }>;
  forgotPassword: (email: string) => Promise<{ success: boolean; email: string }>;
  resetPassword: () => Promise<{ success: boolean }>;
  logout: () => Promise<void>;
  clearError: () => void;
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
        const code = api.verificationCode ?? '';
        dispatch({ type: 'SET_PENDING_VERIFICATION', email: credentials.email, code });
      } else if (result.error) {
        dispatch({ type: 'SET_LOGIN_ERROR', error: result.error });
      }
      return result;
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Login failed';
      dispatch({ type: 'SET_LOGIN_ERROR', error: msg });
      return { success: false, error: msg };
    }
  }, []);

  const register = useCallback(async (input: RegisterInput): Promise<AuthResult> => {
    dispatch({ type: 'SET_LOADING' });
    try {
      const api = await getAuthApi();
      const result = await api.register(input);
      if (result.success && result.user) {
        dispatch({ type: 'SET_USER', user: result.user });
      } else if (result.error === 'VERIFICATION_REQUIRED') {
        const code = api.verificationCode ?? '';
        dispatch({ type: 'SET_PENDING_VERIFICATION', email: input.email, code });
      } else if (result.error) {
        dispatch({ type: 'SET_LOGIN_ERROR', error: result.error });
      }
      return result;
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Registration failed';
      dispatch({ type: 'SET_LOGIN_ERROR', error: msg });
      return { success: false, error: msg };
    }
  }, []);

  const verifyEmail = useCallback(async (code: string): Promise<AuthResult> => {
    if (!state.user) return { success: false, error: 'No user to verify' };
    try {
      const api = await getAuthApi();
      const result = await api.verifyEmail(state.user, code);
      if (result.success && result.user) {
        dispatch({ type: 'SET_USER', user: result.user });
      }
      return result;
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Verification failed';
      return { success: false, error: msg };
    }
  }, [state.user]);

  const resendVerification = useCallback(async (): Promise<{ success: boolean }> => {
    if (!state.user?.email) return { success: false };
    try {
      const api = await getAuthApi();
      return api.resendVerification(state.user.email);
    } catch {
      return { success: false };
    }
  }, [state.user?.email]);

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
    dispatch({ type: 'SET_LOGIN_ERROR', error: null });
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
          dispatch({ type: 'LOGOUT' });
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
