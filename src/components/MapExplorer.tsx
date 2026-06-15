"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useTheme } from "next-themes";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
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

// Stamen Terrain (light) / dark via Stadia Maps. Keyless on localhost.
function tileUrl(dark: boolean): string {
  const style = dark ? "alidade_smooth_dark" : "stamen_terrain";
  const suffix = KEY ? `?api_key=${KEY}` : "";
  return `https://tiles.stadiamaps.com/tiles/${style}/{z}/{x}/{y}{r}.png${suffix}`;
}
const ATTRIB =
  '© <a href="https://stadiamaps.com/">Stadia Maps</a> © <a href="https://stamen.com/">Stamen Design</a> © <a href="https://openstreetmap.org/">OpenStreetMap</a>';

function priceAllowed(band: string, max: string): boolean {
  if (max === "any") return true;
  if (max === "free") return band === "free";
  return PRICE_ORDER.slice(0, PRICE_ORDER.indexOf(max) + 1).includes(band);
}

function emojiFor(slug: string) {
  return CATEGORIES.find((c) => c.slug === slug)?.emoji ?? "📍";
}

export function MapExplorer({ spots }: { spots: ExplorerSpot[] }) {
  const mapEl = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const tileRef = useRef<L.TileLayer | null>(null);
  const layerRef = useRef<L.LayerGroup | null>(null);
  const bySlug = useRef<Map<string, L.Marker>>(new Map());
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
    const map = L.map(mapEl.current, { zoomControl: false, attributionControl: true }).setView(
      [BLR_CENTER.lat, BLR_CENTER.lng],
      11,
    );
    L.control.zoom({ position: "bottomright" }).addTo(map);
    tileRef.current = L.tileLayer(tileUrl(dark), { maxZoom: 20, attribution: ATTRIB }).addTo(map);
    layerRef.current = L.layerGroup().addTo(map);
    mapRef.current = map;

    const ro = new ResizeObserver(() => map.invalidateSize());
    ro.observe(mapEl.current);
    return () => {
      ro.disconnect();
      map.remove();
      mapRef.current = null;
      bySlug.current.clear();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // swap basemap on theme change
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !tileRef.current) return;
    tileRef.current.remove();
    tileRef.current = L.tileLayer(tileUrl(dark), { maxZoom: 20, attribution: ATTRIB }).addTo(map);
    tileRef.current.bringToBack();
  }, [dark]);

  // render markers when the filtered set changes
  useEffect(() => {
    const layer = layerRef.current;
    if (!layer) return;
    layer.clearLayers();
    bySlug.current.clear();
    for (const s of filtered) {
      const color = CATEGORY_COLOR[s.category] ?? "#64748b";
      const icon = L.divIcon({
        className: "blr-pin",
        html: `<div class="blr-sq" style="background:${color}">${emojiFor(s.category)}</div>`,
        iconSize: [30, 30],
        iconAnchor: [15, 15], // centre the square on the coordinate — stays pinned
        popupAnchor: [0, -14],
      });
      const html =
        `<strong>${s.name}</strong><br/>` +
        `<span class="pop-meta">${s.neighborhood ?? ""}${s.neighborhood ? " · " : ""}<span style="color:var(--color-accent)">${s.price}</span></span>` +
        (s.why ? `<br/><span class="pop-why">${s.why}</span>` : "") +
        `<div class="pop-actions"><a href="/spots/${s.slug}">View →</a>` +
        `<button class="pop-save" data-slug="${s.slug}">${readPicks().includes(s.slug) ? "♥ Saved" : "♡ Save"}</button></div>`;
      const marker = L.marker([s.lat, s.lng], { icon, title: s.name }).bindPopup(html, {
        closeButton: false,
      });
      marker.addTo(layer);
      bySlug.current.set(s.slug, marker);
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
    mapRef.current?.flyTo([s.lat, s.lng], 15);
    bySlug.current.get(s.slug)?.openPopup();
  }

  function nearMe() {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition((pos) => {
      mapRef.current?.flyTo([pos.coords.latitude, pos.coords.longitude], 14);
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
    if (!matched && q) setQuery(q);
  }

  return (
    <div className="relative h-full w-full overflow-hidden">
      <div ref={mapEl} className="h-full w-full" />

      {/* top-left: search + filters */}
      <div className="pointer-events-none absolute inset-x-0 top-0 z-[1000] p-3">
        <div className="pointer-events-auto flex max-w-xl flex-col gap-2">
          <div className="flex gap-2">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && askAI()}
              placeholder={`Ask ${spots.length} spots: cheap dosa, free coworking…`}
              className="glass w-full rounded-full px-4 py-2 text-base text-[var(--color-ink)] outline-none placeholder:text-[var(--color-muted)]"
            />
            <button onClick={nearMe} className="chip glass shrink-0">⌖ Near Me</button>
          </div>
          <div className="flex flex-wrap gap-1.5">
            <button className="chip glass" data-active={!cat && !tech} onClick={() => { setCat(null); setTech(false); }}>All</button>
            {CATEGORIES.map((c) => (
              <button
                key={c.slug}
                className="chip glass"
                data-active={cat === c.slug}
                onClick={() => { setCat(cat === c.slug ? null : c.slug); setTech(false); }}
              >
                <span aria-hidden>{c.emoji}</span> {c.name}
              </button>
            ))}
            <button className="chip glass" data-active={tech} onClick={() => { setTech((t) => !t); setCat(null); }}>🚀 Tech Spots</button>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {PRICE_BANDS.map((b) => (
              <button key={b.slug} className="chip glass" data-active={price === b.slug} onClick={() => setPrice(b.slug)}>
                {b.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* top-right: legend */}
      <div className="glass-strong absolute right-3 top-3 z-[1000] hidden rounded-[var(--radius)] p-3 text-xs md:block">
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
        className="glass-accent absolute bottom-4 left-3 z-[1000] inline-flex items-center gap-2 rounded-full px-4 py-2.5 text-sm font-semibold"
      >
        ✦ Ask AI
      </button>

      {/* bottom-right: Spots list toggle */}
      <button
        onClick={() => setListOpen((v) => !v)}
        className="glass absolute bottom-4 right-3 z-[1001] inline-flex items-center gap-2 rounded-full px-4 py-2.5 text-sm font-semibold"
      >
        ☰ {filtered.length} spots
      </button>

      {/* slide-in spots list */}
      <div
        className={`glass-strong absolute right-0 top-0 z-[1000] h-full w-80 max-w-[85vw] overflow-y-auto p-3 pb-20 transition-transform ${listOpen ? "translate-x-0" : "translate-x-full"}`}
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
                  {emojiFor(s.category)}
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
    </div>
  );
}
