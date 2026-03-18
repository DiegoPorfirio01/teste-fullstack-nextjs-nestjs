'use client';

import { useLinkStatus } from 'next/link';

/**
 * Hint component for sidebar links. Must be used as a descendant of a Link component.
 * Shows a subtle pending indicator when navigation is in progress (useLinkStatus pattern).
 * @see https://nextjs.org/docs/app/api-reference/functions/use-link-status
 */
export function LinkHint() {
  const { pending } = useLinkStatus();
  return (
    <span aria-hidden className={`link-hint ${pending ? 'is-pending' : ''}`} />
  );
}
