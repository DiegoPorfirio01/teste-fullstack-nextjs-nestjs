/**
 * Structured logging for server actions.
 * Logs action start, success, and errors (with stack) for observability.
 */

export type LogLevel = 'info' | 'success' | 'error';

export interface ActionLogContext {
  action: string;
  userId?: string;
  [key: string]: unknown;
}

function logStructured(
  level: LogLevel,
  context: ActionLogContext,
  message?: string,
): void {
  const entry = {
    level,
    timestamp: new Date().toISOString(),
    ...context,
    ...(message ? { message } : {}),
  };
  const line = JSON.stringify(entry);
  switch (level) {
    case 'error':
      console.error(line);
      break;
    case 'success':
    case 'info':
    default:
      // eslint-disable-next-line no-console -- logger utility
      console.log(line);
      break;
  }
}

/** Log when an action starts */
export function logActionStart(
  action: string,
  context?: Record<string, unknown>,
): void {
  logStructured('info', { action, ...context }, 'action_start');
}

/** Log when an action completes successfully */
export function logActionSuccess(
  action: string,
  context?: Record<string, unknown>,
): void {
  logStructured('success', { action, ...context }, 'action_success');
}

/** Log when an action fails - includes full error with stack */
export function logActionError(
  action: string,
  err: unknown,
  context?: Record<string, unknown>,
): void {
  const errorContext: ActionLogContext = {
    action,
    ...context,
  };
  if (err instanceof Error) {
    errorContext.errorMessage = err.message;
    errorContext.errorStack = err.stack;
    errorContext.errorName = err.name;
  } else {
    errorContext.errorMessage = String(err);
  }
  logStructured('error', errorContext, 'action_error');
}
