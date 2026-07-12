-- Backfills `destinations` / `destination_categories` / `destination_experiences`
-- from the existing `locations` table, using the exact same clustering rule
-- already proven correct against production data in
-- src/lib/locationMarkers.js: rows are the same destination if they share a
-- normalized name AND are within 30m of each other (single-linkage — a row can
-- match ANY row already in the cluster, not just the first). That specific
-- radius was chosen from real observed cases: Mackenzies Café Bar & Grill (one
-- business, 2 rows, 11m apart) needed to merge; Village Street Parking 5 and
-- Aotea Gifts Tekapo (2 rows each, same name, 61-207m apart) are genuinely
-- distinct places and must NOT merge. 30m sits cleanly between those.
--
-- Run this immediately after 0006_destinations.sql, in the same Supabase SQL
-- editor session. Safe to re-run: it fully rebuilds the three tables from
-- `locations` every time rather than appending, so an imperfect first pass can
-- simply be corrected and re-run.
--
-- One category per destination gets a single placeholder experience row named
-- after the category itself (e.g. "activities" -> "Activities"). The old
-- schema never captured individual experience names (Glacier Explorer, Scenic
-- Flights, etc.), so this is the most this migration can honestly reconstruct
-- — expand these into real named experiences via the admin panel afterward.

truncate table destination_experiences, destination_categories, destinations cascade;

drop table if exists _dest_candidates;
create temporary table _dest_candidates (
  destination_id uuid,
  name_key text,
  latitude double precision,
  longitude double precision
);

do $$
declare
  loc record;
  cand record;
  existing_dest_id uuid;
  new_dest_id uuid;
  radius_meters constant double precision := 30;
  earth_radius constant double precision := 6371000;
  dist double precision;
begin
  for loc in select * from locations order by name, id loop
    existing_dest_id := null;

    for cand in
      select distinct destination_id, latitude, longitude
      from _dest_candidates
      where name_key = lower(trim(loc.name))
    loop
      dist := 2 * earth_radius * asin(sqrt(
        power(sin(radians(loc.latitude::double precision - cand.latitude) / 2), 2) +
        cos(radians(cand.latitude)) * cos(radians(loc.latitude::double precision)) *
        power(sin(radians(loc.longitude::double precision - cand.longitude) / 2), 2)
      ));

      if dist <= radius_meters then
        existing_dest_id := cand.destination_id;
        exit;
      end if;
    end loop;

    if existing_dest_id is null then
      insert into destinations (name, description, address, latitude, longitude, image_url, visible)
      values (loc.name, loc.description, loc.address, loc.latitude, loc.longitude, loc.image_url, loc.visible)
      returning id into new_dest_id;

      existing_dest_id := new_dest_id;
    else
      -- Backfill any display fields the first-seen row was missing, and widen
      -- visibility if any underlying service row opted in.
      update destinations d
      set
        description = coalesce(d.description, loc.description),
        address = coalesce(d.address, loc.address),
        image_url = coalesce(d.image_url, loc.image_url),
        visible = d.visible or loc.visible
      where d.id = existing_dest_id;
    end if;

    insert into _dest_candidates (destination_id, name_key, latitude, longitude)
    values (existing_dest_id, lower(trim(loc.name)), loc.latitude::double precision, loc.longitude::double precision);

    insert into destination_categories (destination_id, category)
    values (existing_dest_id, loc.category)
    on conflict (destination_id, category) do nothing;
  end loop;

  insert into destination_experiences (destination_id, name, category, sort_order)
  select
    dc.destination_id,
    initcap(replace(dc.category, '-', ' ')),
    dc.category,
    row_number() over (partition by dc.destination_id order by dc.category) - 1
  from destination_categories dc;
end;
$$;

drop table if exists _dest_candidates;
