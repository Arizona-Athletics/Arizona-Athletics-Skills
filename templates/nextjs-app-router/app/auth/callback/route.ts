import { cookies } from "next/headers";
import { NextResponse, type NextRequest } from "next/server";
import {
  SESSION_COOKIE_NAME,
  STATE_COOKIE_NAME,
  decodeIdTokenClaims,
  exchangeCodeForTokens,
  getCognitoConfig,
} from "@/lib/auth";

/**
 * GET /auth/callback?code=...&state=...
 *
 * Server-side handler for the Cognito Hosted UI callback. Validates `state`
 * against the value we stashed before the redirect, then exchanges the
 * authorization code for tokens using the confidential client secret.
 *
 * The resulting tokens never reach the browser as JS-readable values. We set
 * an httpOnly session cookie; subsequent server components read it via
 * `cookies()` from `next/headers`.
 *
 * This is a STUB. Production deployments should:
 *   - Validate the ID token signature against the Cognito JWKS.
 *   - Store the refresh token server-side keyed off an opaque session id,
 *     instead of putting any token directly into the cookie.
 *   - Encode the session cookie value (JWE / signed JWT) so the browser
 *     can't tamper even with a copy.
 */
export async function GET(request: NextRequest): Promise<Response> {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const error = url.searchParams.get("error");

  if (error) {
    // Cognito returned an OAuth error (user cancelled, IdP rejection, etc.).
    return NextResponse.redirect(new URL("/?auth_error=1", request.url));
  }
  if (!code || !state) {
    return NextResponse.redirect(new URL("/?auth_error=missing", request.url));
  }

  const cookieStore = await cookies();
  const expectedState = cookieStore.get(STATE_COOKIE_NAME)?.value;

  if (!expectedState || expectedState !== state) {
    // State mismatch ⇒ possible CSRF; refuse and clear the stale cookie.
    cookieStore.delete(STATE_COOKIE_NAME);
    return NextResponse.redirect(new URL("/?auth_error=state", request.url));
  }
  cookieStore.delete(STATE_COOKIE_NAME);

  // CONFIGURE_ME: wrap in a try/catch and render a friendly error page on
  // failure rather than a 500.
  const config = getCognitoConfig();
  const tokens = await exchangeCodeForTokens(config, code);

  // Read identity claims; useful for personalizing the next page render.
  // CONFIGURE_ME: verify the JWT signature before trusting these claims in
  // production. See lib/auth.ts.
  const _claims = decodeIdTokenClaims(tokens.id_token);

  // Session cookie — httpOnly, Secure (in prod), SameSite=Lax. In this stub
  // we store the ID token directly for demo purposes; replace with an opaque
  // session id pointing at server-side storage in production.
  cookieStore.set(SESSION_COOKIE_NAME, tokens.id_token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: tokens.expires_in,
  });

  // CONFIGURE_ME: redirect to a post-login landing page (saved `return_to`
  // param, dashboard, etc.) instead of home.
  return NextResponse.redirect(new URL("/", request.url));
}
