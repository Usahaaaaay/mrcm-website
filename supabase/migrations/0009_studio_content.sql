-- Little Lantern Studios (Phase 1: foundation only, no public/admin UI yet).
-- Single `studio_items` table for both Apps and Projects, distinguished by a
-- `kind` discriminator, rather than two near-identical tables
-- (`studio_apps`/`studio_projects`): the two content types share the same
-- fields (title/slug/tagline/description/status/tech_stack/links/cover
-- media/sort order) with no kind-specific columns today, so one table is the
-- simplest option that stays maintainable — a second table would just
-- duplicate every column, index, and RLS/trigger pair for no structural
-- benefit. Admin and public VIEWS stay separate at the query layer (filter
-- `where kind = 'app'` / `'project'`, same way destination_categories are
-- filtered per-category) once that UI is built in a later phase.
--
-- Reuses set_updated_at()/log_activity() from 0001_cms_schema.sql and the
-- existing public `media` bucket/table — no new storage bucket.
--
-- Run this after 0001-0008 have already been applied.

create table if not exists studio_items (
  id uuid primary key default gen_random_uuid(),
  kind text not null check (kind in ('app', 'project')),
  title text not null,
  slug text not null,
  tagline text,
  description text,
  content jsonb,
  status text not null default 'In Progress' check (status in ('Live', 'In Progress', 'Planned', 'Archived')),
  tech_stack text[] not null default '{}',
  demo_url text,
  app_store_url text,
  github_url text,
  cover_media_id uuid references media(id) on delete set null,
  visible boolean not null default true,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  -- Scoped per kind, not globally unique: Apps and Projects are separate
  -- public sections (e.g. /studio/apps/:slug vs /studio/projects/:slug), so
  -- an app and a project are allowed to share a slug.
  unique (kind, slug)
);

create index if not exists idx_studio_items_kind on studio_items(kind);
create index if not exists idx_studio_items_visible on studio_items(visible);
create index if not exists idx_studio_items_cover_media_id on studio_items(cover_media_id);
create index if not exists idx_studio_items_sort_order on studio_items(sort_order);

-- ---------------------------------------------------------------------------
-- updated_at + activity log triggers (reusing the functions from 0001)
-- ---------------------------------------------------------------------------
create trigger trg_set_updated_at before update on studio_items
  for each row execute function set_updated_at();

create trigger trg_log_activity after insert or update or delete on studio_items
  for each row execute function log_activity();

-- ---------------------------------------------------------------------------
-- RLS — same public-read-if-visible / authenticated-read-all / authenticated-
-- write-all pattern as destinations (0006_destinations.sql), since studio
-- items need a draft-until-visible gate the same way.
-- ---------------------------------------------------------------------------
alter table studio_items enable row level security;

create policy "public read visible studio_items" on studio_items
  for select using (visible = true);
create policy "admin read all studio_items" on studio_items
  for select to authenticated using (true);
create policy "admin write studio_items" on studio_items
  for all to authenticated using (true) with check (true);
