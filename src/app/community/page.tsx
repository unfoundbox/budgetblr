"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { CATEGORIES } from "@/lib/constants";

const NEIGHBORHOODS = [
  ["koramangala", "Koramangala"], ["indiranagar", "Indiranagar"], ["hsr-layout", "HSR Layout"],
  ["btm-layout", "BTM Layout"], ["jayanagar", "Jayanagar"], ["jp-nagar", "JP Nagar"],
  ["whitefield", "Whitefield"], ["marathahalli", "Marathahalli"], ["electronic-city", "Electronic City"],
  ["hebbal", "Hebbal"], ["bellandur", "Bellandur"],
];
const PRICE_TIERS = ["₹", "₹₹", "₹₹₹", "₹₹₹₹"];
const VOTES_NEEDED = 5;

interface Submission {
  id: string;
  created_at: string;
  votes: number;
  payload: Record<string, string>;
}

function voterId(): string {
  let id = localStorage.getItem("blr_voter");
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem("blr_voter", id);
  }
  return id;
}
function votedSet(): Set<string> {
  try {
    return new Set(JSON.parse(localStorage.getItem("blr_voted") || "[]"));
  } catch {
    return new Set();
  }
}

export default function CommunityPage() {
  const [tab, setTab] = useState<"vote" | "add">("vote");

  useEffect(() => {
    if (new URLSearchParams(window.location.search).get("tab") === "add") setTab("add");
  }, []);

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <div className="mb-5 flex items-center gap-2">
        <Link href="/" className="text-[var(--color-muted)] hover:text-[var(--color-ink)]">←</Link>
        <h1 className="text-2xl font-bold tracking-tight">Community</h1>
      </div>

      <div className="mb-6 grid grid-cols-2 overflow-hidden rounded-[var(--radius)] border border-[var(--color-line)]">
        <button
          onClick={() => setTab("vote")}
          className={`px-4 py-3 text-sm font-semibold ${tab === "vote" ? "bg-[var(--color-surface)]" : "bg-transparent text-[var(--color-muted)]"}`}
        >
          Vote on Spots
        </button>
        <button
          onClick={() => setTab("add")}
          className={`px-4 py-3 text-sm font-semibold ${tab === "add" ? "bg-[var(--color-surface)]" : "bg-transparent text-[var(--color-muted)]"}`}
        >
          Add a Spot
        </button>
      </div>

      {tab === "vote" ? <VoteTab /> : <AddTab onDone={() => setTab("vote")} />}
    </div>
  );
}

function Stepper() {
  const steps = ["Submit", `${VOTES_NEEDED} votes`, "Goes live"];
  return (
    <div className="card mb-5 flex items-center justify-center gap-3 p-4 text-sm">
      {steps.map((s, i) => (
        <div key={s} className="flex items-center gap-3">
          <span className="flex items-center gap-2">
            <span className="grid h-6 w-6 place-items-center rounded-full bg-[var(--color-leaf)]/15 text-xs font-bold text-[var(--color-leaf)]">{i + 1}</span>
            {s}
          </span>
          {i < steps.length - 1 && <span className="text-[var(--color-muted)]">›</span>}
        </div>
      ))}
    </div>
  );
}

