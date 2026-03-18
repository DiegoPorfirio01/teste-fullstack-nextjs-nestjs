import * as React from "react"
import { KeyRoundIcon, LockIcon } from "lucide-react"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

export interface PasswordInputProps
  extends Omit<React.ComponentProps<typeof Input>, "type"> {
  type?: "password"
  /** Ícone exibido: "lock" (padrão) para nova senha, "key" para senha atual */
  icon?: "lock" | "key"
}

const PasswordInput = React.forwardRef<HTMLInputElement, PasswordInputProps>(
  ({ className, icon = "lock", ...props }, ref) => {
    const IconComponent = icon === "key" ? KeyRoundIcon : LockIcon
    return (
      <div className="relative">
        <IconComponent
          data-slot="input-icon"
          className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
        />
        <Input
          ref={ref}
          type="password"
          autoComplete={props.autoComplete ?? "current-password"}
          className={cn("pl-9", className)}
          {...props}
        />
      </div>
    )
  }
)

PasswordInput.displayName = "PasswordInput"

export { PasswordInput }
