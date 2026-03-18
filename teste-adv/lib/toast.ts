"use client";

import { toast } from "sonner";

/** Duração padrão para toasts de sucesso (5s). Garante visibilidade em E2E e UX. */
const DEFAULT_SUCCESS_DURATION = 5_000;

/**
 * Exibe toast de sucesso padronizado.
 * Usa duration explícita para consistência entre transferência, reversão, compra, etc.
 */
export function showSuccessToast(message: string): void {
  toast.success(message, { duration: DEFAULT_SUCCESS_DURATION });
}
