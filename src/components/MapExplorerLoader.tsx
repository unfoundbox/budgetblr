"use client";

import dynamic from "next/dynamic";
import type { ExplorerSpot } from "@/components/MapExplorer";

// Leaflet references `window` at import time, so load the map client-only.
const MapExplorer = dynamic(
  () => import("@/components/MapExplorer").then((m) => ({ default: m.MapExplorer })),
  {
    ssr: false,
    loading: () => (
      <div className="grid h-full w-full place-items-center text-[var(--color-muted)]">
        Loading map…
      </div>
    ),
  },
);

export function MapExplorerLoader({ spots }: { spots: ExplorerSpot[] }) {
  return <MapExplorer spots={spots} />;
}
