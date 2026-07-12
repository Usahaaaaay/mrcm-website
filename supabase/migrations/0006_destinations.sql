-- Destination-centric guide model. Replaces the one-row-per-(business,category)
-- shape of `locations` with a real `destinations` entity plus two child tables,
-- so a business can have many categories AND many named experiences (which the
-- old single `category` column had no way to represent at all). Reuses
-- set_updated_at()/log_activity() from 0001_cms_schema.sql.
--
-- IMPORTANT: this migration does NOT touch the existing `locations` table —
-- it stays intact and readable until a later, separate migration drops it,
-- once the new tables have been verified as the complete replacement.
--
-- Run this in the Supabase SQL editor after 0001-0005 have already been applied.
-- Run 0007_backfill_destinations.sql immediately after this one to populate
-- these tables from the existing `locations` data.

create table if not exists destinations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  address text,
  latitude numeric(9, 6) not null,
  longitude numeric(9, 6) not null,
  image_url text,
  visible boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- One row per category a destination belongs to (replaces the single
-- `locations.category` column). Free text against the same
-- src/lib/locationCategories.jsx vocabulary — no migration needed to add a
-- new category value, same philosophy as before.
create table if not exists destination_categories (
  destination_id uuid not null references destinations(id) on delete cascade,
  category text not null,
  primary key (destination_id, category)
);

-- Named experiences/services offered at a destination (e.g. "Glacier
-- Explorer", "Hot Pools") — the capability the old schema had no field for at
-- all. `category` is optional and only drives which icon the popup/admin show
-- for this experience; it is independent of which categories the destination
-- itself belongs to.
create table if not exists destination_experiences (
  id uuid primary key default gen_random_uuid(),
  destination_id uuid not null references destinations(id) on delete cascade,
  name text not null,
  category text,
  description text,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_destinations_visible on destinations(visible);
create index if not exists idx_destination_categories_category on destination_categories(category);
create index if not exists idx_destination_experiences_destination_id on destination_experiences(destination_id);
create index if not exists idx_destination_experiences_sort_order on destination_experiences(sort_order);

-- ---------------------------------------------------------------------------
-- updated_at + activity log triggers
-- ---------------------------------------------------------------------------
do $$
declare
  t text;
begin
  foreach t in array array['destinations', 'destination_experiences']
  loop
    execute format(
      'drop trigger if exists trg_set_updated_at on %I; create trigger trg_set_updated_at before update on %I for each row execute function set_updated_at();',
      t, t
    );
  end loop;
end;
$$;

do $$
declare
  t text;
begin
  foreach t in array array['destinations', 'destination_experiences']
  loop
    execute format(
      'drop trigger if exists trg_log_activity on %I; create trigger trg_log_activity after insert or update or delete on %I for each row execute function log_activity();',
      t, t
    );
  end loop;
end;
$$;

-- ---------------------------------------------------------------------------
-- RLS — same public-read-if-visible / authenticated-write-all pattern as
-- every other table. destination_categories and destination_experiences have
-- no `visible` column of their own; they inherit it from the parent
-- destination so a hidden destination's children disappear too.
-- ---------------------------------------------------------------------------
alter table destinations enable row level security;
alter table destination_categories enable row level security;
alter table destination_experiences enable row level security;

create policy "public read visible destinations" on destinations
  for select using (visible = true);
create policy "admin read all destinations" on destinations
  for select to authenticated using (true);
create policy "admin write destinations" on destinations
  for all to authenticated using (true) with check (true);

create policy "public read visible destination_categories" on destination_categories
  for select using (
    exists (select 1 from destinations d where d.id = destination_categories.destination_id and d.visible = true)
  );
create policy "admin read all destination_categories" on destination_categories
  for select to authenticated using (true);
create policy "admin write destination_categories" on destination_categories
  for all to authenticated using (true) with check (true);

create policy "public read visible destination_experiences" on destination_experiences
  for select using (
    exists (select 1 from destinations d where d.id = destination_experiences.destination_id and d.visible = true)
  );
create policy "admin read all destination_experiences" on destination_experiences
  for select to authenticated using (true);
create policy "admin write destination_experiences" on destination_experiences
  for all to authenticated using (true) with check (true);
