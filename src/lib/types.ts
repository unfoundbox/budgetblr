// Domain types for budgetblr. Hand-written to match the schema; once the DB is
// live you can regenerate richer types with `supabase gen types typescript`.

export type SpotStatus = "pending" | "approved" | "rejected";
export type PriceUnit =
  | "per_plate"
  | "per_person"
  | "per_month"
  | "per_visit"
  | "per_day"
  | "free";
export type PriceBand = "free" | "under_100" | "under_300" | "under_1000" | "any";
export type MetroLineSlug = "purple" | "green" | "yellow" | "pink" | "blue" | "none";

export interface Category {
  id: number;
  slug: string;
  name: string;
  emoji: string;
  blurb: string | null;
  sort: number;
}

export interface Neighborhood {
  id: number;
  slug: string;
  name: string;
  blurb: string | null;
  rent_low: number | null;
  rent_high: number | null;
  commute_note: string | null;
}

export interface MetroStation {
  id: number;
  name: string;
  line: MetroLineSlug;
  lat: number;
  lng: number;
  is_open: boolean;
}

export interface Spot {
  id: string;
  slug: string;
  name: string;
  category_id: number;
  neighborhood_id: number | null;
  lat: number | null;
  lng: number | null;
  address: string | null;
  price_min: number | null;
  price_max: number | null;
  price_unit: PriceUnit;
  price_band: PriceBand;
  description: string | null;
  why_worth_it: string | null;
  external_url: string | null;
  instagram: string | null;
  image_url: string | null;
  nearest_metro_id: number | null;
  metro_walk_min: number | null;
  status: SpotStatus;
  locals_count: number;
  created_at: string;
}

// Spot joined with its category + neighborhood + metro names, as returned by
// the list/detail queries.
export interface SpotWithRefs extends Spot {
  category: Pick<Category, "slug" | "name" | "emoji"> | null;
  neighborhood: Pick<Neighborhood, "slug" | "name"> | null;
  nearest_metro: Pick<MetroStation, "name" | "line"> | null;
}
