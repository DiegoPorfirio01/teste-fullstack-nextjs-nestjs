'use client';

import {
  TransactionDirection,
  TransactionStatus,
  TransactionTabFilter,
} from '@/enums';
import { useActionState, useCallback, useEffect, useMemo, useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
} from '@/components/ui/pagination';
import {
  ChevronsLeftIcon,
  ChevronsRightIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  HistoryIcon,
  SearchIcon,
} from 'lucide-react';
import type { ITransaction, ReverseState } from '@/types';
import { formatCurrency, formatDate } from '@/lib/formatters';
import { TransactionsTable } from './transactions-table';
import { reverseAction } from '@/actions/transactions';
import { showErrorToast, showSuccessToast } from '@/lib/toast';
import { TOAST_MESSAGES } from '@/constants/toast-messages';

function filterBySearch(list: ITransaction[], search: string): ITransaction[] {
  if (!search.trim()) return list;
  const q = search.trim().toLowerCase();
  return list.filter((tx) => tx.counterpartEmail?.toLowerCase().includes(q));
}

const received = (tx: ITransaction) =>
  tx.direction === TransactionDirection.RECEIVED &&
  tx.status === TransactionStatus.COMPLETED;
const sent = (tx: ITransaction) =>
  tx.direction === TransactionDirection.SENT &&
  tx.status === TransactionStatus.COMPLETED;
const reverted = (tx: ITransaction) => tx.status === TransactionStatus.REVERSED;

const PAGE_SIZE_OPTIONS = [10, 25, 50] as const;
const TABLE_HEIGHT = 'h-[400px]';

interface TransactionsHistorySectionProps {
  transactions: ITransaction[];
}

