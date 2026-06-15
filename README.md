# budgetblr

**Living in Bengaluru on a budget** — a crowdsourced, map-driven directory of the city's
best budget spots (darshinis, ₹30 dosas, value PGs, microbreweries, coworking, gyms, free
things to do) plus a newcomer guide. A Bengaluru-localized take on
[budgetsf.com](https://budgetsf.com).

## Stack

- **Next.js 16** (App Router, RSC, TypeScript) + **Tailwind CSS v4**
- **Supabase** — Postgres + PostGIS, Auth-ready, Row Level Security
- **MapLibre GL** with free CARTO basemap tiles

## Features

- Directory with category / price-band / neighbourhood / search filters (`/spots`)
- Spot detail pages with nearest **Namma Metro** station, directions, SEO metadata
- Clustered **map** of every spot (`/map`)
- **Add a spot** → moderation queue → token-gated admin approval (`/submit`, `/admin`)
- **Events** (free/budget things to do), **My Picks** (localStorage), **Newsletter**
- Heavy Bengaluru localization: metro-aware spots, **transport guide** (Namma Yatri /
  Rapido / BMTC / KIAL), **newcomer first-week guide** (SIM, Aadhaar/PAN, rent agreement,
  PG vs flat), **neighbourhood pages** with indicative rents

## Getting started

```bash
npm install
cp .env.example .env.local        # fill from `supabase status`
npx supabase start                # local Postgres + PostGIS (needs Docker)
npm run db:reset                  # applies migration + seeds reference & spots
npm run dev                       # http://localhost:3000
```

`.env.local` needs `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`,
`SUPABASE_SERVICE_ROLE_KEY` (server-only, used by seed + admin) and `ADMIN_TOKEN`
(visit `/admin?token=…` to moderate).

## Data model

`supabase/migrations/0001_init.sql` — PostGIS-enabled schema: `spots`, `categories`,
`neighborhoods`, `metro_stations`, `tags`/`spot_tags`, `saves`, `events`, `submissions`,
`newsletter_subscribers`, `profiles`. Spots store `geom` (geography) with generated
`lat`/`lng` columns; a trigger keeps the full-text `search` vector and `locals_count`
fresh; `nearest_metro()` assigns the closest station. RLS exposes only `approved` rows
publicly and routes additions through `submissions`.

## Seeding

The seed has two parts:

- `supabase/seed/01_reference.sql` — hand-authored categories, 11 neighbourhoods, 51
  metro stations.
- `supabase/seed/02_spots.sql` — **generated** from `scripts/seed/data.json` (144 real,
  web-researched & adversarially-verified BLR spots + 24 events) by
  `scripts/seed/build-seed.mjs` (`npm run seed`). `data.json` was produced by a
  multi-agent research workflow (fan-out per category → verify → dedupe).

To refresh: edit/replace `scripts/seed/data.json`, then `npm run seed && npm run db:reset`.

## Roadmap (phase 2)

Real auth + admin roles (replace the `ADMIN_TOKEN` gate), photo uploads, community
voting, and external data enrichment (Google Places / Zomato) with a "last verified"
badge.
