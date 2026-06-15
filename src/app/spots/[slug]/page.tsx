import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { getSpotBySlug } from "@/lib/queries/spots";
import { formatPrice, METRO_LINES, CATEGORIES } from "@/lib/constants";
import { MapViewLoader } from "@/components/MapViewLoader";
import { PickButton } from "@/components/PickButton";

export const revalidate = 3600;

type Params = Promise<{ slug: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  const spot = await getSpotBySlug(slug);
  if (!spot) return { title: "Spot not found" };
  return {
    title: spot.name,
    description:
      spot.why_worth_it ?? spot.description ?? `${spot.name} — a budget spot in Bengaluru.`,
  };
}

export default async function SpotPage({ params }: { params: Params }) {
  const { slug } = await params;
  const spot = await getSpotBySlug(slug);
  if (!spot) notFound();

  const cat = CATEGORIES.find((c) => c.slug === spot.category?.slug);
  const line = METRO_LINES.find((l) => l.slug === spot.nearest_metro?.line);
  const maps = spot.lat != null
    ? `https://www.google.com/maps/search/?api=1&query=${spot.lat},${spot.lng}`
    : null;

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <Link href="/spots" className="text-sm text-[var(--color-muted)] hover:text-[var(--color-ink)]">
        ← All spots
      </Link>

      <div className="mt-4 flex items-start justify-between gap-4">
        <div>
          <div className="mb-1 flex items-center gap-2 text-sm text-[var(--color-muted)]">
            <span>{cat?.emoji}</span>
            <Link href={`/spots?category=${spot.category?.slug}`} className="hover:underline">
              {spot.category?.name}
            </Link>
            {spot.neighborhood && (
              <>
                <span>·</span>
                <Link href={`/neighborhoods/${spot.neighborhood.slug}`} className="hover:underline">
                  {spot.neighborhood.name}
                </Link>
              </>
            )}
          </div>
          <h1 className="text-3xl font-bold tracking-tight">{spot.name}</h1>
        </div>
        <span className="nums shrink-0 rounded-full bg-[var(--color-accent-soft)] px-3 py-1.5 font-semibold text-[var(--color-accent)]">
          {formatPrice(spot.price_min, spot.price_max, spot.price_unit)}
        </span>
      </div>

      {spot.why_worth_it && (
        <p className="mt-4 text-lg leading-relaxed">{spot.why_worth_it}</p>
      )}
      {spot.description && (
        <p className="mt-3 text-[var(--color-muted)]">{spot.description}</p>
      )}

      <div className="mt-5 flex flex-wrap items-center gap-2 text-sm">
        {spot.nearest_metro && (
          <span className="chip">
            <span className="h-2 w-2 rounded-full" style={{ background: line?.color }} />
            {spot.nearest_metro.name} metro
          </span>
        )}
        <span className="chip">♥ {spot.locals_count} locals vouch</span>
        <PickButton slug={spot.slug} />
        {maps && (
          <a href={maps} target="_blank" rel="noopener" className="chip">📍 Directions</a>
        )}
        {spot.external_url && (
          <a href={spot.external_url} target="_blank" rel="noopener" className="chip">🔗 Website</a>
        )}
        {spot.instagram && (
          <a
            href={spot.instagram.startsWith("http") ? spot.instagram : `https://instagram.com/${spot.instagram.replace("@", "")}`}
            target="_blank"
            rel="noopener"
            className="chip"
          >
            📷 Instagram
          </a>
        )}
      </div>

      {spot.address && <p className="mt-4 text-sm text-[var(--color-muted)]">{spot.address}</p>}

      {spot.lat != null && spot.lng != null && (
        <div className="mt-6">
          <MapViewLoader
            single
            height="280px"
            spots={[{ slug: spot.slug, name: spot.name, lat: spot.lat, lng: spot.lng, emoji: cat?.emoji }]}
          />
        </div>
      )}

      <div className="mt-8 rounded-[var(--radius)] border border-dashed border-[var(--color-line)] p-4 text-sm text-[var(--color-muted)]">
        Spot added by the community. Prices are indicative — found something off?{" "}
        <Link href="/community?tab=add" className="text-[var(--color-accent)] hover:underline">
          Suggest an edit
        </Link>
        .
      </div>
    </div>
  );
}
