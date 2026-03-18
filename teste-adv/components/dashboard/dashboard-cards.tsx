import { TransactionDirection, TransactionStatus } from '@/enums';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  ArrowDownLeftIcon,
  ArrowUpRightIcon,
  WalletIcon,
  TrendingUpIcon,
  TrendingDownIcon,
} from 'lucide-react';
import type { ITransaction } from '@/types';
import { formatCurrency } from '@/lib/formatters';

interface DashboardCardsProps {
  balance: number | null;
  transactions: ITransaction[];
}

export function DashboardCards({ balance, transactions }: DashboardCardsProps) {
  const completed = transactions.filter(
    (tx) => tx.status === TransactionStatus.COMPLETED,
  );
  const received = completed.filter(
    (tx) => tx.direction === TransactionDirection.RECEIVED,
  );
  const sent = completed.filter(
    (tx) => tx.direction === TransactionDirection.SENT,
  );

  const totalRecebido = received.reduce((s, tx) => s + tx.amount, 0);
  const totalEnviado = sent.reduce((s, tx) => s + tx.amount, 0);

  const now = new Date();
  const thisMonth = now.getMonth();
  const thisYear = now.getFullYear();
  const thisMonthCount = completed.filter((tx) => {
    const d = new Date(tx.createdAt);
    return d.getMonth() === thisMonth && d.getFullYear() === thisYear;
  }).length;

  const prevMonth = thisMonth === 0 ? 11 : thisMonth - 1;
  const prevYear = thisMonth === 0 ? thisYear - 1 : thisYear;
  const prevMonthCount = completed.filter((tx) => {
    const d = new Date(tx.createdAt);
    return d.getMonth() === prevMonth && d.getFullYear() === prevYear;
  }).length;

  const monthDiff =
    prevMonthCount > 0
      ? ((thisMonthCount - prevMonthCount) / prevMonthCount) * 100
      : thisMonthCount > 0
        ? 100
        : 0;

  return (
    <div className="grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card *:data-[slot=card]:shadow-xs lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4 dark:*:data-[slot=card]:bg-card">
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Saldo disponível</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {formatCurrency(balance ?? 0)}
          </CardTitle>
          <CardAction>
            <Badge variant="outline">Créditos</Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Carteira atual <WalletIcon className="size-4" />
          </div>
          <div className="text-muted-foreground">
            Saldo disponível para transferências
          </div>
        </CardFooter>
      </Card>

      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Total recebido</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {formatCurrency(totalRecebido)}
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              <ArrowDownLeftIcon className="size-3" />
              {received.length} trans.
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Depósitos e transferências recebidas{' '}
            <ArrowDownLeftIcon className="size-4" />
          </div>
          <div className="text-muted-foreground">
            Histórico completo em Transações
          </div>
        </CardFooter>
      </Card>

      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Total enviado</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {formatCurrency(totalEnviado)}
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              <ArrowUpRightIcon className="size-3" />
              {sent.length} trans.
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Transferências realizadas <ArrowUpRightIcon className="size-4" />
          </div>
          <div className="text-muted-foreground">Envios completados</div>
        </CardFooter>
      </Card>

      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Transações este mês</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {thisMonthCount}
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              {monthDiff >= 0 ? (
                <TrendingUpIcon className="size-3" />
              ) : (
                <TrendingDownIcon className="size-3" />
              )}
              {monthDiff >= 0 ? '+' : ''}
              {monthDiff.toFixed(0)}%
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            {monthDiff >= 0 ? 'Crescimento' : 'Queda'} vs mês anterior{' '}
            <TrendingUpIcon className="size-4" />
          </div>
          <div className="text-muted-foreground">
            {prevMonthCount} transações no mês passado
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
