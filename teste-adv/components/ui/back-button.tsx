'use client';

import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

export function BackButton() {
  return (
    <Button
      type="button"
      variant="ghost"
      size="lg"
      className="gap-2"
      onClick={() => window.history.back()}
    >
      <ArrowLeft className="size-4" aria-hidden />
      Voltar
    </Button>
  );
}
