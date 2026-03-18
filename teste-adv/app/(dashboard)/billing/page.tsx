import type { Metadata } from 'next';
import { getCreditPurchases } from '@/actions/credits';
import { getWalletCredits } from '@/actions/wallet';
import { formatCurrency, formatDate } from '@/lib/formatters';
import { ActionError } from '@/components/dashboard/action-error';
import {
  PageContainer,
  PageHeader,
  PageSection,
} from '@/components/dashboard/page-layout';
import { BuyCreditsSheet } from '@/components/dashboard/buy-credits-sheet';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { CreditCardIcon, HistoryIcon } from 'lucide-react';
import { CREDIT_PACKAGES } from '@/constants';

export const metadata: Metadata = {
  title: 'Comprar Crédito',
  description: 'Gerencie seus créditos e adicione mais quando precisar',
};

export default async function BillingPage() {
  const [creditsResult, purchasesResult] = await Promise.all([
    getWalletCredits(),
    getCreditPurchases(),
  ]);
  const credits = 'data' in creditsResult ? creditsResult.data : 0;
  const purchases =
    'data' in purchasesResult ? (purchasesResult.data ?? []) : [];

  return (
    <PageContainer>
      <ActionError result={creditsResult} />
      <ActionError result={purchasesResult} />
      <PageHeader
        title="Comprar Crédito"
        description="Gerencie seus créditos e adicione mais quando precisar"
      />

      <PageSection>
        <div>
          <h2 className="text-lg font-semibold">Pacotes de créditos</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Quanto mais créditos, menor o preço por unidade
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {CREDIT_PACKAGES.map((pkg) => {
            const Icon = pkg.icon;
            return (
              <Card
                key={pkg.id}
                className={`group relative overflow-hidden transition-all duration-200 hover:shadow-md hover:ring-2 hover:ring-primary/20 ${
                  pkg.popular
                    ? 'ring-2 ring-primary shadow-lg'
                    : 'ring-1 ring-foreground/10'
                }`}
              >
                {pkg.popular && (
                  <div className="absolute right-0 top-0">
                    <div className="absolute -right-8 top-4 w-24 rotate-45 bg-primary py-0.5 text-center text-[10px] font-semibold text-primary-foreground">
                      Popular
                    </div>
                  </div>
                )}
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <Icon className="size-5" />
                    </div>
                    {pkg.discount && (
                      <Badge variant="secondary" className="shrink-0">
                        {pkg.discount}
                      </Badge>
                    )}
                  </div>
                  <CardTitle className="text-xl font-semibold">
                    {pkg.credits} créditos
                  </CardTitle>
                  <CardDescription>{pkg.description}</CardDescription>
                  <div className="mt-2 flex items-baseline gap-1.5">
                    <span className="text-2xl font-semibold tabular-nums">
                      {pkg.price}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {pkg.pricePerCredit}/crédito
                    </span>
                  </div>
                </CardHeader>
                <CardContent>
                  <BuyCreditsSheet
                    defaultPackageId={pkg.id}
                    creditsRemaining={credits}
                  >
                    <Button
                      className="w-full"
                      size="sm"
                      variant={pkg.popular ? 'default' : 'outline'}
                    >
                      <CreditCardIcon data-icon="inline-start" />
                      Comprar
                    </Button>
                  </BuyCreditsSheet>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </PageSection>

      <PageSection>
        <div>
          <h2 className="text-lg font-semibold">Histórico de compras</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Todas as compras de créditos realizadas na sua conta
          </p>
        </div>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <HistoryIcon className="size-4" />
              Compras de créditos
            </CardTitle>
            <CardDescription>
              Lista de todas as compras realizadas
            </CardDescription>
          </CardHeader>
          <CardContent>
            {purchases.length === 0 ? (
              <p className="py-8 text-center text-sm text-muted-foreground">
                Nenhuma compra de créditos encontrada
              </p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Pacote</TableHead>
                    <TableHead>Créditos</TableHead>
                    <TableHead>Data</TableHead>
                    <TableHead className="text-right">Valor</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {purchases.map((purchase) => {
                    const pkg = CREDIT_PACKAGES.find(
                      (p) => p.id === purchase.packageId,
                    );
                    return (
                      <TableRow key={purchase.id}>
                        <TableCell>
                          {pkg ? (
                            <span className="font-medium">
                              {pkg.credits} créditos
                            </span>
                          ) : (
                            <Badge variant="secondary">
                              {purchase.packageId}
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="tabular-nums">
                          +{purchase.credits}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {formatDate(purchase.createdAt)}
                        </TableCell>
                        <TableCell className="text-right tabular-nums">
                          {purchase.amount != null
                            ? formatCurrency(purchase.amount, {
                                maximumFractionDigits: 2,
                              })
                            : (pkg?.price ?? '—')}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </PageSection>
    </PageContainer>
  );
}
