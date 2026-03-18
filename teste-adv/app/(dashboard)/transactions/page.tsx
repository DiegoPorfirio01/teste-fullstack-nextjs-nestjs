import type { Metadata } from "next"
import { getWalletCredits } from "@/actions/wallet"
import { getTransactions } from "@/actions/transactions"
import { ActionError } from "@/components/dashboard/action-error"
import { PageContainer, PageHeader } from "@/components/dashboard/page-layout"
import { FormTransfer } from "@/components/dashboard/forms/form-transfer"
import { TransactionsHistorySection } from "@/components/dashboard/transactions-history-section"

export const metadata: Metadata = {
  title: "Transações",
  description: "Transfira créditos e consulte o histórico",
}

export default async function TransacoesPage() {
  const [creditsResult, transactionsResult] = await Promise.all([
    getWalletCredits(),
    getTransactions(),
  ])

  const credits = "data" in creditsResult ? creditsResult.data : 0
  const transactions = "data" in transactionsResult ? transactionsResult.data ?? [] : []

  return (
    <PageContainer>
      <ActionError result={creditsResult} />
      <ActionError result={transactionsResult} />
      <PageHeader
        title="Transações"
        description={
          <>
            Transfira créditos e consulte o histórico. Saldo disponível:{" "}
            <span className="font-medium tabular-nums text-foreground">
              {credits ?? 0}
            </span>{" "}
            créditos
          </>
        }
      />

      <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:gap-8">
        <aside className="shrink-0 lg:sticky lg:top-[calc(var(--header-height)+1rem)]">
          <FormTransfer />
        </aside>
        <main className="min-w-0 flex-1">
          <TransactionsHistorySection transactions={transactions} />
        </main>
      </div>
    </PageContainer>
  )
}
