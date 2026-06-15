import Link from "next/link";
import { ThemeToggle } from "@/components/ThemeToggle";

const NAV = [
  { href: "/", label: "Map" },
  { href: "/spots", label: "Spots" },
  { href: "/events", label: "Events" },
  { href: "/neighborhoods", label: "Areas" },
  { href: "/guide", label: "New here?" },
  { href: "/community", label: "Community" },
  { href: "/about", label: "About" },
];

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-30 border-b border-[var(--color-line)] bg-[var(--color-bg)]/85 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center gap-4 px-4 py-3">
        <Link href="/" className="flex items-center gap-2 font-bold tracking-tight">
          <span className="grid h-7 w-7 place-items-center rounded-lg bg-[var(--color-accent)] text-[11px] font-extrabold tracking-tight text-white">blr</span>
          <span className="text-lg">budget<span className="text-[var(--color-accent)]">blr</span></span>
        </Link>
        <nav className="ml-2 hidden items-center gap-1 text-sm md:flex">
          {NAV.map((n) => (
            <Link
              key={n.href}
              href={n.href}
              className="rounded-full px-3 py-1.5 text-[var(--color-muted)] transition-colors hover:bg-[var(--color-surface)] hover:text-[var(--color-ink)]"
            >
              {n.label}
            </Link>
          ))}
        </nav>
        <div className="ml-auto flex items-center gap-2">
          <ThemeToggle />
          <Link href="/community?tab=add" className="btn-accent text-sm">
            + Add a spot
          </Link>
        </div>
      </div>
      {/* mobile nav */}
      <nav className="flex items-center gap-1 overflow-x-auto border-t border-[var(--color-line)] px-3 py-2 text-sm md:hidden">
        {NAV.map((n) => (
          <Link key={n.href} href={n.href} className="chip">
            {n.label}
          </Link>
        ))}
      </nav>
    </header>
  );
}
