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
  imageSrc?: string;
  imageAlt?: string;
  overlay?: string;
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
 * `with-image` renders real image plumbing plus the default brand scrim from
 * the component contract. Use `imageAlt` only when the image conveys content;
 * leave it empty for decorative photography.
 */
export function Hero({
  variant = "default",
  headline,
  subhead,
  ctaLabel,
  ctaHref,
  secondaryCtaLabel,
  secondaryCtaHref,
  imageSrc,
  imageAlt = "",
  overlay,
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
  const withImage = variant === "with-image" && Boolean(imageSrc);
  const overlayStyle = {
    background:
      overlay ??
      "linear-gradient(135deg, color-mix(in srgb, var(--ua-blue) 85%, transparent), color-mix(in srgb, var(--ua-red) 60%, transparent))",
  };

  return (
    <section
      aria-labelledby="hero-title"
      className={`
        relative overflow-hidden bg-semantic-surface
        border-b border-semantic-border
        ${paddingY}
      `}
    >
      {withImage ? (
        <div className="absolute inset-0" aria-hidden={imageAlt ? undefined : true}>
          <img
            src={imageSrc}
            alt={imageAlt}
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0" style={overlayStyle} />
        </div>
      ) : null}
      <div
        className={`
          relative mx-auto flex w-full max-w-wide flex-col gap-4 px-4
          ${alignClass}
        `}
      >
        <h1
          id="hero-title"
          className={`
            font-sans font-extrabold text-semantic-text-strong
            text-3xl md:text-5xl
            leading-tight
            ${withImage ? "text-ua-white" : ""}
          `}
        >
          {headline}
        </h1>
        {subhead ? (
          <p className={`
            font-sans text-semantic-text-muted
            text-base md:text-lg
            max-w-narrow
            ${withImage ? "text-ua-white/90" : ""}
          `}>
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
                className={`
                  inline-flex items-center justify-center
                  h-10 px-5 rounded-md
                  border border-semantic-border bg-transparent
                  text-semantic-text-strong
                  font-sans font-semibold
                  transition-colors hover:bg-semantic-surface-alt
                  focus-visible:outline focus-visible:outline-2 focus-visible:outline-semantic-focus-ring focus-visible:outline-offset-2
                  ${withImage ? "border-ua-white/80 text-ua-white hover:bg-ua-white/10" : ""}
                `}
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
