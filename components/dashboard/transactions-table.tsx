"use client"

import { useEffect } from "react"
import { useActionState } from "react"
import { toast } from "sonner"
import { TransactionDirection, TransactionType } from "@/enums"
import { reverseAction } from "@/actions/transactions"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
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
} from "@/components/ui/alert-dialog"
import { Undo2Icon } from "lucide-react"
import type { ITransaction } from "@/types"

interface TransactionsTableProps {
  transactions: ITransaction[]
  formatDate: (iso: string) => string
  formatAmount: (amount: number) => string
}

function TypeBadge({ type }: { type: ITransaction["type"] }) {
  return (
    <Badge variant={type === TransactionType.DEPOSIT ? "secondary" : "outline"}>
      {type === TransactionType.DEPOSIT ? "Depósito" : "Transferência"}
    </Badge>
  )
}

function RevertButton({ transactionId }: { transactionId: string }) {
  const [state, formAction, isPending] = useActionState(reverseAction, undefined)

  useEffect(() => {
    if (state?.success) {
      toast.success("Transferência revertida com sucesso!")
    }
  }, [state?.success])

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Undo2Icon data-icon="inline-start" />
          Reverter
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <form action={formAction}>
          <input type="hidden" name="transactionId" value={transactionId} />
          <AlertDialogHeader>
            <AlertDialogTitle>Reverter transferência?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação devolverá o valor para sua carteira. Só é possível
              reverter dentro de 10 minutos após a transferência.
            </AlertDialogDescription>
          </AlertDialogHeader>
          {state?.error && (
            <p className="text-sm text-destructive">{state.error}</p>
          )}
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isPending}>Cancelar</AlertDialogCancel>
            <AlertDialogAction type="submit" disabled={isPending}>
              {isPending ? "Revertendo…" : "Confirmar"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </form>
      </AlertDialogContent>
    </AlertDialog>
  )
}

export function TransactionsTable({
  transactions,
  formatDate,
  formatAmount,
}: TransactionsTableProps) {
  if (transactions.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-muted-foreground">
        Nenhuma transação encontrada
      </p>
    )
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
            <TableCell className="tabular-nums">
              {tx.direction === TransactionDirection.RECEIVED ? "+" : "-"}
              {formatAmount(tx.amount)}
            </TableCell>
            <TableCell className="text-muted-foreground">
              {formatDate(tx.createdAt)}
            </TableCell>
            <TableCell className="text-muted-foreground">
              {tx.counterpartEmail ??
                (tx.type === TransactionType.DEPOSIT ? "Depósito" : "—")}
            </TableCell>
            <TableCell className="text-right">
              {tx.canReverse ? (
                <RevertButton transactionId={tx.id} />
              ) : (
                <span className="text-muted-foreground text-sm">—</span>
              )}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
