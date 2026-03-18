import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/lib/env', () => ({
  env: { NEXT_PUBLIC_API_URL: 'http://localhost:3001' },
}));

const mockServerFetch = vi.fn();
const mockCookiesSet = vi.fn();

const { loginAction } = await import('./auth');
const mockCookies = vi.fn().mockResolvedValue({
  set: mockCookiesSet,
});

vi.mock('@/lib/server-fetch', () => ({
  serverFetch: (...args: unknown[]) => mockServerFetch(...args),
}));

vi.mock('next/headers', () => ({
  cookies: () => mockCookies(),
}));

vi.mock('next/navigation', () => ({
  redirect: vi.fn(() => {
    const err = new Error('NEXT_REDIRECT');
    (err as Error & { NEXT_REDIRECT?: boolean }).NEXT_REDIRECT = true;
    throw err;
  }),
}));

vi.mock('@/lib/action-utils', () => ({
  rethrowNavigationError: (err: unknown) => {
    throw err;
  },
  toUserFriendlyMessage: (err: unknown, fallback: string) =>
    err instanceof Error ? err.message : fallback,
}));

describe('loginAction', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns fieldErrors when email is invalid', async () => {
    const formData = new FormData();
    formData.set('email', 'notanemail');
    formData.set('password', 'secret123');
    const result = await loginAction(undefined, formData);
    expect(result.fieldErrors).toBeDefined();
    expect(result.fieldErrors?.email).toBeDefined();
    expect(mockServerFetch).not.toHaveBeenCalled();
  });

  it('returns fieldErrors when password is empty', async () => {
    const formData = new FormData();
    formData.set('email', 'user@example.com');
    formData.set('password', '');
    const result = await loginAction(undefined, formData);
    expect(result.fieldErrors).toBeDefined();
    expect(result.fieldErrors?.password).toBeDefined();
    expect(mockServerFetch).not.toHaveBeenCalled();
  });

  it('returns error when API returns not ok', async () => {
    mockServerFetch.mockResolvedValue(
      new Response(JSON.stringify({ message: 'Credenciais inválidas' }), {
        status: 401,
      }),
    );
    const formData = new FormData();
    formData.set('email', 'user@example.com');
    formData.set('password', 'secret123');
    const result = await loginAction(undefined, formData);
    expect(result.error).toBe('Credenciais inválidas');
    expect(mockServerFetch).toHaveBeenCalledWith(
      expect.stringContaining('/auth/login'),
      expect.objectContaining({
        method: 'POST',
      }),
    );
  });

  it('throws redirect on success (sets cookie and redirects)', async () => {
    mockServerFetch.mockResolvedValue(
      new Response(
        JSON.stringify({
          accessToken: 'jwt-token',
          user: { id: '1', name: 'User', email: 'u@x.com', createdAt: '' },
        }),
        { status: 200 },
      ),
    );
    const formData = new FormData();
    formData.set('email', 'user@example.com');
    formData.set('password', 'secret123');
    await expect(loginAction(undefined, formData)).rejects.toThrow(
      'NEXT_REDIRECT',
    );
    expect(mockCookiesSet).toHaveBeenCalledWith(
      'auth-token',
      'jwt-token',
      expect.any(Object),
    );
  });
});
