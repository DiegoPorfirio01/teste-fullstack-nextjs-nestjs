"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { ButtonGroup, ButtonGroupText } from "@/components/ui/button-group"
import { Input } from "@/components/ui/input"
import { MinusIcon, PlusIcon } from "lucide-react"
import { cn } from "@/lib/utils"

const STEP = 1
const MIN = 0

function formatBRL(value: number): string {
  if (Number.isNaN(value) || value < 0) return "0,00"
  return value.toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}

function parseBRL(str: string): number {
  const cleaned = str.replace(/\./g, "").replace(",", ".").trim()
  const parsed = parseFloat(cleaned)
  return Number.isNaN(parsed) ? 0 : Math.max(0, parsed)
}

export type AmountInputBRLProps = {
  id?: string
  name?: string
  defaultValue?: number
  onChange?: (value: number) => void
  min?: number
  step?: number
  required?: boolean
  disabled?: boolean
  className?: string
}

export function AmountInputBRL({
  id = "amount",
  name = "amount",
  defaultValue = 0,
  onChange,
  min = MIN,
  step = STEP,
  required = false,
  disabled = false,
  className,
}: AmountInputBRLProps) {
  const [amount, setAmount] = useState(defaultValue)
  const [inputText, setInputText] = useState(() => formatBRL(defaultValue))

  const updateValue = (next: number) => {
    const clamped = Math.max(min, next)
    setAmount(clamped)
    setInputText(formatBRL(clamped))
    onChange?.(clamped)
  }

  const handleDecrease = () => {
    updateValue(amount - step)
  }

  const handleIncrease = () => {
    updateValue(amount + step)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value
    setInputText(raw)
    setAmount(parseBRL(raw))
    onChange?.(parseBRL(raw))
  }

  const handleInputBlur = () => {
    updateValue(amount)
  }

  return (
    <ButtonGroup
      className={cn(
        "w-full min-w-0 rounded-lg focus-within:ring-3 focus-within:ring-ring/50",
        disabled && "pointer-events-none opacity-50",
        className
      )}
    >
      <ButtonGroupText
        asChild
        className="min-w-0 flex-1 gap-2 bg-background px-4 dark:bg-input/30"
      >
        <div className="flex min-w-0 flex-1 items-center">
          <span className="shrink-0 text-sm font-medium text-muted-foreground">
            R$
          </span>
          <Input
            id={id}
            type="text"
            inputMode="decimal"
            value={inputText}
            onChange={handleInputChange}
            onBlur={handleInputBlur}
            placeholder="0,00"
            disabled={disabled}
            className="h-auto min-h-0 min-w-0 flex-1 border-0 bg-transparent p-0 text-base font-medium tabular-nums shadow-none focus-visible:ring-0 focus-visible:ring-offset-0 md:text-sm"
            aria-label="Valor em reais"
          />
          {name && (
            <input
              type="hidden"
              name={name}
              value={amount}
              required={required}
              readOnly
              aria-hidden
            />
          )}
        </div>
      </ButtonGroupText>
      <Button
        type="button"
        variant="outline"
        size="icon-sm"
        aria-label="Diminuir valor"
        onClick={handleDecrease}
        disabled={disabled || amount <= min}
      >
        <MinusIcon />
      </Button>
      <Button
        type="button"
        variant="outline"
        size="icon-sm"
        aria-label="Aumentar valor"
        onClick={handleIncrease}
        disabled={disabled}
      >
        <PlusIcon />
      </Button>
    </ButtonGroup>
  )
}
