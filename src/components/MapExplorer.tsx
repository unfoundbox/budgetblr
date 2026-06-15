"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useTheme } from "next-themes";
import maplibregl, { type StyleSpecification } from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import {
  BLR_CENTER,
  CATEGORIES,
  PRICE_BANDS,
  TECH_SPOT_CATEGORIES,
  CATEGORY_COLOR,
} from "@/lib/constants";
import { readPicks } from "@/components/PickButton";

export interface ExplorerSpot {
  slug: string;
  name: string;
  lat: number;
  lng: number;
  category: string;
  priceBand: string;
  price: string;
  why: string | null;
  neighborhood: string | null;
  locals: number;
}

const KEY = process.env.NEXT_PUBLIC_STADIA_API_KEY;
const PRICE_ORDER = ["free", "under_100", "under_300", "under_1000"];

// Stamen Terrain (light) / dark via Stadia Maps. Keyless on localhost; the API
// key is appended on the deployed domain.
function makeStyle(dark: boolean): StyleSpecification {
  const style = dark ? "alidade_smooth_dark" : "stamen_terrain";
  const suffix = KEY ? `?api_key=${KEY}` : "";
  return {
    version: 8,
    sources: {
      stadia: {
        type: "raster",
        tiles: [`https://tiles.stadiamaps.com/tiles/${style}/{z}/{x}/{y}@2x.png${suffix}`],
        tileSize: 256,
        attribution:
          '© <a href="https://stadiamaps.com/">Stadia Maps</a> © <a href="https://stamen.com/">Stamen Design</a> © <a href="https://openstreetmap.org/">OpenStreetMap</a>',
      },
    },
    layers: [{ id: "stadia", type: "raster", source: "stadia" }],
  };
}

function priceAllowed(band: string, max: string): boolean {
  if (max === "any") return true;
  if (max === "free") return band === "free";
  const allowed = PRICE_ORDER.slice(0, PRICE_ORDER.indexOf(max) + 1);
  return allowed.includes(band);
}

