"use client"

import * as React from "react"
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts"
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  ToggleGroup,
  ToggleGroupItem,
} from "@/components/ui/toggle-group"
import { useIsMobile } from "@/hooks/use-mobile"
import { getTransactionsByPeriod } from "@/actions/transactions"
import { formatCurrency } from "@/lib/formatters"
import type { TransactionByPeriodItem } from "@/types"

type TimeRange = "90d" | "30d" | "7d"

const DAYS_MAP: Record<TimeRange, 7 | 30 | 90> = {
  "7d": 7,
  "30d": 30,
  "90d": 90,
}

const chartConfig = {
  recebido: {
    label: "Recebido",
    color: "hsl(var(--chart-2))",
  },
  enviado: {
    label: "Enviado",
    color: "hsl(var(--chart-1))",
  },
} satisfies ChartConfig

export function ChartTransactions() {
  const isMobile = useIsMobile()
  const [timeRange, setTimeRange] = React.useState<TimeRange>("7d")
  const [chartData, setChartData] = React.useState<TransactionByPeriodItem[]>([])
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

  React.useEffect(() => {
    if (!isMobile && timeRange === "7d") {
      setTimeRange("30d")
    }
  }, [isMobile, timeRange])

  const days = DAYS_MAP[timeRange]

  React.useEffect(() => {
    setLoading(true)
    setError(null)
    getTransactionsByPeriod(days)
      .then((res) => {
        if ("data" in res) {
          setChartData(res.data ?? [])
          setError(null)
        } else {
          setChartData([])
          setError(res.error)
        }
      })
      .finally(() => setLoading(false))
  }, [days])

  const daysBack = days

  const totalRecebido = chartData.reduce((s, d) => s + d.recebido, 0)
  const totalEnviado = chartData.reduce((s, d) => s + d.enviado, 0)

  return (
    <Card className="@container/card">
      <CardHeader>
        <CardTitle>Transações por período</CardTitle>
        <CardDescription>
          <span className="hidden @[540px]/card:block">
            Recebimentos e envios nos últimos{" "}
            {timeRange === "90d" ? "3 meses" : timeRange === "30d" ? "30 dias" : "7 dias"}
          </span>
          <span className="@[540px]/card:hidden">
            Últimos {daysBack} dias
          </span>
        </CardDescription>
        <CardAction>
          <ToggleGroup
            type="single"
            value={timeRange}
            onValueChange={(v) => v && setTimeRange(v as TimeRange)}
            variant="outline"
            className="hidden *:data-[slot=toggle-group-item]:px-4! @[767px]/card:flex"
          >
            <ToggleGroupItem value="90d">Últimos 3 meses</ToggleGroupItem>
            <ToggleGroupItem value="30d">Últimos 30 dias</ToggleGroupItem>
            <ToggleGroupItem value="7d">Últimos 7 dias</ToggleGroupItem>
          </ToggleGroup>
          <Select value={timeRange} onValueChange={(v) => setTimeRange(v as TimeRange)}>
            <SelectTrigger
              className="flex w-40 **:data-[slot=select-value]:block **:data-[slot=select-value]:truncate @[767px]/card:hidden"
              size="sm"
              aria-label="Selecione um período"
            >
              <SelectValue placeholder="Últimos 30 dias" />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              <SelectItem value="90d" className="rounded-lg">
                Últimos 3 meses
              </SelectItem>
              <SelectItem value="30d" className="rounded-lg">
                Últimos 30 dias
              </SelectItem>
              <SelectItem value="7d" className="rounded-lg">
                Últimos 7 dias
              </SelectItem>
            </SelectContent>
          </Select>
        </CardAction>
      </CardHeader>
      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        {error && (
          <p className="mb-4 text-sm text-destructive">{error}</p>
        )}
        {loading ? (
          <div className="flex h-[250px] items-center justify-center text-muted-foreground">
            Carregando...
          </div>
        ) : (
        <ChartContainer
          config={chartConfig}
          className="aspect-auto h-[250px] w-full"
        >
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="fillRecebido" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="var(--color-recebido)"
                  stopOpacity={1}
                />
                <stop
                  offset="95%"
                  stopColor="var(--color-recebido)"
                  stopOpacity={0.1}
                />
              </linearGradient>
              <linearGradient id="fillEnviado" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="var(--color-enviado)"
                  stopOpacity={0.8}
                />
                <stop
                  offset="95%"
                  stopColor="var(--color-enviado)"
                  stopOpacity={0.1}
                />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={32}
              tickFormatter={(value) => {
                const date = new Date(value)
                return date.toLocaleDateString("pt-BR", {
                  month: "short",
                  day: "numeric",
                })
              }}
            />
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  labelFormatter={(value) =>
                    new Date(value).toLocaleDateString("pt-BR", {
                      month: "short",
                      day: "numeric",
                    })
                  }
                  formatter={(value) =>
                    formatCurrency(Number(value))
                  }
                  indicator="dot"
                />
              }
            />
            <Area
              dataKey="recebido"
              type="natural"
              fill="url(#fillRecebido)"
              stroke="var(--color-recebido)"
              stackId="a"
            />
            <Area
              dataKey="enviado"
              type="natural"
              fill="url(#fillEnviado)"
              stroke="var(--color-enviado)"
              stackId="a"
            />
          </AreaChart>
        </ChartContainer>
        )}
        <div className="mt-4 flex flex-wrap gap-4 text-sm">
          <span className="text-muted-foreground">
            Total recebido:{" "}
            <span className="font-medium tabular-nums text-foreground">
              {formatCurrency(totalRecebido)}
            </span>
          </span>
          <span className="text-muted-foreground">
            Total enviado:{" "}
            <span className="font-medium tabular-nums text-foreground">
              {formatCurrency(totalEnviado)}
            </span>
          </span>
        </div>
      </CardContent>
    </Card>
  )
}
