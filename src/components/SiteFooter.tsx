import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="mt-16 border-t border-[var(--color-line)] bg-[var(--color-surface)]">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 sm:grid-cols-2 md:grid-cols-4">
        <div>
          <div className="flex items-center gap-2 font-bold">
            <span className="grid h-6 w-6 place-items-center rounded-md bg-[var(--color-accent)] text-[9px] font-extrabold tracking-tight text-white">blr</span>
            budgetblr
          </div>
          <p className="mt-3 text-sm text-[var(--color-muted)]">
            Living in Bengaluru on a budget — crowdsourced cheap eats, PGs, pints and more.
          </p>
        </div>
        <div className="text-sm">
          <div className="mb-2 font-semibold">Explore</div>
          <ul className="space-y-1.5 text-[var(--color-muted)]">
            <li><Link href="/spots" className="hover:text-[var(--color-ink)]">All spots</Link></li>
            <li><Link href="/map" className="hover:text-[var(--color-ink)]">Map</Link></li>
            <li><Link href="/events" className="hover:text-[var(--color-ink)]">Events</Link></li>
            <li><Link href="/neighborhoods" className="hover:text-[var(--color-ink)]">Neighbourhoods</Link></li>
          </ul>
        </div>
        <div className="text-sm">
          <div className="mb-2 font-semibold">New to the city</div>
          <ul className="space-y-1.5 text-[var(--color-muted)]">
            <li><Link href="/guide" className="hover:text-[var(--color-ink)]">First-week guide</Link></li>
            <li><Link href="/transport" className="hover:text-[var(--color-ink)]">Getting around</Link></li>
            <li><Link href="/community?tab=add" className="hover:text-[var(--color-ink)]">Add a spot</Link></li>
            <li><Link href="/community" className="hover:text-[var(--color-ink)]">Vote on spots</Link></li>
          </ul>
        </div>
        <div className="text-sm">
          <div className="mb-2 font-semibold">The Friday drop</div>
          <p className="text-[var(--color-muted)]">New spots & price corrections, weekly.</p>
          <Link href="/newsletter" className="mt-3 inline-block text-[var(--color-accent)] hover:underline">
            Subscribe →
          </Link>
          <a
            href="https://www.instagram.com/budgetblr/"
            target="_blank"
            rel="noopener"
            className="mt-3 flex items-center gap-1.5 text-[var(--color-muted)] hover:text-[var(--color-ink)]"
          >
            <InstagramIcon /> @budgetblr
          </a>
        </div>
      </div>
      <div className="flex flex-col items-center gap-2 border-t border-[var(--color-line)] px-4 py-4 text-center text-xs text-[var(--color-muted)] sm:flex-row sm:justify-between">
        <span>Made with filter coffee in Bengaluru · Prices are indicative, always confirm on the spot</span>
        <a
          href="https://www.instagram.com/budgetblr/"
          target="_blank"
          rel="noopener"
          className="inline-flex items-center gap-1.5 hover:text-[var(--color-ink)]"
        >
          <InstagramIcon /> Follow on Instagram
        </a>
      </div>
    </footer>
  );
}

function InstagramIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <rect x="2" y="2" width="20" height="20" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}
