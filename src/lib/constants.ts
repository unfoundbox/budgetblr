// Domain reference data for budgetblr. Mirrors the enums/categories in the DB
// so the UI can render filters without a round-trip.

export const CATEGORIES = [
  { slug: "food", name: "Food", emoji: "🍛", color: "#ef4444", blurb: "Darshinis, mess, thalis, street food, biryani" },
  { slug: "coffee", name: "Coffee", emoji: "☕", color: "#92400e", blurb: "Filter coffee & budget cafes" },
  { slug: "bars", name: "Bars & Drinks", emoji: "🍺", color: "#ec4899", blurb: "Microbreweries & cheap pints" },
  { slug: "grocery", name: "Grocery", emoji: "🧺", color: "#14b8a6", blurb: "HOPCOMS, local markets, supermarkets" },
  { slug: "fitness", name: "Gym & Fitness", emoji: "🏋️", color: "#111827", blurb: "Gyms, cult.fit, parks" },
  { slug: "housing", name: "Housing", emoji: "🏠", color: "#22c55e", blurb: "PGs, coliving, flats & flatmates" },
  { slug: "work", name: "Work Spots", emoji: "💻", color: "#3b82f6", blurb: "Cafes, libraries, coworking" },
  { slug: "accelerators", name: "Accelerators", emoji: "🚀", color: "#f97316", blurb: "Surge, Antler, YC-backed & more" },
  { slug: "vcs", name: "VCs", emoji: "💸", color: "#7c3aed", blurb: "Accel, Blume, Peak XV, Elevation" },
  { slug: "services", name: "Services", emoji: "🧰", color: "#64748b", blurb: "Laundry, salons, repair, tailors" },
] as const;

export type CategorySlug = (typeof CATEGORIES)[number]["slug"];

// "Tech Spots" quick filter = the startup-ecosystem categories (budgetsf parity).
export const TECH_SPOT_CATEGORIES: CategorySlug[] = ["accelerators", "vcs", "work"];

export const CATEGORY_COLOR: Record<string, string> = Object.fromEntries(
  CATEGORIES.map((c) => [c.slug, c.color]),
);

export const PRICE_BANDS = [
  { slug: "any", label: "Any price", max: null },
  { slug: "free", label: "Free", max: 0 },
  { slug: "under_100", label: "Under ₹100", max: 100 },
  { slug: "under_300", label: "Under ₹300", max: 300 },
  { slug: "under_1000", label: "Under ₹1000", max: 1000 },
] as const;

export type PriceBandSlug = (typeof PRICE_BANDS)[number]["slug"];

export const METRO_LINES = [
  { slug: "purple", label: "Purple Line", color: "#7c3aed" },
  { slug: "green", label: "Green Line", color: "#16a34a" },
  { slug: "yellow", label: "Yellow Line", color: "#eab308" },
  { slug: "pink", label: "Pink Line", color: "#ec4899" },
  { slug: "blue", label: "Blue Line", color: "#2563eb" },
] as const;

// Bangalore map default view (roughly city centre / MG Road)
export const BLR_CENTER = { lng: 77.5946, lat: 12.9716 };

export const PRICE_UNIT_LABEL: Record<string, string> = {
  per_plate: "per plate",
  per_person: "per person",
  per_month: "/month",
  per_visit: "per visit",
  per_day: "per day",
  free: "",
};

export function formatPrice(
  min: number | null,
  max: number | null,
  unit: string,
): string {
  if (unit === "free" || (min === 0 && (max === 0 || max === null))) return "Free";
  const suffix = PRICE_UNIT_LABEL[unit] ?? "";
  const tail = suffix && unit !== "per_month" ? ` ${suffix}` : suffix;
  if (min != null && max != null && min !== max) return `₹${min}–₹${max}${tail}`;
  const v = min ?? max;
  return v != null ? `₹${v}${tail}` : "—";
}
