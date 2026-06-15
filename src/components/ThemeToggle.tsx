"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";

// Fixed 36px square so the header never shifts between the pre-mount placeholder
// and the mounted button (Rauno: avoid layout shift).
const BTN =
  "grid h-9 w-9 place-items-center rounded-full border border-[var(--color-line)] " +
  "bg-[var(--color-surface)] text-[var(--color-ink)] transition-colors";

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  // Pre-hydration: render an inert same-size placeholder to avoid a mismatch/flash.
  if (!mounted) {
    return <span className={BTN} aria-hidden style={{ visibility: "hidden" }} />;
  }

  const isDark = resolvedTheme === "dark";
  return (
    <button
      type="button"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className={`${BTN} hover:border-[var(--color-accent)]`}
      aria-label={isDark ? "Switch to light theme" : "Switch to dark theme"}
      title={isDark ? "Light mode" : "Dark mode"}
    >
      {isDark ? (
        // sun
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
          <circle cx="12" cy="12" r="4" />
          <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
        </svg>
      ) : (
        // moon
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
          <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" />
        </svg>
      )}
    </button>
  );
}
