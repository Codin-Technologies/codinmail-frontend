export function getApiMode(): 'mock' | 'real' {
  return (process.env.NEXT_PUBLIC_API_MODE as 'mock' | 'real') ?? 'mock';
}

export function getApiUrl(): string {
  return process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000/api/v1';
}

export const SIGN_BASE = '/workspaces';
