import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import {
  SESSION_COOKIE_NAME,
  STATE_COOKIE_NAME,
  buildLogoutUrl,
  getCognitoConfig,
} from "@/lib/auth";

/**
 * GET /auth/signout
 *
 * Clears the local session cookie, then redirects to the Cognito `/logout`
 * endpoint which clears the Cognito session and bounces back to
 * `COGNITO_LOGOUT_URI`.
 *
 * Note: signing out of Cognito does NOT sign the user out of UA's SAML IdP.
 * The next NetID login may succeed without a re-prompt if the IdP session
 * is still valid. This is expected SAML SSO behavior — see docs/AUTH.md.
 */
export async function GET(): Promise<Response> {
  const config = getCognitoConfig();

  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
  cookieStore.delete(STATE_COOKIE_NAME);

  return NextResponse.redirect(buildLogoutUrl(config));
}
