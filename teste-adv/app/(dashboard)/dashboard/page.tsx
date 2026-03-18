import type { Metadata } from 'next';
import { getWalletCredits } from '@/actions/wallet';
import { getTransactions } from '@/actions/transactions';
import { ActionError } from '@/components/dashboard/action-error';
import { ChartTransactions } from '@/components/dashboard/chart-transactions';
import { DashboardCards } from '@/components/dashboard/dashboard-cards';
import { TransactionsHistorySection } from '@/components/dashboard/transactions-history-section';
import type { ITransaction } from '@/types';
import { extractList } from '@/lib/api-response';

export const metadata: Metadata = {
  title: 'Painel',
  description: 'Visão geral da sua carteira, transações e créditos',
};

export default async function DashboardPage() {
  const [creditsResult, transactionsResult] = await Promise.all([
    getWalletCredits(),
    getTransactions(),
  ]);

  const credits: number = creditsResult.data ?? 0;
  const transactions: ITransaction[] =
    extractList<ITransaction>(transactionsResult);

  return (
    <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
      <ActionError result={creditsResult} className="px-4 lg:px-6" />
      <ActionError result={transactionsResult} className="px-4 lg:px-6" />
      <DashboardCards balance={credits} transactions={transactions} />
      <div className="px-4 lg:px-6">
        <ChartTransactions />
      </div>
      <div className="px-4 lg:px-6">
        <TransactionsHistorySection transactions={transactions} />
      </div>
    </div>
  );
}
