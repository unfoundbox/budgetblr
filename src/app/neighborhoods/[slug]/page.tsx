import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { getNeighborhoodBySlug, listSpots } from "@/lib/queries/spots";
import { SpotCard } from "@/components/SpotCard";

export const revalidate = 3600;

type Params = Promise<{ slug: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  const n = await getNeighborhoodBySlug(slug);
  return n ? { title: n.name, description: n.blurb ?? undefined } : { title: "Area not found" };
}

export default async function NeighborhoodPage({ params }: { params: Params }) {
  const { slug } = await params;
  const n = await getNeighborhoodBySlug(slug);
  if (!n) notFound();

  const spots = await listSpots({ neighborhood: slug });

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <Link href="/neighborhoods" className="text-sm text-[var(--color-muted)] hover:text-[var(--color-ink)]">
        ← All areas
      </Link>
      <h1 className="mt-3 text-3xl font-bold tracking-tight">{n.name}</h1>
      {n.blurb && <p className="mt-2 max-w-2xl text-lg text-[var(--color-muted)]">{n.blurb}</p>}

      <div className="mt-5 flex flex-wrap gap-2 text-sm">
        {n.rent_low && (
          <span className="chip">🏠 Rent ₹{(n.rent_low / 1000).toFixed(0)}k–₹{((n.rent_high ?? 0) / 1000).toFixed(0)}k/mo</span>
        )}
        {n.commute_note && <span className="chip">🚇 {n.commute_note}</span>}
      </div>

      <h2 className="mb-4 mt-8 text-sm font-semibold uppercase tracking-wide text-[var(--color-muted)]">
        {spots.length} budget spots here
      </h2>
      {spots.length === 0 ? (
        <p className="text-[var(--color-muted)]">No spots tagged here yet.</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {spots.map((s) => (
            <SpotCard key={s.id} spot={s} />
          ))}
        </div>
      )}
    </div>
  );
}
