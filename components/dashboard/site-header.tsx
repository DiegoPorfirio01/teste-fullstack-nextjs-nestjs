import { getWalletCredits } from "@/actions/wallet"
import { BuyCreditsSheet } from "@/components/dashboard/buy-credits-sheet"
import { SiteHeaderBreadcrumbs } from "@/components/dashboard/site-header-breadcrumbs"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { CreditCardIcon } from "lucide-react"

export async function SiteHeader() {
  const creditsRemaining = await getWalletCredits()

  return (
    <header className="flex h-(--header-height) shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)">
      <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
        <SidebarTrigger className="-ml-1" />
        <Separator
          orientation="vertical"
          className="mx-2 data-[orientation=vertical]:h-4"
        />
        <div className="flex flex-1 items-center">
          <SiteHeaderBreadcrumbs />
        </div>
        <BuyCreditsSheet>
          <Button variant="outline" size="sm" className="cursor-pointer">
            <CreditCardIcon data-icon="inline-start" />
            {creditsRemaining != null ? (
              <>Comprar créditos ({creditsRemaining} restantes)</>
            ) : (
              "Comprar créditos"
            )}
          </Button>
        </BuyCreditsSheet>
      </div>
    </header>
  )
}
