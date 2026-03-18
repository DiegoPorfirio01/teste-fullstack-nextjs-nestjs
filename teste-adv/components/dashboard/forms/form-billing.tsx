'use client';

import { useEffect, useRef } from 'react';
import { useActionState } from 'react';
import { showSuccessToast } from '@/lib/toast';
import { TOAST_MESSAGES } from '@/constants/toast-messages';
import { Button } from '@/components/ui/button';
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLegend,
  FieldSet,
} from '@/components/ui/field';
import { buyCreditsAction } from '@/actions/billing';
import type { BuyCreditsState } from '@/types';
import { CREDIT_PACKAGES } from '@/constants';
import { CreditCardIcon } from 'lucide-react';

export function FormBilling({
  defaultPackageId,
  onSuccess,
}: {
  defaultPackageId?: string;
  onSuccess?: () => void;
}) {
  const [state, formAction, isPending] = useActionState<
    BuyCreditsState | undefined,
    FormData
  >(buyCreditsAction, undefined);

  const onSuccessRef = useRef(onSuccess);
  useEffect(() => {
    onSuccessRef.current = onSuccess;
  }, [onSuccess]);
  useEffect(() => {
    if (state?.success) {
      showSuccessToast(TOAST_MESSAGES.CREDITS_PURCHASED);
      onSuccessRef.current?.();
    }
  }, [state?.success]);

  return (
    <form action={formAction}>
      <FieldGroup className="gap-4">
        {state?.error && (
          <Field data-invalid>
            <FieldError>{state.error}</FieldError>
          </Field>
        )}

        <Field data-invalid={!!state?.fieldErrors?.packageId}>
          <FieldSet>
            <FieldLegend variant="label">Selecione um pacote</FieldLegend>
            <div className="flex flex-col gap-2">
              {CREDIT_PACKAGES.map((pkg) => {
                const Icon = pkg.icon;
                return (
                  <label
                    key={pkg.id}
                    className="flex cursor-pointer items-center gap-3 rounded-xl border p-4 transition-all has-checked:border-primary has-checked:bg-primary/5 has-checked:ring-2 has-checked:ring-primary/20 hover:border-primary/50"
                  >
                    {/* eslint-disable-next-line jsx-a11y/role-supports-aria-props */}
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
                      aria-invalid={!!state?.fieldErrors?.packageId}
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
                );
              })}
            </div>
            <FieldError
              errors={
                state?.fieldErrors?.packageId?.map((m) => ({ message: m })) ??
                []
              }
            />
          </FieldSet>
        </Field>

        <Button type="submit" disabled={isPending} className="w-full" size="lg">
          <CreditCardIcon data-icon="inline-start" />
          {isPending ? 'Processando…' : 'Confirmar compra'}
        </Button>
      </FieldGroup>
    </form>
  );
}
