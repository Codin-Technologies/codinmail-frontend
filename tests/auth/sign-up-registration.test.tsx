import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import SignUpPage from '@/app/sign-up/page';

const { registerMock, clearErrorMock } = vi.hoisted(() => ({
  registerMock: vi.fn(),
  clearErrorMock: vi.fn(),
}));

vi.mock('next/navigation', () => ({
  useRouter: () => ({ replace: vi.fn(), push: vi.fn() }),
}));

vi.mock('@/lib/stores/auth-context', () => ({
  useAuth: () => ({
    user: null,
    status: 'unauthenticated',
    register: registerMock,
    clearError: clearErrorMock,
  }),
}));

describe('sign-up registration submission', () => {
  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it('submits the backend registration fields without confirmPassword', async () => {
    const user = userEvent.setup();
    render(<SignUpPage />);

    await user.type(screen.getByPlaceholderText('Kelvin'), 'Kelvin');
    await user.type(screen.getByPlaceholderText('Kijazi'), 'Kijazi');
    await user.type(screen.getByPlaceholderText('Kelvin Kijazi'), 'Kelvin Kijazi');
    await user.type(screen.getByPlaceholderText('you@example.com'), 'kelvin@example.com');
    await user.type(screen.getByPlaceholderText('At least 8 characters'), 'StrongPass123');
    await user.type(screen.getByPlaceholderText('Repeat your password'), 'StrongPass123');
    await user.click(screen.getByRole('button', { name: 'Create Codin Account' }));

    expect(registerMock).toHaveBeenCalledWith({
      firstName: 'Kelvin',
      lastName: 'Kijazi',
      displayName: 'Kelvin Kijazi',
      email: 'kelvin@example.com',
      password: 'StrongPass123',
    });
  });
});
