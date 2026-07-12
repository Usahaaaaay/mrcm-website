-- Phase 2 CMS schema: categories, media, video_links, blog_posts, blog_images,
-- portfolio_projects, portfolio_media, gallery, activity_log.
-- Run this in the Supabase SQL editor (or `supabase db push`) before using the admin.

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- categories
-- ---------------------------------------------------------------------------
create table if not exists categories (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  slug text not null unique,
  description text,
  icon text,
  color text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- media (unifies uploaded images + videos into a single table)
-- ---------------------------------------------------------------------------
create table if not exists media (
  id uuid primary key default gen_random_uuid(),
  type text not null check (type in ('image', 'video')),
  filename text not null,
  storage_path text not null,
  url text not null,
  mime_type text not null,
  file_size bigint not null,
  width int,
  height int,
  duration numeric,
  thumbnail_path text,
  alt_text text,
  caption text,
  category_id uuid references categories(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- video_links (embedded YouTube / Vimeo, no uploaded file)
-- ---------------------------------------------------------------------------
create table if not exists video_links (
  id uuid primary key default gen_random_uuid(),
  provider text not null check (provider in ('youtube', 'vimeo')),
  external_id text not null,
  url text not null,
  title text,
  description text,
  thumbnail_url text,
  duration numeric,
  category_id uuid references categories(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- blog_posts
-- ---------------------------------------------------------------------------
create table if not exists blog_posts (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  excerpt text,
  content jsonb,
  cover_media_id uuid references media(id) on delete set null,
  category_id uuid references categories(id) on delete set null,
  status text not null default 'draft' check (status in ('draft', 'published')),
  word_count int not null default 0,
  reading_time_minutes int not null default 0,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists blog_images (
  id uuid primary key default gen_random_uuid(),
  blog_post_id uuid not null references blog_posts(id) on delete cascade,
  media_id uuid not null references media(id) on delete cascade,
  sort_order int not null default 0,
  unique (blog_post_id, media_id)
);

-- ---------------------------------------------------------------------------
-- portfolio_projects
-- ---------------------------------------------------------------------------
create table if not exists portfolio_projects (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  description text,
  content jsonb,
  status text not null default 'Planned' check (status in ('Live', 'In Progress', 'Planned')),
  tech_stack text[] not null default '{}',
  demo_url text,
  github_url text,
  cover_media_id uuid references media(id) on delete set null,
  category_id uuid references categories(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists portfolio_media (
  id uuid primary key default gen_random_uuid(),
  portfolio_project_id uuid not null references portfolio_projects(id) on delete cascade,
  media_id uuid not null references media(id) on delete cascade,
  sort_order int not null default 0,
  unique (portfolio_project_id, media_id)
);

-- ---------------------------------------------------------------------------
-- gallery
-- ---------------------------------------------------------------------------
create table if not exists gallery (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  media_id uuid not null references media(id) on delete cascade,
  category_id uuid references categories(id) on delete set null,
  aspect text not null default 'square' check (aspect in ('tall', 'wide', 'square')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- activity_log (populated by trigger, not application code)
-- ---------------------------------------------------------------------------
create table if not exists activity_log (
  id uuid primary key default gen_random_uuid(),
  action text not null check (action in ('created', 'updated', 'deleted')),
  entity_type text not null,
  entity_id uuid not null,
  entity_title text,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- indexes
-- ---------------------------------------------------------------------------
create index if not exists idx_media_category_id on media(category_id);
create index if not exists idx_video_links_category_id on video_links(category_id);
create index if not exists idx_blog_posts_category_id on blog_posts(category_id);
create index if not exists idx_blog_posts_cover_media_id on blog_posts(cover_media_id);
create index if not exists idx_blog_posts_slug on blog_posts(slug);
create index if not exists idx_blog_posts_status on blog_posts(status);
create index if not exists idx_blog_images_blog_post_id on blog_images(blog_post_id);
create index if not exists idx_blog_images_media_id on blog_images(media_id);
create index if not exists idx_portfolio_projects_category_id on portfolio_projects(category_id);
create index if not exists idx_portfolio_projects_cover_media_id on portfolio_projects(cover_media_id);
create index if not exists idx_portfolio_projects_slug on portfolio_projects(slug);
create index if not exists idx_portfolio_media_project_id on portfolio_media(portfolio_project_id);
create index if not exists idx_portfolio_media_media_id on portfolio_media(media_id);
create index if not exists idx_gallery_media_id on gallery(media_id);
create index if not exists idx_gallery_category_id on gallery(category_id);
create index if not exists idx_categories_slug on categories(slug);
create index if not exists idx_activity_log_created_at on activity_log(created_at desc);

-- ---------------------------------------------------------------------------
-- updated_at maintenance
-- ---------------------------------------------------------------------------
create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

do $$
declare
  t text;
begin
  foreach t in array array['categories', 'media', 'video_links', 'blog_posts', 'portfolio_projects', 'gallery']
  loop
    execute format(
      'drop trigger if exists trg_set_updated_at on %I; create trigger trg_set_updated_at before update on %I for each row execute function set_updated_at();',
      t, t
    );
  end loop;
end;
$$;

-- ---------------------------------------------------------------------------
-- activity_log trigger: one generic function reused by every content table
-- ---------------------------------------------------------------------------
create or replace function log_activity()
returns trigger as $$
declare
  title_value text;
  action_value text;
begin
  action_value := case tg_op
    when 'INSERT' then 'created'
    when 'UPDATE' then 'updated'
    when 'DELETE' then 'deleted'
  end;

  if tg_op = 'DELETE' then
    begin
      title_value := old.title;
    exception when undefined_column then
      title_value := old.name;
    end;
    insert into activity_log (action, entity_type, entity_id, entity_title)
    values (action_value, tg_table_name, old.id, title_value);
    return old;
  else
    begin
      title_value := new.title;
    exception when undefined_column then
      title_value := new.name;
    end;
    insert into activity_log (action, entity_type, entity_id, entity_title)
    values (action_value, tg_table_name, new.id, title_value);
    return new;
  end if;
end;
$$ language plpgsql security definer set search_path = public;

do $$
declare
  t text;
begin
  foreach t in array array['categories', 'blog_posts', 'portfolio_projects', 'gallery', 'media', 'video_links']
  loop
    execute format(
      'drop trigger if exists trg_log_activity on %I; create trigger trg_log_activity after insert or update or delete on %I for each row execute function log_activity();',
      t, t
    );
  end loop;
end;
$$;
