"use client";

import dynamic from "next/dynamic";
import type { MapSpot } from "@/components/MapView";

// Client-only (Leaflet touches `window` at import time).
const MapView = dynamic(
  () => import("@/components/MapView").then((m) => ({ default: m.MapView })),
  { ssr: false },
);

export function MapViewLoader(props: {
  spots: MapSpot[];
  height?: string;
  zoom?: number;
  single?: boolean;
}) {
  return <MapView {...props} />;
}
