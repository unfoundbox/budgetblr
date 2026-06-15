"use client";

import { useActionState } from "react";
import { submitSpot, type SubmitState } from "./actions";
import { CATEGORIES } from "@/lib/constants";

const NEIGHBORHOODS = [
  "koramangala", "indiranagar", "hsr-layout", "btm-layout", "jayanagar",
  "jp-nagar", "whitefield", "marathahalli", "electronic-city", "hebbal", "bellandur",
];

const PRICE_UNITS = [
  ["per_person", "per person"],
  ["per_plate", "per plate"],
  ["per_month", "/month (PG/gym)"],
  ["per_visit", "per visit"],
  ["per_day", "per day"],
  ["free", "free"],
];

const initial: SubmitState = { ok: false };

export default function SubmitPage() {
  const [state, formAction, pending] = useActionState(submitSpot, initial);

  if (state.ok) {
    return (
      <div className="mx-auto max-w-lg px-4 py-20 text-center">
        <div className="text-5xl">🎉</div>
        <h1 className="mt-4 text-2xl font-bold">Thanks for the tip!</h1>
        <p className="mt-2 text-[var(--color-muted)]">
          Your spot is in the review queue. Once a moderator approves it, it&apos;ll show up on the
          map and in the directory.
        </p>
        <a href="/spots" className="btn-accent mt-6 inline-flex">Back to spots</a>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <h1 className="text-2xl font-bold tracking-tight">Add a budget spot</h1>
      <p className="mt-1 text-[var(--color-muted)]">
        Know a ₹40 dosa, a value PG, or a cheap-pint night? Share it. We review submissions before
        they go live.
      </p>

      <form action={formAction} className="mt-6 space-y-4">
        <Field label="Name *">
          <input name="name" required className="inp" placeholder="e.g. CTR (Shri Sagar)" />
        </Field>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Category *">
            <select name="category" required className="inp" defaultValue="">
              <option value="" disabled>Choose…</option>
              {CATEGORIES.map((c) => (
                <option key={c.slug} value={c.slug}>{c.emoji} {c.name}</option>
              ))}
            </select>
          </Field>
          <Field label="Neighbourhood">
            <select name="neighborhood" className="inp" defaultValue="">
              <option value="">Pick the closest…</option>
              {NEIGHBORHOODS.map((n) => (
                <option key={n} value={n}>{n.replace("-", " ")}</option>
              ))}
            </select>
          </Field>
        </div>

        <Field label="Area / landmark">
          <input name="area" className="inp" placeholder="e.g. Malleshwaram, near 8th Cross" />
        </Field>

        <div className="grid gap-4 sm:grid-cols-3">
          <Field label="Price from (₹)">
            <input name="price_min" type="number" min="0" className="inp" placeholder="30" />
          </Field>
          <Field label="Price to (₹)">
            <input name="price_max" type="number" min="0" className="inp" placeholder="120" />
          </Field>
          <Field label="Per">
            <select name="price_unit" className="inp" defaultValue="per_person">
              {PRICE_UNITS.map(([v, l]) => (
                <option key={v} value={v}>{l}</option>
              ))}
            </select>
          </Field>
        </div>

        <Field label="Why it's worth it">
          <input name="why_worth_it" maxLength={280} className="inp" placeholder="One punchy line" />
        </Field>
        <Field label="More details">
          <textarea name="description" maxLength={800} rows={3} className="inp" />
        </Field>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Website / Maps link">
            <input name="external_url" type="url" className="inp" placeholder="https://…" />
          </Field>
          <Field label="Instagram">
            <input name="instagram" className="inp" placeholder="@handle" />
          </Field>
        </div>

        {state.error && <p className="text-sm text-red-600">{state.error}</p>}

        <button type="submit" disabled={pending} className="btn-accent disabled:opacity-60">
          {pending ? "Submitting…" : "Submit spot"}
        </button>
        <p className="text-xs text-[var(--color-muted)]">
          Tip: prices change — give a realistic range and we&apos;ll keep it honest.
        </p>
      </form>

    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-medium">{label}</span>
      {children}
    </label>
  );
}
