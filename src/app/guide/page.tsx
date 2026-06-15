import Link from "next/link";

export const metadata = { title: "New to Bengaluru? First-week guide — budgetblr" };

// Universal — relevant whether you're moving from another Indian city or abroad.
const CHECKLIST = [
  {
    emoji: "📄",
    title: "Rent agreement + police verification",
    body: "Most landlords do an 11-month registered agreement (₹500–₹1,500 stamp/registration). Insist on police verification (tenant + the cook/help) — it's free at the local station or online, and protects you later. Read the deposit clause: Bengaluru deposits run 2–10 months of rent.",
  },
  {
    emoji: "🏠",
    title: "PG vs flat vs coliving",
    body: "PG (₹8k–₹18k incl. food) is fastest for a soft landing. A shared 2BHK splits to ₹10k–₹20k each but needs a deposit + furniture. Coliving (Zolo, Colive, Settl, Stanza) is pricier but plug-and-play. See our breakdown below.",
  },
  {
    emoji: "🚇",
    title: "Metro QR / smart card",
    body: "Skip the token queue — use the Namma Metro QR ticket in the official app, or buy a contactless smart card at any station for daily travel. WhatsApp ticketing also works on the Purple/Green lines.",
  },
  {
    emoji: "🌐",
    title: "Broadband",
    body: "ACT Fibernet is the local favourite, with Airtel Xstream and Hathway close behind. Plans start ~₹500–₹700/month for 100+ Mbps. Ask your PG/landlord which provider already has a line in the building — it saves a week of install waiting.",
  },
  {
    emoji: "🔥",
    title: "Gas connection / cylinder",
    body: "If your flat isn't piped (GAIL), you'll use an Indane/HP/Bharat cylinder. Getting a new connection needs ID + address proof; refills are booked by app or a quick call and cost ~₹900. Many PGs and furnished flats already include this.",
  },
  {
    emoji: "📲",
    title: "Local SIM, if you need one",
    body: "Already on Jio/Airtel/Vi? Just port or keep roaming — no need to do anything. If you do want a fresh local number, prepaid unlimited-data packs run ~₹300–₹400/month with a photo ID and local address.",
  },
];

// Only really needed if you're arriving from another country.
const ABROAD = [
  {
    emoji: "📱",
    title: "Get an Indian SIM",
    body: "As a foreign national you'll need your passport + visa + a local address proof; activation can take a day for non-residents. Airtel/Jio prepaid is cheapest; airport/Matrix SIMs are convenient but pricier.",
  },
  {
    emoji: "🪪",
    title: "PAN card (Form 49AA)",
    body: "Foreign nationals can apply for a PAN using Form 49AA — you'll need it to open a bank account, sign a rent agreement and for any income. Apply online via NSDL/UTIITSL; it usually arrives within ~2 weeks.",
  },
  {
    emoji: "🏦",
    title: "Open an NRO/NRE account",
    body: "Open an NRO account (HDFC, ICICI, Axis) with your passport, visa, PAN and an address proof — it's what links you to UPI and salary. NRE is for money you bring in from abroad. Use Wise for the transfers rather than card-ATM forex rates.",
  },
  {
    emoji: "🛂",
    title: "FRRO registration",
    body: "On most long-term visas (student/employment, >180 days) you must register with the FRRO/FRO within 14 days of arrival on the e-FRRO portal. Keep your residential permit handy — landlords and banks may ask for it.",
  },
];

const LIVE = [
  { area: "Koramangala / HSR", note: "Startup central, walkable, pricier rents but everything's nearby." },
  { area: "Indiranagar", note: "Lively, metro-connected, eat-out heaven — budget by sharing." },
  { area: "Whitefield / Marathahalli", note: "Cheaper rents, close to ITPL/ORR tech parks." },
  { area: "Jayanagar / JP Nagar", note: "Leafy, old-Bangalore calm, great darshinis and value PGs." },
  { area: "Electronic City", note: "Cheapest if you work there — but a long haul to the centre." },
];