function VoteTab() {
  const [subs, setSubs] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [cat, setCat] = useState<string | null>(null);
  const [voted, setVoted] = useState<Set<string>>(new Set());
  const [busy, setBusy] = useState<string | null>(null);

  useEffect(() => {
    setVoted(votedSet());
    const supabase = createClient();
    supabase
      .from("submissions")
      .select("id, created_at, votes, payload")
      .eq("status", "pending")
      .order("votes", { ascending: false })
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        setSubs((data ?? []) as unknown as Submission[]);
        setLoading(false);
      });
  }, []);

  async function approve(s: Submission) {
    if (voted.has(s.id) || busy) return;
    setBusy(s.id);
    const supabase = createClient();
    const { data, error } = await supabase.rpc("cast_vote", {
      p_submission: s.id,
      p_voter: voterId(),
    });
    if (!error) {
      const count = (data as number) ?? s.votes + 1;
      const nextVoted = new Set(voted).add(s.id);
      setVoted(nextVoted);
      localStorage.setItem("blr_voted", JSON.stringify([...nextVoted]));
      if (count >= VOTES_NEEDED) {
        setSubs((prev) => prev.filter((x) => x.id !== s.id)); // went live
      } else {
        setSubs((prev) => prev.map((x) => (x.id === s.id ? { ...x, votes: count } : x)));
      }
    }
    setBusy(null);
  }

  const shown = cat ? subs.filter((s) => s.payload.category === cat) : subs;

  return (
    <>
      <Stepper />
      <div className="mb-5 flex flex-wrap gap-1.5">
        <button className="chip" data-active={!cat} onClick={() => setCat(null)}>All</button>
        {CATEGORIES.map((c) => (
          <button key={c.slug} className="chip" data-active={cat === c.slug} onClick={() => setCat(c.slug)}>
            <span aria-hidden>{c.emoji}</span> {c.name}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="text-[var(--color-muted)]">Loading submissions…</p>
      ) : shown.length === 0 ? (
        <div className="card p-10 text-center text-[var(--color-muted)]">
          Nothing to vote on right now. <Link href="/community?tab=add" className="text-[var(--color-accent)] hover:underline">Add a spot →</Link>
        </div>
      ) : (
        <div className="space-y-4">
          {shown.map((s) => {
            const p = s.payload;
            const c = CATEGORIES.find((x) => x.slug === p.category);
            const hasVoted = voted.has(s.id);
            const isNew = Date.now() - new Date(s.created_at).getTime() < 3 * 864e5;
            return (
              <div key={s.id} className="card p-5">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <span className="text-2xl" aria-hidden>{c?.emoji ?? "📍"}</span>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold">{p.name}</h3>
                        {isNew && <span className="rounded bg-[var(--color-grape)]/15 px-1.5 py-0.5 text-[10px] font-bold uppercase text-[var(--color-grape)]">New</span>}
                      </div>
                      <p className="text-sm text-[var(--color-muted)]">
                        {[NEIGHBORHOODS.find((n) => n[0] === p.neighborhood)?.[1], p.area].filter(Boolean).join(" · ")}
                      </p>
                    </div>
                  </div>
                  <span className="text-[var(--color-leaf)]">{p.price_tier ? "₹".repeat(Number(p.price_tier)) : "₹"}</span>
                </div>

                {p.why && <p className="mt-3 text-sm">{p.why}</p>}
                {p.tags && (
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {p.tags.split(",").map((t) => t.trim()).filter(Boolean).map((t) => (
                      <span key={t} className="rounded bg-[var(--color-bg)] px-2 py-0.5 text-xs text-[var(--color-muted)]">{t}</span>
                    ))}
                  </div>
                )}

                <div className="mt-4 flex items-center gap-3">
                  <button
                    onClick={() => approve(s)}
                    disabled={hasVoted || busy === s.id}
                    className="inline-flex items-center gap-2 rounded-lg bg-[var(--color-leaf)] px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
                  >
                    👍 {hasVoted ? "Voted" : "Approve"}
                  </button>
                  <span className="nums text-sm text-[var(--color-muted)]">{s.votes}/{VOTES_NEEDED}</span>
                </div>
                <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-[var(--color-bg)]">
                  <div className="h-full rounded-full bg-[#e3b341]" style={{ width: `${Math.min(100, (s.votes / VOTES_NEEDED) * 100)}%` }} />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </>
  );
}

function AddTab({ onDone }: { onDone: () => void }) {
  const [tier, setTier] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const fd = new FormData(e.currentTarget);
    const payload = Object.fromEntries(fd.entries());
    if (!payload.name || !payload.category) {
      setError("Name and category are required.");
      return;
    }
    payload.price_tier = String(tier);
    setBusy(true);
    const supabase = createClient();
    const { error } = await supabase.from("submissions").insert({ payload, status: "pending" });
    setBusy(false);
    if (error) setError(error.message);
    else setDone(true);
  }

  if (done) {
    return (
      <div className="card p-10 text-center">
        <div className="text-4xl">🎉</div>
        <h3 className="mt-3 text-lg font-bold">Submitted for the community</h3>
        <p className="mt-1 text-sm text-[var(--color-muted)]">It needs {VOTES_NEEDED} approvals to go live. Rally your friends!</p>
        <button onClick={onDone} className="btn-accent mt-5">See spots to vote on</button>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <Field label="Place name *"><input name="name" required className="inp" placeholder="e.g. CTR (Shri Sagar)" /></Field>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Category *">
          <select name="category" required defaultValue="" className="inp">
            <option value="" disabled>Select</option>
            {CATEGORIES.map((c) => <option key={c.slug} value={c.slug}>{c.emoji} {c.name}</option>)}
          </select>
        </Field>
        <Field label="Subcategory"><input name="subcategory" className="inp" placeholder="Darshini, Andhra mess…" /></Field>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Address *"><input name="address" className="inp" placeholder="7th Cross, Margosa Rd" /></Field>
        <Field label="Neighbourhood *">
          <select name="neighborhood" defaultValue="" className="inp">
            <option value="">Select</option>
            {NEIGHBORHOODS.map(([s, n]) => <option key={s} value={s}>{n}</option>)}
          </select>
        </Field>
      </div>
      <Field label="Why is this spot great? *">
        <textarea name="why" rows={3} className="inp" placeholder="Mention prices, what to order, tips…" />
      </Field>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Price range *">
          <div className="flex gap-2">
            {PRICE_TIERS.map((t, i) => (
              <button
                key={t}
                type="button"
                onClick={() => setTier(i + 1)}
                className={`flex-1 rounded-lg border px-3 py-2 text-sm font-semibold ${tier === i + 1 ? "border-[var(--color-leaf)] bg-[var(--color-leaf)] text-white" : "border-[var(--color-line)]"}`}
              >
                {t}
              </button>
            ))}
          </div>
        </Field>
        <Field label="Avg price (₹)"><input name="avg_price" type="number" min="0" className="inp" placeholder="60" /></Field>
      </div>
      <Field label="Tags (comma-separated)"><input name="tags" className="inp" placeholder="late-night, cash-only, veg" /></Field>

      {error && <p className="text-sm text-red-600">{error}</p>}
      <button type="submit" disabled={busy} className="btn-accent w-full justify-center disabled:opacity-60">
        {busy ? "Submitting…" : "Submit Spot"}
      </button>
    </form>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-[var(--color-muted)]">{label}</span>
      {children}
    </label>
  );
}
