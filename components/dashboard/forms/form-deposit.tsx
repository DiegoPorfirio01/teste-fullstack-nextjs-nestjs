"use client"

import { useEffect } from "react"
import { useActionState } from "react"
import { toast } from "sonner"
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
import { AmountInputBRL } from "@/components/dashboard/amount-input-brl"
import { depositAction } from "@/actions/transactions"
import type { DepositState } from "@/types"
import { WalletIcon } from "lucide-react"

export function FormDeposit() {
  const [state, formAction, isPending] = useActionState<
    DepositState | undefined,
    FormData
  >(depositAction, undefined)

  useEffect(() => {
    if (state?.success) {
      toast.success("Depósito realizado com sucesso!")
    }
  }, [state?.success])

  return (
    <Card className="w-full overflow-hidden lg:w-72">
      <CardHeader className="pb-2 pt-4">
        <div>
          <CardTitle className="text-base">Depositar créditos</CardTitle>
          <CardDescription className="text-sm">
            Adicione créditos à sua carteira
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
            <Field data-invalid={!!state?.fieldErrors?.amount}>
              <FieldLabel htmlFor="amount">Valor (R$)</FieldLabel>
              <AmountInputBRL
                id="amount"
                name="amount"
                step={5}
                required
                defaultValue={0}
                aria-invalid={!!state?.fieldErrors?.amount}
              />
              <FieldError
                errors={
                  state?.fieldErrors?.amount?.map((m) => ({ message: m })) ?? []
                }
              />
            </Field>

            <div className="flex justify-end">
              <Button type="submit" disabled={isPending} size="sm" className="w-full">
                <WalletIcon data-icon="inline-start" />
                {isPending ? "Depositando…" : "Depositar"}
              </Button>
            </div>
          </FieldGroup>
        </form>
      </CardContent>
    </Card>
  )
}
