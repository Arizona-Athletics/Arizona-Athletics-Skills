/*
 * @ua/template-html-tailwind · auth.js
 *
 * AWS Cognito + UA SAML (NetID) authentication SCAFFOLD.
 *
 * This file is a SPA-style PKCE flow stub. See /docs/AUTH.md for the canonical
 * shape of the flow across all UA Athletics templates. Per-project values
 * (user pool, client id, domain, callback URLs, SAML IdP name) are obtained
 * through the UA IT engagement process and live in environment variables, not
 * in source.
 *
 * Every value below marked `// CONFIGURE_ME` must be replaced before the flow
 * will function. DO NOT commit real values. DO NOT put a client secret in any
 * file that ships to the browser — this is a public SPA, so PKCE only.
 *
 * Pure-HTML templates have no build step, so this file ships placeholders and
 * a tiny config-loading shim. For a real deployment you would either inline
 * the values via a server-side template, or fetch a non-secret config JSON
 * from a known path on the same origin at boot.
 */

(function () {
  "use strict";

  // -------------------------------------------------------------------
  // Configuration — fill in via your project's deployment process.
  // See /docs/AUTH.md and the project .env.example.
  // -------------------------------------------------------------------
  var config = {
    // CONFIGURE_ME: AWS region of the Cognito User Pool, e.g. "us-west-2".
    region: "CONFIGURE_ME",

    // CONFIGURE_ME: Cognito hosted-UI subdomain (the part before .auth.<region>.amazoncognito.com).
    cognitoDomain: "CONFIGURE_ME",

    // CONFIGURE_ME: App client ID issued by your Cognito User Pool. Public SPA client (no secret).
    clientId: "CONFIGURE_ME",

    // CONFIGURE_ME: SAML provider name as registered in Cognito (e.g. "UAWebAuth").
    samlProviderName: "CONFIGURE_ME",

    // CONFIGURE_ME: Where Cognito redirects after a successful login.
    // Must be registered on the Cognito app client AND match this exact string.
    redirectUri: window.location.origin + "/auth/callback",

    // CONFIGURE_ME: Where the user lands after sign-out. Must also be registered on Cognito.
    logoutUri: window.location.origin + "/",

    // Default OIDC scopes. Override only if the project genuinely needs more.
    scope: "openid email profile"
  };

  // -------------------------------------------------------------------
  // Internal helpers
  // -------------------------------------------------------------------
  function hostedUiBase() {
    return "https://" + config.cognitoDomain +
      ".auth." + config.region + ".amazoncognito.com";
  }

  function randomString(len) {
    var bytes = new Uint8Array(len);
    crypto.getRandomValues(bytes);
    var out = "";
    var chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789-._~";
    for (var i = 0; i < bytes.length; i++) {
      out += chars[bytes[i] % chars.length];
    }
    return out;
  }

  function base64UrlEncode(buffer) {
    var bytes = new Uint8Array(buffer);
    var s = "";
    for (var i = 0; i < bytes.length; i++) s += String.fromCharCode(bytes[i]);
    return btoa(s).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
  }

  async function sha256(text) {
    var data = new TextEncoder().encode(text);
    return crypto.subtle.digest("SHA-256", data);
  }

  // -------------------------------------------------------------------
  // signIn — kick off the PKCE redirect.
  // -------------------------------------------------------------------
  async function signIn() {
    if (config.clientId === "CONFIGURE_ME") {
      console.warn(
        "[ua-auth] signIn() called but Cognito config is not set. " +
        "Fill in CONFIGURE_ME values in auth.js — see /docs/AUTH.md."
      );
      return;
    }

    var verifier = randomString(64);
    var state = randomString(32);
    var challenge = base64UrlEncode(await sha256(verifier));

    try {
      sessionStorage.setItem("ua-pkce-verifier", verifier);
      sessionStorage.setItem("ua-pkce-state", state);
    } catch (e) {
      console.error("[ua-auth] Unable to store PKCE verifier:", e);
      return;
    }

    var params = new URLSearchParams({
      identity_provider: config.samlProviderName,
      response_type: "code",
      client_id: config.clientId,
      redirect_uri: config.redirectUri,
      scope: config.scope,
      state: state,
      code_challenge: challenge,
      code_challenge_method: "S256"
    });

    window.location.assign(hostedUiBase() + "/oauth2/authorize?" + params.toString());
  }

  // -------------------------------------------------------------------
  // handleCallback — exchange the authorization code for tokens.
  // Call this from your /auth/callback page on load.
  // -------------------------------------------------------------------
  async function handleCallback() {
    var url = new URL(window.location.href);
    var code = url.searchParams.get("code");
    var returnedState = url.searchParams.get("state");
    if (!code) return null;

    var expectedState, verifier;
    try {
      expectedState = sessionStorage.getItem("ua-pkce-state");
      verifier = sessionStorage.getItem("ua-pkce-verifier");
    } catch (e) {
      console.error("[ua-auth] sessionStorage unavailable:", e);
      return null;
    }

    if (!expectedState || expectedState !== returnedState) {
      console.error("[ua-auth] State mismatch on callback — aborting token exchange.");
      return null;
    }

    var body = new URLSearchParams({
      grant_type: "authorization_code",
      client_id: config.clientId,
      code: code,
      redirect_uri: config.redirectUri,
      code_verifier: verifier
    });

    var res = await fetch(hostedUiBase() + "/oauth2/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: body.toString()
    });

    if (!res.ok) {
      console.error("[ua-auth] Token exchange failed:", res.status, await res.text());
      return null;
    }

    var tokens = await res.json();

    // Clean PKCE artefacts.
    try {
      sessionStorage.removeItem("ua-pkce-verifier");
      sessionStorage.removeItem("ua-pkce-state");
    } catch (e) { /* noop */ }

    // Strip ?code & ?state from the URL so tokens don't show up in history.
    url.searchParams.delete("code");
    url.searchParams.delete("state");
    window.history.replaceState({}, document.title, url.pathname + url.search + url.hash);

    // Per /docs/AUTH.md token-storage rules: keep id/access tokens in memory.
    // Do NOT write to localStorage. Refresh-token strategy is project-specific.
    return tokens;
  }

  // -------------------------------------------------------------------
  // signOut — clear Cognito session, then bounce back to logoutUri.
  // -------------------------------------------------------------------
  function signOut() {
    if (config.clientId === "CONFIGURE_ME") {
      console.warn("[ua-auth] signOut() called but Cognito config is not set.");
      return;
    }
    var params = new URLSearchParams({
      client_id: config.clientId,
      logout_uri: config.logoutUri
    });
    window.location.assign(hostedUiBase() + "/logout?" + params.toString());
  }

  // -------------------------------------------------------------------
  // Public surface
  // -------------------------------------------------------------------
  window.UA = window.UA || {};
  window.UA.auth = {
    signIn: signIn,
    handleCallback: handleCallback,
    signOut: signOut,
    config: config
  };
})();
