"use client"

import { useActionState } from "react"
import { Button } from "@/components/ui/button"
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { updateProfileAction } from "@/actions/profile"
import type { UpdateProfileState } from "@/types"
import { UserIcon } from "lucide-react"

type Props = {
  fullName: string
  email: string
}

export function FormProfileDetails({ fullName, email }: Props) {
  const [state, formAction, isPending] = useActionState<
    UpdateProfileState | undefined,
    FormData
  >(updateProfileAction, undefined)

  return (
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

        <Field data-invalid={!!state?.fieldErrors?.fullName}>
          <FieldLabel htmlFor="fullName">Nome completo</FieldLabel>
          <div className="relative">
            <UserIcon className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="fullName"
              name="fullName"
              type="text"
              required
              className="pl-9"
              aria-invalid={!!state?.fieldErrors?.fullName}
              defaultValue={state?.values?.fullName ?? fullName}
            />
          </div>
          <FieldError
            errors={
              state?.fieldErrors?.fullName?.map((m) => ({ message: m })) ?? []
            }
          />
        </Field>

        <Field>
          <FieldLabel htmlFor="email">Email</FieldLabel>
          <Input
            id="email"
            type="email"
            defaultValue={email}
            readOnly
            disabled
            className="cursor-not-allowed bg-muted"
            aria-describedby="email-readonly"
          />
          <span id="email-readonly" className="text-xs text-muted-foreground">
            O email não pode ser alterado
          </span>
        </Field>

        <Button type="submit" disabled={isPending}>
          {isPending ? "Salvando…" : "Salvar alterações"}
        </Button>
      </FieldGroup>
    </form>
  )
}
