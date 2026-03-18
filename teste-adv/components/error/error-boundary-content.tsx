'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import * as Sentry from '@sentry/nextjs';

export type ErrorContext = 'default' | 'auth' | 'dashboard';

const CONTEXT_CONFIG: Record<ErrorContext, { title: string; message: string }> =
  {
    default: {
      title: 'Algo deu errado',
      message:
        'Ocorreu um erro inesperado. Fomos notificados e estamos analisando.',
    },
    auth: {
      title: 'Algo deu errado',
      message:
        'Não foi possível carregar a página de autenticação. Tente novamente.',
    },
    dashboard: {
      title: 'Algo deu errado',
      message: 'Não foi possível carregar o painel. Tente novamente.',
    },
  };

export interface ErrorBoundaryContentProps {
  error: Error & { digest?: string };
  reset: () => void;
  context?: ErrorContext;
  homeHref?: string;
}

export function ErrorBoundaryContent({
  error,
  reset,
  context = 'default',
  homeHref = '/',
}: ErrorBoundaryContentProps) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  const { title, message } = CONTEXT_CONFIG[context];

  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center p-4',
        context === 'default' ? 'min-h-[60vh]' : 'min-h-[50vh]',
      )}
    >
      <Card className="w-full max-w-md">
        <CardContent className="flex flex-col items-center gap-6 p-6 text-center">
          <div className="space-y-2">
            <h2 className="text-xl font-semibold">{title}</h2>
            <p className="text-sm text-muted-foreground">{message}</p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Button onClick={reset}>Tentar novamente</Button>
            <Button asChild variant="outline">
              <Link href={homeHref}>Ir para o início</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
