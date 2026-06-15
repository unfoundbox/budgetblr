-- budgetblr reference seed: categories, neighborhoods, metro stations.
-- Stable, hand-authored facts. Spots/events are generated into 02_spots.sql
-- by the research pipeline (scripts/seed/build-seed.mjs).

-- ─────────────────────────── categories ───────────────────────────
insert into categories (slug, name, emoji, blurb, sort) values
  ('food',         'Food',          '🍛', 'Darshinis, mess, thalis, street food, biryani', 1),
  ('coffee',       'Coffee',        '☕', 'Filter coffee & budget cafes',                  2),
  ('bars',         'Bars & Drinks', '🍺', 'Microbreweries & cheap pints',                  3),
  ('grocery',      'Grocery',       '🧺', 'HOPCOMS, local markets, supermarkets',          4),
  ('fitness',      'Gym & Fitness', '🏋️', 'Gyms, cult.fit, parks',                         5),
  ('housing',      'Housing',       '🏠', 'PGs, coliving, flats & flatmates',              6),
  ('work',         'Work Spots',    '💻', 'Cafes, libraries, coworking',                   7),
  ('accelerators', 'Accelerators',  '🚀', 'Surge, Antler, YC-backed & more',               8),
  ('vcs',          'VCs',           '💸', 'Accel, Blume, Peak XV, Elevation',              9),
  ('services',     'Services',      '🧰', 'Laundry, salons, repair, tailors',             10)
on conflict (slug) do nothing;

-- ─────────────────────────── neighborhoods ───────────────────────────
-- rent_low/high = indicative ₹/month range for a modest 1BHK / good PG.
insert into neighborhoods (slug, name, centroid, blurb, rent_low, rent_high, commute_note, sort) values
  ('koramangala',    'Koramangala',     ST_MakePoint(77.6245,12.9352)::geography, 'Startup heartland — cafes, pubs, and the densest founder scene in the city.', 18000, 45000, 'Central; no metro yet but well-connected by road to HSR, Indiranagar.', 1),
  ('indiranagar',    'Indiranagar',     ST_MakePoint(77.6408,12.9719)::geography, '100ft Road nightlife, breweries, and the Purple Line runs right through it.', 20000, 50000, 'On the Purple Line (Indiranagar station). Easy metro to MG Road & Whitefield.', 2),
  ('hsr-layout',     'HSR Layout',      ST_MakePoint(77.6446,12.9116)::geography, 'Planned sectors, quiet PGs, and a fast-growing cafe + coworking belt.', 16000, 40000, 'No metro; auto/cab to Silk Board. Heavy traffic at Silk Board junction.', 3),
  ('btm-layout',     'BTM Layout',      ST_MakePoint(77.6101,12.9166)::geography, 'Budget-friendly, PG-dense, great cheap food — a classic first-job neighbourhood.', 12000, 28000, 'Green Line nearby; auto to Silk Board / Jayanagar.', 4),
  ('jayanagar',      'Jayanagar',       ST_MakePoint(77.5838,12.9250)::geography, 'Old-Bangalore charm, filter coffee, 4th Block market, leafy and calm.', 15000, 35000, 'Green Line (Jayanagar, RV Road interchange to Yellow Line).', 5),
  ('jp-nagar',       'JP Nagar',        ST_MakePoint(77.5854,12.9063)::geography, 'Residential, value rents, easy access to Jayanagar and Bannerghatta Road.', 14000, 32000, 'Green Line + upcoming connectivity; auto to Jayanagar.', 6),
  ('whitefield',     'Whitefield',      ST_MakePoint(77.7500,12.9698)::geography, 'IT corridor — ITPL, big tech offices, malls; now on the Purple Line.', 16000, 42000, 'Purple Line terminus (Whitefield/Kadugodi). Long but rail-connected to city.', 7),
  ('marathahalli',   'Marathahalli',    ST_MakePoint(77.6970,12.9560)::geography, 'Affordable, food-street energy, central to the ORR tech belt.', 14000, 34000, 'On ORR; no metro yet. Buses + autos to Bellandur/Whitefield.', 8),
  ('electronic-city','Electronic City', ST_MakePoint(77.6770,12.8452)::geography, 'Infosys/Wipro hub down south; cheapest rents, elevated expressway access.', 10000, 26000, 'Elevated expressway to city; Yellow Line now serves this corridor.', 9),
  ('hebbal',         'Hebbal',          ST_MakePoint(77.5970,13.0358)::geography, 'North Bangalore, closest budget base to the airport, lakeside flyover hub.', 14000, 34000, 'Best for KIAL airport runs; ORR + upcoming Blue Line (airport).', 10),
  ('bellandur',      'Bellandur',       ST_MakePoint(77.6780,12.9260)::geography, 'ORR tech corridor by the lake — gyms, gated PGs, weekend traffic.', 16000, 40000, 'ORR; no metro yet. Central to Ecospace/Embassy tech parks.', 11)
on conflict (slug) do nothing;

