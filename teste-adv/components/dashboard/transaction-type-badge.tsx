'use client';

import { TransactionType } from '@/enums';
import { Badge } from '@/components/ui/badge';
import type { ITransaction } from '@/types';

export function TypeBadge({ type }: { type: ITransaction['type'] }) {
  return (
    <Badge variant={type === TransactionType.DEPOSIT ? 'secondary' : 'outline'}>
      {type === TransactionType.DEPOSIT ? 'Depósito' : 'Transferência'}
    </Badge>
  );
}

