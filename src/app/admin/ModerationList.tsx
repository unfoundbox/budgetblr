"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { approveSubmission, rejectSubmission } from "./actions";

interface Submission {
  id: string;
  created_at: string;
  payload: Record<string, unknown>;
}

export function ModerationList({ submissions, token }: { submissions: Submission[]; token: string }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function act(fn: (t: string, id: string) => Promise<void>, id: string) {
    setError(null);
    start(async () => {
      try {
        await fn(token, id);
        router.refresh();
      } catch (e) {
        setError(e instanceof Error ? e.message : "Action failed");
      }
    });
  }

  if (submissions.length === 0) {
    return <p className="text-[var(--color-muted)]">Nothing in the queue. 🎉</p>;
  }

  return (
    <div className="space-y-3">
      {error && <p className="text-sm text-red-600">{error}</p>}
      {submissions.map((s) => {
        const p = s.payload;
        return (
          <div key={s.id} className="card p-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="font-semibold">{String(p.name ?? "Untitled")}</h3>
                <p className="text-sm text-[var(--color-muted)]">
                  {String(p.category ?? "?")} · {String(p.neighborhood ?? p.area ?? "—")} ·{" "}
                  ₹{String(p.price_min ?? "?")}–{String(p.price_max ?? "?")} {String(p.price_unit ?? "")}
                </p>
                {p.why_worth_it ? <p className="mt-1 text-sm">{String(p.why_worth_it)}</p> : null}
              </div>
              <div className="flex shrink-0 gap-2">
                <button
                  disabled={pending}
                  onClick={() => act(approveSubmission, s.id)}
                  className="rounded-full bg-[var(--color-leaf)] px-3 py-1.5 text-sm font-semibold text-white disabled:opacity-50"
                >
                  Approve
                </button>
                <button
                  disabled={pending}
                  onClick={() => act(rejectSubmission, s.id)}
                  className="rounded-full border border-[var(--color-line)] px-3 py-1.5 text-sm disabled:opacity-50"
                >
                  Reject
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
