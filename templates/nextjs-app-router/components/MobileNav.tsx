"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

export interface HeaderNavItem {
  label: string;
  href: string;
  current?: boolean;
}

interface MobileNavProps {
  nav: ReadonlyArray<HeaderNavItem>;
}

const FOCUSABLE_SELECTOR = "a[href], button:not([disabled])";

export function MobileNav({ nav }: MobileNavProps): React.ReactElement {
  const [open, setOpen] = useState(false);
  const drawerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return undefined;

    const previouslyFocused = document.activeElement instanceof HTMLElement
      ? document.activeElement
      : null;
    const drawer = drawerRef.current;
    const focusable = getFocusable(drawer);
    focusable[0]?.focus();

    const onKeyDown = (event: KeyboardEvent): void => {
      if (event.key === "Escape") {
        setOpen(false);
        return;
      }
      if (event.key !== "Tab") return;

      const currentFocusable = getFocusable(drawer);
      const first = currentFocusable[0];
      const last = currentFocusable[currentFocusable.length - 1];
      if (!first || !last) return;

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      if (previouslyFocused === triggerRef.current) {
        triggerRef.current?.focus();
      }
    };
  }, [open]);

  return (
    <div className="md:hidden">
      <button
        ref={triggerRef}
        type="button"
        aria-label={open ? "Close primary navigation" : "Open primary navigation"}
        aria-expanded={open}
        aria-controls="mobile-primary-navigation"
        onClick={() => setOpen((current) => !current)}
        className="
          inline-flex h-10 w-10 flex-col items-center justify-center gap-1
          rounded-sm border border-semantic-border bg-semantic-surface
          text-semantic-text-strong
          focus-visible:outline focus-visible:outline-2 focus-visible:outline-semantic-focus-ring focus-visible:outline-offset-2
        "
      >
        <span aria-hidden="true" className="h-0.5 w-5 rounded-pill bg-current" />
        <span aria-hidden="true" className="h-0.5 w-5 rounded-pill bg-current" />
        <span aria-hidden="true" className="h-0.5 w-5 rounded-pill bg-current" />
      </button>

      <div
        id="mobile-primary-navigation"
        ref={drawerRef}
        hidden={!open}
        className="
          absolute left-0 right-0 top-full z-50
          border-b border-semantic-border bg-semantic-surface
          px-4 py-3 shadow-sm
        "
      >
        <nav aria-label="Primary">
          <ul className="grid gap-2">
            {nav.map((item) => (
              <li key={item.label}>
                <Link
                  href={item.href}
                  aria-current={item.current ? "page" : undefined}
                  onClick={() => setOpen(false)}
                  className={`
                    block border-b-2 border-transparent py-3
                    font-sans font-semibold text-semantic-text
                    hover:text-semantic-text-strong
                    focus-visible:outline focus-visible:outline-2 focus-visible:outline-semantic-focus-ring focus-visible:outline-offset-2
                    ${item.current
                      ? "border-semantic-accent text-semantic-text-strong"
                      : ""}
                  `}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </div>
  );
}

function getFocusable(root: HTMLElement | null): HTMLElement[] {
  if (!root) return [];
  return Array.from(root.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR));
}
