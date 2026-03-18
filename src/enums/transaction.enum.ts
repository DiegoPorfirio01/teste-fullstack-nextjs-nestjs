/**
 * Transaction type values stored in database.
 * Must match prisma schema and API contract.
 */
export const TransactionType = {
  DEPOSIT: 'deposit',
  TRANSFER: 'transfer',
} as const;

export type TransactionType =
  (typeof TransactionType)[keyof typeof TransactionType];

/**
 * Transaction status values.
 */
export const TransactionStatus = {
  COMPLETED: 'completed',
  REVERSED: 'reversed',
} as const;

export type TransactionStatus =
  (typeof TransactionStatus)[keyof typeof TransactionStatus];

/**
 * Direction from current user's perspective (computed, not stored).
 */
export const TransactionDirection = {
  SENT: 'sent',
  RECEIVED: 'received',
} as const;

export type TransactionDirection =
  (typeof TransactionDirection)[keyof typeof TransactionDirection];
