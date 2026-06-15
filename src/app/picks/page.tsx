"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { readPicks } from "@/components/PickButton";
import { formatPrice } from "@/lib/constants";

interface Pick {
  slug: string;
  name: string;
  price_min: number | null;
  price_max: number | null;
  price_unit: string;
  neighborhood: { name: string } | null;
  category: { emoji: string } | null;
}

export default function PicksPage() {
  const [picks, setPicks] = useState<Pick[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const slugs = readPicks();
    if (slugs.length === 0) {
      setLoading(false);
      return;
    }
    const supabase = createClient();
    supabase
      .from("spots")
      .select("slug,name,price_min,price_max,price_unit, neighborhood:neighborhoods(name), category:categories(emoji)")
      .in("slug", slugs)
      .then(({ data }) => {
        setPicks((data ?? []) as unknown as Pick[]);
        setLoading(false);
      });
  }, []);

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="text-2xl font-bold tracking-tight">My picks</h1>
      <p className="mb-6 text-[var(--color-muted)]">
        Spots you&apos;ve saved, kept on this device. Share the page or build your own Bengaluru
        budget guide.
      </p>

      {loading ? (
        <p className="text-[var(--color-muted)]">Loading…</p>
      ) : picks.length === 0 ? (
        <div className="card p-10 text-center text-[var(--color-muted)]">
          No picks yet. Browse <Link href="/spots" className="text-[var(--color-accent)] hover:underline">spots</Link> and tap “Save to picks”.
        </div>
      ) : (
        <ul className="space-y-2">
          {picks.map((p) => (
            <li key={p.slug}>
              <Link href={`/spots/${p.slug}`} className="card flex items-center gap-3 p-3">
                <span className="text-xl">{p.category?.emoji ?? "📍"}</span>
                <span className="font-medium">{p.name}</span>
                <span className="text-sm text-[var(--color-muted)]">{p.neighborhood?.name}</span>
                <span className="ml-auto text-sm font-semibold text-[var(--color-accent)]">
                  {formatPrice(p.price_min, p.price_max, p.price_unit)}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
