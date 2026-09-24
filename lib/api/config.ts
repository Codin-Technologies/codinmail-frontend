export function getApiUrl(): string {
  const url = process.env.NEXT_PUBLIC_API_URL;
  if (!url) {
    if (typeof window !== 'undefined') {
      const hostname = window.location.hostname;
      if (hostname !== 'localhost' && hostname !== '127.0.0.1' && !hostname.endsWith('.local')) {
        throw new Error('NEXT_PUBLIC_API_URL is not configured. Cannot determine API URL in production.');
      }
    }
    return 'http://localhost:3000/api/v1';
  }
  if (url.endsWith('/api/v1')) return url;
  return `${url.replace(/\/+$/, '')}/api/v1`;
}

export const SIGN_BASE = '/workspaces';
