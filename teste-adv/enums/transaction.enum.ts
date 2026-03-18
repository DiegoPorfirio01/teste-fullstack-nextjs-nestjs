/**
 * Transaction enums - must match API responses.
 */
export const TransactionType = {
  DEPOSIT: 'deposit',
  TRANSFER: 'transfer',
} as const;

export type TransactionType =
  (typeof TransactionType)[keyof typeof TransactionType];

export const TransactionStatus = {
  COMPLETED: 'completed',
  REVERSED: 'reversed',
} as const;

export type TransactionStatus =
  (typeof TransactionStatus)[keyof typeof TransactionStatus];

export const TransactionDirection = {
  SENT: 'sent',
  RECEIVED: 'received',
} as const;

export type TransactionDirection =
  (typeof TransactionDirection)[keyof typeof TransactionDirection];

/** Tab filter values for transaction history UI */
export const TransactionTabFilter = {
  SENT: 'sent',
  RECEIVED: 'received',
  REVERTED: 'reverted',
} as const;

export type TransactionTabFilter =
  (typeof TransactionTabFilter)[keyof typeof TransactionTabFilter];
