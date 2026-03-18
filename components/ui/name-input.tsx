import * as React from "react"
import { UserIcon } from "lucide-react"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

export interface NameInputProps
  extends Omit<React.ComponentProps<typeof Input>, "type"> {
  type?: "text"
}

const NameInput = React.forwardRef<HTMLInputElement, NameInputProps>(
  ({ className, ...props }, ref) => {
    return (
      <div className="relative">
        <UserIcon
          data-slot="input-icon"
          className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
        />
        <Input
          ref={ref}
          type="text"
          className={cn("pl-9", className)}
          {...props}
        />
      </div>
    )
  }
)

NameInput.displayName = "NameInput"

export { NameInput }
