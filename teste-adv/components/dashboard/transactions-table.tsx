'use client';

import {
  TransactionDirection,
  TransactionStatus,
  TransactionType,
} from '@/enums';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Undo2Icon } from 'lucide-react';
import { cn, isWithinRevertWindow } from '@/lib/utils';
import { TypeBadge } from '@/components/dashboard/transaction-type-badge';
import type { ReverseState, TransactionsTableProps } from '@/types';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';

function RevertButton({
  transactionId,
  disabled,
  disabledReason,
  hideWhenDisabled,
  reverseFormAction,
  reverseIsPending,
  reverseState,
}: {
  transactionId: string;
  disabled?: boolean;
  disabledReason?: string;
  hideWhenDisabled?: boolean;
  reverseFormAction: TransactionsTableProps['reverseFormAction'];
  reverseIsPending: boolean;
  reverseState: ReverseState | undefined;
}) {
  const trigger = (
    <Button
      variant="outline"
      size="sm"
      disabled={disabled || reverseIsPending}
    >
      <Undo2Icon data-icon="inline-start" />
      Reverter
    </Button>
  );

  if (disabled) {
    if (hideWhenDisabled) {
      return <span className="text-muted-foreground text-sm">—</span>;
    }
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <span className="inline-flex cursor-not-allowed">{trigger}</span>
        </TooltipTrigger>
        <TooltipContent>
          {disabledReason ??
            'Só é possível reverter dentro de 10 minutos após a transferência.'}
        </TooltipContent>
      </Tooltip>
    );
  }

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>{trigger}</AlertDialogTrigger>
      <AlertDialogContent>
        <form action={reverseFormAction}>
          <input type="hidden" name="transactionId" value={transactionId} />
          <AlertDialogHeader>
            <AlertDialogTitle>Reverter transferência?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação devolverá o valor para sua carteira. Só é possível
              reverter dentro de 10 minutos após a transferência.
            </AlertDialogDescription>
          </AlertDialogHeader>
          {reverseState?.transactionId === transactionId &&
            reverseState?.error && (
              <p className="text-sm text-destructive">{reverseState.error}</p>
            )}
          <AlertDialogFooter>
            <AlertDialogCancel disabled={reverseIsPending}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction type="submit" disabled={reverseIsPending}>
              {reverseIsPending ? 'Revertendo…' : 'Confirmar'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </form>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export function TransactionsTable({
  transactions,
  formatDate,
  formatAmount,
  reverseFormAction,
  reverseIsPending,
  reverseState,
}: TransactionsTableProps) {
  if (transactions.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-muted-foreground">
        Nenhuma transação encontrada
      </p>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Tipo</TableHead>
          <TableHead>Valor</TableHead>
          <TableHead>Data</TableHead>
          <TableHead>Contraparte</TableHead>
          <TableHead className="text-right">Ação</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {transactions.map((tx) => (
          <TableRow key={tx.id}>
            <TableCell>
              <TypeBadge type={tx.type} />
            </TableCell>
            <TableCell
              className={cn(
                'tabular-nums font-medium',
                tx.status === TransactionStatus.REVERSED &&
                  'text-yellow-600 dark:text-yellow-500',
                tx.status !== TransactionStatus.REVERSED &&
                  tx.direction === TransactionDirection.RECEIVED &&
                  'text-blue-600 dark:text-blue-400',
                tx.status !== TransactionStatus.REVERSED &&
                  tx.direction === TransactionDirection.SENT &&
                  'text-red-600 dark:text-red-400',
              )}
            >
              {tx.direction === TransactionDirection.RECEIVED ? '+' : '-'}
              {formatAmount(tx.amount)}
            </TableCell>
            <TableCell className="text-muted-foreground">
              {formatDate(tx.createdAt)}
            </TableCell>
            <TableCell className="text-muted-foreground">
              {tx.counterpartEmail ??
                (tx.type === TransactionType.DEPOSIT ? 'Depósito' : '—')}
            </TableCell>
            <TableCell className="text-right">
              {tx.direction === TransactionDirection.SENT &&
              tx.type === TransactionType.TRANSFER ? (
                <RevertButton
                  transactionId={tx.id}
                  disabled={
                    !tx.canReverse || !isWithinRevertWindow(tx.createdAt)
                  }
                  hideWhenDisabled={tx.status !== TransactionStatus.COMPLETED}
                  disabledReason={undefined}
                  reverseFormAction={reverseFormAction}
                  reverseIsPending={reverseIsPending}
                  reverseState={reverseState}
                />
              ) : (
                <span className="text-muted-foreground text-sm">—</span>
              )}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
