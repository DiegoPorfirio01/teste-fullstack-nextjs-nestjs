import Link from "next/link";
import { Button } from "@/components/ui/button";
import { BackButton } from "@/components/ui/back-button"; 
import Image from "next/image";
import { Home } from "lucide-react";

export default function NotFound() {
  return (
    <main className="relative flex min-h-svh flex-col items-center justify-center overflow-hidden p-6">
      {/* Background ambient */}
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-20%,hsl(253_63%_55%/0.12),transparent)]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute right-0 top-1/4 h-96 w-96 rounded-full bg-primary/5 blur-3xl"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute bottom-1/4 left-0 h-64 w-64 rounded-full bg-chart-3/10 blur-3xl"
        aria-hidden
      />

      <div className="relative flex w-full max-w-lg flex-col items-center gap-8 text-center">
        {/* Illustration */}
        <div>
          <Image
            src="/not-found.png"
            alt=""
            width={200}
            height={200}
            className="opacity-90"
            priority
          />
        </div>

        {/* Content */}
        <div className="space-y-3">
          <p className="font-mono text-6xl font-bold tracking-tighter text-primary tabular-nums sm:text-8xl">
            404
          </p>
          <h1 className="text-xl font-semibold text-foreground sm:text-2xl">
            Página não encontrada
          </h1>
          <p className="max-w-sm text-sm text-muted-foreground">
            A página que você está procurando não existe ou foi movida.
          </p>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-3 sm:flex-row">
          <Button asChild variant="default" size="lg" className="gap-2">
            <Link href="/">
              <Home className="size-4" aria-hidden />
              Ir para o início
            </Link>
          </Button>
          <BackButton />
        </div>
      </div>
    </main>
  );
}
