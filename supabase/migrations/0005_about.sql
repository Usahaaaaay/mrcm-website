-- About Me management system: a singleton "profile document" with a draft/
-- published twin-table split, plus seven ordered list collections (skills,
-- technologies, social links, statistics, interests, fun facts, timeline).
--
-- Draft/publish design: `about` is the live, publicly-readable document.
-- `about_draft` is a 1:1 shadow with the same editable columns, readable only
-- by `authenticated` — drafts are structurally invisible to the public API,
-- not just unqueried by convention. Publish = copy draft -> about. Discard =
-- copy about -> draft. Autosave/Save Draft just updates `about_draft`.
--
-- The list tables intentionally have NO draft/publish step — same immediate-
-- effect behavior as categories/gallery/locations elsewhere in this schema.

create table if not exists about (
  id uuid primary key default gen_random_uuid(),
  singleton boolean not null default true unique,

  full_name text,
  display_name text,
  job_title text,
  short_introduction text,
  tagline text,

  photo_url text,
  photo_storage_path text,

  bio_title text,
  bio_subtitle text,
  bio_content jsonb,
  bio_content_html text,

  location text,
  email text,
  phone text,
  availability text,

  resume_url text,
  resume_storage_path text,

  currently_building text,
  currently_learning text,
  currently_reading text,
  currently_watching text,
  currently_listening_to text,
  currently_planning text,

  seo_title text,
  seo_description text,
  seo_og_title text,
  seo_og_description text,
  seo_keywords text,
  seo_slug text,

  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists about_draft (
  id uuid primary key default gen_random_uuid(),
  singleton boolean not null default true unique,

  full_name text,
  display_name text,
  job_title text,
  short_introduction text,
  tagline text,

  photo_url text,
  photo_storage_path text,

  bio_title text,
  bio_subtitle text,
  bio_content jsonb,
  bio_content_html text,

  location text,
  email text,
  phone text,
  availability text,

  resume_url text,
  resume_storage_path text,

  currently_building text,
  currently_learning text,
  currently_reading text,
  currently_watching text,
  currently_listening_to text,
  currently_planning text,

  seo_title text,
  seo_description text,
  seo_og_title text,
  seo_og_description text,
  seo_keywords text,
  seo_slug text,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Seed exactly one row in each (idempotent — safe to re-run).
insert into about (singleton) values (true) on conflict (singleton) do nothing;
insert into about_draft (singleton) values (true) on conflict (singleton) do nothing;

-- ---------------------------------------------------------------------------
-- List collections — each a simple ordered list, no draft/publish step.
-- ---------------------------------------------------------------------------
create table if not exists about_skills (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists about_technologies (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  icon text,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists about_social_links (
  id uuid primary key default gen_random_uuid(),
  platform text not null,
  url text not null,
  icon text,
  visible boolean not null default true,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists about_statistics (
  id uuid primary key default gen_random_uuid(),
  label text not null,
  value text not null,
  icon text,
  visible boolean not null default true,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists about_interests (
  id uuid primary key default gen_random_uuid(),
  label text not null,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists about_fun_facts (
  id uuid primary key default gen_random_uuid(),
  emoji text,
  text text not null,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists about_timeline (
  id uuid primary key default gen_random_uuid(),
  year text not null,
  title text not null,
  description text,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- indexes
-- ---------------------------------------------------------------------------
create index if not exists idx_about_skills_sort_order on about_skills(sort_order);
create index if not exists idx_about_technologies_sort_order on about_technologies(sort_order);
create index if not exists idx_about_social_links_sort_order on about_social_links(sort_order);
create index if not exists idx_about_statistics_sort_order on about_statistics(sort_order);
create index if not exists idx_about_interests_sort_order on about_interests(sort_order);
create index if not exists idx_about_fun_facts_sort_order on about_fun_facts(sort_order);
create index if not exists idx_about_timeline_sort_order on about_timeline(sort_order);

-- ---------------------------------------------------------------------------
-- updated_at + activity log triggers (reusing the functions from 0001, already
-- hardened against missing title/name/filename columns via to_jsonb).
-- about_draft deliberately gets set_updated_at (drives "Last saved") but NOT
-- log_activity — autosave fires every ~30s and would flood Recent Activity.
-- ---------------------------------------------------------------------------
do $$
declare
  t text;
begin
  foreach t in array array[
    'about', 'about_draft', 'about_skills', 'about_technologies',
    'about_social_links', 'about_statistics', 'about_interests',
    'about_fun_facts', 'about_timeline'
  ]
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
  foreach t in array array[
    'about', 'about_skills', 'about_technologies', 'about_social_links',
    'about_statistics', 'about_interests', 'about_fun_facts', 'about_timeline'
  ]
  loop
    execute format(
      'drop trigger if exists trg_log_activity on %I; create trigger trg_log_activity after insert or update or delete on %I for each row execute function log_activity();',
      t, t
    );
  end loop;
end;
$$;

-- ---------------------------------------------------------------------------
-- RLS
-- ---------------------------------------------------------------------------
alter table about enable row level security;
alter table about_draft enable row level security;
alter table about_skills enable row level security;
alter table about_technologies enable row level security;
alter table about_social_links enable row level security;
alter table about_statistics enable row level security;
alter table about_interests enable row level security;
alter table about_fun_facts enable row level security;
alter table about_timeline enable row level security;

create policy "public read about" on about for select using (true);
create policy "admin write about" on about for all to authenticated using (true) with check (true);

-- No public policy at all on about_draft: anon has zero access by default deny.
create policy "admin read about_draft" on about_draft for select to authenticated using (true);
create policy "admin write about_draft" on about_draft for all to authenticated using (true) with check (true);

create policy "public read about_skills" on about_skills for select using (true);
create policy "admin write about_skills" on about_skills for all to authenticated using (true) with check (true);

create policy "public read about_technologies" on about_technologies for select using (true);
create policy "admin write about_technologies" on about_technologies for all to authenticated using (true) with check (true);

create policy "public read about_social_links" on about_social_links for select using (true);
create policy "admin write about_social_links" on about_social_links for all to authenticated using (true) with check (true);

create policy "public read about_statistics" on about_statistics for select using (true);
create policy "admin write about_statistics" on about_statistics for all to authenticated using (true) with check (true);

create policy "public read about_interests" on about_interests for select using (true);
create policy "admin write about_interests" on about_interests for all to authenticated using (true) with check (true);

create policy "public read about_fun_facts" on about_fun_facts for select using (true);
create policy "admin write about_fun_facts" on about_fun_facts for all to authenticated using (true) with check (true);

create policy "public read about_timeline" on about_timeline for select using (true);
create policy "admin write about_timeline" on about_timeline for all to authenticated using (true) with check (true);

-- ---------------------------------------------------------------------------
-- storage: allow PDF uploads (resume) through the existing `media` bucket
-- ---------------------------------------------------------------------------
update storage.buckets
set allowed_mime_types = allowed_mime_types || array['application/pdf']::text[]
where id = 'media';