export default function GuidePage() {
  return (
    <div>
      <section className="bg-paper border-b border-[var(--color-line)]">
        <div className="mx-auto max-w-6xl px-4 py-14 sm:py-20">
          <span className="chip" data-active="true">👋 First week sorted</span>
          <h1 className="mt-5 max-w-3xl text-4xl font-bold leading-[1.05] tracking-tight sm:text-5xl">
            New to Bengaluru?{" "}
            <span className="text-[var(--color-accent)]">Start here.</span>
          </h1>
          <p className="mt-5 max-w-2xl text-lg text-[var(--color-muted)]">
            Just landed for that first job or college? Here's the no-fluff playbook for your first
            week in namma ooru — a roof, getting around, broadband and eating like a local without
            burning your stipend. Moving from abroad? There&apos;s a section for you too.
          </p>
        </div>
      </section>

      {/* checklist */}
      <section className="mx-auto max-w-6xl px-4 py-12">
        <h2 className="mb-5 text-sm font-semibold uppercase tracking-wide text-[var(--color-muted)]">
          Your first-week checklist
        </h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {CHECKLIST.map((c) => (
            <div key={c.title} className="card p-5">
              <div className="flex items-baseline gap-2">
                <span className="text-2xl">{c.emoji}</span>
                <h3 className="text-lg font-semibold">{c.title}</h3>
              </div>
              <p className="mt-2 text-sm leading-relaxed text-[var(--color-muted)]">{c.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* moving from abroad */}
      <section className="mx-auto max-w-6xl px-4 pb-4">
        <div className="rounded-[var(--radius)] border border-[var(--color-line)] bg-[var(--color-surface)] p-6">
          <div className="flex items-baseline gap-2">
            <h2 className="text-xl font-semibold">🌍 Moving to Bengaluru from abroad?</h2>
          </div>
          <p className="mt-2 max-w-2xl text-sm text-[var(--color-muted)]">
            If you already live in India you can skip this — you&apos;ve got a SIM, a bank account and
            a PAN/Aadhaar. These steps are for foreign nationals arriving on a visa.
          </p>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            {ABROAD.map((c) => (
              <div key={c.title} className="rounded-[var(--radius)] border border-[var(--color-line)] p-4">
                <div className="flex items-baseline gap-2">
                  <span className="text-xl">{c.emoji}</span>
                  <h3 className="font-semibold">{c.title}</h3>
                </div>
                <p className="mt-1.5 text-sm leading-relaxed text-[var(--color-muted)]">{c.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* where to live */}
      <section className="mx-auto max-w-6xl px-4 pb-4">
        <div className="card p-6">
          <h2 className="text-xl font-semibold">Where to live on a budget</h2>
          <p className="mt-2 max-w-2xl text-sm text-[var(--color-muted)]">
            Rent eats most of a fresher's salary, so pick by commute first. Roughly where the value is:
          </p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {LIVE.map((l) => (
              <div key={l.area} className="rounded-[var(--radius)] border border-[var(--color-line)] p-4">
                <div className="font-semibold">{l.area}</div>
                <div className="text-sm text-[var(--color-muted)]">{l.note}</div>
              </div>
            ))}
          </div>
          <Link href="/neighborhoods" className="btn-accent mt-5 text-sm">
            Compare all areas →
          </Link>
        </div>
      </section>

      {/* getting around + eating */}
      <section className="mx-auto max-w-6xl px-4 py-4">
        <div className="grid gap-4 lg:grid-cols-2">
          <div className="card p-6">
            <h2 className="text-xl font-semibold">🛺 Getting around cheaply</h2>
            <p className="mt-2 text-sm leading-relaxed text-[var(--color-muted)]">
              Namma Metro is the cheapest way to cross the city. For autos, use Namma Yatri (the
              driver-owned app — zero commission, fair meter fares) instead of haggling. Rapido bike
              taxis are unbeatable for solo short hops, and BMTC monthly passes pay off fast if you
              commute daily.
            </p>
            <Link href="/transport" className="mt-4 inline-flex text-sm font-semibold text-[var(--color-accent)] hover:underline">
              Full transport guide →
            </Link>
          </div>
          <div className="card p-6">
            <h2 className="text-xl font-semibold">🍛 Eating well for cheap</h2>
            <p className="mt-2 text-sm leading-relaxed text-[var(--color-muted)]">
              Bengaluru runs on <strong>darshinis</strong> — stand-and-eat joints where a plate of
              idli-vada or a masala dosa is ₹40–₹70 and filter coffee is ₹15–₹25. A working-lunch
              mess does unlimited thalis for ₹80–₹120. Cook breakfast, eat your big meal at a mess,
              and save delivery apps for treats.
            </p>
            <Link href="/spots?category=food" className="mt-4 inline-flex text-sm font-semibold text-[var(--color-accent)] hover:underline">
              Find cheap eats →
            </Link>
          </div>
        </div>
      </section>

      {/* money tips */}
      <section className="mx-auto max-w-6xl px-4 py-4">
        <div className="card p-6">
          <h2 className="text-xl font-semibold">💸 Money tips</h2>
          <ul className="mt-3 space-y-2 text-sm leading-relaxed text-[var(--color-muted)]">
            <li>
              <strong className="text-[var(--color-ink)]">UPI is everywhere.</strong> Set up GPay /
              PhonePe / Paytm — even the tender-coconut vendor has a QR. You'll rarely touch cash.
            </li>
            <li>
              <strong className="text-[var(--color-ink)]">Avoid forex fees.</strong> Moving from
              abroad? Use Wise or your bank's NRI account rather than card-swiping at ATM rates.
              Once you're on UPI, foreign cards become irrelevant.
            </li>
            <li>
              <strong className="text-[var(--color-ink)]">Use student / youth discounts.</strong>
              {" "}Cult.fit, BookMyShow, Zomato and many cafes run student offers. Carry your college
              ID — museums and Lalbagh/Cubbon events are often free or near-free.
            </li>
            <li>
              <strong className="text-[var(--color-ink)]">Split everything.</strong> Splitwise plus
              UPI is how the whole city settles flat rent, the Sunday biryani run and the auto fare.
            </li>
          </ul>
        </div>
      </section>

      {/* reality check */}
      <section className="mx-auto max-w-6xl px-4 py-4 pb-16">
        <div className="rounded-[var(--radius)] border border-[var(--color-accent)] bg-[var(--color-accent-soft)] p-6">
          <h2 className="text-xl font-semibold">⚠️ Bangalore reality check</h2>
          <ul className="mt-3 space-y-2 text-sm leading-relaxed text-[var(--color-ink)]">
            <li>
              <strong>Monsoon + traffic are real.</strong> May–October brings sudden downpours and
              flooded underpasses; a 6 km commute can take an hour. Live near where you work or near
              the metro — it's worth paying a little more in rent.
            </li>
            <li>
              <strong>Power cuts happen.</strong> Outages are short but frequent in some areas; check
              the building has an inverter or generator before you sign, especially if you work from home.
            </li>
            <li>
              <strong>Water can be tankered.</strong> Outer areas (Whitefield, Sarjapur, parts of the
              east) sometimes rely on water tankers rather than Cauvery supply. Ask the landlord how
              water comes in — it affects your monthly bills.
            </li>
            <li>
              <strong>Carry a little cash for autos.</strong> UPI works almost everywhere, but a
              ₹100 note for the odd auto or roadside stall saves you when a QR won't load.
            </li>
          </ul>
        </div>
      </section>
    </div>
  );
}
