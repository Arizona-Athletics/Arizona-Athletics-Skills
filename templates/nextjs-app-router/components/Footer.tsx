import Link from "next/link";

/**
 * Footer — site chrome at the bottom of every page.
 *
 * Server component. Renders the required UA legal bar verbatim per UA Marcom
 * standards — the copyright string, Privacy link, Accessibility link, and
 * "The University of Arizona" link are non-negotiable and MUST appear on
 * every UA Athletics page. See docs/COMPONENTS.md § Footer.
 */
export function Footer(): React.ReactElement {
  const year = new Date().getFullYear();

  // CONFIGURE_ME: replace these placeholder link columns with the real
  // site information architecture once it's confirmed by UA Marcom.
  const columns: ReadonlyArray<{
    heading: string;
    links: ReadonlyArray<{ label: string; href: string }>;
  }> = [
    {
      heading: "Teams",
      links: [
        { label: "Football", href: "#" },
        { label: "Basketball", href: "#" },
        { label: "Baseball", href: "#" },
        { label: "Olympic Sports", href: "#" },
      ],
    },
    {
      heading: "Fans",
      links: [
        { label: "Tickets", href: "#" },
        { label: "Schedule", href: "#" },
        { label: "Shop", href: "#" },
      ],
    },
    {
      heading: "About",
      links: [
        { label: "News", href: "#" },
        { label: "Staff Directory", href: "#" },
        { label: "Contact", href: "#" },
      ],
    },
  ];

  return (
    <footer
      role="contentinfo"
      className="
        bg-semantic-surface border-t border-semantic-border
        mt-auto
      "
    >
      <div className="mx-auto w-full max-w-wide px-4 py-8 md:py-10">
        <div className="grid gap-8 md:grid-cols-4">
          <div>
            {/*
              CONFIGURE_ME: replace with the official UA Athletics wordmark
              SVG once UA Marcom provides the asset.
            */}
            <p className="font-sans font-extrabold text-semantic-text-strong text-h4">
              Arizona Athletics
            </p>
            <p className="mt-2 font-sans text-semantic-text-muted text-sm">
              The official home of Arizona Athletics.
            </p>
          </div>

          <nav aria-label="Footer" className="md:col-span-3">
            <div className="grid gap-6 sm:grid-cols-3">
              {columns.map((col) => (
                <div key={col.heading}>
                  <h4
                    className="
                      font-sans uppercase text-xs tracking-[0.04em]
                      text-semantic-text-muted
                      mb-3
                    "
                  >
                    {col.heading}
                  </h4>
                  <ul className="space-y-2">
                    {col.links.map((link) => (
                      <li key={link.label}>
                        <Link
                          href={link.href}
                          className="
                            font-sans text-semantic-text text-sm
                            hover:text-semantic-text-strong hover:underline
                            focus-visible:outline focus-visible:outline-2 focus-visible:outline-semantic-focus-ring focus-visible:outline-offset-2
                          "
                        >
                          {link.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </nav>
        </div>

        {/*
          REQUIRED legal bar per UA Marcom standards.
          Do not modify the copyright string, the link labels, or the
          University of Arizona target URL. See docs/COMPONENTS.md § Footer.
        */}
        <div
          className="
            mt-8 pt-6 border-t border-semantic-border
            flex flex-col gap-3 md:flex-row md:items-center md:justify-between
            text-semantic-text-muted text-sm
          "
        >
          <p>
            &copy; {year} Arizona Board of Regents on behalf of the University
            of Arizona.
          </p>
          <ul className="flex flex-wrap gap-4">
            <li>
              {/* CONFIGURE_ME: link to the UA privacy policy URL. */}
              <Link
                href="#"
                className="
                  hover:text-semantic-text-strong hover:underline
                  focus-visible:outline focus-visible:outline-2 focus-visible:outline-semantic-focus-ring focus-visible:outline-offset-2
                "
              >
                Privacy
              </Link>
            </li>
            <li>
              {/* CONFIGURE_ME: link to the UA accessibility statement URL. */}
              <Link
                href="#"
                className="
                  hover:text-semantic-text-strong hover:underline
                  focus-visible:outline focus-visible:outline-2 focus-visible:outline-semantic-focus-ring focus-visible:outline-offset-2
                "
              >
                Accessibility
              </Link>
            </li>
            <li>
              <a
                href="https://www.arizona.edu/"
                className="
                  hover:text-semantic-text-strong hover:underline
                  focus-visible:outline focus-visible:outline-2 focus-visible:outline-semantic-focus-ring focus-visible:outline-offset-2
                "
              >
                The University of Arizona
              </a>
            </li>
          </ul>
        </div>
      </div>
    </footer>
  );
}
