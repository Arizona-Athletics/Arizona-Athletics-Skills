/// <reference types="astro/client" />

interface ImportMetaEnv {
  // Cognito + UA SAML federation — values come from env, never from source.
  // See docs/AUTH.md and .env.example for the full list. All PUBLIC_ prefixed
  // values ship in the client bundle; the unprefixed CLIENT_SECRET stays
  // server-side and must never appear in PUBLIC_-prefixed code paths.
  readonly PUBLIC_AWS_REGION?: string;
  readonly PUBLIC_COGNITO_DOMAIN?: string;
  readonly PUBLIC_COGNITO_CLIENT_ID?: string;
  readonly PUBLIC_COGNITO_REDIRECT_URI?: string;
  readonly PUBLIC_COGNITO_LOGOUT_URI?: string;
  readonly PUBLIC_COGNITO_SAML_PROVIDER_NAME?: string;
  readonly PUBLIC_TYPEKIT_ID?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
