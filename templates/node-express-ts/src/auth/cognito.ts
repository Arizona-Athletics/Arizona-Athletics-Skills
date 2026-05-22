/**
 * Cognito + UA SAML federation — shape only.
 *
 * This file describes the auth flow that every UA Athletics server-rendered
 * app implements. It does NOT contain any real UA identifiers, real Cognito
 * pool IDs, real client IDs, real client secrets, or real callback URLs.
 * Every value comes from `env.ts`, which validates `process.env` at boot.
 *
 * The flow:
 *   1. App redirects to Cognito Hosted UI `/oauth2/authorize` with
 *      `identity_provider=<COGNITO_SAML_PROVIDER_NAME>` — Cognito then
 *      forwards the browser to the UA SAML IdP (NetID / WebAuth).
 *   2. UA SAML IdP POSTs the assertion back to Cognito.
 *   3. Cognito redirects back to `<COGNITO_REDIRECT_URI>` with `?code=...`.
 *   4. This server exchanges `code` for tokens at `/oauth2/token` using
 *      HTTP Basic auth (`client_id:client_secret`) — confidential client.
 *      PKCE is NOT required for server flows; we use it only in SPA templates.
 *   5. Tokens never leave the server. We persist a minimal user record in
 *      `req.session.user` and rely on the httpOnly session cookie to carry
 *      the session to the browser.
 *   6. Sign-out clears the local session, then redirects to Cognito's
 *      `/logout` endpoint so the IdP-side Cognito session is also cleared.
 *
 * Detailed contract: /docs/AUTH.md.
 */

import { env, cognitoBaseUrl } from "../env.js";

export interface CognitoUser {
  /** `sub` claim from the ID token — Cognito's stable identifier. */
  sub: string;
  /** Email if present in the SAML attribute mapping. */
  email?: string;
  /** Display name if present. */
  name?: string;
  /** Group/role names from the `cognito:groups` claim. */
  groups: string[];
  /** Issued-at and expiry (seconds since epoch). */
  iat: number;
  exp: number;
}

/**
 * Build the Cognito Hosted-UI authorize URL.
 *
 * Used by GET /auth/login. `state` is a server-issued opaque string that we
 * also store in the session — the callback compares them to prevent CSRF.
 */
export function buildAuthorizeUrl(state: string): string {
  const params = new URLSearchParams({
    response_type: "code",
    client_id: env.COGNITO_CLIENT_ID,
    redirect_uri: env.COGNITO_REDIRECT_URI,
    scope: "openid email profile",
    identity_provider: env.COGNITO_SAML_PROVIDER_NAME,
    state,
  });
  return `${cognitoBaseUrl}/oauth2/authorize?${params.toString()}`;
}

/**
 * Build the Cognito Hosted-UI logout URL.
 *
 * Used by GET /auth/logout AFTER we have cleared the local session.
 * `logout_uri` must be registered on the Cognito app client.
 */
export function buildLogoutUrl(): string {
  const params = new URLSearchParams({
    client_id: env.COGNITO_CLIENT_ID,
    logout_uri: env.COGNITO_LOGOUT_URI,
  });
  return `${cognitoBaseUrl}/logout?${params.toString()}`;
}

/**
 * Exchange an authorization code for an ID/access/refresh token bundle.
 *
 * Real implementations should:
 *  - Use the global `fetch` (Node 22 has it) or `openid-client`.
 *  - HTTP Basic auth with `client_id:client_secret` — credentials never leave
 *    the server.
 *  - Verify the ID token signature against Cognito's JWKS endpoint:
 *    `${cognitoBaseUrl}/.well-known/jwks.json`.
 *  - Validate `iss`, `aud`, `exp`, `nonce`, and `state`.
 *  - Map `cognito:groups` to `CognitoUser.groups`.
 *
 * This stub returns `null` — the real implementation lands once the project
 * has its Cognito app client configured (see /docs/AUTH.md).
 *
 * CONFIGURE_ME: implement before deploying. Recommended dependency:
 *   bun add openid-client jose
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function exchangeCodeForUser(_code: string): Promise<CognitoUser | null> {
  // CONFIGURE_ME — implement Authorization Code exchange against Cognito.
  // Until implemented, the callback route below short-circuits to a stub user
  // so the rest of the template's UI can be exercised in development.
  return null;
}

/**
 * Authorize a user against a group/role.
 *
 * Group names are project-specific (NOT in this repo). The consuming app
 * passes the name(s) — never hardcode UA group strings in shared template code.
 */
export function hasGroup(user: CognitoUser | undefined, group: string): boolean {
  return Boolean(user?.groups.includes(group));
}
