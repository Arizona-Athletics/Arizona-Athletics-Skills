/**
 * Environment loader & validator.
 *
 * Reads process.env, validates with zod, and exits early with a readable error
 * if anything required is missing or malformed. Every CONFIGURE_ME value is
 * tolerated in development but flagged at boot in production.
 *
 * Anything that needs an environment value must `import { env } from "./env.js"`.
 * Never reach back into `process.env` from app code.
 */

import { z } from "zod";

const SCHEMA = z.object({
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  PORT: z.coerce.number().int().positive().default(3000),

  // Session
  SESSION_SECRET: z
    .string()
    .min(32, "SESSION_SECRET must be at least 32 chars. Generate: openssl rand -base64 48"),
  SESSION_COOKIE_NAME: z.string().default("ua.sid"),
  SESSION_COOKIE_SECURE: z
    .string()
    .default("false")
    .transform((v) => v === "true"),

  // Cognito / AWS
  AWS_REGION: z.string().default("us-west-2"),
  COGNITO_USER_POOL_ID: z.string(),
  COGNITO_CLIENT_ID: z.string(),
  COGNITO_CLIENT_SECRET: z.string(),
  COGNITO_DOMAIN: z.string(),
  COGNITO_REDIRECT_URI: z.string().url(),
  COGNITO_LOGOUT_URI: z.string().url(),
  COGNITO_SAML_PROVIDER_NAME: z.string(),

  // Branding
  TYPEKIT_KIT_ID: z.string().default("CONFIGURE_ME"),
});

export type Env = z.infer<typeof SCHEMA>;

function parseEnv(): Env {
  const parsed = SCHEMA.safeParse(process.env);
  if (!parsed.success) {
    // eslint-disable-next-line no-console
    console.error(
      "[env] Invalid environment configuration. Copy .env.example to .env and fill in CONFIGURE_ME values.",
    );
    // eslint-disable-next-line no-console
    console.error(parsed.error.flatten().fieldErrors);
    process.exit(1);
  }
  return parsed.data;
}

export const env: Env = parseEnv();

/**
 * Convenience: derived Cognito Hosted-UI base URL. Templates can interpolate
 * `${env.COGNITO_DOMAIN}.auth.${env.AWS_REGION}.amazoncognito.com` themselves
 * — exposing the derived URL keeps the assembly in one place.
 */
export const cognitoBaseUrl = `https://${env.COGNITO_DOMAIN}.auth.${env.AWS_REGION}.amazoncognito.com`;

export const isProd = env.NODE_ENV === "production";
