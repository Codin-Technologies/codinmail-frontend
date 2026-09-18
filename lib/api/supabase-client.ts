import { createClient, type SupabaseClient } from '@supabase/supabase-js';

let cachedClient: SupabaseClient | null = null;
let cachedAccessToken: string | null = null;

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '';

export async function getSupabaseClient(): Promise<SupabaseClient | null> {
  if (!supabaseUrl || !supabaseAnonKey) return null;
  if (cachedClient) return cachedClient;
  cachedClient = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      storageKey: 'codin_auth',
    },
  });
  return cachedClient;
}

export function getAccessToken(): string | null {
  if (typeof window === 'undefined') return null;
  if (cachedAccessToken !== null) return cachedAccessToken;
  try {
    return localStorage.getItem('codin_access_token');
  } catch {
    return null;
  }
}

export function setAccessToken(token: string | null): void {
  cachedAccessToken = token;
  if (typeof window === 'undefined') return;
  try {
    if (token === null) {
      localStorage.removeItem('codin_access_token');
    } else {
      localStorage.setItem('codin_access_token', token);
    }
  } catch {}
}

export type { SupabaseClient as SupabaseClientType };
