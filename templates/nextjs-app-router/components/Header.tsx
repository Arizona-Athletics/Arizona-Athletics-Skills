import Link from "next/link";
import { ThemeToggle } from "./ThemeToggle";

/**
 * Header — site chrome at the top of every page.
 *
 * Server component. The interactive bits (ThemeToggle, eventually a mobile
 * drawer trigger) live in client subcomponents and are dropped into the
 * `actions` slot. No hex values: colors come from the semantic token
 * utilities, which flip automatically in dark mode.
 *
 * Visual contract: docs/COMPONENTS.md § Header.
 */
export function Header(): React.ReactElement {
  // CONFIGURE_ME: replace these placeholder nav items with the real site nav.
  const nav: ReadonlyArray<{ label: string; href: string; current?: boolean }> =
    [
      { label: "Teams", href: "#", current: true },
      { label: "Schedule", href: "#" },
      { label: "Tickets", href: "#" },
      { label: "News", href: "#" },
    ];

  return (
    <header
      role="banner"
      className="
        bg-semantic-surface border-b border-semantic-border
        h-14 md:h-16
      "
    >
      <div className="
        mx-auto flex h-full w-full max-w-wide items-center gap-4 px-4
      ">
        {/*
          CONFIGURE_ME: replace the text wordmark with the official Block A
          or UA Athletics wordmark SVG once UA Marcom provides the asset.
        */}
        <Link
          href="/"
          aria-label="Arizona Athletics home"
          className="
            inline-flex items-center gap-2
            font-sans font-extrabold text-semantic-text-strong
            text-h4
          "
        >
          <span aria-hidden="true">A</span>
          <span className="hidden sm:inline">Arizona Athletics</span>
        </Link>

        <nav aria-label="Primary" className="ml-2 hidden md:block">
          <ul className="flex items-center gap-5">
            {nav.map((item) => (
              <li key={item.label}>
                <Link
                  href={item.href}
                  aria-current={item.current ? "page" : undefined}
                  className={`
                    relative inline-block py-1 font-sans text-semantic-text
                    hover:text-semantic-text-strong
                    ${item.current
                      ? "text-semantic-text-strong after:absolute after:left-0 after:right-0 after:-bottom-1 after:h-0.5 after:bg-semantic-accent"
                      : ""}
                  `}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="ml-auto flex items-center gap-2">
          <ThemeToggle />
          {/*
            CONFIGURE_ME: wire this to the real Cognito sign-in flow. Right now
            it points at the server route handler at app/auth/signin/route.ts,
            which generates state and redirects to Cognito Hosted UI.
          */}
          <Link
            href="/auth/signin"
            className="
              hidden sm:inline-flex items-center
              h-9 px-4 rounded-pill
              bg-semantic-accent text-ua-white
              text-sm font-semibold
              transition-colors hover:bg-semantic-accent-hover
              focus-visible:outline focus-visible:outline-2 focus-visible:outline-semantic-focus-ring focus-visible:outline-offset-2
            "
          >
            Sign in
          </Link>
        </div>
      </div>
    </header>
  );
}
