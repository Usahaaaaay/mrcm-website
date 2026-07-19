-- Renames the "Emergency" location category to "EV Charging Station"
-- (src/lib/locationCategories.jsx: 'emergency' -> 'ev-charging-station').
-- `category` columns are free text (see 0003_locations.sql / 0006_destinations.sql),
-- so existing rows referencing the old value need a data migration, not a schema
-- change, to avoid losing their category assignment.
--
-- Run this after 0007_backfill_destinations.sql has already been applied.

update destination_categories set category = 'ev-charging-station' where category = 'emergency';
update destination_experiences set category = 'ev-charging-station' where category = 'emergency';

-- `locations` is the deprecated pre-0006 table — no longer read by the app,
-- but still present until a later migration formally drops it. Updated here
-- too so it doesn't sit with a stale category value in the meantime.
update locations set category = 'ev-charging-station' where category = 'emergency';
