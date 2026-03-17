"use client"

import { toast } from "sonner"
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { FormProfileDetails } from "@/components/dashboard/forms/form-profile-details"
import { FormPerfil } from "@/components/dashboard/forms/form-perfil"
import { ConnectedInvestidores } from "@/components/dashboard/connected-investidores"
import { deleteAccountAction } from "@/actions/profile"
import {
  AlertTriangleIcon,
  BellIcon,
  LockIcon,
  ShieldCheckIcon,
  UserIcon,
} from "lucide-react"

const USER = {
  fullName: "Usuário",
  email: "usuario@exemplo.com",
  avatar: "/avatars/shadcn.jpg",
}

export default function PerfilPage() {
  return (
    <div className="flex flex-col gap-8 px-4 py-6 md:gap-10 md:px-6">
      <header className="page-content">
        <div className="flex flex-col gap-6 rounded-xl bg-linear-to-br from-primary/8 via-primary/4 to-transparent p-6 ring-1 ring-primary/10 md:flex-row md:items-center md:gap-8">
          <Avatar className="size-20 rounded-xl ring-2 ring-background shadow-lg md:size-24">
            <AvatarImage src={USER.avatar} alt="Avatar" />
            <AvatarFallback className="rounded-xl bg-primary/20 text-lg text-primary">
              <UserIcon className="size-10" />
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-1 flex-col gap-1">
            <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">
              Configurações da conta
            </h1>
            <p className="text-muted-foreground">
              Gerencie suas configurações e preferências da conta
            </p>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground">
                <ShieldCheckIcon className="size-3.5" />
                Conta verificada
              </span>
            </div>
          </div>
        </div>
      </header>

      <div className="page-content">
        <Tabs defaultValue="profile" className="flex flex-col gap-6">
          <TabsList variant="line" className="h-fit gap-1 bg-transparent p-0">
            <TabsTrigger value="profile" className="gap-2 data-active:border-primary">
              <UserIcon className="size-4" />
              Perfil
            </TabsTrigger>
            <TabsTrigger value="security" className="gap-2 data-active:border-primary">
              <LockIcon className="size-4" />
              Segurança
            </TabsTrigger>
            <TabsTrigger value="notifications" className="gap-2 data-active:border-primary">
              <BellIcon className="size-4" />
              Notificações
            </TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="flex flex-col gap-8">
            <section>
              <Card>
                <CardHeader className="pb-2">
                  <div className="flex items-center gap-2">
                    <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <UserIcon className="size-4" />
                    </div>
                    <div>
                      <CardTitle>Detalhes do perfil</CardTitle>
                      <CardDescription>
                        Atualize suas informações pessoais
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <FormProfileDetails
                    fullName={USER.fullName}
                    email={USER.email}
                  />
                </CardContent>
              </Card>
            </section>

            <section>
              <ConnectedInvestidores />
            </section>
          </TabsContent>

          <TabsContent value="security" className="space-y-8">
            <FormPerfil />

            <Card className="overflow-hidden border-destructive/30 bg-destructive/2">
              <CardHeader className="pb-2">
                <div className="flex items-center gap-2">
                  <div className="flex size-9 items-center justify-center rounded-lg bg-destructive/10 text-destructive">
                    <AlertTriangleIcon className="size-4" />
                  </div>
                  <div>
                    <CardTitle className="text-destructive">
                      Zona de perigo
                    </CardTitle>
                    <CardDescription>
                      Ações irreversíveis que afetam sua conta
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col gap-4 rounded-lg border border-destructive/20 bg-destructive/5 p-5">
                  <div>
                    <h3 className="font-medium">Excluir conta</h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Ao excluir sua conta, todos os seus dados serão removidos
                      permanentemente. Esta ação não pode ser desfeita.
                    </p>
                  </div>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive" size="sm" className="w-fit">
                        <AlertTriangleIcon data-icon="inline-start" />
                        Excluir conta
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Excluir sua conta?</AlertDialogTitle>
                        <AlertDialogDescription>
                          Esta ação é irreversível. Todos os seus dados serão
                          permanentemente removidos. Tem certeza que deseja continuar?
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <form
                        action={async () => {
                          const result = await deleteAccountAction()
                          if (result?.error) toast.error(result.error)
                        }}
                      >
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <Button type="submit" variant="destructive">
                            Excluir conta
                          </Button>
                        </AlertDialogFooter>
                      </form>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notifications" className="space-y-8">
            <Card>
              <CardHeader>
                <CardTitle>Preferências de notificação</CardTitle>
                <CardDescription>
                  Escolha como deseja receber atualizações e alertas
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Em breve você poderá configurar suas preferências de notificação.
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
