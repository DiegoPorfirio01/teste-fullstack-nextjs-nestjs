import { BuyCreditsSheet } from "@/components/dashboard/buy-credits-sheet"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CreditCardIcon } from "lucide-react"
import { CREDIT_PACKAGES } from "@/constants"

export default function BillingPage() {
  return (
    <div className="flex flex-col gap-8 px-4 py-6 md:gap-10 md:px-6">
      {/* Page header */}
      <header className="page-content">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">
            Billing
          </h1>
          <p className="text-muted-foreground">
            Gerencie seus créditos e adicione mais quando precisar
          </p>
        </div>
      </header>

      {/* Pricing packages */}
      <section className="page-content">
        <div>
          <h2 className="text-lg font-semibold">Pacotes de créditos</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Quanto mais créditos, menor o preço por unidade
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {CREDIT_PACKAGES.map((pkg) => {
            const Icon = pkg.icon
            return (
              <Card
                key={pkg.id}
                className={`group relative overflow-hidden transition-all duration-200 hover:shadow-md hover:ring-2 hover:ring-primary/20 ${
                  pkg.popular
                    ? "ring-2 ring-primary shadow-lg"
                    : "ring-1 ring-foreground/10"
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
                  <BuyCreditsSheet defaultPackageId={pkg.id}>
                    <Button
                      className="w-full"
                      size="sm"
                      variant={pkg.popular ? "default" : "outline"}
                    >
                      <CreditCardIcon data-icon="inline-start" />
                      Comprar
                    </Button>
                  </BuyCreditsSheet>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </section>

      {/* How it works */}
      <section className="page-content">
        <Card className="border-dashed">
          <CardHeader>
            <CardTitle className="text-base">Como funcionam os créditos</CardTitle>
            <CardDescription>
              Os créditos são consumidos conforme você utiliza as funcionalidades
              da plataforma. Adicione mais sempre que precisar.
            </CardDescription>
          </CardHeader>
        </Card>
      </section>
    </div>
  )
}
