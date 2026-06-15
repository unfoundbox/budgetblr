"use client";

import { useEffect, useRef } from "react";
import { useTheme } from "next-themes";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { BLR_CENTER } from "@/lib/constants";

export interface MapSpot {
  slug: string;
  name: string;
  lat: number;
  lng: number;
  emoji?: string;
  price?: string;
  category?: string;
}

const KEY = process.env.NEXT_PUBLIC_STADIA_API_KEY;
function tileUrl(dark: boolean): string {
  const style = dark ? "alidade_smooth_dark" : "stamen_terrain";
  const suffix = KEY ? `?api_key=${KEY}` : "";
  return `https://tiles.stadiamaps.com/tiles/${style}/{z}/{x}/{y}{r}.png${suffix}`;
}
const ATTRIB =
  '© <a href="https://stadiamaps.com/">Stadia Maps</a> © <a href="https://stamen.com/">Stamen Design</a> © <a href="https://openstreetmap.org/">OpenStreetMap</a>';

export function MapView({
  spots,
  height = "70vh",
  zoom = 11,
  single = false,
}: {
  spots: MapSpot[];
  height?: string;
  zoom?: number;
  single?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const { resolvedTheme } = useTheme();
  const dark = resolvedTheme === "dark";

  useEffect(() => {
    if (!ref.current) return;
    const first = spots[0];
    const center: [number, number] = single && first
      ? [first.lat, first.lng]
      : [BLR_CENTER.lat, BLR_CENTER.lng];

    const map = L.map(ref.current, { zoomControl: !single, scrollWheelZoom: !single }).setView(
      center,
      single ? 14 : zoom,
    );
    L.tileLayer(tileUrl(dark), { maxZoom: 20, attribution: ATTRIB }).addTo(map);

    for (const s of spots) {
      if (s.lat == null || s.lng == null) continue;
      const icon = L.divIcon({
        className: "blr-pin",
        html: `<div class="blr-dot">${s.emoji ?? "📍"}</div>`,
        iconSize: [30, 30],
        iconAnchor: [15, 15],
        popupAnchor: [0, -14],
      });
      const marker = L.marker([s.lat, s.lng], { icon, title: s.name }).addTo(map);
      if (!single) {
        marker.bindPopup(
          `<strong>${s.name}</strong>${s.price ? `<br/><span style="color:var(--color-accent)">${s.price}</span>` : ""}<br/><a href="/spots/${s.slug}" style="color:var(--color-accent)">View →</a>`,
          { closeButton: false },
        );
      }
    }

    const ro = new ResizeObserver(() => map.invalidateSize());
    ro.observe(ref.current);
    return () => {
      ro.disconnect();
      map.remove();
    };
  }, [spots, zoom, single, dark]);

  return (
    <div
      ref={ref}
      style={{ height, width: "100%" }}
      className="overflow-hidden rounded-[var(--radius)] border border-[var(--color-line)]"
    />
  );
}
