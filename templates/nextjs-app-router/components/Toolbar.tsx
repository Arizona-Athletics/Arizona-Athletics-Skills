export interface ToolbarProps {
  title?: string;
  /** Labels for filter chips. The first chip is shown as active. */
  filters?: ReadonlyArray<string>;
  primaryCta?: { label: string; href: string };
  secondaryCta?: { label: string; href: string };
}

/**
 * Toolbar — secondary action bar under the hero on app/dashboard pages.
 *
 * Server component. The filter chips here are rendered as static buttons so
 * the bar can ship without a client boundary. If a page needs interactive
 * filtering, wrap the chips in a client component that owns the selected
 * state and reuses the same `aria-pressed` markup.
 *
 * Visual contract: docs/COMPONENTS.md § Toolbar.
 */
export function Toolbar({
  title,
  filters,
  primaryCta,
  secondaryCta,
}: ToolbarProps): React.ReactElement {
  return (
    <div
      className="
        bg-semantic-surface-alt border-b border-semantic-border
      "
    >
      <div
        className="
          mx-auto flex w-full max-w-wide flex-wrap items-center gap-4 px-4 py-3
        "
      >
        {title ? (
          <h2 className="font-sans font-semibold text-semantic-text-strong text-h4">
            {title}
          </h2>
        ) : null}

        {filters && filters.length > 0 ? (
          <div
            role="group"
            aria-label="Filters"
            className="flex flex-wrap items-center gap-2"
          >
            {filters.map((label, index) => {
              const active = index === 0;
              return (
                <button
                  key={label}
                  type="button"
                  aria-pressed={active}
                  data-filter={label.toLowerCase().replace(/\s+/g, "-")}
                  className={`
                    inline-flex items-center
                    h-8 px-3 rounded-pill border
                    font-sans text-sm
                    transition-colors
                    focus-visible:outline focus-visible:outline-2 focus-visible:outline-semantic-focus-ring focus-visible:outline-offset-2
                    ${active
                      ? "bg-semantic-accent text-ua-white border-transparent"
                      : "bg-semantic-surface text-semantic-text border-semantic-border hover:text-semantic-text-strong"}
                  `}
                >
                  {label}
                </button>
              );
            })}
          </div>
        ) : null}

        {primaryCta || secondaryCta ? (
          <div className="ml-auto flex items-center gap-2">
            {secondaryCta ? (
              <a
                href={secondaryCta.href}
                className="
                  inline-flex items-center justify-center
                  h-8 px-4 rounded-md
                  border border-semantic-border bg-transparent
                  text-semantic-text-strong
                  font-sans text-sm font-semibold
                  transition-colors hover:bg-semantic-surface
                  focus-visible:outline focus-visible:outline-2 focus-visible:outline-semantic-focus-ring focus-visible:outline-offset-2
                "
              >
                {secondaryCta.label}
              </a>
            ) : null}
            {primaryCta ? (
              <a
                href={primaryCta.href}
                className="
                  inline-flex items-center justify-center
                  h-8 px-4 rounded-md
                  bg-semantic-accent text-ua-white
                  font-sans text-sm font-semibold
                  transition-colors hover:bg-semantic-accent-hover
                  focus-visible:outline focus-visible:outline-2 focus-visible:outline-semantic-focus-ring focus-visible:outline-offset-2
                "
              >
                {primaryCta.label}
              </a>
            ) : null}
          </div>
        ) : null}
      </div>
    </div>
  );
}
