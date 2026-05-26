import Link from "next/link";

export interface HeroProps {
  /** Variant maps to docs/COMPONENTS.md § Hero. */
  variant?: "default" | "with-image" | "compact";
  headline: string;
  subhead?: string;
  ctaLabel?: string;
  ctaHref?: string;
  secondaryCtaLabel?: string;
  secondaryCtaHref?: string;
  /** Text alignment within the hero. */
  align?: "start" | "center";
}

/**
 * Hero — page-top banner. Server component.
 *
 * Renders an <h1>; never skip heading levels. Headline color is
 * `text-semantic-text-strong` so it flips in dark mode without an override.
 * CTAs inherit the global accent fill; focus rings use --focus-ring via the
 * preset's `focus-visible:outline-semantic-focus-ring`.
 *
 * `with-image` is intentionally left as a stub variant — drop the image-with-
 * brand-scrim treatment in once UA Marcom approves the photography.
 */
export function Hero({
  variant = "default",
  headline,
  subhead,
  ctaLabel,
  ctaHref,
  secondaryCtaLabel,
  secondaryCtaHref,
  align = "start",
}: HeroProps): React.ReactElement {
  const paddingY =
    variant === "compact"
      ? "py-8 md:py-10"
      : variant === "with-image"
        ? "py-16 md:py-24"
        : "py-12 md:py-16";
  const alignClass =
    align === "center" ? "items-center text-center" : "items-start text-left";

  return (
    <section
      aria-labelledby="hero-title"
      className={`
        relative bg-semantic-surface
        border-b border-semantic-border
        ${paddingY}
      `}
    >
      <div
        className={`
          mx-auto flex w-full max-w-wide flex-col gap-4 px-4
          ${alignClass}
        `}
      >
        <h1
          id="hero-title"
          className="
            font-sans font-extrabold text-semantic-text-strong
            text-3xl md:text-5xl
            leading-tight
          "
        >
          {headline}
        </h1>
        {subhead ? (
          <p className="
            font-sans text-semantic-text-muted
            text-base md:text-lg
            max-w-narrow
          ">
            {subhead}
          </p>
        ) : null}
        {ctaHref && ctaLabel ? (
          <div className="mt-2 flex flex-wrap items-center gap-3">
            <Link
              href={ctaHref}
              className="
                inline-flex items-center justify-center
                h-10 px-5 rounded-md
                bg-semantic-accent text-ua-white
                font-sans font-semibold
                transition-colors hover:bg-semantic-accent-hover
                focus-visible:outline focus-visible:outline-2 focus-visible:outline-semantic-focus-ring focus-visible:outline-offset-2
              "
            >
              {ctaLabel}
            </Link>
            {secondaryCtaHref && secondaryCtaLabel ? (
              <Link
                href={secondaryCtaHref}
                className="
                  inline-flex items-center justify-center
                  h-10 px-5 rounded-md
                  border border-semantic-border bg-transparent
                  text-semantic-text-strong
                  font-sans font-semibold
                  transition-colors hover:bg-semantic-surface-alt
                  focus-visible:outline focus-visible:outline-2 focus-visible:outline-semantic-focus-ring focus-visible:outline-offset-2
                "
              >
                {secondaryCtaLabel}
              </Link>
            ) : null}
          </div>
        ) : null}
      </div>
    </section>
  );
}
