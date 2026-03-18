import * as Sentry from '@sentry/nextjs';

type LogAttributes = Record<string, string | number | boolean>;

/**
 * Sets per-request isolation scope attributes and logs the start of a server action.
 * Uses getIsolationScope to avoid cross-request attribute leakage.
 */
export function logActionStart(
  action: string,
  attrs?: LogAttributes,
): void {
  Sentry.getIsolationScope().setAttributes({ action, ...attrs });
  Sentry.logger.info(Sentry.logger.fmt`Action ${action} started`, attrs);
}

/**
 * Logs a successful server action with optional result attributes.
 * Follows the "wide event" pattern — one log with all relevant context.
 */
export function logActionSuccess(
  action: string,
  attrs?: LogAttributes,
): void {
  Sentry.logger.info(Sentry.logger.fmt`Action ${action} succeeded`, attrs);
}

/**
 * Logs a failed server action. Also calls captureException so the error
 * appears in Sentry Issues, not just Logs.
 */
export function logActionError(
  action: string,
  err: unknown,
  attrs?: LogAttributes,
): void {
  const reason = err instanceof Error ? err.message : String(err);
  Sentry.logger.error(Sentry.logger.fmt`Action ${action} failed`, {
    reason,
    ...attrs,
  });
  Sentry.captureException(err, { tags: { action } });
}
