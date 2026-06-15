"use client";

import { useMemo, useState } from "react";
import type { EventRow } from "@/lib/queries/spots";

type ViewMode = "list" | "calendar";

function sameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function EventListItem({ e }: { e: EventRow }) {
  const d = new Date(e.starts_at);
  return (
    <li className="card flex items-center gap-4 p-4">
      <div className="grid h-14 w-14 shrink-0 place-items-center rounded-xl bg-[var(--color-accent-soft)] text-[var(--color-accent)]">
        <div className="text-center leading-none">
          <div className="nums text-lg font-bold">{d.getDate()}</div>
          <div className="text-[10px] uppercase">{d.toLocaleString("en-IN", { month: "short" })}</div>
        </div>
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <h3 className="font-semibold">{e.title}</h3>
          <span
            className={`nums rounded-full px-2 py-0.5 text-xs font-semibold ${
              e.is_free
                ? "bg-[var(--color-leaf)]/15 text-[var(--color-leaf)]"
                : "bg-[var(--color-accent-soft)] text-[var(--color-accent)]"
            }`}
          >
            {e.is_free ? "Free" : `₹${e.price}`}
          </span>
        </div>
        <p className="truncate text-sm text-[var(--color-muted)]">
          {[e.venue, e.neighborhood?.name].filter(Boolean).join(" · ")}
          {e.description ? ` — ${e.description}` : ""}
        </p>
      </div>
      {e.link && (
        <a href={e.link} target="_blank" rel="noopener" className="chip shrink-0">
          Details
        </a>
      )}
    </li>
  );
}

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function CalendarView({ events }: { events: EventRow[] }) {
  // Anchor on the earliest upcoming event, falling back to the current month.
  const anchor = useMemo(() => {
    if (events.length > 0) return new Date(events[0].starts_at);
    return new Date();
  }, [events]);

  const year = anchor.getFullYear();
  const month = anchor.getMonth();
  const monthLabel = anchor.toLocaleString("en-IN", { month: "long", year: "numeric" });

  // Build a Mon-start grid covering the whole month.
  const cells = useMemo(() => {
    const first = new Date(year, month, 1);
    // getDay(): 0=Sun..6=Sat -> convert to Mon=0..Sun=6
    const lead = (first.getDay() + 6) % 7;
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const out: (Date | null)[] = [];
    for (let i = 0; i < lead; i++) out.push(null);
    for (let day = 1; day <= daysInMonth; day++) out.push(new Date(year, month, day));
    while (out.length % 7 !== 0) out.push(null);
    return out;
  }, [year, month]);

  return (
    <div>
      <div className="mb-3 text-sm font-semibold text-[var(--color-muted)]">{monthLabel}</div>
      <div className="overflow-hidden rounded-[var(--radius)] border border-[var(--color-line)]">
        <div className="grid grid-cols-7 border-b border-[var(--color-line)] bg-[var(--color-surface)]">
          {WEEKDAYS.map((w) => (
            <div
              key={w}
              className="px-2 py-2 text-center text-[11px] font-semibold uppercase tracking-wide text-[var(--color-muted)]"
            >
              {w}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7">
          {cells.map((date, i) => {
            const dayEvents = date ? events.filter((e) => sameDay(new Date(e.starts_at), date)) : [];
            return (
              <div
                key={i}
                className={`min-h-[88px] border-b border-r border-[var(--color-line)] p-1.5 ${
                  date ? "bg-[var(--color-surface)]" : "bg-[var(--color-bg)]"
                }`}
              >
                {date && (
                  <>
                    <div className="nums mb-1 text-right text-xs text-[var(--color-muted)]">
                      {date.getDate()}
                    </div>
                    <div className="space-y-1">
                      {dayEvents.map((e) => (
                        <div
                          key={e.id}
                          title={e.title}
                          className={`truncate rounded px-1.5 py-0.5 text-[11px] font-medium ${
                            e.is_free
                              ? "bg-[var(--color-leaf)]/15 text-[var(--color-leaf)]"
                              : "bg-[var(--color-accent-soft)] text-[var(--color-accent)]"
                          }`}
                        >
                          {e.title}
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default function EventsView({ events }: { events: EventRow[] }) {
  const [view, setView] = useState<ViewMode>("list");
  const [freeOnly, setFreeOnly] = useState(false);
  const [hood, setHood] = useState<string | null>(null);

  const hoods = useMemo(() => {
    const names = new Set<string>();
    for (const e of events) if (e.neighborhood?.name) names.add(e.neighborhood.name);
    return Array.from(names).sort();
  }, [events]);

  const filtered = useMemo(() => {
    return events.filter((e) => {
      if (freeOnly && !e.is_free) return false;
      if (hood && e.neighborhood?.name !== hood) return false;
      return true;
    });
  }, [events, freeOnly, hood]);

  return (
    <div>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Budget &amp; free things to do</h1>
          <p className="text-[var(--color-muted)]">
            Run clubs, open mics, jam nights, flea markets, meetups — light on the wallet.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            className="chip"
            data-active={view === "list"}
            onClick={() => setView("list")}
          >
            List
          </button>
          <button
            type="button"
            className="chip"
            data-active={view === "calendar"}
            onClick={() => setView("calendar")}
          >
            Calendar
          </button>
        </div>
      </div>

      <div className="mt-5 mb-6 flex flex-wrap items-center gap-2">
        <button
          type="button"
          className="chip"
          data-active={freeOnly}
          onClick={() => setFreeOnly((v) => !v)}
        >
          Free only
        </button>
        {hoods.length > 0 && (
          <span className="mx-1 h-4 w-px bg-[var(--color-line)]" aria-hidden />
        )}
        <button
          type="button"
          className="chip"
          data-active={hood === null}
          onClick={() => setHood(null)}
        >
          All
        </button>
        {hoods.map((name) => (
          <button
            key={name}
            type="button"
            className="chip"
            data-active={hood === name}
            onClick={() => setHood((cur) => (cur === name ? null : name))}
          >
            {name}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <p className="text-[var(--color-muted)]">No events match these filters.</p>
      ) : view === "list" ? (
        <ul className="space-y-3">
          {filtered.map((e) => (
            <EventListItem key={e.id} e={e} />
          ))}
        </ul>
      ) : (
        <CalendarView events={filtered} />
      )}
    </div>
  );
}
