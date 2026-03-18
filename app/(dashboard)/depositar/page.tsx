import type { Metadata } from "next"
import { getWalletCredits } from "@/actions/wallet"
import { ActionError } from "@/components/dashboard/action-error"
import { PageContainer, PageHeader } from "@/components/dashboard/page-layout"
import { FormDeposit } from "@/components/dashboard/forms/form-deposit"

export const metadata: Metadata = {
  title: "Depositar",
  description: "Adicione créditos à sua carteira",
}

export default async function DepositarPage() {
  const creditsResult = await getWalletCredits()
  const credits = "data" in creditsResult ? creditsResult.data : 0

  return (
    <PageContainer>
      <ActionError result={creditsResult} />
      <PageHeader
        title="Depositar"
        description={
          <>
            Adicione créditos à sua carteira. Saldo atual:{" "}
            <span className="font-medium tabular-nums text-foreground">
              {credits ?? 0}
            </span>{" "}
            créditos
          </>
        }
      />

      <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:gap-8">
        <aside className="shrink-0 lg:sticky lg:top-[calc(var(--header-height)+1rem)]">
          <FormDeposit />
        </aside>
      </div>
    </PageContainer>
  )
}
