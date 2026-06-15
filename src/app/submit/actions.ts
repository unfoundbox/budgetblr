"use server";

import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

const SubmitSchema = z.object({
  name: z.string().min(2, "Name is too short").max(120),
  category: z.string().min(1, "Pick a category"),
  neighborhood: z.string().optional(),
  area: z.string().max(120).optional(),
  price_min: z.coerce.number().int().min(0).optional(),
  price_max: z.coerce.number().int().min(0).optional(),
  price_unit: z.string().optional(),
  why_worth_it: z.string().max(280).optional(),
  description: z.string().max(800).optional(),
  external_url: z.string().url().optional().or(z.literal("")),
  instagram: z.string().max(120).optional(),
});

export type SubmitState = { ok: boolean; error?: string };

export async function submitSpot(
  _prev: SubmitState,
  formData: FormData,
): Promise<SubmitState> {
  const parsed = SubmitSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("submissions").insert({
    payload: parsed.data,
    status: "pending",
  });
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}
