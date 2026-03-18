'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { routes } from '@/api-routes';
import { getApiErrorMessage } from '@/lib/api-error';
import {
  rethrowNavigationError,
  toUserFriendlyMessage,
} from '@/lib/action-utils';
import { serverFetch } from '@/lib/server-fetch';
import { zodFieldErrors } from '@/lib/zod-utils';
import { AUTH_COOKIE_NAME } from '@/constants';
import type { LoginState, RegisterState } from '@/types';
import { loginSchema, registerSchema } from '@/schemas/auth-form';
import * as Sentry from '@sentry/nextjs';
import { authResponseSchema } from '@/schemas/api-response';
import {
  logActionStart,
  logActionSuccess,
  logActionError,
} from '@/lib/action-logger';

export async function loginAction(
  _prevState: LoginState | undefined,
  formData: FormData,
): Promise<LoginState> {
  const parsed = loginSchema.safeParse({
    email: formData.get('email'),
    password: formData.get('password'),
  });

  if (!parsed.success) {
    return {
      fieldErrors: zodFieldErrors(parsed.error),
      values: {
        email: String(formData.get('email') ?? ''),
        password: String(formData.get('password') ?? ''),
      },
    };
  }

  logActionStart('loginAction', { email: parsed.data.email });

  try {
    const res = await serverFetch(routes.auth.login, {
      method: 'POST',
      redirectOn401: false,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: parsed.data.email,
        password: parsed.data.password,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      const msg = getApiErrorMessage(data, 'E-mail ou senha inválidos');
      return {
        error: msg,
        values: {
          email: parsed.data.email,
          password: String(formData.get('password') ?? ''),
        },
      };
    }

    const authParsed = authResponseSchema.safeParse(data);
    if (!authParsed.success) {
      return {
        error: 'Resposta da API inválida. Tente novamente.',
        values: {
          email: parsed.data.email,
          password: String(formData.get('password') ?? ''),
        },
      };
    }
    const auth = authParsed.data;
    const cookieStore = await cookies();

    cookieStore.set(AUTH_COOKIE_NAME, auth.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    });

    Sentry.setUser({ id: auth.user.id, email: auth.user.email });
    logActionSuccess('loginAction', { email: parsed.data.email });
    redirect('/dashboard');
  } catch (err) {
    rethrowNavigationError(err);
    logActionError('loginAction', err, { email: parsed.data.email });
    return {
      error: toUserFriendlyMessage(err, 'E-mail ou senha inválidos'),
      values: {
        email: String(formData.get('email') ?? ''),
        password: String(formData.get('password') ?? ''),
      },
    };
  }
}

export async function registerAction(
  _prevState: RegisterState | undefined,
  formData: FormData,
): Promise<RegisterState> {
  const parsed = registerSchema.safeParse({
    name: formData.get('name'),
    email: formData.get('email'),
    password: formData.get('password'),
    confirmPassword: formData.get('confirmPassword'),
  });

  if (!parsed.success) {
    return {
      fieldErrors: zodFieldErrors(parsed.error),
      values: {
        name: String(formData.get('name') ?? ''),
        email: String(formData.get('email') ?? ''),
        password: String(formData.get('password') ?? ''),
        confirmPassword: String(formData.get('confirmPassword') ?? ''),
      },
    };
  }

  logActionStart('registerAction', { email: parsed.data.email });

  try {
    const res = await serverFetch(routes.auth.register, {
      method: 'POST',
      redirectOn401: false,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: parsed.data.name,
        email: parsed.data.email,
        password: parsed.data.password,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      const msg = getApiErrorMessage(data, 'Falha no cadastro');
      return {
        error: msg,
        values: {
          name: parsed.data.name,
          email: parsed.data.email,
          password: String(formData.get('password') ?? ''),
          confirmPassword: String(formData.get('confirmPassword') ?? ''),
        },
      };
    }

    const authParsed = authResponseSchema.safeParse(data);
    if (!authParsed.success) {
      return {
        error: 'Resposta da API inválida. Tente novamente.',
        values: {
          name: parsed.data.name,
          email: parsed.data.email,
          password: String(formData.get('password') ?? ''),
          confirmPassword: String(formData.get('confirmPassword') ?? ''),
        },
      };
    }
    const auth = authParsed.data;
    const cookieStore = await cookies();

    cookieStore.set(AUTH_COOKIE_NAME, auth.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    });

    Sentry.setUser({ id: auth.user.id, email: auth.user.email });
    logActionSuccess('registerAction', { email: parsed.data.email });
    redirect('/dashboard');
  } catch (err) {
    rethrowNavigationError(err);
    logActionError('registerAction', err, { email: parsed.data.email });
    return {
      error: toUserFriendlyMessage(err, 'Falha no cadastro'),
      values: {
        name: String(formData.get('name') ?? ''),
        email: String(formData.get('email') ?? ''),
        password: String(formData.get('password') ?? ''),
        confirmPassword: String(formData.get('confirmPassword') ?? ''),
      },
    };
  }
}

export async function logoutAction(): Promise<void> {
  logActionStart('logoutAction');
  const cookieStore = await cookies();
  cookieStore.delete(AUTH_COOKIE_NAME);
  Sentry.setUser(null);
  logActionSuccess('logoutAction');
  redirect('/auth/login');
}
