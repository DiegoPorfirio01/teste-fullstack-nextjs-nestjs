"use client"

import { useActionState } from "react"
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
import { deleteAccountAction } from "@/actions/profile"
import type { DeleteAccountState } from "@/types"
import { PageContainer, PageHeader, PageSection } from "@/components/dashboard/page-layout"
import {
  AlertTriangleIcon,
  LockIcon,
  UserIcon,
} from "lucide-react"

type Props = {
  fullName: string
  email: string
  avatarUrl: string
}

export function PerfilContent({ fullName, email, avatarUrl }: Props) {
  const [deleteState, deleteFormAction, isDeleting] = useActionState<
    DeleteAccountState | undefined,
    FormData
  >(deleteAccountAction, undefined)

  return (
    <PageContainer>
      <PageHeader
        title="Configurações da conta"
        description="Gerencie suas configurações e preferências da conta"
      >
        <div className="flex flex-col gap-6 rounded-xl bg-linear-to-br from-primary/8 via-primary/4 to-transparent p-6 ring-1 ring-primary/10 md:flex-row md:items-center md:gap-8">
          <Avatar className="size-20 rounded-xl ring-2 ring-background shadow-lg md:size-24">
            <AvatarImage src={avatarUrl} alt="Avatar" />
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
          </div>
        </div>
      </PageHeader>

      <PageSection>
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
          </TabsList>

          <TabsContent value="profile" className="flex flex-col gap-8">
            <section>
              <Card>
                <CardHeader className="pb-2">
                  <div className="flex items-center gap-2">
                    <div className="size-9 flex items-center justify-center rounded-lg bg-primary/10 text-primary">
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
                  <FormProfileDetails fullName={fullName} email={email} />
                </CardContent>
              </Card>
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
                      <form action={deleteFormAction}>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <Button
                            type="submit"
                            variant="destructive"
                            disabled={isDeleting}
                          >
                            {isDeleting ? "Excluindo…" : "Excluir conta"}
                          </Button>
                        </AlertDialogFooter>
                      </form>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </PageSection>
    </PageContainer>
  )
}
