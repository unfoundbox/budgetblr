import { createClient } from "@/lib/supabase/server";
import type { SpotWithRefs, Neighborhood } from "@/lib/types";
import { PRICE_BANDS } from "@/lib/constants";

const SPOT_SELECT =
  "*, category:categories(slug,name,emoji), neighborhood:neighborhoods(slug,name), nearest_metro:metro_stations(name,line)";

export interface SpotFilters {
  category?: string;
  neighborhood?: string;
  priceBand?: string;
  q?: string;
}

/** Approved spots, filtered. Used by the directory list. */
export async function listSpots(filters: SpotFilters = {}): Promise<SpotWithRefs[]> {
  const supabase = await createClient();
  let query = supabase
    .from("spots")
    .select(SPOT_SELECT)
    .eq("status", "approved")
    .order("locals_count", { ascending: false })
    .order("name");

  if (filters.category) {
    query = supabase
      .from("spots")
      .select(SPOT_SELECT.replace("categories(", "categories!inner("))
      .eq("status", "approved")
      .eq("category.slug", filters.category)
      .order("locals_count", { ascending: false })
      .order("name");
  }
  if (filters.neighborhood) {
    query = query.eq("neighborhood.slug", filters.neighborhood);
  }
  if (filters.priceBand && filters.priceBand !== "any") {
    const band = PRICE_BANDS.find((b) => b.slug === filters.priceBand);
    if (band?.max === 0) {
      query = query.eq("price_band", "free");
    } else if (band?.max != null) {
      // include the band itself plus cheaper bands
      const order = ["free", "under_100", "under_300", "under_1000"];
      const allowed = order.slice(0, order.indexOf(filters.priceBand) + 1);
      query = query.in("price_band", allowed);
    }
  }
  if (filters.q) {
    query = query.or(`name.ilike.%${filters.q}%,description.ilike.%${filters.q}%`);
  }

  const { data, error } = await query.limit(500);
  if (error) throw error;
  return (data ?? []) as unknown as SpotWithRefs[];
}

export async function getSpotBySlug(slug: string): Promise<SpotWithRefs | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("spots")
    .select(SPOT_SELECT)
    .eq("slug", slug)
    .eq("status", "approved")
    .maybeSingle();
  if (error) throw error;
  return (data as unknown as SpotWithRefs) ?? null;
}

/** All approved spots with coordinates, for the map. */
export async function listSpotsForMap(): Promise<SpotWithRefs[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("spots")
    .select(SPOT_SELECT)
    .eq("status", "approved")
    .not("lat", "is", null)
    .limit(1000);
  if (error) throw error;
  return (data ?? []) as unknown as SpotWithRefs[];
}

export async function listNeighborhoods(): Promise<Neighborhood[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("neighborhoods")
    .select("*")
    .order("sort");
  if (error) throw error;
  return (data ?? []) as unknown as Neighborhood[];
}

export async function getNeighborhoodBySlug(slug: string): Promise<Neighborhood | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("neighborhoods")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();
  if (error) throw error;
  return (data as unknown as Neighborhood) ?? null;
}

export interface EventRow {
  id: string;
  title: string;
  venue: string | null;
  starts_at: string;
  price: number | null;
  is_free: boolean;
  description: string | null;
  link: string | null;
  neighborhood: { slug: string; name: string } | null;
}

export async function listUpcomingEvents(): Promise<EventRow[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("events")
    .select("id,title,venue,starts_at,price,is_free,description,link, neighborhood:neighborhoods(slug,name)")
    .eq("status", "approved")
    .order("starts_at");
  if (error) throw error;
  return (data ?? []) as unknown as EventRow[];
}

export async function spotCount(): Promise<number> {
  const supabase = await createClient();
  const { count } = await supabase
    .from("spots")
    .select("id", { count: "exact", head: true })
    .eq("status", "approved");
  return count ?? 0;
}
