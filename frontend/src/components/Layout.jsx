import { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { IconClose, IconMenu } from "./icons.jsx";

export function Layout({ children }) {
  const [navOpen, setNavOpen] = useState(false);

  const linkClass = ({ isActive }) =>
    [
      "cursor-pointer rounded-lg px-3 py-2 text-sm font-medium transition-colors duration-200",
      isActive
        ? "bg-red-50 text-digest-accent"
        : "text-digest-muted hover:bg-stone-100 hover:text-digest-ink",
    ].join(" ");

  return (
    <div className="min-h-screen flex flex-col font-body">
      <header className="fixed top-3 left-3 right-3 z-50 sm:top-4 sm:left-4 sm:right-4">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 rounded-2xl border border-digest-border bg-white/90 px-4 py-3 shadow-sm backdrop-blur-md sm:px-6">
          <Link
            to="/"
            className="font-heading text-lg font-bold tracking-tight text-digest-ink transition-colors duration-200 hover:text-digest-accent sm:text-xl"
            onClick={() => setNavOpen(false)}
          >
            News Digest
          </Link>

          <nav className="hidden items-center gap-1 md:flex" aria-label="Primary">
            <NavLink to="/" className={linkClass} end>
              Digest
            </NavLink>
            <a
              href="/#digest"
              className="cursor-pointer rounded-lg px-3 py-2 text-sm font-medium text-digest-muted transition-colors duration-200 hover:bg-stone-100 hover:text-digest-ink"
            >
              Stories
            </a>
          </nav>

          <button
            type="button"
            className="inline-flex cursor-pointer items-center justify-center rounded-lg border border-digest-border p-2 text-digest-ink transition-colors duration-200 hover:bg-stone-50 md:hidden"
            aria-expanded={navOpen}
            aria-controls="mobile-nav"
            onClick={() => setNavOpen((o) => !o)}
          >
            <span className="sr-only">{navOpen ? "Close menu" : "Open menu"}</span>
            {navOpen ? <IconClose className="h-6 w-6" /> : <IconMenu className="h-6 w-6" />}
          </button>
        </div>

        {navOpen && (
          <div
            id="mobile-nav"
            className="mx-auto mt-2 max-w-7xl rounded-2xl border border-digest-border bg-white p-3 shadow-lg md:hidden"
          >
            <NavLink
              to="/"
              className={`${linkClass} block w-full text-left`}
              end
              onClick={() => setNavOpen(false)}
            >
              Digest
            </NavLink>
            <a
              href="/#digest"
              className="mt-1 block w-full cursor-pointer rounded-lg px-3 py-2 text-left text-sm font-medium text-digest-muted transition-colors duration-200 hover:bg-stone-100 hover:text-digest-ink"
              onClick={() => setNavOpen(false)}
            >
              Stories
            </a>
          </div>
        )}
      </header>

      <div className="h-[4.25rem] shrink-0 sm:h-[4.5rem]" aria-hidden />

      <main className="flex-1 w-full max-w-7xl mx-auto px-4 pb-16 pt-6 sm:px-6 sm:pt-8 lg:px-8">
        {children}
      </main>

      <footer className="border-t border-digest-border bg-white/80 py-10 text-center backdrop-blur-sm">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <p className="font-heading text-sm font-semibold text-digest-ink">News Digest</p>
          <p className="mt-2 text-xs text-digest-muted sm:text-sm">
            Multi-source RSS digest · educational project · Built with clustering & optional AI summaries
          </p>
        </div>
      </footer>
    </div>
  );
}
