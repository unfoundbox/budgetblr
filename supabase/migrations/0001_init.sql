-- budgetblr — initial schema
-- "Living in Bangalore on a budget": crowdsourced directory of affordable spots.

-- ───────────────────────────── extensions ─────────────────────────────
create extension if not exists postgis;
create extension if not exists pg_trgm;

-- ───────────────────────────── enums ──────────────────────────────────
create type spot_status   as enum ('pending', 'approved', 'rejected');
create type price_unit     as enum ('per_plate', 'per_person', 'per_month', 'per_visit', 'per_day', 'free');
create type price_band     as enum ('free', 'under_100', 'under_300', 'under_1000', 'any');
create type metro_line     as enum ('purple', 'green', 'yellow', 'pink', 'blue', 'none');
create type user_role       as enum ('user', 'admin');

-- ───────────────────────────── profiles ───────────────────────────────
-- Mirrors auth.users; holds public handle + role for moderation.
create table profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  handle      text unique,
  role        user_role not null default 'user',
  created_at  timestamptz not null default now()
);

-- ───────────────────────────── reference data ─────────────────────────
create table categories (
  id     smallint generated always as identity primary key,
  slug   text unique not null,
  name   text not null,
  emoji  text not null,
  blurb  text,
  sort   smallint not null default 0
);

create table neighborhoods (
  id          smallint generated always as identity primary key,
  slug        text unique not null,
  name        text not null,
  centroid    geography(Point, 4326),
  lat         double precision generated always as (ST_Y(centroid::geometry)) stored,
  lng         double precision generated always as (ST_X(centroid::geometry)) stored,
  blurb       text,
  rent_low    integer,        -- ₹/month, indicative 1BHK floor
  rent_high   integer,        -- ₹/month, indicative ceiling
  commute_note text,
  sort        smallint not null default 0
);

create table metro_stations (
  id        smallint generated always as identity primary key,
  name      text not null,
  line      metro_line not null,
  geom      geography(Point, 4326) not null,
  lat       double precision generated always as (ST_Y(geom::geometry)) stored,
  lng       double precision generated always as (ST_X(geom::geometry)) stored,
  is_open   boolean not null default true   -- false = under construction (e.g. Yellow Line)
);

create table tags (
  id    smallint generated always as identity primary key,
  slug  text unique not null,
  label text not null
);

