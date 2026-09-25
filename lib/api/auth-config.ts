/**
 * Auth configuration helpers for Codin Mail
 */

export const PRODUCTION_VERIFICATION_URL = 'https://app.codin.co.tz/verify-email';

/**
 * Returns the URL where Supabase should redirect after email verification.
 * 
 * Requirements:
 * - Production verification URL MUST use: https://app.codin.co.tz/verify-email
 * - The frontend must NEVER redirect the production verification flow to: http://localhost:3000
 * - Preserve localhost development support when running locally.
 */
export function getVerificationRedirectUrl(): string {
  // Check if explicit override is provided in environment variables
  const configured =
    process.env.NEXT_PUBLIC_AUTH_REDIRECT_URL ||
    process.env.NEXT_PUBLIC_VERIFY_EMAIL_URL ||
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.NEXT_PUBLIC_APP_URL;

  const isBrowser = typeof window !== 'undefined';
  const hostname = isBrowser ? window.location.hostname : '';
  const isLocalHost =
    hostname === 'localhost' ||
    hostname === '127.0.0.1' ||
    hostname.endsWith('.local');

  const isProduction =
    process.env.NODE_ENV === 'production' ||
    process.env.NEXT_PUBLIC_VERCEL_ENV === 'production' ||
    (isBrowser && !isLocalHost);

  // In production, strictly enforce production URL and disallow localhost
  if (isProduction) {
    if (configured && !configured.includes('localhost') && !configured.includes('127.0.0.1')) {
      const trimmed = configured.replace(/\/+$/, '');
      return trimmed.endsWith('/verify-email') ? trimmed : `${trimmed}/verify-email`;
    }
    return PRODUCTION_VERIFICATION_URL;
  }

  // In local development
  if (configured) {
    const trimmed = configured.replace(/\/+$/, '');
    return trimmed.endsWith('/verify-email') ? trimmed : `${trimmed}/verify-email`;
  }

  if (isBrowser && isLocalHost) {
    return `${window.location.origin}/verify-email`;
  }

  return PRODUCTION_VERIFICATION_URL;
}
