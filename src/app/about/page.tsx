import Link from "next/link";

export const metadata = { title: "About budgetblr" };

export default function AboutPage() {
  return (
    <div>
      <section className="bg-paper border-b border-[var(--color-line)]">
        <div className="mx-auto max-w-6xl px-4 py-14 sm:py-20">
          <span className="chip" data-active="true">₹ For the love of cheap dosas</span>
          <h1 className="mt-5 max-w-3xl text-4xl font-bold leading-[1.05] tracking-tight sm:text-5xl">
            About{" "}
            <span className="font-bold">budget<span className="text-[var(--color-accent)]">blr</span></span>
          </h1>
          <p className="mt-5 max-w-2xl text-lg text-[var(--color-muted)]">
            A crowdsourced directory for living well in Bengaluru without overpaying — built by
            locals, for everyone trying to make namma ooru work on a real budget.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-4 py-12">
        <div className="space-y-6">
          <div className="card p-6">
            <h2 className="text-xl font-semibold">What it is</h2>
            <p className="mt-2 text-sm leading-relaxed text-[var(--color-muted)]">
              budgetblr is a community-built map of the best-value spots in the city — ₹30 dosas,
              honest darshinis, value PGs, laptop-friendly cafes, cheap pints and the free things
              that make Bangalore great. It's inspired by{" "}
              <a
                href="https://budgetsf.com"
                target="_blank"
                rel="noreferrer"
                className="font-semibold text-[var(--color-accent)] hover:underline"
              >
                budgetsf.com
              </a>
              , reimagined for filter coffee, autos and the monsoon.
            </p>
          </div>

          <div className="card p-6">
            <h2 className="text-xl font-semibold">How spots get added</h2>
            <p className="mt-2 text-sm leading-relaxed text-[var(--color-muted)]">
              Anyone can{" "}
              <Link href="/submit" className="font-semibold text-[var(--color-accent)] hover:underline">
                submit a spot
              </Link>{" "}
              they love — a name, where it is, roughly what it costs and why it's worth it. Every
              submission is reviewed by a human before it goes live, so the directory stays useful
              and the prices stay real.
            </p>
          </div>

          <div className="card p-6">
            <h2 className="text-xl font-semibold">Our ethos</h2>
            <ul className="mt-2 space-y-2 text-sm leading-relaxed text-[var(--color-muted)]">
              <li>
                <strong className="text-[var(--color-ink)]">Real prices.</strong> What you'll
                actually pay, in ₹ — not aspirational menus.
              </li>
              <li>
                <strong className="text-[var(--color-ink)]">Vouched by locals.</strong> Every spot
                is somewhere a real Bengalurean would send a friend.
              </li>
              <li>
                <strong className="text-[var(--color-ink)]">No paid placement.</strong> Nobody buys
                their way onto the list — ever. If it's here, it earned it.
              </li>
            </ul>
          </div>

          <div className="rounded-[var(--radius)] border border-[var(--color-accent)] bg-[var(--color-accent-soft)] p-6">
            <h2 className="text-xl font-semibold">Pitch in</h2>
            <p className="mt-2 text-sm leading-relaxed text-[var(--color-ink)]">
              Know a place that belongs here, or a price that's gone stale? Help keep the directory
              honest.
            </p>
            <div className="mt-4 flex flex-wrap gap-3">
              <Link href="/submit" className="btn-accent text-sm">
                + Add a spot
              </Link>
              <Link
                href="/newsletter"
                className="inline-flex items-center gap-2 rounded-full border border-[var(--color-ink)] px-5 py-2.5 text-sm font-semibold"
              >
                Get the Friday drop
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
