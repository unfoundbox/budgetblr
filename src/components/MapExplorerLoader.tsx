"use client";

import dynamic from "next/dynamic";
import type { ExplorerSpot } from "@/components/MapExplorer";

// Leaflet references `window` at import time, so load the map client-only.
const MapExplorer = dynamic(
  () => import("@/components/MapExplorer").then((m) => ({ default: m.MapExplorer })),
  {
    ssr: false,
    loading: () => (
      <div className="relative h-full w-full overflow-hidden bg-[var(--color-bg)] bg-paper">
        {/* skeleton of the glass overlays so the load doesn't flash */}
        <div className="absolute inset-x-0 top-0 p-3">
          <div className="flex max-w-xl flex-col gap-2">
            <div className="glass h-10 w-full animate-pulse rounded-full" />
            <div className="flex gap-1.5">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="glass h-7 w-20 animate-pulse rounded-full" />
              ))}
            </div>
          </div>
        </div>
        <div className="absolute inset-0 grid place-items-center">
          <span className="glass rounded-full px-4 py-2 text-sm text-[var(--color-muted)]">
            Loading map…
          </span>
        </div>
      </div>
    ),
  },
);

export function MapExplorerLoader({ spots }: { spots: ExplorerSpot[] }) {
  return <MapExplorer spots={spots} />;
}
