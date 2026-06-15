-- A few pending community submissions so the "Vote on Spots" tab has content.
-- Backed by real votes via cast_vote() so the counts stay consistent.

insert into submissions (id, payload, status) values
  ('00000000-0000-0000-0000-0000000000c1',
   '{"name":"Filter Coffadda","category":"coffee","neighborhood":"jayanagar","area":"Jayanagar 4th Block","address":"4th Block, Jayanagar","why":"₹15 filter coffee, standing only, an institution since 1980.","price_tier":"1","avg_price":"15","tags":"filter, iconic, cheap"}'::jsonb, 'pending'),
  ('00000000-0000-0000-0000-0000000000c2',
   '{"name":"New Thai Spot on Brigade","category":"food","neighborhood":"indiranagar","area":"Brigade Road","address":"Brigade Rd","why":"Just opened. Amazing pad see ew for ₹180. Weekday lunch under ₹150!","price_tier":"1","avg_price":"150","tags":"new, thai, lunch-special"}'::jsonb, 'pending'),
  ('00000000-0000-0000-0000-0000000000c3',
   '{"name":"Cult.fit - HSR","category":"fitness","neighborhood":"hsr-layout","area":"HSR 27th Main","address":"27th Main, HSR","why":"₹999/month unlimited classes, right off the main road.","price_tier":"2","avg_price":"999","tags":"gym, classes"}'::jsonb, 'pending'),
  ('00000000-0000-0000-0000-0000000000c4',
   '{"name":"Bhatkal Biryani Corner","category":"food","neighborhood":"btm-layout","area":"BTM 2nd Stage","address":"BTM 2nd Stage","why":"Coastal-style chicken biryani for ₹160, fragrant and not too oily.","price_tier":"1","avg_price":"160","tags":"biryani, coastal"}'::jsonb, 'pending')
on conflict (id) do nothing;

-- give them 4, 3, 2, 1 votes respectively
select cast_vote('00000000-0000-0000-0000-0000000000c1', 'seed' || g) from generate_series(1, 4) g;
select cast_vote('00000000-0000-0000-0000-0000000000c2', 'seed' || g) from generate_series(1, 3) g;
select cast_vote('00000000-0000-0000-0000-0000000000c3', 'seed' || g) from generate_series(1, 2) g;
select cast_vote('00000000-0000-0000-0000-0000000000c4', 'seed' || g) from generate_series(1, 1) g;