-- ─────────────────────────── metro stations ───────────────────────────
-- Namma Metro operational stations (approx coords). Purple = E↔W, Green = N↔S,
-- Yellow = RV Road↔Bommasandra (Electronic City corridor).
insert into metro_stations (name, line, geom, is_open) values
  -- Purple Line (selected, east → west)
  ('Whitefield (Kadugodi)', 'purple', ST_MakePoint(77.7585,12.9959)::geography, true),
  ('Hopefarm Channasandra', 'purple', ST_MakePoint(77.7480,12.9905)::geography, true),
  ('Kadugodi Tree Park',    'purple', ST_MakePoint(77.7600,12.9920)::geography, true),
  ('Pattandur Agrahara',    'purple', ST_MakePoint(77.7250,12.9860)::geography, true),
  ('Sri Sathya Sai Hospital','purple',ST_MakePoint(77.7170,12.9800)::geography, true),
  ('Nallurhalli',           'purple', ST_MakePoint(77.7110,12.9710)::geography, true),
  ('Kundalahalli',          'purple', ST_MakePoint(77.7150,12.9590)::geography, true),
  ('Garudacharpalya',       'purple', ST_MakePoint(77.7030,12.9930)::geography, true),
  ('Mahadevapura',          'purple', ST_MakePoint(77.6890,12.9960)::geography, true),
  ('Baiyappanahalli',       'purple', ST_MakePoint(77.6520,12.9908)::geography, true),
  ('Swami Vivekananda Road', 'purple', ST_MakePoint(77.6450,12.9856)::geography, true),
  ('Indiranagar',           'purple', ST_MakePoint(77.6386,12.9784)::geography, true),
  ('Halasuru',              'purple', ST_MakePoint(77.6266,12.9762)::geography, true),
  ('Trinity',               'purple', ST_MakePoint(77.6166,12.9730)::geography, true),
  ('MG Road',               'purple', ST_MakePoint(77.6195,12.9756)::geography, true),
  ('Cubbon Park',           'purple', ST_MakePoint(77.5990,12.9770)::geography, true),
  ('Vidhana Soudha',        'purple', ST_MakePoint(77.5920,12.9790)::geography, true),
  ('Sir M. Visvesvaraya',   'purple', ST_MakePoint(77.5860,12.9760)::geography, true),
  ('Nadaprabhu Kempegowda (Majestic)', 'purple', ST_MakePoint(77.5720,12.9756)::geography, true),
  ('Vijayanagar',           'purple', ST_MakePoint(77.5370,12.9700)::geography, true),
  ('Mysuru Road',           'purple', ST_MakePoint(77.5260,12.9480)::geography, true),
  ('Kengeri',               'purple', ST_MakePoint(77.4830,12.9100)::geography, true),
  ('Challaghatta',          'purple', ST_MakePoint(77.4720,12.9000)::geography, true),
  -- Green Line (selected, north → south)
  ('Nagasandra',            'green',  ST_MakePoint(77.5000,13.0480)::geography, true),
  ('Dasarahalli',           'green',  ST_MakePoint(77.5120,13.0430)::geography, true),
  ('Peenya',                'green',  ST_MakePoint(77.5200,13.0290)::geography, true),
  ('Yeshwantpur',           'green',  ST_MakePoint(77.5540,13.0230)::geography, true),
  ('Mahalakshmi',           'green',  ST_MakePoint(77.5490,13.0030)::geography, true),
  ('Rajajinagar',           'green',  ST_MakePoint(77.5550,12.9960)::geography, true),
  ('Mantri Square Sampige', 'green',  ST_MakePoint(77.5700,12.9910)::geography, true),
  ('Majestic (Green)',      'green',  ST_MakePoint(77.5720,12.9756)::geography, true),
  ('Chickpete',             'green',  ST_MakePoint(77.5760,12.9670)::geography, true),
  ('KR Market',             'green',  ST_MakePoint(77.5770,12.9620)::geography, true),
  ('National College',      'green',  ST_MakePoint(77.5740,12.9500)::geography, true),
  ('Lalbagh',               'green',  ST_MakePoint(77.5800,12.9460)::geography, true),
  ('South End Circle',      'green',  ST_MakePoint(77.5790,12.9380)::geography, true),
  ('Jayanagar',             'green',  ST_MakePoint(77.5800,12.9300)::geography, true),
  ('Rashtreeya Vidyalaya Road', 'green', ST_MakePoint(77.5810,12.9210)::geography, true),
  ('Banashankari',          'green',  ST_MakePoint(77.5740,12.9150)::geography, true),
  ('Jaya Prakash Nagar',    'green',  ST_MakePoint(77.5730,12.9070)::geography, true),
  ('Yelachenahalli',        'green',  ST_MakePoint(77.5710,12.8950)::geography, true),
  ('Silk Institute',        'green',  ST_MakePoint(77.5520,12.8620)::geography, true),
  -- Yellow Line (RV Road ↔ Bommasandra / Electronic City corridor)
  ('Ragigudda',             'yellow', ST_MakePoint(77.5870,12.9120)::geography, true),
  ('Jayadeva Hospital',     'yellow', ST_MakePoint(77.5990,12.9180)::geography, true),
  ('BTM Layout',            'yellow', ST_MakePoint(77.6100,12.9166)::geography, true),
  ('Silk Board',            'yellow', ST_MakePoint(77.6230,12.9170)::geography, true),
  ('HSR Layout',            'yellow', ST_MakePoint(77.6446,12.9116)::geography, true),
  ('Bommanahalli',          'yellow', ST_MakePoint(77.6380,12.9060)::geography, true),
  ('Hosa Road',             'yellow', ST_MakePoint(77.6470,12.8880)::geography, true),
  ('Electronic City',       'yellow', ST_MakePoint(77.6770,12.8452)::geography, true),
  ('Bommasandra',           'yellow', ST_MakePoint(77.6900,12.8050)::geography, true)
on conflict do nothing;
