"use client"

import { useActionState } from "react"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { updatePasswordAction } from "@/actions/profile"
import type { UpdatePasswordState } from "@/types"
import { KeyRoundIcon, LockIcon } from "lucide-react"

export function FormPerfil() {
  const [state, formAction, isPending] = useActionState<
    UpdatePasswordState | undefined,
    FormData
  >(updatePasswordAction, undefined)

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
          key={state?.values ? "has-values" : "initial"}
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
              <div className="relative">
                <KeyRoundIcon className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="currentPassword"
                  name="currentPassword"
                  type="password"
                  required
                  className="pl-9"
                  aria-invalid={!!state?.fieldErrors?.currentPassword}
                  defaultValue={state?.values?.currentPassword}
                />
              </div>
              <FieldError
                errors={
                  state?.fieldErrors?.currentPassword?.map((m) => ({
                    message: m,
                  })) ?? []
                }
              />
            </Field>

            <Separator className="my-1" />

            <Field data-invalid={!!state?.fieldErrors?.newPassword}>
              <FieldLabel htmlFor="newPassword">Nova senha</FieldLabel>
              <div className="relative">
                <LockIcon className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="newPassword"
                  name="newPassword"
                  type="password"
                  required
                  className="pl-9"
                  aria-invalid={!!state?.fieldErrors?.newPassword}
                  defaultValue={state?.values?.newPassword}
                />
              </div>
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
              <div className="relative">
                <LockIcon className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="confirmNewPassword"
                  name="confirmNewPassword"
                  type="password"
                  required
                  className="pl-9"
                  aria-invalid={!!state?.fieldErrors?.confirmNewPassword}
                  defaultValue={state?.values?.confirmNewPassword}
                />
              </div>
              <FieldError
                errors={
                  state?.fieldErrors?.confirmNewPassword?.map((m) => ({
                    message: m,
                  })) ?? []
                }
              />
            </Field>

            <Button type="submit" disabled={isPending}>
              {isPending ? "Salvando…" : "Atualizar senha"}
            </Button>
          </FieldGroup>
        </form>
      </CardContent>
    </Card>
  )
}
