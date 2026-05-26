/**
 * Cognito confidential-client helpers for the Next.js App Router template.
 *
 * Server-only. This file MUST NOT be imported by a client component. It reads
 * `COGNITO_CLIENT_SECRET` from `process.env`; any client import will leak the
 * secret into the browser bundle. The only consumers are the route handlers
 * under the `app/auth/[segment]/route.ts` handlers (signin, callback, signout).
 *
 * Canonical flow shape: docs/AUTH.md.
 * All UA-specific values are marked `// CONFIGURE_ME` and read from env vars
 * documented in `.env.example`.
 */
import "server-only";

export interface CognitoConfig {
  region: string;
  userPoolId: string;
  clientId: string;
  clientSecret: string;
  domain: string;
  redirectUri: string;
  logoutUri: string;
  samlProviderName: string;
  stateSecret: string;
}

/**
 * Read and validate the Cognito configuration from server env vars.
 * Called at request time inside route handlers — never at module load — so
 * the build doesn't fail in environments that haven't configured auth yet.
 */
export function getCognitoConfig(): CognitoConfig {
  // CONFIGURE_ME: all values below come from .env.local; see .env.example.
  const config: CognitoConfig = {
    region: process.env["AWS_REGION"] ?? "",
    userPoolId: process.env["COGNITO_USER_POOL_ID"] ?? "",
    clientId: process.env["COGNITO_CLIENT_ID"] ?? "",
    clientSecret: process.env["COGNITO_CLIENT_SECRET"] ?? "",
    domain: process.env["COGNITO_DOMAIN"] ?? "",
    redirectUri: process.env["COGNITO_REDIRECT_URI"] ?? "",
    logoutUri: process.env["COGNITO_LOGOUT_URI"] ?? "",
    samlProviderName: process.env["COGNITO_SAML_PROVIDER_NAME"] ?? "",
    stateSecret: process.env["AUTH_STATE_SECRET"] ?? "",
  };

  const missing = Object.entries(config)
    .filter(([, v]) => !v)
    .map(([k]) => k);

  if (missing.length > 0) {
    throw new Error(
      `Cognito config incomplete. Missing env vars: ${missing.join(", ")}. ` +
        "See .env.example.",
    );
  }
  return config;
}

/** The Cognito Hosted UI base URL for this user pool. */
export function getCognitoBaseUrl(config: CognitoConfig): string {
  return `https://${config.domain}.auth.${config.region}.amazoncognito.com`;
}

/**
 * Build the `/oauth2/authorize` URL that kicks off the SAML federated login.
 * `identity_provider` tells Cognito to skip its built-in login form and jump
 * straight to the UA SAML IdP (WebAuth / NetID).
 */
export function buildAuthorizeUrl(
  config: CognitoConfig,
  state: string,
): string {
  const url = new URL(`${getCognitoBaseUrl(config)}/oauth2/authorize`);
  url.searchParams.set("client_id", config.clientId);
  url.searchParams.set("response_type", "code");
  url.searchParams.set("scope", "openid email profile");
  url.searchParams.set("redirect_uri", config.redirectUri);
  url.searchParams.set("identity_provider", config.samlProviderName);
  url.searchParams.set("state", state);
  return url.toString();
}

/**
 * Build the `/logout` URL that ends the Cognito session. Redirects the
 * browser back to `logout_uri` once Cognito clears its cookies.
 *
 * NOTE: logout does NOT sign the user out of UA's SAML IdP. A subsequent
 * NetID login may succeed without a re-prompt if the IdP session is valid.
 */
export function buildLogoutUrl(config: CognitoConfig): string {
  const url = new URL(`${getCognitoBaseUrl(config)}/logout`);
  url.searchParams.set("client_id", config.clientId);
  url.searchParams.set("logout_uri", config.logoutUri);
  return url.toString();
}

export interface CognitoTokenResponse {
  id_token: string;
  access_token: string;
  refresh_token: string;
  expires_in: number;
  token_type: "Bearer";
}

/**
 * Exchange an authorization code for tokens. Uses HTTP Basic auth with the
 * client secret — this MUST run on the server. The refresh token is meant
 * to live in an httpOnly cookie set by the calling route handler and never
 * leaves the server.
 */
export async function exchangeCodeForTokens(
  config: CognitoConfig,
  code: string,
): Promise<CognitoTokenResponse> {
  const credentials = Buffer.from(
    `${config.clientId}:${config.clientSecret}`,
  ).toString("base64");

  const body = new URLSearchParams({
    grant_type: "authorization_code",
    client_id: config.clientId,
    code,
    redirect_uri: config.redirectUri,
  });

  const res = await fetch(`${getCognitoBaseUrl(config)}/oauth2/token`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `Basic ${credentials}`,
    },
    body,
    cache: "no-store",
  });

  if (!res.ok) {
    // Avoid leaking the raw response body — it can contain tokens on success
    // and is unstructured on failure.
    throw new Error(`Cognito token exchange failed: HTTP ${res.status}`);
  }

  return (await res.json()) as CognitoTokenResponse;
}

/**
 * Lightweight ID-token claims reader. Decodes the JWT payload without
 * verifying the signature — verification belongs in a separate hardened
 * helper (out of scope for this stub). Use only to read claims you have
 * already validated upstream.
 *
 * CONFIGURE_ME: for production, validate the JWT signature against the
 * Cognito JWKS at `${baseUrl}/.well-known/jwks.json` before trusting claims.
 */
export interface IdTokenClaims {
  sub: string;
  email?: string;
  "cognito:username"?: string;
  "cognito:groups"?: string[];
  // Any additional SAML attributes mapped through Cognito appear here.
  [key: string]: unknown;
}

export function decodeIdTokenClaims(idToken: string): IdTokenClaims {
  const parts = idToken.split(".");
  if (parts.length !== 3) {
    throw new Error("Malformed ID token");
  }
  const payload = parts[1];
  if (!payload) throw new Error("Malformed ID token");
  const json = Buffer.from(
    payload.replace(/-/g, "+").replace(/_/g, "/"),
    "base64",
  ).toString("utf8");
  return JSON.parse(json) as IdTokenClaims;
}

/** Random URL-safe string for the `state` parameter on the auth redirect. */
export function generateState(): string {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return Buffer.from(bytes).toString("base64url");
}

/**
 * The session cookie name and shape. The cookie itself is httpOnly + Secure +
 * SameSite=Lax. Route handlers set it via `cookies()` from `next/headers`.
 *
 * For brevity this stub stores tokens directly in the cookie. Production
 * deployments should instead store a server-side session reference (e.g.,
 * Redis / DynamoDB) and put only an opaque session id in the cookie.
 */
export const SESSION_COOKIE_NAME = "ua-session";
export const STATE_COOKIE_NAME = "ua-auth-state";
