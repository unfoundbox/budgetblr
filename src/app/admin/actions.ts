"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";

function checkToken(token: string) {
  if (!process.env.ADMIN_TOKEN || token !== process.env.ADMIN_TOKEN) {
    throw new Error("Unauthorized");
  }
}

function slugify(name: string, area?: string) {
  const base = `${name} ${area ?? ""}`
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 70);
  return base || "spot";
}

function priceBand(min?: number, max?: number, unit?: string) {
  if (unit === "free") return "free";
  const v = max ?? min;
  if (v == null) return "any";
  if (v === 0) return "free";
  if (unit === "per_month") return "any";
  if (v <= 100) return "under_100";
  if (v <= 300) return "under_300";
  if (v <= 1000) return "under_1000";
  return "any";
}

export async function approveSubmission(token: string, id: string) {
  checkToken(token);
  const supabase = createAdminClient();

  const { data: sub, error: subErr } = await supabase
    .from("submissions")
    .select("id, payload")
    .eq("id", id)
    .single();
  if (subErr || !sub) throw new Error(subErr?.message ?? "Submission not found");

  const p = sub.payload as Record<string, unknown>;
  const name = String(p.name ?? "").trim();
  const category = String(p.category ?? "");
  let slug = slugify(name, p.area as string);

  // resolve category + neighborhood ids
  const { data: cat } = await supabase.from("categories").select("id").eq("slug", category).maybeSingle();
  const { data: nb } = p.neighborhood
    ? await supabase.from("neighborhoods").select("id").eq("slug", p.neighborhood).maybeSingle()
    : { data: null };

  // ensure unique slug
  const { data: existing } = await supabase.from("spots").select("id").eq("slug", slug).maybeSingle();
  if (existing) slug = `${slug}-${id.slice(0, 4)}`;

  const min = p.price_min != null ? Number(p.price_min) : null;
  const max = p.price_max != null ? Number(p.price_max) : null;
  const unit = (p.price_unit as string) || "per_person";

  const { data: spot, error: spotErr } = await supabase
    .from("spots")
    .insert({
      slug,
      name,
      category_id: cat?.id ?? null,
      neighborhood_id: nb?.id ?? null,
      address: (p.area as string) ?? null,
      price_min: min,
      price_max: max,
      price_unit: unit,
      price_band: priceBand(min ?? undefined, max ?? undefined, unit),
      why_worth_it: (p.why_worth_it as string) ?? null,
      description: (p.description as string) ?? null,
      external_url: (p.external_url as string) || null,
      instagram: (p.instagram as string) || null,
      status: "approved",
    })
    .select("id")
    .single();
  if (spotErr) throw new Error(spotErr.message);

  await supabase.from("submissions").update({ status: "approved", spot_id: spot.id }).eq("id", id);
  revalidatePath("/admin");
  revalidatePath("/spots");
}

export async function rejectSubmission(token: string, id: string) {
  checkToken(token);
  const supabase = createAdminClient();
  await supabase.from("submissions").update({ status: "rejected" }).eq("id", id);
  revalidatePath("/admin");
}
