import { getWalletCredits } from '@/actions/wallet';
import { SiteHeaderBreadcrumbs } from '@/components/dashboard/site-header-breadcrumbs';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { CreditCardIcon } from 'lucide-react';
import { BuyCreditsSheet } from './buy-credits-sheet';
import { Button } from '../ui/button';

export async function SiteHeader() {
  const result = await getWalletCredits();
  const creditsRemaining = 'data' in result ? result.data : null;

  return (
    <header className="flex h-(--header-height) shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)">
      <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
        <SidebarTrigger className="-ml-1" />
        <div className="flex flex-1 items-center">
          <SiteHeaderBreadcrumbs />
        </div>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <BuyCreditsSheet creditsRemaining={creditsRemaining ?? 0}>
            <Button variant="outline" size="sm" className="cursor-pointer">
              <CreditCardIcon data-icon="inline-start" />
              {creditsRemaining ? (
                <>
                  <span className="tabular-nums">{creditsRemaining}</span>{' '}
                  créditos
                </>
              ) : (
                'Comprar créditos'
              )}
            </Button>
          </BuyCreditsSheet>
        </div>
      </div>
    </header>
  );
}
