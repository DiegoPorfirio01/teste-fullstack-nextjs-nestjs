/** Constantes de validação e regras para operações de transação. */

// Janela para permitir reversão de uma transferência (em ms).
export const REVERT_WINDOW_MS = 10 * 60 * 1000; // 10 minutos

// Valor máximo permitido para transferência.
export const MAX_AMOUNT = 1_000_000;

/** Valida formato de e-mail. */
export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

