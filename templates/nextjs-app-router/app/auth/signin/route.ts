import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import {
  STATE_COOKIE_NAME,
  buildAuthorizeUrl,
  generateState,
  getCognitoConfig,
} from "@/lib/auth";

/**
 * GET /auth/signin
 *
 * Generates a CSRF-protective state value, stores it in an httpOnly cookie,
 * and redirects to the Cognito Hosted UI with `identity_provider` pointed at
 * the UA SAML IdP. Cognito will then forward the browser to UA WebAuth/NetID.
 *
 * Server-side only — `COGNITO_CLIENT_SECRET` is never sent here, but other
 * config values that originate from .env stay on the server too.
 */
export async function GET(): Promise<Response> {
  // CONFIGURE_ME: in production, wrap getCognitoConfig() in a try/catch that
  // renders a friendly "auth not configured" page instead of a 500.
  const config = getCognitoConfig();
  const state = generateState();

  const cookieStore = await cookies();
  cookieStore.set(STATE_COOKIE_NAME, state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 10, // 10 minutes is plenty for a redirect round-trip.
  });

  return NextResponse.redirect(buildAuthorizeUrl(config, state));
}