export function TransactionsHistorySection({
  transactions,
}: TransactionsHistorySectionProps) {
  const [reverseState, reverseFormAction, reverseIsPending] = useActionState<
    ReverseState | undefined,
    FormData
  >(reverseAction, undefined);

  useEffect(() => {
    if (reverseState?.success) {
      showSuccessToast(TOAST_MESSAGES.REVERT_SUCCESS);
    }
    if (reverseState?.error) {
      showErrorToast(reverseState.error);
    }
  }, [
    reverseState?.success,
    reverseState?.error,
    reverseState?.transactionId,
  ]);

  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState<TransactionTabFilter>(
    TransactionTabFilter.SENT,
  );
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState<number>(10);

  const receivedList = useMemo(
    () => filterBySearch(transactions.filter(received), search),
    [transactions, search],
  );
  const sentList = useMemo(
    () => filterBySearch(transactions.filter(sent), search),
    [transactions, search],
  );
  const revertedList = useMemo(
    () => filterBySearch(transactions.filter(reverted), search),
    [transactions, search],
  );

  const listByTab = useMemo(
    () =>
      ({
        [TransactionTabFilter.SENT]: sentList,
        [TransactionTabFilter.RECEIVED]: receivedList,
        [TransactionTabFilter.REVERTED]: revertedList,
      }) as Record<TransactionTabFilter, ITransaction[]>,
    [sentList, receivedList, revertedList],
  );

  const currentList = listByTab[activeTab];
  const totalPages = Math.max(1, Math.ceil(currentList.length / pageSize));
  const clampedPage = Math.min(page, totalPages - 1);
  const paginatedList = useMemo(
    () =>
      currentList.slice(
        clampedPage * pageSize,
        clampedPage * pageSize + pageSize,
      ),
    [currentList, clampedPage, pageSize],
  );

  const goToPage = useCallback(
    (newPage: number) =>
      setPage(Math.max(0, Math.min(newPage, totalPages - 1))),
    [totalPages],
  );

  const handleTabChange = useCallback((value: string) => {
    setActiveTab(value as TransactionTabFilter);
    setPage(0);
  }, []);

  const handlePageSizeChange = useCallback((value: string) => {
    setPageSize(Number(value));
    setPage(0);
  }, []);

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 text-base">
              <HistoryIcon />
              Histórico de transações
            </CardTitle>
            <CardDescription>
              Recebidas, enviadas e revertidas. Reversão permitida em até 10
              minutos.
            </CardDescription>
          </div>
          <div className="relative max-w-xs shrink-0">
            <SearchIcon
              className="absolute bottom-1/2 left-3 translate-y-1/2 text-muted-foreground"
              aria-hidden
            />
            <Input
              placeholder="Buscar por e-mail..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(0);
              }}
              className="pl-9"
              aria-label="Buscar transações por e-mail da contraparte"
            />
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <Tabs value={activeTab} onValueChange={handleTabChange}>
          <TabsList>
            <TabsTrigger value={TransactionTabFilter.SENT}>
              Enviadas ({sentList.length})
            </TabsTrigger>
            <TabsTrigger value={TransactionTabFilter.RECEIVED}>
              Recebidas ({receivedList.length})
            </TabsTrigger>
            <TabsTrigger value={TransactionTabFilter.REVERTED}>
              Revertidas ({revertedList.length})
            </TabsTrigger>
          </TabsList>
          <TabsContent value={TransactionTabFilter.SENT} className="mt-4">
            <div
              className={`overflow-y-auto rounded-md border ${TABLE_HEIGHT}`}
              role="region"
              aria-label="Tabela de transações enviadas"
            >
              <TransactionsTable
                transactions={paginatedList}
                formatDate={formatDate}
                formatAmount={formatCurrency}
                reverseFormAction={reverseFormAction}
                reverseIsPending={reverseIsPending}
                reverseState={reverseState}
              />
            </div>
          </TabsContent>
          <TabsContent value={TransactionTabFilter.RECEIVED} className="mt-4">
            <div
              className={`overflow-y-auto rounded-md border ${TABLE_HEIGHT}`}
              role="region"
              aria-label="Tabela de transações recebidas"
            >
              <TransactionsTable
                transactions={paginatedList}
                formatDate={formatDate}
                formatAmount={formatCurrency}
                reverseFormAction={reverseFormAction}
                reverseIsPending={reverseIsPending}
                reverseState={reverseState}
              />
            </div>
          </TabsContent>
          <TabsContent value={TransactionTabFilter.REVERTED} className="mt-4">
            <div
              className={`overflow-y-auto rounded-md border ${TABLE_HEIGHT}`}
              role="region"
              aria-label="Tabela de transações revertidas"
            >
              <TransactionsTable
                transactions={paginatedList}
                formatDate={formatDate}
                formatAmount={formatCurrency}
                reverseFormAction={reverseFormAction}
                reverseIsPending={reverseIsPending}
                reverseState={reverseState}
              />
            </div>
          </TabsContent>
        </Tabs>

        {currentList.length > 0 && (
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2">
              <Label htmlFor="rows-per-page" className="text-sm font-medium">
                Por página
              </Label>
              <Select
                value={String(pageSize)}
                onValueChange={handlePageSizeChange}
              >
                <SelectTrigger size="sm" className="w-20" id="rows-per-page">
                  <SelectValue placeholder={pageSize} />
                </SelectTrigger>
                <SelectContent side="top" align="start">
                  <SelectGroup>
                    {PAGE_SIZE_OPTIONS.map((size) => (
                      <SelectItem key={size} value={String(size)}>
                        {size}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
            <Pagination className="mx-0 w-auto">
              <PaginationContent className="flex items-center gap-1">
                <PaginationItem>
                  <Button
                    variant="outline"
                    size="icon"
                    className="size-8"
                    onClick={() => goToPage(0)}
                    disabled={clampedPage <= 0}
                    aria-label="Ir para primeira página"
                  >
                    <ChevronsLeftIcon />
                  </Button>
                </PaginationItem>
                <PaginationItem>
                  <Button
                    variant="outline"
                    size="icon"
                    className="size-8"
                    onClick={() => goToPage(clampedPage - 1)}
                    disabled={clampedPage <= 0}
                    aria-label="Ir para página anterior"
                  >
                    <ChevronLeftIcon />
                  </Button>
                </PaginationItem>
                <PaginationItem>
                  <span className="px-3 text-sm font-medium">
                    Página {clampedPage + 1} de {totalPages}
                  </span>
                </PaginationItem>
                <PaginationItem>
                  <Button
                    variant="outline"
                    size="icon"
                    className="size-8"
                    onClick={() => goToPage(clampedPage + 1)}
                    disabled={clampedPage >= totalPages - 1}
                    aria-label="Ir para próxima página"
                  >
                    <ChevronRightIcon />
                  </Button>
                </PaginationItem>
                <PaginationItem>
                  <Button
                    variant="outline"
                    size="icon"
                    className="size-8"
                    onClick={() => goToPage(totalPages - 1)}
                    disabled={clampedPage >= totalPages - 1}
                    aria-label="Ir para última página"
                  >
                    <ChevronsRightIcon />
                  </Button>
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
