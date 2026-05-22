import Link from "next/link";
import type { ReactNode } from "react";

export interface CardProps {
  /** Small uppercase label above the headline. */
  eyebrow?: string;
  headline: string;
  body?: string;
  /** Render-prop slot for the footer row (links, meta, etc.). */
  footer?: ReactNode;
  /** Whole-card-clickable variant. When set, the outer element becomes <a>. */
  href?: string;
}

/**
 * Card — content tile. Server component.
 *
 * Visual contract: docs/COMPONENTS.md § Card.
 *
 * The whole-card-clickable variant uses an outer <Link>. Avoid nesting
 * interactive elements inside such a card — the footer slot should not
 * contain a separate <a>/<button> when `href` is set, or screen readers
 * will encounter two link affordances for the same target.
 */
export function Card({
  eyebrow,
  headline,
  body,
  footer,
  href,
}: CardProps): React.ReactElement {
  const containerClass = `
    block rounded-md
    bg-semantic-surface border border-semantic-border
    shadow-sm
    transition-shadow
    hover:shadow-md
    focus-visible:outline focus-visible:outline-2 focus-visible:outline-semantic-focus-ring focus-visible:outline-offset-2
  `;

  const body_ = (
    <article className="flex h-full flex-col p-4 md:p-5">
      {eyebrow ? (
        <p
          className="
            font-sans text-xs uppercase tracking-[0.04em]
            text-semantic-text-muted
            mb-2
          "
        >
          {eyebrow}
        </p>
      ) : null}
      <h3
        className="
          font-sans font-semibold text-semantic-text-strong
          text-h4
          mb-2
        "
      >
        {headline}
      </h3>
      {body ? (
        <p className="font-sans text-semantic-text text-base">{body}</p>
      ) : null}
      {footer ? (
        <div
          className="
            mt-4 pt-3 border-t border-semantic-border
            flex flex-wrap items-center justify-between gap-2
            text-sm
          "
        >
          {footer}
        </div>
      ) : null}
    </article>
  );

  if (href) {
    return (
      <Link href={href} className={containerClass}>
        {body_}
      </Link>
    );
  }
  return <div className={containerClass}>{body_}</div>;
}
