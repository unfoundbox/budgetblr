import Link from "next/link";
import type { SpotWithRefs } from "@/lib/types";
import { formatPrice } from "@/lib/constants";
import { METRO_LINES } from "@/lib/constants";

export function SpotCard({ spot }: { spot: SpotWithRefs }) {
  const line = METRO_LINES.find((l) => l.slug === spot.nearest_metro?.line);
  return (
    <Link href={`/spots/${spot.slug}`} className="card flex flex-col gap-3 p-4">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="text-2xl" aria-hidden>{spot.category?.emoji ?? "📍"}</span>
          <div>
            <h3 className="font-semibold leading-tight">{spot.name}</h3>
            <p className="text-sm text-[var(--color-muted)]">
              {spot.neighborhood?.name ?? spot.address ?? "Bengaluru"}
            </p>
          </div>
        </div>
        <span className="shrink-0 rounded-full bg-[var(--color-accent-soft)] px-2.5 py-1 text-sm font-semibold text-[var(--color-accent)]">
          {formatPrice(spot.price_min, spot.price_max, spot.price_unit)}
        </span>
      </div>

      {spot.why_worth_it && (
        <p className="line-clamp-2 text-sm text-[var(--color-ink)]/80">{spot.why_worth_it}</p>
      )}

      <div className="mt-auto flex flex-wrap items-center gap-2 pt-1 text-xs text-[var(--color-muted)]">
        {spot.nearest_metro && (
          <span className="inline-flex items-center gap-1">
            <span
              className="h-2 w-2 rounded-full"
              style={{ background: line?.color ?? "#999" }}
            />
            {spot.nearest_metro.name}
            {spot.metro_walk_min ? ` · ${spot.metro_walk_min}m walk` : ""}
          </span>
        )}
        <span className="ml-auto inline-flex items-center gap-1">
          ♥ {spot.locals_count} {spot.locals_count === 1 ? "local" : "locals"}
        </span>
      </div>
    </Link>
  );
}
