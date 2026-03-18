"use client"

import { useState } from "react"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { FormBilling } from "@/components/dashboard/forms/form-billing"

export function BuyCreditsSheet({
  children,
  defaultPackageId,
  creditsRemaining,
}: {
  children: React.ReactNode
  defaultPackageId?: string
  creditsRemaining?: number | null
}) {
  const [open, setOpen] = useState(false)
  const credits = creditsRemaining ?? 0

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>{children}</SheetTrigger>
      <SheetContent className="sm:max-w-md">
        <SheetHeader>
          <SheetTitle>Comprar créditos</SheetTitle>
          <SheetDescription>
            <span className="flex flex-col gap-1">
              <span>Escolha o pacote ideal para suas necessidades</span>
              <span className="font-medium tabular-nums text-foreground">
                Créditos atuais: {credits}
              </span>
            </span>
          </SheetDescription>
        </SheetHeader>
        <div className="mt-6 p-6 bg-background">
          <FormBilling
            defaultPackageId={defaultPackageId}
            onSuccess={() => setOpen(false)}
          />
        </div>
      </SheetContent>
    </Sheet>
  )
}
