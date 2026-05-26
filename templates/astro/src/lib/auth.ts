/**
 * PKCE auth helpers for the UA Athletics Astro template.
 *
 * Flow: SPA-style PKCE against AWS Cognito federated with UA's SAML IdP.
 * See docs/AUTH.md for the full sequence diagram, environment variables,
 * and the "never commit secrets" checklist. No client_secret is used or
 * stored anywhere on the client.
 *
 * Every UA-specific value is read from import.meta.env and marked
 * CONFIGURE_ME so the human filling them in cannot miss the seam.
 */

// --- Config ----------------------------------------------------------------

interface AuthConfig {
  region: string;
  cognitoDomain: string; // subdomain of {region}.amazoncognito.com
  clientId: string;
  redirectUri: string;
  logoutUri: string;
  samlProviderName: string;
  scopes: readonly string[];
}

// CONFIGURE_ME: every field below resolves from .env (see .env.example).
// Do NOT hardcode any real UA pool ID, client ID, domain prefix, or callback
// URL here. Local dev and production each have their own .env file.
export const authConfig: AuthConfig = {
  region: import.meta.env.PUBLIC_AWS_REGION ?? "", // CONFIGURE_ME
  cognitoDomain: import.meta.env.PUBLIC_COGNITO_DOMAIN ?? "", // CONFIGURE_ME
  clientId: import.meta.env.PUBLIC_COGNITO_CLIENT_ID ?? "", // CONFIGURE_ME
  redirectUri: import.meta.env.PUBLIC_COGNITO_REDIRECT_URI ?? "", // CONFIGURE_ME
  logoutUri: import.meta.env.PUBLIC_COGNITO_LOGOUT_URI ?? "", // CONFIGURE_ME
  samlProviderName:
    import.meta.env.PUBLIC_COGNITO_SAML_PROVIDER_NAME ?? "", // CONFIGURE_ME
  scopes: ["openid", "email", "profile"],
};

// --- Session-storage keys --------------------------------------------------

const VERIFIER_KEY = "ua-pkce-verifier";
const STATE_KEY = "ua-pkce-state";

// --- Crypto helpers (PKCE per RFC 7636) ------------------------------------

function base64UrlEncode(bytes: ArrayBuffer | Uint8Array): string {
  const arr = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
  let str = "";
  for (let i = 0; i < arr.length; i++) {
    str += String.fromCharCode(arr[i] as number);
  }
  return btoa(str).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function randomString(byteLength: number): string {
  const bytes = new Uint8Array(byteLength);
  crypto.getRandomValues(bytes);
  return base64UrlEncode(bytes);
}

async function sha256(input: string): Promise<ArrayBuffer> {
  const encoder = new TextEncoder();
  return crypto.subtle.digest("SHA-256", encoder.encode(input));
}

export interface PkceChallenge {
  verifier: string;
  challenge: string;
  state: string;
}

/**
 * Generate a fresh PKCE verifier + challenge + state. Caller is responsible
 * for stashing the verifier in sessionStorage before redirecting.
 */
export async function generatePkceChallenge(): Promise<PkceChallenge> {
  const verifier = randomString(32); // 43+ chars after base64url
  const challenge = base64UrlEncode(await sha256(verifier));
  const state = randomString(16);
  return { verifier, challenge, state };
}

// --- Authorize redirect ----------------------------------------------------

/**
 * Build the Cognito Hosted UI URL that kicks off the federated SAML login.
 * Stashes the verifier + state in sessionStorage so the callback can finish
 * the exchange.
 */
export async function buildAuthorizeUrl(): Promise<string> {
  if (!authConfig.cognitoDomain || !authConfig.clientId) {
    throw new Error(
      "auth.ts: Cognito config is empty. Populate .env from .env.example before redirecting.",
    );
  }

  const { verifier, challenge, state } = await generatePkceChallenge();
  sessionStorage.setItem(VERIFIER_KEY, verifier);
  sessionStorage.setItem(STATE_KEY, state);

  const params = new URLSearchParams({
    client_id: authConfig.clientId,
    response_type: "code",
    scope: authConfig.scopes.join(" "),
    redirect_uri: authConfig.redirectUri,
    code_challenge: challenge,
    code_challenge_method: "S256",
    state,
    identity_provider: authConfig.samlProviderName, // CONFIGURE_ME: UA SAML IdP name in Cognito
  });

  return `https://${authConfig.cognitoDomain}.auth.${authConfig.region}.amazoncognito.com/oauth2/authorize?${params.toString()}`;
}

// --- Token exchange --------------------------------------------------------

export interface TokenSet {
  id_token: string;
  access_token: string;
  refresh_token?: string;
  expires_in: number;
  token_type: "Bearer";
}

/**
 * Exchange the authorization code for tokens. PKCE — no client_secret.
 *
 * Validates the `state` returned by Cognito against the value we stashed
 * before redirecting, then pulls the verifier and POSTs to /oauth2/token.
 *
 * Tokens are returned to the caller (typically the callback page) which
 * decides where to put them. Per docs/AUTH.md: do NOT put access tokens in
 * localStorage. Hold them in memory and rely on a refresh strategy.
 */
export async function exchangeCodeForTokens(
  code: string,
  returnedState: string,
): Promise<TokenSet> {
  const storedState = sessionStorage.getItem(STATE_KEY);
  const verifier = sessionStorage.getItem(VERIFIER_KEY);
  if (!storedState || storedState !== returnedState) {
    throw new Error("auth.ts: state mismatch — possible CSRF, aborting.");
  }
  if (!verifier) {
    throw new Error("auth.ts: missing PKCE verifier in sessionStorage.");
  }

  const body = new URLSearchParams({
    grant_type: "authorization_code",
    client_id: authConfig.clientId,
    code,
    redirect_uri: authConfig.redirectUri,
    code_verifier: verifier,
  });

  // CONFIGURE_ME: confirm this is the right Cognito token endpoint shape for
  // your deployed user pool. The default form below matches Cognito Hosted UI.
  const tokenUrl = `https://${authConfig.cognitoDomain}.auth.${authConfig.region}.amazoncognito.com/oauth2/token`;

  const resp = await fetch(tokenUrl, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: body.toString(),
  });

  if (!resp.ok) {
    const detail = await resp.text();
    throw new Error(
      `auth.ts: token exchange failed (${resp.status}): ${detail}`,
    );
  }

  // Clear single-use PKCE artifacts the moment we no longer need them.
  sessionStorage.removeItem(STATE_KEY);
  sessionStorage.removeItem(VERIFIER_KEY);

  return (await resp.json()) as TokenSet;
}

// --- Sign-out helper -------------------------------------------------------

/**
 * Redirect to Cognito's logout endpoint. Cognito does NOT sign the user out
 * of UA's SAML IdP — that's expected SSO behavior. See docs/AUTH.md.
 */
export function buildLogoutUrl(): string {
  const params = new URLSearchParams({
    client_id: authConfig.clientId,
    logout_uri: authConfig.logoutUri,
  });
  return `https://${authConfig.cognitoDomain}.auth.${authConfig.region}.amazoncognito.com/logout?${params.toString()}`;
}
