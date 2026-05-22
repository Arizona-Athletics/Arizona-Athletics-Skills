import type { ReactNode } from "react";

export interface HeroProps {
  readonly headline?: ReactNode;
  readonly subhead?: ReactNode;
  readonly cta?: ReactNode;
}

export function Hero({
  headline = "Bear Down. Build Up.",
  subhead = "Be the next chapter in 140+ years of Wildcat resolve.",
  cta,
}: HeroProps) {
  return (
    <section className="background-wrapper text-bg-red bg-triangles-top-left">
      <div className="container py-5 my-5">
        <div className="row">
          <div className="col-lg-7">
            <h1 className="display-2 fw-bold">{headline}</h1>
            {subhead ? <p className="lead mb-4">{subhead}</p> : null}
            {cta ? <div className="d-flex flex-wrap gap-2">{cta}</div> : null}
          </div>
        </div>
      </div>
    </section>
  );
}

export interface HeroButtonProps {
  readonly href: string;
  readonly children: ReactNode;
}

export function HeroButton({ href, children }: HeroButtonProps) {
  return (
    <a href={href} className="btn btn-outline-white btn-lg">
      {children}
    </a>
  );
}
