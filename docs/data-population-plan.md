# budgetblr — Data population plan (places & events)

Plan only — how we grow the directory from the current seed to a dense, fresh,
trustworthy map of budget Bengaluru. No implementation here.

## Where we are today

- **~144 spots + ~24 events**, web-researched and adversarially verified, committed as
  `supabase/seed/01_reference.sql` (categories, 11 neighbourhoods, 51 metro stations),
  `02_spots.sql` (generated), `03_community.sql` (a few pending submissions).
- Generation tooling already exists: `scripts/seed/build-seed.mjs` turns a JSON dataset
  (`scripts/seed/data.json`) into SQL, computing slug, price band, `geom`, and nearest metro.
- A multi-agent research Workflow produced the original dataset (fan-out per category →
  adversarial verify → dedup → synthesize).

**Target:** 500–800 high-quality spots and a rolling 60–90 days of events, kept fresh.

## Guardrails (the quality bar)

1. **Real & operating.** Every spot must be a place a local could walk into this month.
2. **Actually budget.** It must be genuinely cheap for its category — not just "has a cheap item".
3. **Honest prices in ₹**, with a sensible `price_unit` (per_plate / per_person / per_month…).
4. **Attributed & de-duplicated** — no fabricated names, no duplicates by name+area.
5. **Geocoded** — lat/lng inside BLR bounds; nearest metro auto-assigned by the DB function.
6. **"Last verified" date** so stale entries can be re-checked or retired.

> Schema note (phase 0): add `source text` and `last_verified date` to `spots` so every
> row records where it came from and when it was last confirmed.

## Sources, in priority order

| Source | Best for | Notes |
|---|---|---|
| **AI web research** (current pipeline) | iconic/local-loved spots, the long tail | already proven; scale it up |
| **Community submissions + 5-vote voting** | freshness, local truth | already live (`/community`) — the flywheel |
| **Google Places API** | hours, ratings, photos, precise coords, "is it open" | needs key + cost control; great for enrichment |
| **Zomato / Swiggy (where ToS permits)** | food pricing, menus, areas | care with ToS/rate limits |
| **Instagram (@budgetblr + local food pages)** | new openings, trends | manual/curated, not scraped |
| **Reddit r/bangalore, Twitter/X, LBB, blogs** | recommendations, sentiment | research-agent inputs |
| **Events: Insider.in, BookMyShow, Meetup, Townscript, run-club & flea pages** | the events feed | scrape/curate per-source |

## Approach — three phases

### Phase 1 — Deepen via research (no new keys)
Re-run the research Workflow with bigger fan-out and a per-neighbourhood pass to reach
**~400–500 spots**:
- Fan out by **category × neighbourhood** (10 × 11) so each cell is covered, not just the
  central ones. Bias toward under-served areas (Hebbal, Electronic City, Marathahalli, JP Nagar).
- Each agent returns the structured spot shape (`scripts/seed/build-seed.mjs` already consumes it).
- **Verify stage**: a second agent must find evidence each place is real/open/budget; default
  to dropping on no evidence; `log()` everything dropped (no silent truncation).
- **Dedup**: by normalized `name+area`; merge near-duplicates.
- Output → `data.json` → `build-seed.mjs` → `02_spots.sql` → `supabase db reset` (local), then
  apply the delta to cloud.

### Phase 2 — Enrich & keep fresh (Google Places)
- A nightly/weekly job matches each spot to a Google Place (by name + coords) and refreshes
  **hours, rating, price level, a photo, and open/closed status**.
- Flip `last_verified`; auto-flag permanently-closed places for review (don't hard-delete).
- Keep Places usage within the free tier with caching + only re-checking the oldest N rows.

### Phase 3 — Community flywheel (already wired)
- `/community` submissions → **5 votes → auto-promoted** to a live spot (`cast_vote`).
- Lightweight ops: a weekly review of approved/submitted spots; reward prolific contributors
  via the Instagram/newsletter shout-outs.
- This is the long-term engine; phases 1–2 just seed it richly.

## Events pipeline

Events are time-bound, so freshness matters more than volume:
- **Recurring** (run clubs, Cubbon Reads, open mics, flea markets, jam nights): model as
  templates with a cadence; regenerate upcoming dates weekly.
- **One-off** (Insider/BookMyShow/Meetup): a weekly research/scrape pass pulls free & cheap
  (≤ ₹500) events for the next ~6 weeks; dedup by title+date+venue; link back to the source.
- Tag each event with `neighborhood_id` and `is_free`; the `/events` page already filters by
  Free + neighbourhood and renders a calendar.
- Retire past events (or keep for a "what happened" archive) via a scheduled cleanup.

## Cadence & ops

- **Weekly**: events refresh; community queue review; Places re-verify the oldest 100 spots.
- **Monthly**: a research top-up pass for any thin category/area; prune closed places.
- **Per release**: regenerate `02_spots.sql`, apply the migration/seed delta to cloud, redeploy.

## Success metrics

- Coverage: spots per neighbourhood (target ≥ 25 in each of the 11) and per category.
- Freshness: % of spots verified in the last 90 days.
- Trust: community vote pass-rate; reported-wrong rate per 1,000 views.
- Engagement (via the new analytics): map opens, searches, spot detail views, submissions.

## Open decisions

- Google Places vs Zomato as the primary enrichment source (cost vs coverage).
- Whether to store photos in Supabase Storage or hot-link source images (licensing).
- Auto-retire vs human-review for "closed" flags.