-- ───────────────────────────── spots ──────────────────────────────────
create table spots (
  id            uuid primary key default gen_random_uuid(),
  slug          text unique not null,
  name          text not null,
  category_id   smallint not null references categories(id),
  neighborhood_id smallint references neighborhoods(id),
  geom          geography(Point, 4326),
  lat           double precision generated always as (ST_Y(geom::geometry)) stored,
  lng           double precision generated always as (ST_X(geom::geometry)) stored,
  address       text,

  price_min     integer,           -- ₹
  price_max     integer,           -- ₹
  price_unit    price_unit not null default 'per_person',
  price_band    price_band not null default 'any',

  description   text,
  why_worth_it  text,
  hours         jsonb,             -- { mon: "7:00-22:00", ... }
  external_url  text,
  instagram     text,
  image_url     text,

  nearest_metro_id smallint references metro_stations(id),
  metro_walk_min   smallint,        -- minutes on foot to nearest metro

  status        spot_status not null default 'pending',
  submitted_by  uuid references profiles(id) on delete set null,
  locals_count  integer not null default 0,   -- denormalized save count
  search        tsvector,

  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create table spot_tags (
  spot_id uuid references spots(id) on delete cascade,
  tag_id  smallint references tags(id) on delete cascade,
  primary key (spot_id, tag_id)
);

-- saves = "locals" who vouch for a spot
create table saves (
  user_id   uuid references profiles(id) on delete cascade,
  spot_id   uuid references spots(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, spot_id)
);

-- ───────────────────────────── events ─────────────────────────────────
create table events (
  id         uuid primary key default gen_random_uuid(),
  title      text not null,
  spot_id    uuid references spots(id) on delete set null,
  venue      text,
  neighborhood_id smallint references neighborhoods(id),
  starts_at  timestamptz not null,
  ends_at    timestamptz,
  price      integer,            -- ₹, null/0 = free
  is_free    boolean generated always as (price is null or price = 0) stored,
  description text,
  link       text,
  status     spot_status not null default 'pending',
  created_at timestamptz not null default now()
);

-- raw add-a-spot submissions feeding the moderation queue
create table submissions (
  id          uuid primary key default gen_random_uuid(),
  payload     jsonb not null,     -- proposed spot fields
  submitted_by uuid references profiles(id) on delete set null,
  status      spot_status not null default 'pending',
  spot_id     uuid references spots(id) on delete set null, -- set when approved
  created_at  timestamptz not null default now()
);

create table newsletter_subscribers (
  id         uuid primary key default gen_random_uuid(),
  email      text unique not null,
  source     text,
  created_at timestamptz not null default now()
);

-- ───────────────────────────── indexes ────────────────────────────────
create index spots_geom_idx        on spots using gist (geom);
create index spots_category_idx    on spots (category_id);
create index spots_neighborhood_idx on spots (neighborhood_id);
create index spots_status_idx      on spots (status);
create index spots_price_band_idx  on spots (price_band);
create index spots_search_idx      on spots using gin (search);
create index spots_name_trgm_idx   on spots using gin (name gin_trgm_ops);
create index metro_geom_idx        on metro_stations using gist (geom);
create index neighborhoods_centroid_idx on neighborhoods using gist (centroid);
create index events_starts_idx     on events (starts_at);

-- ───────────────────────── triggers / functions ───────────────────────
-- keep search vector + updated_at fresh
create or replace function spots_before_write() returns trigger as $$
begin
  new.search :=
    setweight(to_tsvector('simple', coalesce(new.name, '')), 'A') ||
    setweight(to_tsvector('simple', coalesce(new.description, '')), 'C') ||
    setweight(to_tsvector('simple', coalesce(new.why_worth_it, '')), 'C');
  new.updated_at := now();
  return new;
end;
$$ language plpgsql;

create trigger spots_before_write_trg
  before insert or update on spots
  for each row execute function spots_before_write();

-- maintain denormalized locals_count
create or replace function saves_count_sync() returns trigger as $$
begin
  if tg_op = 'INSERT' then
    update spots set locals_count = locals_count + 1 where id = new.spot_id;
  elsif tg_op = 'DELETE' then
    update spots set locals_count = greatest(locals_count - 1, 0) where id = old.spot_id;
  end if;
  return null;
end;
$$ language plpgsql;

create trigger saves_count_trg
  after insert or delete on saves
  for each row execute function saves_count_sync();

-- auto-create a profile row when a user signs up
create or replace function handle_new_user() returns trigger as $$
begin
  insert into profiles (id, handle)
  values (new.id, split_part(new.email, '@', 1))
  on conflict (id) do nothing;
  return new;
end;
$$ language plpgsql security definer set search_path = public;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- assign nearest metro station to a spot (used during seeding / submission approval)
create or replace function nearest_metro(p geography)
returns smallint as $$
  select id from metro_stations
  where is_open
  order by geom <-> p
  limit 1;
$$ language sql stable;

-- RPC: spots near a lat/lng within radius (metres), approved only
create or replace function spots_nearby(lat double precision, lng double precision, radius_m integer default 3000)
returns setof spots as $$
  select * from spots
  where status = 'approved'
    and geom is not null
    and ST_DWithin(geom, ST_MakePoint(lng, lat)::geography, radius_m)
  order by geom <-> ST_MakePoint(lng, lat)::geography;
$$ language sql stable;

-- ───────────────────────────── RLS ────────────────────────────────────
alter table profiles      enable row level security;
alter table spots         enable row level security;
alter table categories    enable row level security;
alter table neighborhoods enable row level security;
alter table metro_stations enable row level security;
alter table tags          enable row level security;
alter table spot_tags     enable row level security;
alter table saves         enable row level security;
alter table events        enable row level security;
alter table submissions   enable row level security;
alter table newsletter_subscribers enable row level security;

-- helper: is the current user an admin?
create or replace function is_admin() returns boolean as $$
  select exists (select 1 from profiles where id = auth.uid() and role = 'admin');
$$ language sql stable security definer set search_path = public;

-- reference tables: world-readable
create policy "read categories"     on categories     for select using (true);
create policy "read neighborhoods"  on neighborhoods  for select using (true);
create policy "read metro"          on metro_stations for select using (true);
create policy "read tags"           on tags           for select using (true);
create policy "read spot_tags"      on spot_tags      for select using (true);

-- spots: public sees approved; owner sees own; admin sees all
create policy "read approved spots" on spots for select
  using (status = 'approved' or submitted_by = auth.uid() or is_admin());
create policy "admin write spots"   on spots for all
  using (is_admin()) with check (is_admin());

-- events: public sees approved
create policy "read approved events" on events for select
  using (status = 'approved' or is_admin());
create policy "admin write events"   on events for all
  using (is_admin()) with check (is_admin());

-- profiles: readable by all (public handles), self-update only
create policy "read profiles"        on profiles for select using (true);
create policy "update own profile"   on profiles for update using (id = auth.uid());

-- saves: a user manages their own
create policy "read own saves"   on saves for select using (user_id = auth.uid());
create policy "insert own saves" on saves for insert with check (user_id = auth.uid());
create policy "delete own saves" on saves for delete using (user_id = auth.uid());

-- submissions: anyone may propose a spot (anon allowed for MVP — no login wall);
-- authed users own theirs. Admins see/manage all via the policies below.
create policy "insert submission"    on submissions for insert
  with check (submitted_by is null or submitted_by = auth.uid());
create policy "read own submissions" on submissions for select using (submitted_by = auth.uid() or is_admin());
create policy "admin update submissions" on submissions for update using (is_admin()) with check (is_admin());

-- newsletter: anyone can subscribe (insert), nobody can read via API
create policy "subscribe" on newsletter_subscribers for insert with check (true);

-- ─────────────────────────── grants ───────────────────────────
-- RLS governs *rows*; roles still need table-level privileges. RLS policies
-- above remain the real gatekeeper for what each role can actually see/do.
grant usage on schema public to anon, authenticated, service_role;
grant select on all tables in schema public to anon, authenticated;
grant insert, update, delete on all tables in schema public to authenticated;
grant insert on newsletter_subscribers to anon;          -- subscribe while logged out
grant insert on submissions to anon;                     -- propose a spot without login (MVP)
grant usage, select on all sequences in schema public to anon, authenticated;
-- service_role bypasses RLS but still needs table privileges (used by admin tasks/seed)
grant all on all tables in schema public to service_role;
grant all on all sequences in schema public to service_role;
grant execute on function spots_nearby(double precision, double precision, integer) to anon, authenticated;
grant execute on function is_admin() to anon, authenticated;
