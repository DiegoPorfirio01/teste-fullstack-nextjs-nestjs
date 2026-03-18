import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { REVERT_WINDOW_MS } from '@/constants';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function isWithinRevertWindow(createdAt: string): boolean {
  const created = new Date(createdAt).getTime();
  return Date.now() - created <= REVERT_WINDOW_MS;
}
