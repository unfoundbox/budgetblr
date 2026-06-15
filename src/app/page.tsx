import { listSpotsForMap } from "@/lib/queries/spots";
import { MapExplorerLoader } from "@/components/MapExplorerLoader";
import type { ExplorerSpot } from "@/components/MapExplorer";
import { formatPrice } from "@/lib/constants";

export default async function Home() {
  const spots = await listSpotsForMap();
  const explorerSpots: ExplorerSpot[] = spots
    .filter((s) => s.lat != null && s.lng != null && s.category)
    .map((s) => ({
      slug: s.slug,
      name: s.name,
      lat: s.lat as number,
      lng: s.lng as number,
      category: s.category!.slug,
      priceBand: s.price_band,
      price: formatPrice(s.price_min, s.price_max, s.price_unit),
      why: s.why_worth_it,
      neighborhood: s.neighborhood?.name ?? null,
      locals: s.locals_count,
    }));

  return (
    <div className="h-[calc(100svh-7rem)] min-h-[440px] w-full md:h-[calc(100svh-3.5rem)]">
      <MapExplorerLoader spots={explorerSpots} />
    </div>
  );
}
