/**
 * @deprecated LEGACY MOCK - Use `lib/features/auth/api/auth.mock.ts` instead.
 * This file is retained only for backward compatibility.
 */
import type { MockUser, MockWorkspace, WorkspaceMember, Invitation, Mailbox, SecuritySession, Domain } from './types';

const wait = (ms = 420) => new Promise((resolve) => setTimeout(resolve, ms));

const demoUser: MockUser = {
  id: 'usr_demo_001',
  name: 'Kelvin Kijazi',
  email: 'kelvin@example.com',
  codinId: 'kelvin.kijazi',
  avatar: null,
  emailVerified: true,
};

export const mockAuthApi = {
  async register(input: { name: string; email: string; codinId: string; password: string }) {
    await wait();
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const user: MockUser = {
      id: `usr_${Date.now()}`,
      name: input.name.trim(),
      email: input.email.trim().toLowerCase(),
      codinId: input.codinId.trim().toLowerCase(),
      avatar: null,
      emailVerified: false,
    };
    return { success: true, user, requiresVerification: true, verificationCode: code };
  },
  async login(input: { email: string; password: string }) {
    await wait();
    if (!input.email || input.password.length < 6) return { success: false as const, error: 'Enter a valid email and password.' };
    if (input.email.toLowerCase() === 'suspended@example.com') return { success: false as const, error: 'This account is suspended. Contact your administrator.' };
    if (input.email.toLowerCase() === 'unverified@example.com') return { success: false as const, error: 'Please verify your email before signing in.' };
    return {
      success: true as const,
      user: input.email.toLowerCase() === demoUser.email ? demoUser : {
        ...demoUser,
        id: `usr_${Date.now()}`,
        name: input.email.split('@')[0],
        email: input.email.toLowerCase(),
        codinId: input.email.split('@')[0].replace(/[^a-z0-9]+/gi, '.'),
      },
    };
  },
  async verifyEmail(user: MockUser, code?: string) {
    await wait(250);
    if (code && code !== '123456') return { success: false as const, error: 'Invalid verification code.' };
    return { success: true as const, user: { ...user, emailVerified: true } };
  },
  async resendVerification() { await wait(300); return { success: true }; },
  async forgotPassword(email: string) { await wait(450); return { success: true, email }; },
  async resetPassword() { await wait(450); return { success: true }; },
  async logout() { await wait(180); return { success: true }; },
  async getCurrentUser() { await wait(180); return demoUser; },
};

export { demoUser };
