import type { ReactNode } from "react";

export interface CardProps {
  readonly eyebrow: string;
  readonly headline: ReactNode;
  readonly body?: ReactNode;
  readonly href?: string;
  readonly linkLabel?: string;
}

export function Card({
  eyebrow,
  headline,
  body,
  href = "#",
  linkLabel = "Read story",
}: CardProps) {
  return (
    <article className="card border-0 shadow-sm rounded-3 h-100">
      <div className="card-body">
        <p className="text-uppercase small fw-bold text-red mb-2">{eyebrow}</p>
        <h3 className="h4 mb-3">{headline}</h3>
        {body ? <p className="text-body-secondary">{body}</p> : null}
        <a href={href} className="stretched-link">
          {linkLabel}
        </a>
      </div>
    </article>
  );
}

export interface CardItem extends CardProps {
  readonly id: string;
}

export interface CardGridProps {
  readonly cards: readonly CardItem[];
}

const DEFAULT_CARDS: readonly CardItem[] = [
  {
    id: "mckale",
    eyebrow: "From McKale",
    headline: "Wildcats sweep weekend series",
    body: "A second-half surge carries the Cats past a ranked conference foe in three straight.",
  },
  {
    id: "stadium",
    eyebrow: "From Arizona Stadium",
    headline: "Tickets on sale for the season opener",
    body: "Single-game and season passes open this week — Bear Down for kickoff under the desert sky.",
  },
  {
    id: "desert",
    eyebrow: "From the Desert",
    headline: "Bear Down Fund hits new milestone",
    body: "Wildcat donors fuel the next generation of Arizona student-athletes across every program.",
  },
];

export function CardGrid({ cards = DEFAULT_CARDS }: CardGridProps) {
  return (
    <section className="bg-warm-gray py-5">
      <div className="container">
        <div className="row g-4">
          {cards.map((c) => (
            <div key={c.id} className="col-md-4">
              <Card
                eyebrow={c.eyebrow}
                headline={c.headline}
                body={c.body}
                href={c.href}
                linkLabel={c.linkLabel}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
