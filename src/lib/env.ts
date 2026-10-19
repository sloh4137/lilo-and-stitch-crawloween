import "server-only";
import { z } from "zod";

// Server-only: validates secrets once, on first use, so a missing or malformed
// variable fails loudly instead of surfacing as a confusing Firebase error. Lazy
// rather than at import, because `next build` imports page modules and must not
// need production secrets. Nothing here may be NEXT_PUBLIC_.

// Copying .env.example leaves blank values (`KEY=""`); treat those as unset.
const optionalString = z
  .string()
  .trim()
  .transform((value) => value || undefined)
  .optional();

const envSchema = z
  .object({
    FIREBASE_PROJECT_ID: z.string().trim().min(1, "is required"),
    FIREBASE_CLIENT_EMAIL: optionalString.pipe(z.email().optional()),
    // Vercel and .env files usually store the key with literal "\n" sequences.
    FIREBASE_PRIVATE_KEY: optionalString
      .transform((key) => key?.replace(/\\n/g, "\n"))
      .pipe(
        z
          .string()
          .includes("-----BEGIN PRIVATE KEY-----", {
            message: "must be the PEM private_key from the service account JSON",
          })
          .optional(),
      ),
    // Set to use the local Firestore emulator; firebase-admin reads it from
    // process.env itself, and service account credentials become optional.
    FIRESTORE_EMULATOR_HOST: optionalString,
  })
  .superRefine((env, ctx) => {
    if (env.FIRESTORE_EMULATOR_HOST) return;
    for (const key of ["FIREBASE_CLIENT_EMAIL", "FIREBASE_PRIVATE_KEY"] as const) {
      if (!env[key]) {
        ctx.addIssue({
          code: "custom",
          path: [key],
          message: "is required unless FIRESTORE_EMULATOR_HOST is set",
        });
      }
    }
  });

export type Env = z.infer<typeof envSchema>;

function parseEnv(): Env {
  const result = envSchema.safeParse(process.env);
  if (!result.success) {
    throw new Error(
      `Invalid environment variables (see .env.example):\n${z.prettifyError(result.error)}`,
    );
  }
  return result.data;
}

let cached: Env | undefined;

export function getEnv(): Env {
  cached ??= parseEnv();
  return cached;
}
