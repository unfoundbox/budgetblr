import Link from "next/link";
import { listNeighborhoods } from "@/lib/queries/spots";

export const metadata = { title: "Neighbourhoods" };

export default async function NeighborhoodsPage() {
  const neighborhoods = await listNeighborhoods();

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="text-2xl font-bold tracking-tight">Where to live on a budget</h1>
      <p className="mb-6 text-[var(--color-muted)]">
        Indicative rents, the vibe, and how each area connects — to help you pick a base.
      </p>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {neighborhoods.map((n) => (
          <Link key={n.slug} href={`/neighborhoods/${n.slug}`} className="card flex flex-col gap-2 p-5">
            <h3 className="text-lg font-semibold">{n.name}</h3>
            {n.blurb && <p className="text-sm text-[var(--color-muted)]">{n.blurb}</p>}
            <div className="mt-auto flex items-center justify-between pt-2 text-sm">
              <span className="font-semibold text-[var(--color-accent)]">
                {n.rent_low ? `₹${(n.rent_low / 1000).toFixed(0)}k–₹${((n.rent_high ?? 0) / 1000).toFixed(0)}k` : "—"}
                <span className="font-normal text-[var(--color-muted)]">/mo</span>
              </span>
              <span className="text-[var(--color-muted)]">Explore →</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
