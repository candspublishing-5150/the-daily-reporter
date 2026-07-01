-- Add unique constraint on listings.source_url so the scraper can upsert (deduplicate) by URL
-- Run this in the Supabase SQL Editor

alter table listings add column if not exists source_url text;
create unique index if not exists listings_source_url_unique on listings (source_url)
  where source_url is not null;
