import Link from "next/link";
import { CATEGORIES } from "@/lib/constants";
import { listSpots, spotCount } from "@/lib/queries/spots";
import { SpotCard } from "@/components/SpotCard";

export default async function Home() {
  const [featured, count] = await Promise.all([
    listSpots().then((s) => s.slice(0, 6)),
    spotCount(),
  ]);

  return (
    <div>
      {/* hero */}
      <section className="bg-paper border-b border-[var(--color-line)]">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:py-24">
          <span className="chip" data-active="true">🛺 {count ? `${count} spots` : "A city"} & counting</span>
          <h1 className="mt-5 max-w-3xl text-4xl font-bold leading-[1.05] tracking-tight sm:text-6xl">
            Live in Bengaluru on a{" "}
            <span className="text-[var(--color-accent)]">budget.</span>
          </h1>
          <p className="mt-5 max-w-xl text-lg text-[var(--color-muted)]">
            Crowdsourced darshinis, ₹30 dosas, value PGs, cheap pints, laptop-friendly cafes and
            free things to do — mapped, priced, and vouched for by locals.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Link href="/spots" className="btn-accent">Browse spots</Link>
            <Link
              href="/map"
              className="inline-flex items-center gap-2 rounded-full border border-[var(--color-ink)] px-5 py-2.5 text-sm font-semibold"
            >
              Open the map
            </Link>
            <Link
              href="/guide"
              className="inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold text-[var(--color-muted)] hover:text-[var(--color-ink)]"
            >
              New to the city? →
            </Link>
          </div>
        </div>
      </section>

      {/* categories */}
      <section className="mx-auto max-w-6xl px-4 py-12">
        <h2 className="mb-5 text-sm font-semibold uppercase tracking-wide text-[var(--color-muted)]">
          Browse by category
        </h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {CATEGORIES.map((c) => (
            <Link
              key={c.slug}
              href={`/spots?category=${c.slug}`}
              className="card flex flex-col gap-1 p-4"
            >
              <span className="text-2xl">{c.emoji}</span>
              <span className="font-semibold">{c.name}</span>
              <span className="text-xs text-[var(--color-muted)]">{c.blurb}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* featured */}
      {featured.length > 0 && (
        <section className="mx-auto max-w-6xl px-4 pb-16">
          <div className="mb-5 flex items-end justify-between">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-[var(--color-muted)]">
              Loved by locals
            </h2>
            <Link href="/spots" className="text-sm text-[var(--color-accent)] hover:underline">
              See all →
            </Link>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {featured.map((s) => (
              <SpotCard key={s.id} spot={s} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
