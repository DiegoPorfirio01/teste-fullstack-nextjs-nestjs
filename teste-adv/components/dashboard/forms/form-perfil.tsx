'use client';

import { useEffect } from 'react';
import { useActionState } from 'react';
import { showSuccessToast } from '@/lib/toast';
import { TOAST_MESSAGES } from '@/constants/toast-messages';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
} from '@/components/ui/field';
import { PasswordInput } from '@/components/ui/password-input';
import { updatePasswordAction } from '@/actions/profile';
import type { UpdatePasswordState } from '@/types';
import { LockIcon } from 'lucide-react';

export function FormPerfil() {
  const [state, formAction, isPending] = useActionState<
    UpdatePasswordState | undefined,
    FormData
  >(updatePasswordAction, undefined);

  useEffect(() => {
    if (state?.success) {
      showSuccessToast(TOAST_MESSAGES.PASSWORD_UPDATED);
    }
  }, [state?.success]);

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2">
          <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <LockIcon className="size-4" />
          </div>
          <div>
            <CardTitle>Alterar senha</CardTitle>
            <CardDescription>
              Mantenha sua conta segura com uma senha forte
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <form
          key={state?.values ? 'has-values' : 'initial'}
          action={formAction}
        >
          <FieldGroup className="gap-5">
            {state?.error && (
              <Field data-invalid>
                <FieldError>{state.error}</FieldError>
              </Field>
            )}

            <Field data-invalid={!!state?.fieldErrors?.currentPassword}>
              <FieldLabel htmlFor="currentPassword">Senha atual</FieldLabel>
              <PasswordInput
                id="currentPassword"
                name="currentPassword"
                icon="key"
                required
                autoComplete="current-password"
                aria-invalid={!!state?.fieldErrors?.currentPassword}
                defaultValue={state?.values?.currentPassword}
              />
              <FieldError
                errors={
                  state?.fieldErrors?.currentPassword?.map((m) => ({
                    message: m,
                  })) ?? []
                }
              />
            </Field>

            <FieldSeparator />

            <Field data-invalid={!!state?.fieldErrors?.newPassword}>
              <FieldLabel htmlFor="newPassword">Nova senha</FieldLabel>
              <PasswordInput
                id="newPassword"
                name="newPassword"
                autoComplete="new-password"
                required
                aria-invalid={!!state?.fieldErrors?.newPassword}
                defaultValue={state?.values?.newPassword}
              />
              <FieldError
                errors={
                  state?.fieldErrors?.newPassword?.map((m) => ({
                    message: m,
                  })) ?? []
                }
              />
            </Field>

            <Field data-invalid={!!state?.fieldErrors?.confirmNewPassword}>
              <FieldLabel htmlFor="confirmNewPassword">
                Confirmar nova senha
              </FieldLabel>
              <PasswordInput
                id="confirmNewPassword"
                name="confirmNewPassword"
                autoComplete="new-password"
                required
                aria-invalid={!!state?.fieldErrors?.confirmNewPassword}
                defaultValue={state?.values?.confirmNewPassword}
              />
              <FieldError
                errors={
                  state?.fieldErrors?.confirmNewPassword?.map((m) => ({
                    message: m,
                  })) ?? []
                }
              />
            </Field>

            <Field>
              <div className="flex justify-end">
                <Button type="submit" disabled={isPending}>
                  {isPending ? 'Salvando…' : 'Atualizar senha'}
                </Button>
              </div>
            </Field>
          </FieldGroup>
        </form>
      </CardContent>
    </Card>
  );
}
