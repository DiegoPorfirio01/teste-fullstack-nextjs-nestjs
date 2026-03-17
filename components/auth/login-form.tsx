"use client";

import { useActionState } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { loginAction } from "@/actions/auth";
import type { LoginState } from "@/types";
import Image from "next/image";

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const [state, formAction, isPending] = useActionState<
    LoginState | undefined,
    FormData
  >(loginAction, undefined);

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card className="overflow-hidden p-0">
        <CardContent className="grid p-0 md:grid-cols-2">
          <form
            key={state?.values ? "has-values" : "initial"}
            className="p-6 md:p-8"
            action={formAction}
          >
            <FieldGroup>
              <div className="flex flex-col items-center gap-2 text-center">
                <h1 className="text-2xl font-bold">Bem-vindo de volta</h1>
                <p className="text-balance text-muted-foreground">
                  Entre na sua conta Acme Inc
                </p>
              </div>

              {state?.error && (
                <Field data-invalid>
                  <FieldError>{state.error}</FieldError>
                </Field>
              )}

              <Field data-invalid={!!state?.fieldErrors?.email}>
                <FieldLabel htmlFor="email">E-mail</FieldLabel>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="m@example.com"
                  required
                  aria-invalid={!!state?.fieldErrors?.email}
                  defaultValue={state?.values?.email}
                />
                <FieldError errors={state?.fieldErrors?.email?.map((m: string) => ({ message: m })) ?? []} />
              </Field>

              <Field data-invalid={!!state?.fieldErrors?.password}>
                <FieldLabel htmlFor="password">Senha</FieldLabel>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  required
                  aria-invalid={!!state?.fieldErrors?.password}
                  defaultValue={state?.values?.password}
                />
                <FieldError errors={state?.fieldErrors?.password?.map((m: string) => ({ message: m })) ?? []} />
              </Field>

              <Field>
                <Button type="submit" disabled={isPending}>
                  {isPending ? "Entrando…" : "Entrar"}
                </Button>
              </Field>

              <FieldSeparator className="*:data-[slot=field-separator-content]:bg-card"></FieldSeparator>
              <FieldDescription className="text-center">
                Não tem uma conta?{" "}
                <Link href="/auth/register" className="underline underline-offset-4 hover:text-primary">
                  Cadastre-se
                </Link>
              </FieldDescription>
            </FieldGroup>
          </form>
          <div className="relative hidden bg-muted md:block">
            <Image
              src="/vercel.svg"
              alt="Image"
              className="absolute inset-0 h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
              width={400}
              height={400}
            />
          </div>
        </CardContent>
      </Card>
      <FieldDescription className="px-6 text-center">
        Ao continuar, você concorda com nossos <a href="#">Termos de Uso</a>{" "}
        e <a href="#">Política de Privacidade</a>.
      </FieldDescription>
    </div>
  )
}
