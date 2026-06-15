import { listUpcomingEvents } from "@/lib/queries/spots";

export const metadata = { title: "Events" };

export default async function EventsPage() {
  const events = await listUpcomingEvents();

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="text-2xl font-bold tracking-tight">Budget & free things to do</h1>
      <p className="mb-6 text-[var(--color-muted)]">
        Run clubs, open mics, jam nights, flea markets, meetups — light on the wallet.
      </p>

      {events.length === 0 ? (
        <p className="text-[var(--color-muted)]">No events listed yet. Check back soon.</p>
      ) : (
        <ul className="space-y-3">
          {events.map((e) => {
            const d = new Date(e.starts_at);
            return (
              <li key={e.id} className="card flex items-center gap-4 p-4">
                <div className="grid h-14 w-14 shrink-0 place-items-center rounded-xl bg-[var(--color-accent-soft)] text-[var(--color-accent)]">
                  <div className="text-center leading-none">
                    <div className="text-lg font-bold">{d.getDate()}</div>
                    <div className="text-[10px] uppercase">{d.toLocaleString("en-IN", { month: "short" })}</div>
                  </div>
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold">{e.title}</h3>
                    <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${e.is_free ? "bg-[var(--color-leaf)]/15 text-[var(--color-leaf)]" : "bg-[var(--color-accent-soft)] text-[var(--color-accent)]"}`}>
                      {e.is_free ? "Free" : `₹${e.price}`}
                    </span>
                  </div>
                  <p className="truncate text-sm text-[var(--color-muted)]">
                    {[e.venue, e.neighborhood?.name].filter(Boolean).join(" · ")}
                    {e.description ? ` — ${e.description}` : ""}
                  </p>
                </div>
                {e.link && (
                  <a href={e.link} target="_blank" rel="noopener" className="chip shrink-0">Details</a>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
