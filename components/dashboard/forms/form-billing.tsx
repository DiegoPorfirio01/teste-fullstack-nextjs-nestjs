"use client"

import { useActionState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
  Field,
  FieldError,
  FieldGroup,
} from "@/components/ui/field"
import { buyCreditsAction } from "@/actions/billing"
import type { BuyCreditsState } from "@/actions/billing"
import { CREDIT_PACKAGES } from "@/constants"
import { toast } from "sonner"
import { CreditCardIcon } from "lucide-react"

export function FormBilling({
  onSuccess,
  defaultPackageId,
}: {
  onSuccess?: () => void
  defaultPackageId?: string
}) {
  const [state, formAction, isPending] = useActionState<
    BuyCreditsState | undefined,
    FormData
  >(buyCreditsAction, undefined)

  useEffect(() => {
    if (state?.success) {
      toast.success("Créditos comprados com sucesso!")
      onSuccess?.()
    }
  }, [state?.success, onSuccess])

  return (
    <form action={formAction}>
      <FieldGroup className="gap-4">
        {state?.error && (
          <Field data-invalid>
            <FieldError>{state.error}</FieldError>
          </Field>
        )}

        <div className="flex flex-col gap-2">
          <span className="text-sm font-medium">Selecione um pacote</span>
          <div className="flex flex-col gap-2">
            {CREDIT_PACKAGES.map((pkg) => {
              const Icon = pkg.icon
              return (
                <label
                  key={pkg.id}
                  className="flex cursor-pointer items-center gap-3 rounded-xl border p-4 transition-all has-checked:border-primary has-checked:bg-primary/5 has-checked:ring-2 has-checked:ring-primary/20 hover:border-primary/50"
                >
                  <input
                    type="radio"
                    name="packageId"
                    value={pkg.id}
                    className="size-4 shrink-0 accent-primary"
                    defaultChecked={
                      defaultPackageId
                        ? pkg.id === defaultPackageId
                        : pkg.popular
                    }
                  />
                  <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Icon className="size-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <span className="font-medium">
                      {pkg.credits} créditos
                    </span>
                    <span className="ml-1 text-muted-foreground">
                      · {pkg.pricePerCredit}/crédito
                    </span>
                  </div>
                  <span className="shrink-0 font-semibold tabular-nums">
                    {pkg.price}
                  </span>
                  {pkg.popular && (
                    <span className="shrink-0 rounded-full bg-primary/20 px-2 py-0.5 text-xs font-medium text-primary">
                      Popular
                    </span>
                  )}
                </label>
              )
            })}
          </div>
        </div>

        <Button
          type="submit"
          disabled={isPending}
          className="w-full"
          size="lg"
        >
          <CreditCardIcon data-icon="inline-start" />
          {isPending ? "Processando…" : "Confirmar compra"}
        </Button>
      </FieldGroup>
    </form>
  )
}
