"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import type { IInvestidor } from "@/types"
import { StarIcon, UserIcon } from "lucide-react"

const MOCK_INVESTIDORES: IInvestidor[] = [
  {
    id: "1",
    name: "Maria Silva",
    email: "maria@exemplo.com",
    followedAt: "2024-01-15",
  },
  {
    id: "2",
    name: "João Santos",
    email: "joao@exemplo.com",
    followedAt: "2024-02-20",
  },
  {
    id: "3",
    name: "Ana Costa",
    followedAt: "2024-03-10",
  },
]

export function ConnectedInvestidores() {
  const investidores = MOCK_INVESTIDORES

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <StarIcon className="size-4" />
          </div>
          <div>
            <CardTitle>Investidores seguidos</CardTitle>
            <CardDescription>
              Investidores que você acompanha na plataforma
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {investidores.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Você ainda não segue nenhum investidor. Explore a plataforma para
            descobrir investidores e começar a acompanhar.
          </p>
        ) : (
          <div className="flex flex-col gap-3">
            {investidores.map((inv) => (
              <div
                key={inv.id}
                className="flex items-center justify-between gap-4 rounded-lg border p-4"
              >
                <div className="flex items-center gap-3">
                  <Avatar className="size-10">
                    <AvatarImage src={inv.avatarUrl} alt={inv.name} />
                    <AvatarFallback className="bg-muted">
                      <UserIcon className="size-5 text-muted-foreground" />
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{inv.name}</p>
                    {inv.email && (
                      <p className="text-sm text-muted-foreground">
                        {inv.email}
                      </p>
                    )}
                  </div>
                </div>
                <Button variant="outline" size="sm">
                  Deixar de seguir
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
