import { cn } from "@/lib/utils"

type ActionResultLike = { error?: string; data?: unknown }

interface ActionErrorProps {
  result: ActionResultLike
  className?: string
}

export function ActionError({ result, className }: ActionErrorProps) {
  if (!("error" in result) || !result.error) return null
  return (
    <p className={cn("text-sm text-destructive", className)}>{result.error}</p>
  )
}
