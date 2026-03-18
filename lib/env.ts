import { z } from "zod";

const envSchema = z.object({
  NEXT_PUBLIC_API_URL: z.url("NEXT_PUBLIC_API_URL must be a valid URL"),
  NEXT_PUBLIC_SENTRY_DSN: z
    .string()
    .optional().nullable(),
  SENTRY_ORG: z.string().optional().nullable(),
  SENTRY_PROJECT: z.string().optional().nullable(),
  SENTRY_AUTH_TOKEN: z.string().optional().nullable(),
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
