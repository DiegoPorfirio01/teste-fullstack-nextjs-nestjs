"use client"

import { useEffect } from "react"
import { useActionState } from "react"
import { showSuccessToast } from "@/lib/toast"
import { TOAST_MESSAGES } from "@/constants/toast-messages"
import { Button } from "@/components/ui/button"
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { NameInput } from "@/components/ui/name-input"
import { EmailInput } from "@/components/ui/email-input"
import { updateProfileAction } from "@/actions/profile"
import type { UpdateProfileState } from "@/types"

type Props = {
  fullName: string
  email: string
}

export function FormProfileDetails({ fullName, email }: Props) {
  const [state, formAction, isPending] = useActionState<
    UpdateProfileState | undefined,
    FormData
  >(updateProfileAction, undefined)

  useEffect(() => {
    if (state?.success) {
      showSuccessToast(TOAST_MESSAGES.PROFILE_UPDATED)
    }
  }, [state?.success])

  return (
    <form
      key={state?.values != null ? "has-values" : "initial"}
      action={formAction}
    >
      <FieldGroup className="gap-5">
        {state?.error && (
          <Field data-invalid>
            <FieldError>{state.error}</FieldError>
          </Field>
        )}

        <Field data-invalid={!!state?.fieldErrors?.fullName}>
          <FieldLabel htmlFor="fullName">Nome completo</FieldLabel>
          <NameInput
            id="fullName"
            name="fullName"
            required
            aria-invalid={!!state?.fieldErrors?.fullName}
            defaultValue={state?.values?.fullName ?? fullName}
          />
          <FieldError
            errors={
              state?.fieldErrors?.fullName?.map((m) => ({ message: m })) ?? []
            }
          />
        </Field>

        <Field data-disabled>
          <FieldLabel htmlFor="email">E-mail</FieldLabel>
          <EmailInput
            id="email"
            type="email"
            defaultValue={email}
            readOnly
            disabled
            className="cursor-not-allowed bg-muted"
            aria-describedby="email-description"
          />
          <FieldDescription id="email-description">
            O e-mail não pode ser alterado
          </FieldDescription>
        </Field>

        <Field>
          <div className="flex justify-end">
            <Button type="submit" disabled={isPending}>
              {isPending ? "Salvando…" : "Salvar alterações"}
            </Button>
          </div>
        </Field>
      </FieldGroup>
    </form>
  )
}
