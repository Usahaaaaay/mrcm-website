-- Generic location system (Phase 3 foundation for the public "Tekapo Guide" page).
-- Named generically (locations / category as free text) so this can expand beyond
-- Lake Tekapo later without a schema rename. Reuses set_updated_at() and
-- log_activity() from 0001_cms_schema.sql — no need to recreate those functions.
-- Run this after 0001 and 0002 have already been applied.

create table if not exists locations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  category text not null,
  description text,
  address text,
  latitude numeric(9, 6) not null,
  longitude numeric(9, 6) not null,
  image_url text,
  visible boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- `category` is intentionally free text (not a CHECK-constrained enum or FK) so new
-- categories can be added in application code (src/lib/locationCategories.jsx) without
-- a migration. Indexed below since it's the primary filter on the public guide page.
create index if not exists idx_locations_category on locations(category);
create index if not exists idx_locations_visible on locations(visible);

drop trigger if exists trg_set_updated_at on locations;
create trigger trg_set_updated_at
  before update on locations
  for each row execute function set_updated_at();

drop trigger if exists trg_log_activity on locations;
create trigger trg_log_activity
  after insert or update or delete on locations
  for each row execute function log_activity();

alter table locations enable row level security;

-- Public can only see visible locations; the admin (any authenticated user, same
-- single-admin trust model as the rest of the CMS) can see and manage everything.
create policy "public read visible locations" on locations
  for select using (visible = true);

create policy "admin read all locations" on locations
  for select to authenticated using (true);

create policy "admin write locations" on locations
  for all to authenticated using (true) with check (true);
