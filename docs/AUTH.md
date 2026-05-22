# Authentication

The standard auth pattern for University of Arizona Athletics web apps is an
**AWS Cognito User Pool federated with UA's SAML Identity Provider**. NetID
login is handled by UA's central SSO; Cognito issues the OAuth/OIDC session
tokens that the app actually consumes. This document describes the *shape* of
the flow that all templates in this repo implement. Per-project values (user
pool IDs, app client IDs, Cognito domain prefixes, callback URLs, SAML provider
names) are obtained through the UA IT engagement process and live in
environment variables — never in source, never in this repo.

This is a forward-looking spec. PR 1 ships the documentation; the per-template
implementation lands in PR 2+ under `templates/{name}/src/lib/auth.ts` (or the
framework equivalent).

---

## What this doc is NOT

- Not a Cognito tutorial. See the [AWS Cognito User Pool developer guide](https://docs.aws.amazon.com/cognito/latest/developerguide/cognito-user-identity-pools.html).
- Not a SAML primer. See UA IT's internal documentation for NetID/WebAuth federation.
- Not a substitute for a security review. New deployments must go through UA IT.
- Does not include any UA-specific identifiers, secrets, production URLs,
  IdP metadata, ticket queues, or contact names. Those live in your project's
  AWS account and in UA IT's engagement system, not here.

---

## The flow at a glance

```
   ┌──────────┐      1. click "Sign in with UA NetID"
   │   App    │ ───────────────────────────────────────┐
   │ (SPA or  │                                        │
   │  server) │ <──── 8. tokens in cookie / memory ─── │
   └────┬─────┘                                        │
        │ 2. redirect /oauth2/authorize                │
        v                                              │
   ┌──────────┐                                        │
   │ Cognito  │ 6. redirect to app callback with code  │
   │  Hosted  │ ───────────────────────────────────────┘
   │    UI    │
   └────┬─────┘ 7. POST /oauth2/token  (PKCE or client_secret)
        │
        │ 3. redirect to UA SAML IdP
        v
   ┌──────────┐ 4. user authenticates with NetID (WebAuth)
   │  UA SAML │
   │   IdP    │ 5. SAML assertion POSTed back to Cognito
   └──────────┘
```

1. User clicks **Sign in with UA NetID** in the app.
2. App redirects to the Cognito Hosted UI:
   `https://{cognito-domain}.auth.{region}.amazoncognito.com/oauth2/authorize?identity_provider={UA_SAML_IDP_NAME}&response_type=code&client_id=...&scope=openid+email+profile&redirect_uri=...&code_challenge=...&code_challenge_method=S256`
3. Cognito recognizes the `identity_provider` parameter and redirects the
   browser to UA's SAML IdP.
4. User authenticates with NetID (WebAuth, including MFA if required by UA).
5. UA SAML IdP POSTs a signed SAML assertion back to Cognito's ACS endpoint.
6. Cognito validates the assertion, creates or updates the federated user
   record, issues an authorization code, and redirects the browser to the
   app's registered callback URL.
7. The app exchanges the code for an ID token, access token, and refresh
   token by calling Cognito's `/oauth2/token` endpoint.
   - SPAs use **PKCE** (no client secret).
   - Confidential server clients use the **client secret**.
8. App stores tokens (in-memory or httpOnly cookie depending on template) and
   uses them for protected API calls. The ID token carries identity claims;
   the access token authorizes API calls; the refresh token renews the session.

---

## Roles in the stack

- **UA SAML IdP** — Owned and operated by UA IT. Source of NetID truth.
  Each Cognito User Pool must be allowlisted by UA IT before federation will
  work; this is not something the app can self-serve.
- **AWS Cognito User Pool** — Owned by the project's own AWS account. Holds
  the federated user records, issues OAuth/OIDC tokens, controls token
  lifetimes, holds the app clients, holds the Cognito groups used for
  authorization.
- **The app (this template)** — Initiates the redirect, receives the callback,
  exchanges the code for tokens, refreshes tokens, gates UI by group
  membership, and signs the user out.

---

## Required environment variables

Every template will ship a `.env.example` with the following placeholders.
Replace each value via your project's AWS Console and the UA IT engagement
ticket. `.env` itself is gitignored.

```dotenv
# AWS / Cognito User Pool  (CONFIGURE_ME)
AWS_REGION=us-west-2
COGNITO_USER_POOL_ID=us-west-2_XXXXXXXXX
COGNITO_CLIENT_ID=xxxxxxxxxxxxxxxxxxxxxxxxxx
COGNITO_DOMAIN=your-app-name           # subdomain of {region}.amazoncognito.com
COGNITO_REDIRECT_URI=http://localhost:3000/auth/callback
COGNITO_LOGOUT_URI=http://localhost:3000/

# SAML IdP name as configured in Cognito  (CONFIGURE_ME)
COGNITO_SAML_PROVIDER_NAME=UAWebAuth

# Server-side only.  NEVER commit.  NEVER expose to the client bundle.
COGNITO_CLIENT_SECRET=                 # only for confidential server clients
```

Notes:

- **SPAs (React-Vite, Astro client-side) use PKCE.** They must NOT have a
  client secret. Create the Cognito app client as a public client.
- **Server-rendered apps (Next.js route handlers, Express) may use a
  confidential client** with `COGNITO_CLIENT_SECRET`.
- Never put `COGNITO_CLIENT_SECRET` in any variable that ships to the browser
  bundle. In Next.js, that means **do not** prefix it with `NEXT_PUBLIC_`. In
  Vite, **do not** prefix it with `VITE_`. In Astro, **do not** expose it via
  `import.meta.env` on the client.
- `COGNITO_REDIRECT_URI` and `COGNITO_LOGOUT_URI` must be registered on the
  Cognito app client. Local-dev URIs and production URIs are registered
  separately; never reuse a production callback URL in a local `.env`.

---

## Where the `// CONFIGURE_ME` markers live

Each template (shipping in PR 2+) will follow this layout:

- **`src/lib/auth.ts`** (or the framework equivalent — `src/server/auth.ts`
  for Next.js route handlers, `src/auth/index.ts` for Express) — A single
  config object that reads `import.meta.env.*` or `process.env.*`, with a
  `// CONFIGURE_ME` comment next to each field that requires a UA-IT-issued
  value. The config object is the only place auth values are read.
- **`.env.example`** — The placeholder shape shown above. Copy to `.env` and
  fill in.
- **`README.md`** — A "Getting auth working" section that points back to this
  document and to the UA IT engagement process.

Do not duplicate auth config across multiple files. If a value is needed in
more than one place, import it from `src/lib/auth.ts`.

---

## PKCE flow (SPA templates: React-Vite, Astro)

Used by templates where the entire app runs in the browser and there is no
trusted server companion to hold a client secret.

- Generate a cryptographically random `code_verifier` (43–128 chars, URL-safe).
- Derive `code_challenge = BASE64URL(SHA256(code_verifier))`.
- Store `code_verifier` in `sessionStorage` (cleared on tab close) keyed by
  a one-time state value. Also store the `state` value to validate on return.
- Redirect to Cognito's `/oauth2/authorize` with `response_type=code`,
  `code_challenge`, `code_challenge_method=S256`, `state`, and
  `identity_provider={UA_SAML_IDP_NAME}`.
- On the callback route, validate `state`, read `code_verifier` from
  `sessionStorage`, and POST to `/oauth2/token` with grant_type
  `authorization_code` and the verifier. **No client secret.**
- Hold the resulting tokens in memory (e.g., a React context). Refresh token
  storage is documented below.

Code for this lands with the templates in PR 2+.

---

## Authorization Code with Client Secret (server templates: Next.js, Express)

Used by templates with a trusted server runtime that can keep the client
secret out of the browser.

- `COGNITO_CLIENT_SECRET` is loaded from server-side env only.
- The browser hits a server route (e.g., `/api/auth/login`) which redirects
  to Cognito's `/oauth2/authorize` with `response_type=code` and
  `identity_provider={UA_SAML_IDP_NAME}`. `state` is signed/encrypted with a
  server secret to bind the redirect.
- On callback, the server route validates `state`, then POSTs to
  `/oauth2/token` from the server with HTTP Basic auth
  (`client_id:client_secret`).
- The server sets an **httpOnly, Secure, SameSite=Lax** cookie containing
  either the session itself or a server-side session reference. The refresh
  token never leaves the server.
- Token refresh happens server-side on demand using the
  `refresh_token` grant.

Code for this lands with the templates in PR 2+.

---

## Token storage rules

- **DO** use httpOnly + Secure + SameSite=Lax cookies for server-rendered
  apps (Next.js route handlers, Express).
- **DO** keep access/ID tokens in JavaScript memory for SPAs. Use React
  context, a Svelte store, or equivalent.
- **DO** put the refresh token in an httpOnly cookie if the SPA has a server
  companion. Otherwise, document the trade-offs of `sessionStorage` (lost
  on tab close, readable by same-origin scripts) and prefer re-authentication
  over long-lived browser-side refresh tokens.
- **DO NOT** put access tokens or ID tokens in `localStorage` — any XSS can
  read them.
- **DO NOT** log tokens. Not in `console.log`, not in error reporters, not in
  server access logs. Scrub the `Authorization` header in any HTTP logger.
- **DO NOT** embed tokens in URLs (no query string, no fragment after
  callback handling). Strip the `code` and `state` from the URL after
  callback handling completes.

---

## Sign-out

Sign-out has two halves: clear the Cognito session, then clear the local
session.

- Redirect the browser to
  `https://{cognito-domain}.auth.{region}.amazoncognito.com/logout?client_id={COGNITO_CLIENT_ID}&logout_uri={COGNITO_LOGOUT_URI}`.
- `logout_uri` must be registered on the Cognito app client as an allowed
  sign-out URL.
- On return to `logout_uri`, clear:
  - In-memory tokens (SPA).
  - Session cookie (server-rendered).
  - Any cached user/group state.
- Sign-out from Cognito does **not** automatically sign the user out of UA's
  SAML IdP. A subsequent NetID login may succeed without re-prompting if the
  IdP session is still valid. This is expected SAML SSO behavior.

---

## Group-based authorization

Cognito groups map to UA roles (e.g., admin tiers, content editors, read-only
viewers). Group names and access policies are project-specific and **must
not** be checked into this repo.

- Groups are read from the ID token's `cognito:groups` claim.
- Group assignment is managed in the Cognito console (or via Cognito APIs
  from an admin tool), typically driven by SAML attribute mapping from UA's
  IdP. Coordinate with UA IT on which SAML attributes carry role information.
- Templates ship a `requireGroup(name: string)` helper stub that:
  - In SPAs, gates routes/components and redirects to a "not authorized"
    page on mismatch.
  - In server routes, returns a 403 on mismatch.
- The actual group name strings live in the consuming project, not in the
  template. Pass them in via config, never hard-code them in shared code.

---

## Getting set up at UA

To enable a new Cognito User Pool with UA SAML federation, you must file a
ticket with UA IT. The specific intake process, queue, and required
information are internal and out of scope for this public document. Check
with the Athletics IT or Marcom liaison for the current process.

Expect to provide, at minimum: the AWS account ID, the Cognito User Pool ID,
the Cognito-hosted ACS URL and entity ID, and the list of SAML attributes
your app needs mapped (e.g., NetID, email, display name, group/role
attributes). UA IT will provide the IdP metadata to load into your Cognito
SAML provider configuration.

Do not paste any of those values into this repo or into this document.

---

## What to never commit

Final checklist before opening a PR:

- [ ] `.env` is gitignored. Only `.env.example` (with placeholder shapes) is
      committed.
- [ ] `COGNITO_CLIENT_SECRET` does not appear in any committed file, log,
      test fixture, or screenshot.
- [ ] UA SAML IdP metadata XML files are not committed.
- [ ] No real production callback URLs are in source, comments, README
      examples, or test fixtures. Use `your-app-name`, `XXXX`, or
      `// CONFIGURE_ME` placeholders.
- [ ] No real user pool IDs, app client IDs, or Cognito domain prefixes from
      any UA deployment are in source. Same placeholder rule.
- [ ] No internal UA group names, role identifiers, or access-policy strings
      are committed to shared template code.
- [ ] No internal UA IT URLs, ticket queue names, or staff contact info.
- [ ] No tokens in logs, snapshots, or recorded HTTP fixtures. If you record
      a fixture against a real Cognito pool, redact `Authorization`,
      `Set-Cookie`, `id_token`, `access_token`, and `refresh_token` before
      committing.

If you find any of the above in this repo, rotate the affected value and
open an issue.

---

## Forward references

The per-template implementation lands in PR 2+. Expected layout:

- `templates/react-vite/src/lib/auth.ts` — PKCE.
- `templates/astro/src/lib/auth.ts` — PKCE for the client-side islands;
  optional server-route variant for server endpoints.
- `templates/nextjs/src/server/auth.ts` — Authorization Code with client
  secret, executed in route handlers; httpOnly cookie session.
- `templates/express/src/auth/index.ts` — Authorization Code with client
  secret; httpOnly cookie session; `requireGroup` middleware.

When those templates land, each will link back to this document from its
own README's "Getting auth working" section. This document remains the
single source of truth for the auth flow shape across the template family.