export function MapExplorer({ spots }: { spots: ExplorerSpot[] }) {
  const mapEl = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const markersRef = useRef<Map<string, maplibregl.Marker>>(new Map());
  const { resolvedTheme } = useTheme();
  const dark = resolvedTheme === "dark";

  const [query, setQuery] = useState("");
  const [cat, setCat] = useState<string | null>(null);
  const [price, setPrice] = useState("any");
  const [tech, setTech] = useState(false);
  const [listOpen, setListOpen] = useState(false);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return spots.filter((s) => {
      if (tech && !TECH_SPOT_CATEGORIES.includes(s.category as never)) return false;
      if (cat && s.category !== cat) return false;
      if (!priceAllowed(s.priceBand, price)) return false;
      if (q) {
        const hay = `${s.name} ${s.why ?? ""} ${s.neighborhood ?? ""} ${s.category}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [spots, query, cat, price, tech]);

  // init map once
  useEffect(() => {
    if (!mapEl.current || mapRef.current) return;
    const map = new maplibregl.Map({
      container: mapEl.current,
      style: makeStyle(dark),
      center: [BLR_CENTER.lng, BLR_CENTER.lat],
      zoom: 11,
      attributionControl: { compact: true },
    });
    map.addControl(new maplibregl.NavigationControl({ showCompass: false }), "bottom-right");
    mapRef.current = map;

    // keep the canvas sized to its container (handles late layout / resizes)
    const ro = new ResizeObserver(() => map.resize());
    ro.observe(mapEl.current);

    return () => {
      ro.disconnect();
      map.remove();
      mapRef.current = null;
      markersRef.current.clear();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // swap basemap on theme change (markers persist across setStyle)
  useEffect(() => {
    mapRef.current?.setStyle(makeStyle(dark));
  }, [dark]);

  // re-render markers when the filtered set changes
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    markersRef.current.forEach((m) => m.remove());
    markersRef.current.clear();

    for (const s of filtered) {
      const el = document.createElement("div");
      el.className = "blr-sq";
      el.style.background = CATEGORY_COLOR[s.category] ?? "#64748b";
      el.textContent = CATEGORIES.find((c) => c.slug === s.category)?.emoji ?? "📍";
      el.title = s.name;
      const popup = new maplibregl.Popup({ offset: 18, closeButton: false }).setHTML(
        `<strong>${s.name}</strong><br/>` +
          `<span class="pop-meta">${s.neighborhood ?? ""}${s.neighborhood ? " · " : ""}<span style="color:var(--color-accent)">${s.price}</span></span>` +
          (s.why ? `<br/><span class="pop-why">${s.why}</span>` : "") +
          `<div class="pop-actions"><a href="/spots/${s.slug}">View →</a>` +
          `<button class="pop-save" data-slug="${s.slug}">${readPicks().includes(s.slug) ? "♥ Saved" : "♡ Save"}</button></div>`,
      );
      const marker = new maplibregl.Marker({ element: el })
        .setLngLat([s.lng, s.lat])
        .setPopup(popup)
        .addTo(map);
      markersRef.current.set(s.slug, marker);
    }
  }, [filtered]);

  // delegated "save to picks" from popup buttons
  useEffect(() => {
    function onClick(e: MouseEvent) {
      const btn = (e.target as HTMLElement).closest<HTMLElement>(".pop-save");
      if (!btn) return;
      const slug = btn.dataset.slug;
      if (!slug) return;
      const picks = readPicks();
      const next = picks.includes(slug) ? picks.filter((x) => x !== slug) : [...picks, slug];
      localStorage.setItem("blr_picks", JSON.stringify(next));
      btn.textContent = next.includes(slug) ? "♥ Saved" : "♡ Save";
    }
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);

  function flyTo(s: ExplorerSpot) {
    mapRef.current?.flyTo({ center: [s.lng, s.lat], zoom: 15 });
    markersRef.current.get(s.slug)?.togglePopup();
  }

  function nearMe() {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition((pos) => {
      mapRef.current?.flyTo({ center: [pos.coords.longitude, pos.coords.latitude], zoom: 14 });
    });
  }

  // "Ask AI" = heuristic intent parse over the current query → category + price.
  function askAI() {
    const q = query.toLowerCase();
    const rules: [RegExp, () => void][] = [
      [/free|gratis/, () => setPrice("free")],
      [/cheap|budget|under/, () => setPrice("under_300")],
      [/dosa|idli|eat|food|biryani|thali|mess|darshini|tiffin/, () => setCat("food")],
      [/coffee|filter|cafe/, () => setCat("coffee")],
      [/beer|pint|pub|brew|bar|drink/, () => setCat("bars")],
      [/cowork|work|laptop|wifi|library/, () => setCat("work")],
      [/gym|fitness|cult|run/, () => setCat("fitness")],
      [/pg|rent|stay|hostel|coliving|flat/, () => setCat("housing")],
      [/grocer|market|veg|hopcom/, () => setCat("grocery")],
      [/vc|invest|fund/, () => setCat("vcs")],
      [/accelerat|incubat|startup/, () => setTech(true)],
    ];
    let matched = false;
    for (const [re, fn] of rules) if (re.test(q)) { fn(); matched = true; }
    if (!matched && q) setQuery(q); // fall back to plain text search
  }

  return (
    <div className="relative h-full w-full overflow-hidden">
      <div ref={mapEl} className="h-full w-full" />

      {/* top-left: search + filters */}
      <div className="pointer-events-none absolute inset-x-0 top-0 z-10 p-3">
        <div className="pointer-events-auto flex max-w-xl flex-col gap-2">
          <div className="flex gap-2">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && askAI()}
              placeholder={`Ask ${spots.length} spots: cheap dosa, free coworking…`}
              className="w-full rounded-full border border-[var(--color-line)] bg-[var(--color-surface)] px-4 py-2 text-base shadow-sm outline-none"
            />
            <button onClick={nearMe} className="chip shrink-0 shadow-sm">⌖ Near Me</button>
          </div>
          <div className="flex flex-wrap gap-1.5">
            <button className="chip shadow-sm" data-active={!cat && !tech} onClick={() => { setCat(null); setTech(false); }}>All</button>
            {CATEGORIES.map((c) => (
              <button
                key={c.slug}
                className="chip shadow-sm"
                data-active={cat === c.slug}
                onClick={() => { setCat(cat === c.slug ? null : c.slug); setTech(false); }}
              >
                <span aria-hidden>{c.emoji}</span> {c.name}
              </button>
            ))}
            <button className="chip shadow-sm" data-active={tech} onClick={() => { setTech((t) => !t); setCat(null); }}>🚀 Tech Spots</button>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {PRICE_BANDS.map((b) => (
              <button key={b.slug} className="chip shadow-sm" data-active={price === b.slug} onClick={() => setPrice(b.slug)}>
                {b.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* top-right: legend */}
      <div className="absolute right-3 top-3 z-10 hidden rounded-[var(--radius)] border border-[var(--color-line)] bg-[var(--color-surface)]/95 p-3 text-xs shadow-sm backdrop-blur md:block">
        <div className="mb-1.5 font-semibold">Categories</div>
        <ul className="space-y-1">
          {CATEGORIES.map((c) => (
            <li key={c.slug}>
              <button
                className="flex items-center gap-2 hover:text-[var(--color-accent)]"
                onClick={() => { setCat(cat === c.slug ? null : c.slug); setTech(false); }}
              >
                <span className="h-2.5 w-2.5 rounded-[3px]" style={{ background: c.color }} />
                {c.name}
              </button>
            </li>
          ))}
        </ul>
      </div>

      {/* bottom-left: Ask AI */}
      <button
        onClick={askAI}
        className="absolute bottom-4 left-3 z-10 inline-flex items-center gap-2 rounded-full bg-[var(--color-ink)] px-4 py-2.5 text-sm font-semibold text-[var(--color-bg)] shadow-md"
      >
        ✦ Ask AI
      </button>

      {/* bottom-right: Spots list toggle */}
      <button
        onClick={() => setListOpen((v) => !v)}
        className="absolute bottom-4 right-3 z-20 inline-flex items-center gap-2 rounded-full border border-[var(--color-line)] bg-[var(--color-surface)] px-4 py-2.5 text-sm font-semibold shadow-md"
      >
        ☰ {filtered.length} spots
      </button>

      {/* slide-in spots list */}
      <div
        className={`absolute right-0 top-0 z-10 h-full w-80 max-w-[85vw] overflow-y-auto border-l border-[var(--color-line)] bg-[var(--color-surface)] p-3 pb-20 shadow-xl transition-transform ${listOpen ? "translate-x-0" : "translate-x-full"}`}
      >
        <div className="mb-2 flex items-center justify-between">
          <span className="font-semibold">{filtered.length} spots</span>
          <button onClick={() => setListOpen(false)} className="chip">Close</button>
        </div>
        <ul className="space-y-1.5">
          {filtered.map((s) => (
            <li key={s.slug}>
              <button onClick={() => flyTo(s)} className="card flex w-full items-center gap-2 p-2.5 text-left">
                <span className="grid h-7 w-7 shrink-0 place-items-center rounded-[6px] text-sm" style={{ background: CATEGORY_COLOR[s.category] }}>
                  {CATEGORIES.find((c) => c.slug === s.category)?.emoji}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-medium">{s.name}</span>
                  <span className="block truncate text-xs text-[var(--color-muted)]">{s.neighborhood}</span>
                </span>
                <span className="nums shrink-0 text-xs font-semibold text-[var(--color-accent)]">{s.price}</span>
              </button>
            </li>
          ))}
        </ul>
      </div>

      <style>{`
        .blr-sq {
          display:grid; place-items:center;
          width:30px; height:30px; font-size:15px;
          border-radius:8px; border:2px solid #fff;
          box-shadow:0 2px 6px rgba(0,0,0,.3); cursor:pointer;
          transition:transform .1s ease;
        }
        .blr-sq:hover { transform:scale(1.15); z-index:2; }
        .maplibregl-popup-content {
          border-radius:12px; font-family:inherit; font-size:13px; padding:10px 12px;
          background:var(--color-surface); color:var(--color-ink);
          box-shadow:0 8px 24px -8px rgba(0,0,0,.35);
        }
        .maplibregl-popup-anchor-top .maplibregl-popup-tip { border-bottom-color:var(--color-surface); }
        .maplibregl-popup-anchor-bottom .maplibregl-popup-tip { border-top-color:var(--color-surface); }
        .maplibregl-popup-anchor-left .maplibregl-popup-tip { border-right-color:var(--color-surface); }
        .maplibregl-popup-anchor-right .maplibregl-popup-tip { border-left-color:var(--color-surface); }
        .pop-meta { color:var(--color-muted); font-size:12px; }
        .pop-why { color:var(--color-ink); }
        .pop-actions { margin-top:6px; display:flex; gap:10px; align-items:center; }
        .pop-actions a { color:var(--color-accent); font-weight:600; text-decoration:none; }
        .pop-save { cursor:pointer; background:none; border:none; color:var(--color-muted); font:inherit; padding:0; }
      `}</style>
    </div>
  );
}
