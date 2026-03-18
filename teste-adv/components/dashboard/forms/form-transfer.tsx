"use client"

import { useEffect } from "react"
import { useActionState } from "react"
import { showSuccessToast } from "@/lib/toast"
import { TOAST_MESSAGES } from "@/constants/toast-messages"
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
import { EmailInput } from "@/components/ui/email-input"
import { AmountInputBRL } from "@/components/dashboard/amount-input-brl"
import { transferAction } from "@/actions/transactions"
import type { TransferState } from "@/types"
import { ArrowRightLeftIcon } from "lucide-react"

export function FormTransfer() {
  const [state, formAction, isPending] = useActionState<
    TransferState | undefined,
    FormData
  >(transferAction, undefined)

  useEffect(() => {
    if (state?.success) {
      showSuccessToast(TOAST_MESSAGES.TRANSFER_SUCCESS)
    }
  }, [state?.success])

  return (
    <Card className="w-full overflow-hidden lg:w-72">
      <CardHeader className="pb-2 pt-4">
        <div>
          <CardTitle className="text-base">Transferir créditos</CardTitle>
          <CardDescription className="text-sm">
            Envie créditos para outra conta
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent className="pb-4">
        <form action={formAction}>
          <FieldGroup className="gap-4">
            {state?.error && (
              <Field data-invalid>
                <FieldError>{state.error}</FieldError>
              </Field>
            )}
            <Field data-invalid={!!state?.fieldErrors?.receiverEmail}>
              <FieldLabel htmlFor="receiverEmail">E-mail</FieldLabel>
              <EmailInput
                id="receiverEmail"
                name="receiverEmail"
                required
                key={
                  state?.error || state?.fieldErrors
                    ? `err-${state.receiverEmail ?? ""}`
                    : "default"
                }
                defaultValue={state?.receiverEmail ?? ""}
                aria-invalid={!!state?.fieldErrors?.receiverEmail}
              />
              <FieldError
                errors={
                  state?.fieldErrors?.receiverEmail?.map((m) => ({
                    message: m,
                  })) ?? []
                }
              />
            </Field>

            <Field data-invalid={!!state?.fieldErrors?.amount}>
              <FieldLabel htmlFor="amount">Valor (R$)</FieldLabel>
              <AmountInputBRL
                id="amount"
                name="amount"
                step={5}
                required
                key={
                  state?.error || state?.fieldErrors
                    ? `err-${state.amount ?? 0}`
                    : "default"
                }
                defaultValue={state?.amount ?? 0}
              />
              <FieldError
                errors={
                  state?.fieldErrors?.amount?.map((m) => ({ message: m })) ?? []
                }
              />
            </Field>

            <div className="flex justify-end">
              <Button type="submit" disabled={isPending} size="sm" className="w-full">
                <ArrowRightLeftIcon data-icon="inline-start" />
                {isPending ? "Transferindo…" : "Transferir"}
              </Button>
            </div>
          </FieldGroup>
        </form>
      </CardContent>
    </Card>
  )
}
