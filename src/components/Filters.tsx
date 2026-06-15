"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useCallback, useTransition } from "react";
import { CATEGORIES, PRICE_BANDS } from "@/lib/constants";
import type { Neighborhood } from "@/lib/types";

export function Filters({ neighborhoods }: { neighborhoods: Neighborhood[] }) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const [, startTransition] = useTransition();

  const category = params.get("category") ?? "";
  const price = params.get("price") ?? "any";
  const neighborhood = params.get("neighborhood") ?? "";
  const q = params.get("q") ?? "";

  const setParam = useCallback(
    (key: string, value: string) => {
      const next = new URLSearchParams(params.toString());
      if (!value || value === "any") next.delete(key);
      else next.set(key, value);
      startTransition(() => router.push(`${pathname}?${next.toString()}`, { scroll: false }));
    },
    [params, pathname, router],
  );

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <input
          defaultValue={q}
          placeholder="Search dosa, PG, brewery…"
          onKeyDown={(e) => {
            if (e.key === "Enter") setParam("q", (e.target as HTMLInputElement).value);
          }}
          className="w-full rounded-full border border-[var(--color-line)] bg-[var(--color-surface)] px-4 py-2 text-base outline-none"
        />
        <select
          value={neighborhood}
          onChange={(e) => setParam("neighborhood", e.target.value)}
          className="rounded-full border border-[var(--color-line)] bg-[var(--color-surface)] px-3 py-2 text-base outline-none"
        >
          <option value="">All areas</option>
          {neighborhoods.map((n) => (
            <option key={n.slug} value={n.slug}>{n.name}</option>
          ))}
        </select>
      </div>

      <div className="flex flex-wrap gap-2">
        <button className="chip" data-active={!category} onClick={() => setParam("category", "")}>
          All
        </button>
        {CATEGORIES.map((c) => (
          <button
            key={c.slug}
            className="chip"
            data-active={category === c.slug}
            onClick={() => setParam("category", c.slug)}
          >
            <span aria-hidden>{c.emoji}</span> {c.name}
          </button>
        ))}
      </div>

      <div className="flex flex-wrap gap-2">
        {PRICE_BANDS.map((b) => (
          <button
            key={b.slug}
            className="chip"
            data-active={price === b.slug}
            onClick={() => setParam("price", b.slug)}
          >
            {b.label}
          </button>
        ))}
      </div>
    </div>
  );
}
