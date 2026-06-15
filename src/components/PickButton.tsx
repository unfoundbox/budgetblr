"use client";

import { useEffect, useState } from "react";

const KEY = "blr_picks";

export function readPicks(): string[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(KEY) || "[]");
  } catch {
    return [];
  }
}

export function PickButton({ slug }: { slug: string }) {
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setSaved(readPicks().includes(slug));
  }, [slug]);

  function toggle() {
    const picks = readPicks();
    const next = picks.includes(slug) ? picks.filter((s) => s !== slug) : [...picks, slug];
    localStorage.setItem(KEY, JSON.stringify(next));
    setSaved(next.includes(slug));
  }

  return (
    <button
      onClick={toggle}
      className="chip"
      data-active={saved}
      aria-pressed={saved}
    >
      {saved ? "♥ Saved to picks" : "♡ Save to picks"}
    </button>
  );
}
