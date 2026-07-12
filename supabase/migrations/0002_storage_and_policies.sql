-- Phase 2 CMS: Row Level Security policies + the `media` storage bucket.
-- Run after 0001_cms_schema.sql.
-- This is a single-admin site: every Supabase Auth user is trusted as the admin
-- (there is no self-registration UI, so create exactly one user by hand).

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------
alter table categories enable row level security;
alter table media enable row level security;
alter table video_links enable row level security;
alter table blog_posts enable row level security;
alter table blog_images enable row level security;
alter table portfolio_projects enable row level security;
alter table portfolio_media enable row level security;
alter table gallery enable row level security;
alter table activity_log enable row level security;

-- Public (anon + authenticated) read access for site content
create policy "public read categories" on categories for select using (true);
create policy "public read media" on media for select using (true);
create policy "public read video_links" on video_links for select using (true);
create policy "public read blog_images" on blog_images for select using (true);
create policy "public read portfolio_projects" on portfolio_projects for select using (true);
create policy "public read portfolio_media" on portfolio_media for select using (true);
create policy "public read gallery" on gallery for select using (true);

-- Blog posts: public only sees published posts; the admin (authenticated) sees everything
create policy "read published or admin" on blog_posts
  for select using (status = 'published' or auth.role() = 'authenticated');

-- Admin-only writes on every content table
create policy "admin write categories" on categories for all
  to authenticated using (true) with check (true);
create policy "admin write media" on media for all
  to authenticated using (true) with check (true);
create policy "admin write video_links" on video_links for all
  to authenticated using (true) with check (true);
create policy "admin write blog_posts" on blog_posts for all
  to authenticated using (true) with check (true);
create policy "admin write blog_images" on blog_images for all
  to authenticated using (true) with check (true);
create policy "admin write portfolio_projects" on portfolio_projects for all
  to authenticated using (true) with check (true);
create policy "admin write portfolio_media" on portfolio_media for all
  to authenticated using (true) with check (true);
create policy "admin write gallery" on gallery for all
  to authenticated using (true) with check (true);

-- Activity log: admin-only read; inserts happen via the SECURITY DEFINER trigger
-- function from 0001, so no insert policy is required for normal operation, but we
-- add one anyway so the log is writable if ever inserted into directly by an admin.
create policy "admin read activity_log" on activity_log
  for select to authenticated using (true);
create policy "admin insert activity_log" on activity_log
  for insert to authenticated with check (true);

-- ---------------------------------------------------------------------------
-- Storage: single public `media` bucket
-- ---------------------------------------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'media',
  'media',
  true,
  209715200, -- 200MB hard ceiling at the bucket level; app-level limits are stricter (see validation.js)
  array[
    'image/jpeg', 'image/jpg', 'image/png', 'image/webp',
    'video/mp4', 'video/quicktime', 'video/webm'
  ]
)
on conflict (id) do nothing;

create policy "public read media bucket" on storage.objects
  for select using (bucket_id = 'media');

create policy "admin write media bucket" on storage.objects
  for insert to authenticated with check (bucket_id = 'media');

create policy "admin update media bucket" on storage.objects
  for update to authenticated using (bucket_id = 'media');

create policy "admin delete media bucket" on storage.objects
  for delete to authenticated using (bucket_id = 'media');
