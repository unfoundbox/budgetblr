-- Community moderation: anyone can vote on pending submissions; 5 votes promotes
-- a submission to a live spot (budgetsf-style "Submit → 5 votes → Goes live").

alter table submissions add column if not exists votes integer not null default 0;

create table if not exists submission_votes (
  submission_id uuid references submissions(id) on delete cascade,
  voter         text not null,          -- client-generated id (lightweight, like budgetsf)
  created_at    timestamptz not null default now(),
  primary key (submission_id, voter)
);
alter table submission_votes enable row level security;  -- locked; only cast_vote() writes

-- Anyone may see pending submissions (to vote on them); owners/admins see theirs.
drop policy if exists "read own submissions" on submissions;
create policy "read pending or own" on submissions for select
  using (status = 'pending' or submitted_by = auth.uid() or is_admin());

-- Build a live spot from a submission payload, mark it approved. SECURITY DEFINER
-- so it can write spots regardless of the caller's RLS.
create or replace function promote_submission(p_submission uuid)
returns uuid as $$
declare
  p      jsonb;
  v_name text;
  v_slug text;
  v_cat  smallint;
  v_nb   smallint;
  v_avg  integer;
  v_unit price_unit;
  v_band price_band;
  v_spot uuid;
  v_tag  text;
  v_tagid smallint;
begin
  select payload into p from submissions where id = p_submission and status = 'pending';
  if p is null then return null; end if;

  v_name := coalesce(p->>'name', 'Untitled');
  v_slug := regexp_replace(lower(v_name || ' ' || coalesce(p->>'area','')), '[^a-z0-9]+', '-', 'g');
  v_slug := trim(both '-' from left(v_slug, 70));
  if exists (select 1 from spots where slug = v_slug) then
    v_slug := v_slug || '-' || left(p_submission::text, 4);
  end if;

  select id into v_cat from categories where slug = p->>'category';
  select id into v_nb  from neighborhoods where slug = p->>'neighborhood';
  v_avg  := nullif(p->>'avg_price','')::integer;
  v_unit := coalesce(
    nullif(p->>'price_unit','')::price_unit,
    (case when p->>'category' in ('housing','fitness') then 'per_month' else 'per_person' end)::price_unit
  );
  v_band := case
    when v_avg is null then 'any'
    when v_avg = 0 then 'free'
    when v_unit = 'per_month' then 'any'
    when v_avg <= 100 then 'under_100'
    when v_avg <= 300 then 'under_300'
    when v_avg <= 1000 then 'under_1000'
    else 'any' end;

  insert into spots (slug, name, category_id, neighborhood_id, address, price_min, price_max,
                     price_unit, price_band, why_worth_it, description, status)
  values (v_slug, v_name, v_cat, v_nb, p->>'address', v_avg, v_avg, v_unit, v_band,
          p->>'why', p->>'why', 'approved')
  returning id into v_spot;

  -- tags: payload.tags can be a comma string or a json array
  for v_tag in
    select trim(t) from unnest(
      string_to_array(coalesce(p->>'tags', ''), ',')
    ) as t where trim(t) <> ''
  loop
    insert into tags (slug, label)
      values (regexp_replace(lower(v_tag), '[^a-z0-9]+', '-', 'g'), v_tag)
      on conflict (slug) do nothing;
    select id into v_tagid from tags where slug = regexp_replace(lower(v_tag), '[^a-z0-9]+', '-', 'g');
    insert into spot_tags (spot_id, tag_id) values (v_spot, v_tagid) on conflict do nothing;
  end loop;

  update submissions set status = 'approved', spot_id = v_spot where id = p_submission;
  return v_spot;
end;
$$ language plpgsql security definer set search_path = public;

-- Cast a community vote. Returns the new vote count. Promotes at 5 votes.
create or replace function cast_vote(p_submission uuid, p_voter text)
returns integer as $$
declare
  v_count integer;
  v_status spot_status;
begin
  insert into submission_votes (submission_id, voter)
    values (p_submission, p_voter)
    on conflict do nothing;

  select count(*) into v_count from submission_votes where submission_id = p_submission;
  update submissions set votes = v_count where id = p_submission
    returning status into v_status;

  if v_count >= 5 and v_status = 'pending' then
    perform promote_submission(p_submission);
  end if;
  return v_count;
end;
$$ language plpgsql security definer set search_path = public;

grant execute on function cast_vote(uuid, text) to anon, authenticated;
