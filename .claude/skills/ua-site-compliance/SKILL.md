---
name: ua-site-compliance
description: Audit and refactor an existing web site, app, template, or page so it complies with University of Arizona Athletics design standards, UA Marcom brand guidance, Arizona Digital conventions, @ua/ua-tokens, semantic color tokens, the six shared components, dark mode behavior, accessibility expectations, and safe auth placeholders. Use when the user asks to redo, modernize, fix, convert, or bring a site into UA Athletics compliance.
---

# UA Site Compliance

Bring an existing site into the UA Athletics system without rewriting unrelated
behavior.

Source repo:
`https://github.com/Arizona-Athletics/Arizona-Athletics-Skills`

## First moves

1. Identify the stack, package manager, build commands, styling system, and
   rendered entry points.
2. If the work is non-trivial, run `$ua-standards-check` or read
   `skills/ua-standards-check/SKILL.md` and perform that read-only audit.
3. Load `docs/LLM_GUIDE.md`, then only the focused docs needed:
   `docs/COLORS.md`, `docs/TYPOGRAPHY.md`, `docs/COMPONENTS.md`,
   `docs/DARK_MODE.md`, and `docs/AUTH.md` if auth exists.
4. Preserve content, URLs, behavior, analytics hooks, form semantics, and CMS
   integration unless the user asks to change them.

## Audit checklist

Search for:

```bash
rg -n "#[0-9A-Fa-f]{3,8}|rgb\\(|rgba\\(|hsl\\(|hsla\\(" .
rg -n "bg-(gray|slate|zinc|neutral)|text-(gray|slate|zinc|neutral)|border-(gray|slate|zinc|neutral)" .
rg -n "font-family|Inter|Roboto|Open Sans|Helvetica" .
rg -n "dark:|prefers-color-scheme|data-theme|data-bs-theme" .
rg -n "COGNITO_CLIENT_SECRET|AWS_SECRET|client_secret|poolId|userPoolId|identityProvider" .
```

Also inspect:

- Whether `@ua/ua-tokens` or generated `tokens.css` is loaded.
- Whether the page has `Header`, `Hero`, `Toolbar`, `Card`, `Footer`, and
  `ThemeToggle` equivalents.
- Whether body text, surfaces, links, borders, focus rings, and buttons use
  semantic tokens.
- Whether any UA logo, wordmark, Typekit kit ID, Cognito ID, social URL, or
  contact value was guessed instead of provided.
- Whether light/dark first paint is safe and does not require JS after render to
  correct colors.

## Refactor rules

- Replace raw UA colors and generic grays with semantic tokens.
- Keep brand tokens only for isolated identity accents.
- Do not write manual dark-mode color overrides; fix token usage instead.
- Use the existing framework's idioms. Do not migrate stacks just to comply.
- Add `@ua/ua-tokens` through the target stack's normal package path when the
  project can consume packages. If it cannot, copy or reference the compiled
  token CSS in the least surprising existing asset pipeline.
- For email templates, literal hex output is acceptable only when sourced from
  `@ua/ua-tokens`; document that source in comments or build scripts.
- Keep `--az-*` aliases in Arizona Digital / Bootstrap / Quickstart projects.
- Replace guessed UA-specific values with `CONFIGURE_ME` markers.
- Never commit client-side secrets or Cognito client secrets.

## Implementation flow

1. Run the app or inspect screenshots before changing styles, when feasible.
2. Make a small compliance map: token loading, typography, components, theme,
   assets, auth/secrets, and verification gaps.
3. Patch the narrowest files that correct those gaps.
4. Run tests, build, lint/typecheck, and any existing formatting command.
5. For browser apps, verify at least one representative page in light and dark
   mode at desktop and mobile widths.
6. Report any remaining non-compliance that needs a human-supplied asset, ID, or
   business decision.

## Output standard

Finish with:

- Main compliance changes made.
- Commands and visual checks that passed.
- Remaining `CONFIGURE_ME` items or human decisions.
- Any deliberate exceptions, especially email hex output or legacy `--az-*`
  compatibility.
