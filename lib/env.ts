import { z } from "zod";

const envSchema = z.object({
  NEXT_PUBLIC_API_URL: z.url("NEXT_PUBLIC_API_URL must be a valid URL"),
  NEXT_PUBLIC_SENTRY_DSN: z.url("NEXT_PUBLIC_SENTRY_DSN must be a valid URL"),
  SENTRY_ORG: z.string().min(1, "SENTRY_ORG is required"),
  SENTRY_PROJECT: z.string().min(1, "SENTRY_PROJECT is required"),
  SENTRY_AUTH_TOKEN: z.string().min(1, "SENTRY_AUTH_TOKEN is required"),
});

export type Env = z.infer<typeof envSchema>;

function validateEnv(): Env {
  const parsed = envSchema.safeParse(process.env);

  if (!parsed.success) {
    const messages = parsed.error.issues
      .map((issue) => `  - ${issue.path.join(".")}: ${issue.message}`)
      .join("\n");
    throw new Error(
      `Invalid environment variables:\n${messages}\n\nCheck your .env.local file.`
    );
  }

  return parsed.data;
}

export const env = validateEnv();
