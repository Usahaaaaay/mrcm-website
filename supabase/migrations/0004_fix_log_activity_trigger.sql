-- Fixes: media uploads failing with `record "new" has no field "name"`.
--
-- Root cause: log_activity() (0001_cms_schema.sql) tries NEW.title, and on
-- undefined_column falls back to NEW.name. That covers categories/blog_posts/
-- portfolio_projects/gallery/video_links (each has a `title` or `name`), but
-- the `media` table has neither — only `filename` — so the fallback itself
-- raised an uncaught undefined_column error, aborting the whole INSERT
-- (including the row the app was trying to create for every image/video
-- upload).
--
-- Fix: derive the log label via to_jsonb(row)->>'column'. A missing JSONB key
-- returns NULL instead of raising, so this can never throw again regardless
-- of which of title/name/filename (or none) a given table has — including any
-- future table attached to this trigger. This CREATE OR REPLACE takes effect
-- immediately for every existing trg_log_activity trigger; no table changes
-- or data are touched.

create or replace function log_activity()
returns trigger as $$
declare
  action_value text;
  row_json jsonb;
  title_value text;
begin
  action_value := case tg_op
    when 'INSERT' then 'created'
    when 'UPDATE' then 'updated'
    when 'DELETE' then 'deleted'
  end;

  row_json := to_jsonb(case when tg_op = 'DELETE' then old else new end);
  title_value := coalesce(row_json ->> 'title', row_json ->> 'name', row_json ->> 'filename');

  insert into activity_log (action, entity_type, entity_id, entity_title)
  values (action_value, tg_table_name, (row_json ->> 'id')::uuid, title_value);

  if tg_op = 'DELETE' then
    return old;
  else
    return new;
  end if;
end;
$$ language plpgsql security definer set search_path = public;
