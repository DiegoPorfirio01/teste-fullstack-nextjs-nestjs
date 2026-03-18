import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { REVERT_WINDOW_MS } from '@/constants';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function isWithinRevertWindow(
  createdAt: string,
  nowMs: number = Date.now(),
): boolean {
  const created = new Date(createdAt).getTime();
  if (Number.isNaN(created)) return false;
  return nowMs - created <= REVERT_WINDOW_MS;
}
