import Link from "next/link";

export const metadata = { title: "Getting around Bengaluru on a budget — budgetblr" };

type Mode = {
  emoji: string;
  name: string;
  cost: string;
  bestFor: string;
  body: string;
};

const MODES: Mode[] = [
  {
    emoji: "🚇",
    name: "Namma Metro",
    cost: "₹10–₹60 per trip",
    bestFor: "Crossing the city, beating traffic",
    body: "Three lines running: Purple (Whitefield ↔ Challaghatta via MG Road), Green (Madavara ↔ Silk Institute) and the new Yellow Line (RV Road ↔ Bommasandra / Electronic City). Buy a contactless smart card for daily travel, or use the QR ticket in the official app / WhatsApp. Cheapest and fastest for long, cross-town hauls.",
  },
  {
    emoji: "🚌",
    name: "BMTC bus",
    cost: "₹6–₹35 (regular) · ₹35–₹90 (AC Vajra)",
    bestFor: "Daily commuters on a tight budget",
    body: "Ordinary buses are dirt cheap; the blue AC Vajra coaches cost more but are comfy for long ORR runs. If you commute daily, a monthly pass pays for itself in a week. Plan routes and track buses live on the official BMTC app (Tummoc/BMTC) — far less guesswork than flagging at the stop.",
  },
  {
    emoji: "🛺",
    name: "Auto rickshaw",
    cost: "₹30 base (1.9 km) + ~₹15/km",
    bestFor: "Short-to-mid trips, door to door",
    body: "Insist on the meter, or book through Namma Yatri — the driver-owned app that charges zero commission, so fares stay fair and drivers actually accept. Avoid 'one-and-a-half meter' haggling at night by booking in-app. A little cash helps for the rare QR-fail.",
  },
  {
    emoji: "🏍️",
    name: "Rapido (bike taxi)",
    cost: "₹25–₹80 for short hops",
    bestFor: "Solo riders, beating gridlock",
    body: "The cheapest motorised option for one person on a short trip — a bike weaves through traffic an auto can't. Great for the last 2–4 km to the metro or office. Carry your own helmet if you ride often.",
  },
  {
    emoji: "🚴",
    name: "Cycling / walking",
    cost: "Free",
    bestFor: "Sub-3 km trips, getting your steps",
    body: "Flat, leafy stretches in Jayanagar, Indiranagar and around Cubbon Park make short trips walkable. Yulu and Bounce e-bikes dot metro stations for cheap first/last-mile rides. Free, healthy, and you skip the traffic entirely.",
  },
];

const AIRPORT = [
  {
    option: "BMTC Vayu Vajra / Flybus",
    cost: "~₹250–₹350",
    note: "AC airport buses from ~15 points across the city (Majestic, Koramangala, Whitefield, Electronic City). Slowest but by far the cheapest — book or tap on board.",
    cheapest: true,
  },
  {
    option: "Metro + bus combo",
    cost: "~₹100–₹400",
    note: "Take the metro to a Vayu Vajra pickup, then the airport bus. Most economical if you're already near a line; takes planning.",
    cheapest: false,
  },
  {
    option: "Cab (Uber / Ola / pre-paid)",
    cost: "₹900–₹1,500+",
    note: "Fastest door-to-door, especially late at night, but KIAL is ~40 km out so it's pricey. Split with co-passengers to make it worth it.",
    cheapest: false,
  },
  {
    option: "Blue Line metro (upcoming)",
    cost: "TBD — expected budget-friendly",
    note: "The under-construction Blue Line will eventually connect the city to KIAL directly. Not open yet — watch this space.",
    cheapest: false,
  },
];

export default function TransportPage() {
  return (
    <div>
      <section className="bg-paper border-b border-[var(--color-line)]">
        <div className="mx-auto max-w-6xl px-4 py-14 sm:py-20">
          <span className="chip" data-active="true">🛺 Move smart, spend less</span>
          <h1 className="mt-5 max-w-3xl text-4xl font-bold leading-[1.05] tracking-tight sm:text-5xl">
            Getting around Bengaluru on a{" "}
            <span className="text-[var(--color-accent)]">budget.</span>
          </h1>
          <p className="mt-5 max-w-2xl text-lg text-[var(--color-muted)]">
            Bengaluru traffic is legendary — but you don't need a car or pricey cabs. Here's every
            way to get around, ranked by cost, with rough fares and what each one's actually best for.
          </p>
        </div>
      </section>

      {/* modes */}
      <section className="mx-auto max-w-6xl px-4 py-12">
        <h2 className="mb-5 text-sm font-semibold uppercase tracking-wide text-[var(--color-muted)]">
          Ways to get around
        </h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {MODES.map((m) => (
            <div key={m.name} className="card flex flex-col p-5">
              <div className="flex items-baseline gap-2">
                <span className="text-2xl">{m.emoji}</span>
                <h3 className="text-lg font-semibold">{m.name}</h3>
              </div>
              <div className="mt-2 flex flex-wrap gap-2">
                <span className="chip">{m.cost}</span>
                <span className="chip">Best for: {m.bestFor}</span>
              </div>
              <p className="mt-3 text-sm leading-relaxed text-[var(--color-muted)]">{m.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* namma yatri vs uber/ola */}
      <section className="mx-auto max-w-6xl px-4 pb-4">
        <div className="card p-6">
          <h2 className="text-xl font-semibold">Namma Yatri vs Uber / Ola</h2>
          <p className="mt-2 max-w-3xl text-sm leading-relaxed text-[var(--color-muted)]">
            For autos, <strong className="text-[var(--color-ink)]">Namma Yatri</strong> is the
            local's pick — it's an open, driver-owned platform that takes no commission, so fares
            track the government meter and drivers don't cancel. Uber and Ola are handy for cabs and
            late-night certainty, but tack on surge pricing and platform fees. Rule of thumb: autos
            on Namma Yatri, cabs on whichever app is cheaper that moment.
          </p>
        </div>
      </section>

      {/* airport */}
      <section className="mx-auto max-w-6xl px-4 py-4 pb-16">
        <h2 className="mb-5 text-sm font-semibold uppercase tracking-wide text-[var(--color-muted)]">
          To/from the airport (KIAL), cheapest first
        </h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {AIRPORT.map((a) => (
            <div
              key={a.option}
              className="card p-5"
              style={a.cheapest ? { borderColor: "var(--color-accent)" } : undefined}
            >
              <div className="flex items-center justify-between gap-2">
                <h3 className="text-lg font-semibold">{a.option}</h3>
                {a.cheapest && (
                  <span className="chip" data-active="true">Cheapest</span>
                )}
              </div>
              <div className="mt-2 text-base font-semibold text-[var(--color-accent)]">{a.cost}</div>
              <p className="mt-2 text-sm leading-relaxed text-[var(--color-muted)]">{a.note}</p>
            </div>
          ))}
        </div>
        <div className="mt-8 rounded-[var(--radius)] border border-[var(--color-line)] bg-[var(--color-surface)] p-5 text-sm text-[var(--color-muted)]">
          New in town? Pair this with our{" "}
          <Link href="/guide" className="font-semibold text-[var(--color-accent)] hover:underline">
            first-week guide
          </Link>{" "}
          and browse{" "}
          <Link href="/spots" className="font-semibold text-[var(--color-accent)] hover:underline">
            budget spots
          </Link>{" "}
          near your line.
        </div>
      </section>
    </div>
  );
}
