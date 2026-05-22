/**
 * UA Athletics — Cognito + UA SAML federation, SPA (PKCE) flow.
 *
 * This file is intentionally a scaffold. It contains:
 *   - the config shape (read from `import.meta.env`),
 *   - the PKCE helpers (code verifier + S256 challenge),
 *   - the authorize-URL builder, and
 *   - a TODO stub for the code-for-tokens exchange.
 *
 * Every UA-specific value is marked `// CONFIGURE_ME` and read from Vite env
 * variables prefixed `VITE_`. Do NOT add any real Cognito IDs or domain
 * prefixes here; they live in `.env` (gitignored) and are wired by the human
 * after running through UA IT's engagement process. See docs/AUTH.md.
 *
 * NEVER put `COGNITO_CLIENT_SECRET` in this file. SPAs use PKCE, which is
 * specifically the flavor of the OAuth code grant that does not require a
 * client secret.
 */

// CONFIGURE_ME: every field below is wired from `.env`. See `.env.example`
// at the template root for the full placeholder shape. The keys are read at
// build time by Vite from `import.meta.env`.
export interface AuthConfig {
  /** AWS region, e.g. `us-west-2`. */
  readonly region: string;
  /** Cognito User Pool ID, e.g. `us-west-2_XXXXXXXXX`. */
  readonly userPoolId: string;
  /** Cognito App Client ID (public client — no secret). */
  readonly clientId: string;
  /** Cognito domain prefix (subdomain of `auth.{region}.amazoncognito.com`). */
  readonly domain: string;
  /** Registered callback URL on the Cognito app client. */
  readonly redirectUri: string;
  /** Registered sign-out URL on the Cognito app client. */
  readonly logoutUri: string;
  /** SAML IdP name as configured in Cognito (e.g. `UAWebAuth`). */
  readonly samlProviderName: string;
}

export const authConfig: AuthConfig = {
  // CONFIGURE_ME — COGNITO_REGION
  region: import.meta.env["VITE_COGNITO_REGION"] ?? "",
  // CONFIGURE_ME — COGNITO_USER_POOL_ID
  userPoolId: import.meta.env["VITE_COGNITO_USER_POOL_ID"] ?? "",
  // CONFIGURE_ME — COGNITO_CLIENT_ID (public client; no secret)
  clientId: import.meta.env["VITE_COGNITO_CLIENT_ID"] ?? "",
  // CONFIGURE_ME — COGNITO_DOMAIN
  domain: import.meta.env["VITE_COGNITO_DOMAIN"] ?? "",
  // CONFIGURE_ME — COGNITO_REDIRECT_URI
  redirectUri: import.meta.env["VITE_COGNITO_REDIRECT_URI"] ?? "",
  // CONFIGURE_ME — COGNITO_LOGOUT_URI
  logoutUri: import.meta.env["VITE_COGNITO_LOGOUT_URI"] ?? "",
  // CONFIGURE_ME — COGNITO_SAML_PROVIDER_NAME
  samlProviderName: import.meta.env["VITE_COGNITO_SAML_PROVIDER_NAME"] ?? "",
};

const STATE_STORAGE_KEY = "ua-auth-state";
const VERIFIER_STORAGE_KEY = "ua-auth-code-verifier";

