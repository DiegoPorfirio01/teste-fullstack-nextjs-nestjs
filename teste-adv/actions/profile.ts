'use server';

import { cache } from 'react';
import { revalidatePath } from 'next/cache';
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
import type {
  DeleteAccountState,
  IUserProfile,
  ActionResult,
  UpdatePasswordState,
  UpdateProfileState,
} from '@/types';
import {
  updatePasswordSchema,
  updateProfileSchema,
} from '@/schemas/profile-form';
import {
  logActionStart,
  logActionSuccess,
  logActionError,
} from '@/lib/action-logger';

const JSON_HEADERS = { 'Content-Type': 'application/json' } as const;

export async function getProfileAction(): Promise<ActionResult<IUserProfile>> {
  logActionStart('getProfileAction');

  try {
    const res = await serverFetch(routes.auth.profile, { method: 'GET' });
    if (!res.ok) {
      const data = (await res.json()) as Record<string, unknown>;
      const msg = getApiErrorMessage(data, 'Falha ao carregar perfil');
      return { error: msg };
    }

    const data = (await res.json()) as Record<string, unknown>;
    const profile: IUserProfile = {
      id: String(data.id),
      fullName: String(data.fullName ?? ''),
      email: String(data.email ?? ''),
      avatarUrl: data.avatarUrl != null ? String(data.avatarUrl) : undefined,
    };
    return { data: profile };
  } catch (err) {
    rethrowNavigationError(err);
    logActionError('getProfileAction', err);
    return {
      error: toUserFriendlyMessage(err, 'Falha ao carregar perfil'),
    };
  }
}

export const getProfileCached = cache(getProfileAction);

export async function updatePasswordAction(
  _prevState: UpdatePasswordState | undefined,
  formData: FormData,
): Promise<UpdatePasswordState> {
  const parsed = updatePasswordSchema.safeParse({
    currentPassword: formData.get('currentPassword'),
    newPassword: formData.get('newPassword'),
    confirmNewPassword: formData.get('confirmNewPassword'),
  });

  if (!parsed.success) {
    return {
      fieldErrors: zodFieldErrors(parsed.error),
      values: {
        currentPassword: String(formData.get('currentPassword') ?? ''),
        newPassword: String(formData.get('newPassword') ?? ''),
        confirmNewPassword: String(formData.get('confirmNewPassword') ?? ''),
      },
    };
  }

  logActionStart('updatePasswordAction');

  try {
    const res = await serverFetch(routes.auth.updatePassword, {
      method: 'PATCH',
      headers: JSON_HEADERS,
      body: JSON.stringify({
        currentPassword: parsed.data.currentPassword,
        newPassword: parsed.data.newPassword,
      }),
    });

    const data = (await res.json()) as Record<string, unknown>;

    if (!res.ok) {
      const msg = getApiErrorMessage(data, 'Falha ao alterar senha');
      return {
        error: msg,
        values: {
          currentPassword: parsed.data.currentPassword,
          newPassword: '',
          confirmNewPassword: '',
        },
      };
    }

    revalidatePath('/perfil');
    logActionSuccess('updatePasswordAction');
    return { success: true };
  } catch (err) {
    rethrowNavigationError(err);
    logActionError('updatePasswordAction', err);
    return {
      error: toUserFriendlyMessage(err, 'Erro inesperado ao alterar senha'),
      values: {
        currentPassword: String(formData.get('currentPassword') ?? ''),
        newPassword: '',
        confirmNewPassword: '',
      },
    };
  }
}

export async function updateProfileAction(
  _prevState: UpdateProfileState | undefined,
  formData: FormData,
): Promise<UpdateProfileState> {
  const parsed = updateProfileSchema.safeParse({
    fullName: formData.get('fullName'),
  });

  if (!parsed.success) {
    return {
      fieldErrors: zodFieldErrors(parsed.error),
      values: { fullName: String(formData.get('fullName') ?? '') },
    };
  }

  logActionStart('updateProfileAction');

  try {
    const res = await serverFetch(routes.auth.profile, {
      method: 'PATCH',
      headers: JSON_HEADERS,
      body: JSON.stringify({ fullName: parsed.data.fullName }),
    });

    const data = (await res.json()) as Record<string, unknown>;

    if (!res.ok) {
      const msg = getApiErrorMessage(data, 'Falha ao atualizar perfil');
      return {
        error: msg,
        values: { fullName: parsed.data.fullName },
      };
    }

    revalidatePath('/perfil');
    logActionSuccess('updateProfileAction');
    return { success: true };
  } catch (err) {
    rethrowNavigationError(err);
    logActionError('updateProfileAction', err);
    return {
      error: toUserFriendlyMessage(err, 'Erro inesperado ao atualizar perfil'),
      values: { fullName: parsed.data.fullName },
    };
  }
}

export async function deleteAccountAction(
  _prevState: DeleteAccountState | undefined,
  _formData: FormData,
): Promise<DeleteAccountState> {
  void _prevState;
  void _formData;

  logActionStart('deleteAccountAction');

  try {
    const res = await serverFetch(routes.auth.deleteAccount, {
      method: 'DELETE',
    });

    const data = (await res.json()) as Record<string, unknown>;

    if (!res.ok) {
      const msg = getApiErrorMessage(data, 'Falha ao excluir conta');
      return { error: msg };
    }

    const cookieStore = await cookies();
    cookieStore.delete(AUTH_COOKIE_NAME);
    logActionSuccess('deleteAccountAction');
    redirect('/auth/login');
  } catch (err) {
    rethrowNavigationError(err);
    logActionError('deleteAccountAction', err);
    return {
      error: toUserFriendlyMessage(err, 'Erro inesperado ao excluir conta'),
    };
  }
}
