"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

function SignupForm() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [message, setMessage] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!email.trim()) return;
    setStatus("loading");
    setMessage("");

    const supabase = createClient();
    const { error } = await supabase
      .from("newsletter_subscribers")
      .insert({ email: email.trim().toLowerCase(), source: "newsletter_page" });

    // 23505 = already subscribed — treat as success, not an error.
    if (error && error.code !== "23505") {
      setStatus("error");
      setMessage("Hmm, that didn't go through. Mind trying again?");
      return;
    }

    setStatus("done");
    setEmail("");
  }

  if (status === "done") {
    return (
      <div className="rounded-[var(--radius)] border border-[var(--color-accent)] bg-[var(--color-accent-soft)] p-5">
        <p className="font-semibold">You're on the list 🎉</p>
        <p className="mt-1 text-sm text-[var(--color-muted)]">
          Watch your inbox this Friday for the first drop. Filter coffee on us (spiritually).
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3 sm:flex-row">
      <input
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="you@email.com"
        disabled={status === "loading"}
        className="w-full flex-1 rounded-full border border-[var(--color-line)] bg-[var(--color-surface)] px-5 py-2.5 text-sm outline-none focus:border-[var(--color-accent)] disabled:opacity-60"
      />
      <button type="submit" disabled={status === "loading"} className="btn-accent justify-center disabled:opacity-60">
        {status === "loading" ? "Signing up…" : "Get the Friday drop"}
      </button>
      {status === "error" && (
        <p className="text-sm text-[var(--color-accent)] sm:basis-full">{message}</p>
      )}
    </form>
  );
}

export default function NewsletterPage() {
  return (
    <div>
      <section className="bg-paper border-b border-[var(--color-line)]">
        <div className="mx-auto max-w-3xl px-4 py-16 sm:py-24">
          <span className="chip" data-active="true">📨 Weekly, every Friday</span>
          <h1 className="mt-5 text-4xl font-bold leading-[1.05] tracking-tight sm:text-5xl">
            The <span className="text-[var(--color-accent)]">Friday drop.</span>
          </h1>
          <p className="mt-5 max-w-xl text-lg text-[var(--color-muted)]">
            One short email a week: the new budget spots locals just added, plus price corrections
            so you never get surprised at the counter. No spam, no fluff — just where to eat, drink
            and live cheap in Bengaluru.
          </p>

          <div className="mt-8 max-w-xl">
            <SignupForm />
            <p className="mt-3 text-xs text-[var(--color-muted)]">
              Free forever. Unsubscribe anytime — no hard feelings.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
