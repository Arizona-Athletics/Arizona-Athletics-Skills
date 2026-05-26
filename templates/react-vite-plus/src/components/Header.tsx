import type { ReactNode } from "react";

export interface NavItem {
  readonly label: string;
  readonly href: string;
  readonly current?: boolean;
}

export interface HeaderProps {
  readonly siteTitle?: string;
  readonly nav: readonly NavItem[];
  readonly actions?: ReactNode;
}

export function Header({ siteTitle = "Arizona Athletics", nav, actions }: HeaderProps) {
  return (
    <>
      <div className="arizona-header az-fixed-header-on-mobile bg-red" id="header_arizona">
        <div className="container">
          <div className="row align-items-center">
            <a
              className="arizona-logo col-auto"
              href="https://www.arizona.edu"
              title="The University of Arizona homepage"
            >
              <img
                className="arizona-line-logo"
                alt="The University of Arizona Wordmark Line Logo White"
                src="https://cdn.digital.arizona.edu/logos/v1.0.0/ua_wordmark_line_logo_white_rgb.min.svg"
                fetchPriority="high"
              />
            </a>
            <div className="col"></div>
            <div className="col-auto d-none d-lg-flex align-items-center gap-2">
              {actions}
            </div>
            <div className="d-lg-none d-flex col-auto px-0">
              <button
                data-bs-toggle="offcanvas"
                type="button"
                data-bs-target="#azMobileNav"
                aria-controls="azMobileNav"
                className="btn btn-arizona-header"
              >
                <span aria-hidden="true" className="icon material-symbols-rounded">search</span>
                <span className="icon-text">Search</span>
              </button>
              <button
                data-bs-toggle="offcanvas"
                type="button"
                data-bs-target="#azMobileNav"
                aria-controls="azMobileNav"
                className="btn btn-arizona-header"
              >
                <span aria-hidden="true" className="icon material-symbols-rounded">menu</span>
                <span className="icon-text">Menu</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="ua-brand-band border-bottom">
        <div className="container py-3">
          <a
            href="/"
            className="d-inline-flex align-items-center text-decoration-none"
            aria-label={`${siteTitle} home`}
          >
            <img src="/block-a.svg" alt="" width="48" height="48" className="me-3" />
            <span className="ua-brand-lockup fs-4">{siteTitle}</span>
          </a>
        </div>
      </div>

      <nav className="navbar navbar-expand-lg bg-blue" aria-label="Primary">
        <div className="container">
          <button
            className="navbar-toggler text-white border-0"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#primaryNav"
            aria-controls="primaryNav"
            aria-expanded="false"
            aria-label="Toggle navigation"
          >
            <span aria-hidden="true" className="material-symbols-rounded">menu</span>
          </button>
          <div className="collapse navbar-collapse" id="primaryNav">
            <ul className="navbar-nav me-auto text-uppercase fw-semibold">
              {nav.map((item) => (
                <li key={item.href} className="nav-item">
                  <a
                    className={`nav-link${item.current ? " active" : ""}`}
                    href={item.href}
                    aria-current={item.current ? "page" : undefined}
                  >
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
            <div className="d-lg-none mt-2">{actions}</div>
          </div>
        </div>
      </nav>

      <div
        className="offcanvas offcanvas-end bg-red text-white"
        tabIndex={-1}
        id="azMobileNav"
        aria-labelledby="azMobileNavLabel"
      >
        <div className="offcanvas-header">
          <h2 className="offcanvas-title h5 text-uppercase fw-bold" id="azMobileNavLabel">
            {siteTitle}
          </h2>
          <button
            type="button"
            className="btn btn-arizona-header"
            data-bs-dismiss="offcanvas"
            aria-label="Close"
          >
            <span aria-hidden="true" className="icon material-symbols-rounded">close</span>
            <span className="icon-text">Close</span>
          </button>
        </div>
        <div className="offcanvas-body">
          <ul className="nav flex-column text-uppercase fw-semibold gap-2">
            {nav.map((item) => (
              <li key={item.href} className="nav-item">
                <a className="nav-link text-white" href={item.href}>
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
          <div className="mt-4">{actions}</div>
        </div>
      </div>
    </>
  );
}
