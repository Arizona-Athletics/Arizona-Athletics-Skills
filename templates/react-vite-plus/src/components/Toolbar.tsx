export interface ToolbarLink {
  readonly label: string;
  readonly href: string;
}

export interface ToolbarProps {
  readonly links?: readonly ToolbarLink[];
}

const DEFAULT_LINKS: readonly ToolbarLink[] = [
  { label: "Tickets", href: "/tickets" },
  { label: "Schedule", href: "/schedule" },
  { label: "Roster", href: "/roster" },
  { label: "News", href: "/news" },
  { label: "Watch", href: "/watch" },
];

export function Toolbar({ links = DEFAULT_LINKS }: ToolbarProps) {
  return (
    <nav className="navbar navbar-expand bg-warm-gray border-bottom py-1" aria-label="Secondary">
      <div className="container">
        <ul className="navbar-nav gap-3 small text-uppercase fw-semibold">
          {links.map((l) => (
            <li key={l.href} className="nav-item">
              <a className="nav-link" href={l.href}>
                {l.label}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
}
