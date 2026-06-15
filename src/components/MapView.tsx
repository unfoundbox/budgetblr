"use client";

import { useEffect, useRef } from "react";
import { useTheme } from "next-themes";
import maplibregl, { type StyleSpecification } from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
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

// Free CARTO raster basemap — light/dark variants. Swap for a vector provider in prod.
function makeStyle(dark: boolean): StyleSpecification {
  const variant = dark ? "dark_all" : "light_all";
  return {
    version: 8,
    sources: {
      carto: {
        type: "raster",
        tiles: ["a", "b", "c", "d"].map(
          (s) => `https://${s}.basemaps.cartocdn.com/${variant}/{z}/{x}/{y}@2x.png`,
        ),
        tileSize: 256,
        attribution: "© OpenStreetMap contributors © CARTO",
      },
    },
    layers: [{ id: "carto", type: "raster", source: "carto" }],
  };
}

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
      ? [first.lng, first.lat]
      : [BLR_CENTER.lng, BLR_CENTER.lat];

    const map = new maplibregl.Map({
      container: ref.current,
      style: makeStyle(dark),
      center,
      zoom: single ? 14 : zoom,
      attributionControl: { compact: true },
    });
    map.addControl(new maplibregl.NavigationControl({ showCompass: false }), "top-right");
    if (!single) map.addControl(new maplibregl.GeolocateControl({ trackUserLocation: false }), "top-right");

    for (const s of spots) {
      if (s.lat == null || s.lng == null) continue;
      const el = document.createElement("a");
      el.href = `/spots/${s.slug}`;
      el.className = "blr-pin";
      el.textContent = s.emoji ?? "📍";
      el.title = s.name;
      const marker = new maplibregl.Marker({ element: el })
        .setLngLat([s.lng, s.lat])
        .addTo(map);
      if (!single) {
        marker.setPopup(
          new maplibregl.Popup({ offset: 24, closeButton: false }).setHTML(
            `<strong>${s.name}</strong>${s.price ? `<br/><span style="color:var(--color-accent)">${s.price}</span>` : ""}<br/><a href="/spots/${s.slug}" style="color:var(--color-accent)">View →</a>`,
          ),
        );
      }
    }

    return () => map.remove();
  }, [spots, zoom, single, dark]);

  return (
    <>
      <div ref={ref} style={{ height, width: "100%" }} className="overflow-hidden rounded-[var(--radius)] border border-[var(--color-line)]" />
      <style>{`
        .blr-pin {
          display:grid; place-items:center;
          width:30px; height:30px; font-size:16px;
          background:var(--color-surface);
          border:1.5px solid var(--color-line); border-radius:999px;
          box-shadow:0 2px 6px rgba(0,0,0,.18); cursor:pointer; text-decoration:none;
        }
        .blr-pin:hover { border-color:var(--color-accent); transform:scale(1.12); }
        .maplibregl-popup-content {
          border-radius:12px; font-family:inherit; font-size:13px;
          background:var(--color-surface); color:var(--color-ink);
        }
        .maplibregl-popup-anchor-top .maplibregl-popup-tip { border-bottom-color:var(--color-surface); }
        .maplibregl-popup-anchor-bottom .maplibregl-popup-tip { border-top-color:var(--color-surface); }
        .maplibregl-popup-anchor-left .maplibregl-popup-tip { border-right-color:var(--color-surface); }
        .maplibregl-popup-anchor-right .maplibregl-popup-tip { border-left-color:var(--color-surface); }
      `}</style>
    </>
  );
}
