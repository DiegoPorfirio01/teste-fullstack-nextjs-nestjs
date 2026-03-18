"use client";

import { ErrorBoundaryContent } from "@/components/error/error-boundary-content";

export default function AuthError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return <ErrorBoundaryContent error={error} reset={reset} context="auth" />;
}
