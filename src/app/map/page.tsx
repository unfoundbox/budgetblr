import { listSpotsForMap } from "@/lib/queries/spots";
import { MapView, type MapSpot } from "@/components/MapView";
import { formatPrice } from "@/lib/constants";

export const metadata = { title: "Map" };

export default async function MapPage() {
  const spots = await listSpotsForMap();
  const mapSpots: MapSpot[] = spots
    .filter((s) => s.lat != null && s.lng != null)
    .map((s) => ({
      slug: s.slug,
      name: s.name,
      lat: s.lat as number,
      lng: s.lng as number,
      emoji: s.category?.emoji,
      category: s.category?.slug,
      price: formatPrice(s.price_min, s.price_max, s.price_unit),
    }));

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="mb-4">
        <h1 className="text-2xl font-bold tracking-tight">Map</h1>
        <p className="text-[var(--color-muted)]">
          {mapSpots.length}{" "}budget spots across Bengaluru. Tap a pin for details, or use the
          locate button to find what&apos;s near you.
        </p>
      </div>
      <MapView spots={mapSpots} />
    </div>
  );
}
