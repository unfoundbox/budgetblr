import { Suspense } from "react";
import { listSpots, listNeighborhoods } from "@/lib/queries/spots";
import { Filters } from "@/components/Filters";
import { SpotCard } from "@/components/SpotCard";

export const metadata = { title: "All spots" };

type SP = Promise<{ category?: string; neighborhood?: string; price?: string; q?: string }>;

async function SpotGrid({ sp }: { sp: SP }) {
  const { category, neighborhood, price, q } = await sp;
  const spots = await listSpots({ category, neighborhood, priceBand: price, q });

  return (
    <>
      <p className="mb-4 text-sm text-[var(--color-muted)]">
        {spots.length} {spots.length === 1 ? "spot" : "spots"}
        {category ? ` in ${category}` : ""}
      </p>
      {spots.length === 0 ? (
        <div className="card p-10 text-center text-[var(--color-muted)]">
          No spots match yet. Try widening the filters — or{" "}
          <a href="/community?tab=add" className="text-[var(--color-accent)] hover:underline">add one</a>.
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {spots.map((s) => (
            <SpotCard key={s.id} spot={s} />
          ))}
        </div>
      )}
    </>
  );
}

export default async function SpotsPage({ searchParams }: { searchParams: SP }) {
  const neighborhoods = await listNeighborhoods();

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">Budget spots in Bengaluru</h1>
        <p className="text-[var(--color-muted)]">Filter by what you need and how much you want to spend.</p>
      </div>
      <div className="sticky top-[52px] z-20 -mx-4 mb-6 border-b border-[var(--color-line)] bg-[var(--color-bg)]/90 px-4 py-3 backdrop-blur">
        <Filters neighborhoods={neighborhoods} />
      </div>
      <Suspense fallback={<p className="text-[var(--color-muted)]">Loading spots…</p>}>
        <SpotGrid sp={searchParams} />
      </Suspense>
    </div>
  );
}
