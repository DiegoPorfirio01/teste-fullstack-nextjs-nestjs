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
}: {
  children: React.ReactNode
  defaultPackageId?: string
}) {
  const [open, setOpen] = useState(false)

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>{children}</SheetTrigger>
      <SheetContent className="sm:max-w-md">
        <SheetHeader>
          <SheetTitle>Comprar créditos</SheetTitle>
          <SheetDescription>
            Escolha o pacote ideal para suas necessidades
          </SheetDescription>
        </SheetHeader>
        <div className="mt-6">
          <FormBilling
            onSuccess={() => setOpen(false)}
            defaultPackageId={defaultPackageId}
          />
        </div>
      </SheetContent>
    </Sheet>
  )
}