/** URL-safe base64 (RFC 4648 §5) — no `+`, `/`, or trailing `=`. */
function base64UrlEncode(bytes: ArrayBuffer | Uint8Array): string {
  const u8 = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
  let str = "";
  for (let i = 0; i < u8.length; i++) {
    // u8[i] is `number | undefined` under noUncheckedIndexedAccess.
    str += String.fromCharCode(u8[i] ?? 0);
  }
  return btoa(str).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

/**
 * Generate a cryptographically random PKCE code verifier (RFC 7636 §4.1).
 * 32 random bytes → 43 url-safe base64 chars, within the 43–128 char window.
 */
export function generateCodeVerifier(): string {
  const random = new Uint8Array(32);
  crypto.getRandomValues(random);
  return base64UrlEncode(random);
}

/**
 * Derive the PKCE code challenge: BASE64URL(SHA256(verifier)) per RFC 7636 §4.2.
 */
export async function generateCodeChallenge(verifier: string): Promise<string> {
  const data = new TextEncoder().encode(verifier);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return base64UrlEncode(digest);
}

/** Generate a short random `state` value to bind the authorize → callback round-trip. */
export function generateState(): string {
  const random = new Uint8Array(16);
  crypto.getRandomValues(random);
  return base64UrlEncode(random);
}

/** Build the Cognito `/oauth2/authorize` URL for the SAML-federated flow. */
export function buildAuthorizeUrl(args: {
  config: AuthConfig;
  state: string;
  codeChallenge: string;
  scopes?: readonly string[];
}): string {
  const { config, state, codeChallenge, scopes = ["openid", "email", "profile"] } = args;
  const base = `https://${config.domain}.auth.${config.region}.amazoncognito.com/oauth2/authorize`;
  const params = new URLSearchParams({
    identity_provider: config.samlProviderName,
    response_type: "code",
    client_id: config.clientId,
    redirect_uri: config.redirectUri,
    scope: scopes.join(" "),
    state,
    code_challenge: codeChallenge,
    code_challenge_method: "S256",
  });
  return `${base}?${params.toString()}`;
}

/** Build the Cognito `/logout` URL. */
export function buildLogoutUrl(config: AuthConfig): string {
  const base = `https://${config.domain}.auth.${config.region}.amazoncognito.com/logout`;
  const params = new URLSearchParams({
    client_id: config.clientId,
    logout_uri: config.logoutUri,
  });
  return `${base}?${params.toString()}`;
}

/**
 * Kick off the PKCE flow: persist `state` + `code_verifier` in `sessionStorage`
 * (cleared on tab close), then navigate the browser to the authorize URL.
 *
 * Returns a Promise that resolves to the URL the caller can navigate to. The
 * helper does NOT call `window.location.assign` itself; that's the
 * responsibility of the consuming UI, so tests and SSR don't accidentally
 * navigate.
 */
export async function beginLogin(config: AuthConfig = authConfig): Promise<string> {
  const verifier = generateCodeVerifier();
  const challenge = await generateCodeChallenge(verifier);
  const state = generateState();
  try {
    window.sessionStorage.setItem(STATE_STORAGE_KEY, state);
    window.sessionStorage.setItem(VERIFIER_STORAGE_KEY, verifier);
  } catch {
    // Private-mode browsers can throw. The flow cannot complete safely
    // without sessionStorage, so surface the failure to the caller.
    throw new Error("sessionStorage is unavailable; PKCE flow cannot continue.");
  }
  return buildAuthorizeUrl({ config, state, codeChallenge: challenge });
}

/** Result of a successful token exchange. */
export interface TokenResponse {
  readonly id_token: string;
  readonly access_token: string;
  readonly refresh_token?: string;
  readonly expires_in: number;
  readonly token_type: "Bearer";
}

/**
 * Complete the PKCE flow: validate `state`, exchange `code` for tokens at
 * Cognito's `/oauth2/token`, and clear the one-time storage.
 *
 * TODO: implement the token exchange. The shape is:
 *   POST https://{domain}.auth.{region}.amazoncognito.com/oauth2/token
 *     Content-Type: application/x-www-form-urlencoded
 *     body: grant_type=authorization_code
 *           &client_id={clientId}
 *           &code={code}
 *           &redirect_uri={redirectUri}
 *           &code_verifier={verifier}
 *   (NO client_secret — this is the SPA / PKCE flow.)
 *
 * After exchange:
 *   - hold id_token / access_token in memory only (React context),
 *   - decide refresh_token storage per docs/AUTH.md (sessionStorage with a
 *     documented trade-off, or httpOnly cookie from a server companion),
 *   - strip `code` and `state` from `window.location` before rendering.
 */
export async function completeLogin(
  _params: URLSearchParams,
  _config: AuthConfig = authConfig,
): Promise<TokenResponse> {
  // TODO: pull `code` + `state` out of `_params`, compare `state` against the
  // value stored in sessionStorage, read the verifier, POST to /oauth2/token,
  // parse the response, and clear the one-time storage. See docs/AUTH.md.
  throw new Error("completeLogin: not yet implemented. See docs/AUTH.md for the contract.");
}

/**
 * Group-based authorization helper stub. Reads `cognito:groups` from a
 * decoded ID token and returns whether the user is a member of `name`.
 *
 * TODO: wire to your ID-token parser of choice (e.g. `jose`) and the
 * project-specific group name string (which lives in the consuming app,
 * NOT in this shared template — see docs/AUTH.md).
 */
export function requireGroup(_name: string): boolean {
  // TODO: implement once the consuming project picks a JWT library and
  //       supplies the group identifier.
  return false;
}
