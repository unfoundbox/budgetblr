"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
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
const AI_ENABLED = process.env.NEXT_PUBLIC_AI_SEARCH === "1";
const PRICE_ORDER = ["free", "under_100", "under_300", "under_1000"];
const STATE_KEY = "blr_map_state";
const SPOTS_CACHE = "blr_spots_cache";

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
function mapsHref(s: ExplorerSpot) {
  return `https://www.google.com/maps/search/?api=1&query=${s.lat},${s.lng}`;
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
  const [selected, setSelected] = useState<ExplorerSpot | null>(null);
  const [askOpen, setAskOpen] = useState(false);

  // restore persisted filters + cache spots for reload resilience
  useEffect(() => {
    try {
      const s = JSON.parse(localStorage.getItem(STATE_KEY) || "{}");
      if (s.cat) setCat(s.cat);
      if (s.price) setPrice(s.price);
      if (s.tech) setTech(true);
    } catch {}
    try {
      localStorage.setItem(SPOTS_CACHE, JSON.stringify({ t: Date.now(), spots }));
    } catch {}
  }, [spots]);

  useEffect(() => {
    try {
      localStorage.setItem(STATE_KEY, JSON.stringify({ cat, price, tech }));
    } catch {}
  }, [cat, price, tech]);

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

  // typing in search opens the results panel
  useEffect(() => {
    if (query.trim()) setListOpen(true);
  }, [query]);

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
    map.on("click", () => setSelected(null)); // tap empty map to dismiss card

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
        iconAnchor: [15, 15],
      });
      const marker = L.marker([s.lat, s.lng], { icon, title: s.name, riseOnHover: true });
      marker.on("click", () => {
        setAskOpen(false);
        setSelected(s);
        mapRef.current?.panTo([s.lat, s.lng], { animate: true });
      });
      marker.addTo(layer);
      bySlug.current.set(s.slug, marker);
    }
  }, [filtered]);

  function flyTo(s: ExplorerSpot) {
    mapRef.current?.flyTo([s.lat, s.lng], 15);
    setSelected(s);
  }
  function nearMe() {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition((pos) => {
      mapRef.current?.flyTo([pos.coords.latitude, pos.coords.longitude], 14);
    });
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
              placeholder={`Search ${spots.length} spots: dosa, PG, brewery…`}
              className="glass w-full rounded-full px-4 py-2 text-base text-[var(--color-ink)] outline-none placeholder:text-[var(--color-muted)]"
            />
            <button onClick={nearMe} className="chip glass shrink-0">⌖ Near Me</button>
          </div>
          <div className="flex flex-wrap gap-1.5">
            <button className="chip glass" data-active={!cat && !tech} onClick={() => { setCat(null); setTech(false); }}>All</button>
            {CATEGORIES.map((c) => (
              <button key={c.slug} className="chip glass" data-active={cat === c.slug} onClick={() => { setCat(cat === c.slug ? null : c.slug); setTech(false); }}>
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
      <div className="glass-strong absolute right-3 top-3 z-[900] hidden rounded-[var(--radius)] p-3 text-xs md:block">
        <div className="mb-1.5 font-semibold">Categories</div>
        <ul className="space-y-1">
          {CATEGORIES.map((c) => (
            <li key={c.slug}>
              <button className="flex items-center gap-2 hover:text-[var(--color-accent)]" onClick={() => { setCat(cat === c.slug ? null : c.slug); setTech(false); }}>
                <span className="h-2.5 w-2.5 rounded-[3px]" style={{ background: c.color }} />
                {c.name}
              </button>
            </li>
          ))}
        </ul>
      </div>

      {/* selected spot card */}
      {selected && <SelectedCard spot={selected} onClose={() => setSelected(null)} />}

      {/* Ask AI */}
      {askOpen && (
        AI_ENABLED ? (
          <AskChat spots={spots} onClose={() => setAskOpen(false)} onPick={(s) => { setAskOpen(false); flyTo(s); }} />
        ) : (
          <div className="glass-strong absolute bottom-20 left-3 z-[1001] w-[20rem] max-w-[calc(100vw-1.5rem)] rounded-[var(--radius)] p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 font-semibold">
                <span className="grid h-6 w-6 place-items-center rounded-md bg-[var(--color-accent)] text-[9px] font-extrabold text-white">blr</span>
                Ask AI
              </div>
              <button onClick={() => setAskOpen(false)} aria-label="Close" className="text-[var(--color-muted)] hover:text-[var(--color-ink)]">✕</button>
            </div>
            <p className="mt-3 text-sm leading-relaxed text-[var(--color-muted)]">
              ✨ Smart natural-language search is{" "}
              <strong className="text-[var(--color-ink)]">coming soon</strong>. For now, use the search
              bar up top or the category filters to find spots.
            </p>
          </div>
        )
      )}

      {/* bottom-left: Ask AI FAB */}
      <button
        onClick={() => { setAskOpen((v) => !v); setSelected(null); }}
        className={`absolute bottom-4 left-3 z-[1001] grid h-12 w-12 place-items-center rounded-full text-lg shadow-md ${askOpen ? "glass" : "glass-accent"}`}
        aria-label="Ask AI"
      >
        {askOpen ? "✕" : "✦"}
      </button>

      {/* bottom-right: Spots list toggle */}
      <button
        onClick={() => setListOpen((v) => !v)}
        className="glass absolute bottom-4 right-3 z-[1001] inline-flex items-center gap-2 rounded-full px-4 py-2.5 text-sm font-semibold"
      >
        ☰ {filtered.length} spots
      </button>

      {/* slide-in spots panel */}
      <div className={`glass-strong absolute right-0 top-0 z-[1000] flex h-full w-80 max-w-[85vw] flex-col transition-transform ${listOpen ? "translate-x-0" : "translate-x-full"}`}>
        <div className="flex items-center justify-between border-b border-[var(--color-line)] p-3">
          <span className="nums text-sm font-semibold">{filtered.length} of {spots.length} spots</span>
          <div className="flex items-center gap-2">
            <Link href="/community?tab=add" className="chip">+ Add</Link>
            <button onClick={() => setListOpen(false)} aria-label="Close" className="text-[var(--color-muted)] hover:text-[var(--color-ink)]">✕</button>
          </div>
        </div>
        <ul className="flex-1 space-y-1.5 overflow-y-auto p-3">
          {filtered.length === 0 ? (
            <li className="px-1 py-6 text-center text-sm text-[var(--color-muted)]">No spots match.</li>
          ) : filtered.map((s) => (
            <li key={s.slug}>
              <button onClick={() => flyTo(s)} className="card flex w-full items-center gap-2 p-2.5 text-left">
                <span className="grid h-7 w-7 shrink-0 place-items-center rounded-[6px] text-sm" style={{ background: CATEGORY_COLOR[s.category] }}>{emojiFor(s.category)}</span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-medium">{s.name}</span>
                  <span className="block truncate text-xs text-[var(--color-muted)]">{s.neighborhood}</span>
                </span>
                <span className="nums shrink-0 text-xs font-semibold text-[var(--color-accent)]">{s.price}</span>
              </button>
            </li>
          ))}
        </ul>
        <div className="border-t border-[var(--color-line)] p-3">
          <div className="card p-3">
            <div className="flex items-center gap-2 text-sm font-semibold">📨 The Friday drop</div>
            <p className="mt-1 text-xs text-[var(--color-muted)]">New spots & price corrections, weekly. Free.</p>
            <Link href="/newsletter" className="btn-accent mt-2 inline-flex text-xs">Subscribe →</Link>
          </div>
        </div>
      </div>
    </div>
  );
}

function SelectedCard({ spot, onClose }: { spot: ExplorerSpot; onClose: () => void }) {
  const cat = CATEGORIES.find((c) => c.slug === spot.category);
  const [saved, setSaved] = useState(false);
  useEffect(() => setSaved(readPicks().includes(spot.slug)), [spot.slug]);
  function toggleSave() {
    const picks = readPicks();
    const next = picks.includes(spot.slug) ? picks.filter((x) => x !== spot.slug) : [...picks, spot.slug];
    localStorage.setItem("blr_picks", JSON.stringify(next));
    setSaved(next.includes(spot.slug));
  }
  return (
    <div className="glass-strong absolute bottom-20 left-3 z-[1001] w-80 max-w-[calc(100vw-1.5rem)] rounded-[var(--radius)] p-4">
      <div className="flex items-start justify-between">
        <span className="text-[10px] font-bold uppercase tracking-wide text-[var(--color-muted)]">Selected</span>
        <button onClick={onClose} aria-label="Close" className="text-[var(--color-muted)] hover:text-[var(--color-ink)]">✕</button>
      </div>
      <div className="mt-1 flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="grid h-8 w-8 shrink-0 place-items-center rounded-[7px] text-base" style={{ background: cat?.color }}>{cat?.emoji}</span>
          <h3 className="font-semibold leading-tight">{spot.name}</h3>
        </div>
        <span className="nums shrink-0 rounded-full bg-[var(--color-accent-soft)] px-2 py-0.5 text-xs font-semibold text-[var(--color-accent)]">{spot.price}</span>
      </div>
      {spot.neighborhood && <p className="mt-2 text-sm text-[var(--color-muted)]">{spot.neighborhood}</p>}
      {spot.why && <p className="mt-2 text-sm">{spot.why}</p>}
      <div className="mt-3 flex gap-2">
        <Link href={`/spots/${spot.slug}`} className="btn-accent flex-1 justify-center text-sm">View details</Link>
        <a href={mapsHref(spot)} target="_blank" rel="noopener" className="chip">📍 Directions</a>
        <button onClick={toggleSave} className="chip" data-active={saved} aria-pressed={saved}>{saved ? "♥" : "♡"}</button>
      </div>
    </div>
  );
}

interface ChatMsg { role: "user" | "bot"; text: string; results?: ExplorerSpot[] }

function AskChat({
  spots,
  onClose,
  onPick,
}: {
  spots: ExplorerSpot[];
  onClose: () => void;
  onPick: (s: ExplorerSpot) => void;
}) {
  const [q, setQ] = useState("");
  const [busy, setBusy] = useState(false);
  const [msgs, setMsgs] = useState<ChatMsg[]>([
    { role: "bot", text: "Hey! Ask me anything about budget spots in Bengaluru — try “cheap dosa near Indiranagar”, “free coworking”, or “best filter coffee”." },
  ]);
  const endRef = useRef<HTMLDivElement>(null);
  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [msgs, busy]);

  const bySlug = new Map(spots.map((s) => [s.slug, s]));

  async function send() {
    const text = q.trim();
    if (!text || busy) return;
    setMsgs((m) => [...m, { role: "user", text }]);
    setQ("");
    setBusy(true);
    try {
      const res = await fetch("/api/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: text }),
      });
      if (!res.ok) {
        const msg = res.status === 503 ? "AI search isn’t switched on yet — use the search bar up top for now." : "Hmm, that didn’t go through. Try again?";
        setMsgs((m) => [...m, { role: "bot", text: msg }]);
      } else {
        const data = await res.json();
        const results = (data.slugs as string[]).map((s) => bySlug.get(s)).filter(Boolean) as ExplorerSpot[];
        setMsgs((m) => [...m, { role: "bot", text: data.reply || "Here's what I found.", results }]);
      }
    } catch {
      setMsgs((m) => [...m, { role: "bot", text: "Network hiccup — try again in a moment." }]);
    }
    setBusy(false);
  }

  return (
    <div className="glass-strong absolute bottom-20 left-3 z-[1001] flex max-h-[72vh] w-[24rem] max-w-[calc(100vw-1.5rem)] flex-col rounded-[var(--radius)]">
      <div className="flex items-center justify-between border-b border-[var(--color-line)] p-3">
        <div className="flex items-center gap-2 font-semibold">
          <span className="grid h-6 w-6 place-items-center rounded-md bg-[var(--color-accent)] text-[9px] font-extrabold text-white">blr</span>
          budgetblr Search
        </div>
        <button onClick={onClose} aria-label="Close" className="text-[var(--color-muted)] hover:text-[var(--color-ink)]">✕</button>
      </div>
      <div className="flex-1 space-y-3 overflow-y-auto p-3">
        {msgs.map((m, i) =>
          m.role === "user" ? (
            <div key={i} className="ml-auto w-fit max-w-[85%] rounded-2xl rounded-br-sm bg-[var(--color-accent)] px-3 py-2 text-sm text-white">{m.text}</div>
          ) : (
            <div key={i} className="space-y-2">
              <div className="w-fit max-w-[90%] rounded-2xl rounded-bl-sm bg-[var(--color-bg)] px-3 py-2 text-sm leading-relaxed">{m.text}</div>
              {m.results?.map((s) => (
                <button key={s.slug} onClick={() => onPick(s)} className="card flex w-full items-center gap-2 p-2.5 text-left">
                  <span className="grid h-7 w-7 shrink-0 place-items-center rounded-[6px] text-sm" style={{ background: CATEGORY_COLOR[s.category] }}>{emojiFor(s.category)}</span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-medium">{s.name}</span>
                    <span className="block truncate text-xs text-[var(--color-muted)]">{[s.neighborhood, s.price, s.category].filter(Boolean).join(" · ")}</span>
                  </span>
                </button>
              ))}
            </div>
          ),
        )}
        {busy && <div className="w-fit rounded-2xl rounded-bl-sm bg-[var(--color-bg)] px-3 py-2 text-sm text-[var(--color-muted)]">Searching…</div>}
        <div ref={endRef} />
      </div>
      <div className="flex gap-2 border-t border-[var(--color-line)] p-3">
        <input
          autoFocus
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && send()}
          placeholder="Ask about budget spots…"
          className="w-full rounded-lg border border-[var(--color-line)] bg-[var(--color-surface)] px-3 py-2 text-base outline-none"
        />
        <button onClick={send} disabled={busy} className="btn-accent shrink-0 text-sm disabled:opacity-60">Ask</button>
      </div>
    </div>
  );
}
