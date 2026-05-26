export interface FooterLink {
  readonly label: string;
  readonly href: string;
}

export interface FooterProps {
  readonly year?: number;
}

const ATHLETICS_LINKS: readonly FooterLink[] = [
  { label: "Tickets", href: "/tickets" },
  { label: "Schedule", href: "/schedule" },
  { label: "Roster", href: "/roster" },
  { label: "Fan Guide", href: "/fan-guide" },
];

const RESOURCES_LINKS: readonly FooterLink[] = [
  { label: "Compliance", href: "/compliance" },
  { label: "Accessibility", href: "/accessibility" },
  { label: "Privacy", href: "/privacy" },
];

export function Footer({ year }: FooterProps) {
  const currentYear = year ?? new Date().getFullYear();
  return (
    <div className="container">
      <footer className="row row-cols-1 row-cols-sm-2 row-cols-md-5 py-5 my-5 border-top">
        <div className="col mb-3">
          <a
            href="/"
            className="d-flex align-items-center mb-3 link-body-emphasis text-decoration-none"
            aria-label="Arizona Athletics"
          >
            <img src="/block-a.svg" alt="" width="48" height="48" className="me-2" />
          </a>
          <p className="text-body-secondary small mb-0">
            The University of Arizona
            <br />
            Tucson, AZ 85721
          </p>
          <p className="text-body-secondary small">
            &copy; {currentYear} Arizona Board of Regents
          </p>
        </div>

        <div className="col mb-3"></div>

        <div className="col mb-3">
          <h5 className="text-uppercase fs-6 fw-bold">Athletics</h5>
          <ul className="nav flex-column">
            {ATHLETICS_LINKS.map((l) => (
              <li key={l.href} className="nav-item mb-2">
                <a href={l.href} className="nav-link p-0 text-body-secondary">
                  {l.label}
                </a>
              </li>
            ))}
          </ul>
        </div>

        <div className="col mb-3">
          <h5 className="text-uppercase fs-6 fw-bold">Resources</h5>
          <ul className="nav flex-column">
            {RESOURCES_LINKS.map((l) => (
              <li key={l.href} className="nav-item mb-2">
                <a href={l.href} className="nav-link p-0 text-body-secondary">
                  {l.label}
                </a>
              </li>
            ))}
          </ul>
        </div>

        <div className="col mb-3">
          <h5 className="text-uppercase fs-6 fw-bold">Stay Connected</h5>
          <form>
            <p className="small mb-2">Wildcat news in your inbox.</p>
            <div className="d-flex flex-column flex-sm-row w-100 gap-2">
              <label htmlFor="newsletter1" className="visually-hidden">
                Email address
              </label>
              <input
                id="newsletter1"
                type="email"
                className="form-control"
                placeholder="Email address"
              />
              <button className="btn btn-red" type="button">
                Subscribe
              </button>
            </div>
          </form>
        </div>
      </footer>

      <div className="d-flex flex-column flex-sm-row justify-content-between py-4 my-4 border-top">
        <p className="small text-body-secondary mb-0">
          A unit of the University of Arizona. Bear Down&reg; and Block A&reg; are
          registered trademarks of the Arizona Board of Regents.
        </p>
        <ul className="list-unstyled d-flex mb-0">
          <li className="ms-3">
            <a className="link-body-emphasis" href="#" aria-label="Arizona Athletics on X">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="currentColor"
                aria-hidden="true"
              >
                <path d="M18.244 2H21l-6.52 7.45L22.5 22h-6.84l-4.79-6.27L4.93 22H2.17l6.98-7.98L1.5 2h6.99l4.33 5.73L18.244 2Zm-2.39 18h1.62L7.21 4H5.49l10.364 16Z" />
              </svg>
            </a>
          </li>
          <li className="ms-3">
            <a className="link-body-emphasis" href="#" aria-label="Arizona Athletics on Instagram">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="currentColor"
                aria-hidden="true"
              >
                <path d="M12 2.16c3.2 0 3.58.01 4.85.07 1.17.05 1.8.25 2.23.41.56.22.96.48 1.38.9.42.42.68.82.9 1.38.16.42.36 1.06.41 2.23.06 1.27.07 1.65.07 4.85s-.01 3.58-.07 4.85c-.05 1.17-.25 1.8-.41 2.23-.22.56-.48.96-.9 1.38-.42.42-.82.68-1.38.9-.42.16-1.06.36-2.23.41-1.27.06-1.65.07-4.85.07s-3.58-.01-4.85-.07c-1.17-.05-1.8-.25-2.23-.41-.56-.22-.96-.48-1.38-.9-.42-.42-.68-.82-.9-1.38-.16-.42-.36-1.06-.41-2.23C2.17 15.58 2.16 15.2 2.16 12s.01-3.58.07-4.85c.05-1.17.25-1.8.41-2.23.22-.56.48-.96.9-1.38.42-.42.82-.68 1.38-.9.42-.16 1.06-.36 2.23-.41C8.42 2.17 8.8 2.16 12 2.16ZM12 0C8.74 0 8.33.01 7.05.07 5.78.13 4.9.33 4.14.63a5.7 5.7 0 0 0-2.06 1.34A5.7 5.7 0 0 0 .74 4.04C.43 4.8.23 5.68.17 6.95.11 8.23.1 8.64.1 11.9c0 3.26.01 3.67.07 4.95.06 1.27.26 2.15.56 2.91.32.81.74 1.5 1.34 2.1.6.6 1.29 1.02 2.1 1.34.76.3 1.64.5 2.91.56 1.28.06 1.69.07 4.95.07s3.67-.01 4.95-.07c1.27-.06 2.15-.26 2.91-.56a5.7 5.7 0 0 0 2.1-1.34c.6-.6 1.02-1.29 1.34-2.1.3-.76.5-1.64.56-2.91.06-1.28.07-1.69.07-4.95s-.01-3.67-.07-4.95c-.06-1.27-.26-2.15-.56-2.91A5.7 5.7 0 0 0 21.93 1.97 5.7 5.7 0 0 0 19.87.63C19.1.33 18.22.13 16.95.07 15.67.01 15.26 0 12 0Zm0 5.84A6.16 6.16 0 1 0 18.16 12 6.16 6.16 0 0 0 12 5.84ZM12 16a4 4 0 1 1 4-4 4 4 0 0 1-4 4Zm6.4-11.85a1.44 1.44 0 1 0 1.44 1.44 1.44 1.44 0 0 0-1.44-1.44Z" />
              </svg>
            </a>
          </li>
          <li className="ms-3">
            <a className="link-body-emphasis" href="#" aria-label="Arizona Athletics on Facebook">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="currentColor"
                aria-hidden="true"
              >
                <path d="M22.675 0H1.325C.593 0 0 .593 0 1.325v21.351C0 23.408.593 24 1.325 24H12.82v-9.294H9.692V11.08h3.128V8.413c0-3.1 1.893-4.788 4.66-4.788 1.325 0 2.464.099 2.795.143v3.24l-1.918.001c-1.504 0-1.795.715-1.795 1.763v2.31h3.587l-.467 3.626h-3.12V24h6.116c.73 0 1.323-.592 1.323-1.324V1.325C24 .593 23.408 0 22.675 0Z" />
              </svg>
            </a>
          </li>
        </ul>
      </div>
    </div>
  );
}
