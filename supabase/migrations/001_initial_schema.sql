-- ============================================================
-- TDR Initial Schema
-- Run this in the Supabase SQL Editor
-- ============================================================

-- Editions (weekly newspaper issues)
create table editions (
  id uuid primary key default gen_random_uuid(),
  name text not null,                        -- e.g. "Southern CA Edition"
  edition_type text not null,                -- 'southern_ca' | 'northern_ca' | 'water' | 'blueprint'
  publish_date date not null,
  flipsnack_url text,
  cover_image_url text,
  pdf_url text,
  created_at timestamptz default now()
);

-- Jobs open for bid
create table listings (
  id uuid primary key default gen_random_uuid(),
  edition_id uuid references editions(id) on delete set null,
  title text not null,
  agency text not null,
  county text,
  bid_date timestamptz,
  description text,
  contact_info text,
  source_url text,
  created_at timestamptz default now()
);

-- Ads (outreach + display)
create table ads (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  ad_type text not null,                     -- 'outreach' | 'display'
  placement text,                            -- 'leaderboard' | 'billboard' | 'rectangle' | 'sponsor' | 'newsletter'
  status text not null default 'draft',      -- 'draft' | 'pending_review' | 'approved' | 'live' | 'ended'
  headline text,
  body_copy text,
  cta_label text,
  cta_url text,
  accent_color text default '#a8242f',
  image_url text,
  start_date date,
  end_date date,
  budget numeric(10,2),
  impressions integer default 0,
  clicks integer default 0,
  admin_notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Campaigns (groups one or more ads, tracks overall spend)
create table campaigns (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  name text not null,
  status text not null default 'active',     -- 'active' | 'paused' | 'ended'
  total_budget numeric(10,2),
  total_spend numeric(10,2) default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Join table: campaigns <-> ads
create table campaign_ads (
  campaign_id uuid references campaigns(id) on delete cascade,
  ad_id uuid references ads(id) on delete cascade,
  primary key (campaign_id, ad_id)
);

-- Email subscribers
create table subscribers (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  is_active boolean default true,
  subscribed_at timestamptz default now(),
  unsubscribed_at timestamptz
);

-- Invoices
create table invoices (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid references campaigns(id) on delete set null,
  user_id uuid references auth.users(id) on delete set null,
  amount numeric(10,2) not null,
  status text not null default 'unpaid',     -- 'unpaid' | 'paid' | 'refunded'
  payment_method text,
  quickbooks_id text,
  paid_at timestamptz,
  created_at timestamptz default now()
);

-- Auto-generated articles
create table articles (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  body text not null,
  tags text[],
  source_url text,
  is_published boolean default false,
  published_at timestamptz,
  created_at timestamptz default now()
);

-- ============================================================
-- Row Level Security
-- ============================================================

alter table editions enable row level security;
alter table listings enable row level security;
alter table ads enable row level security;
alter table campaigns enable row level security;
alter table campaign_ads enable row level security;
alter table subscribers enable row level security;
alter table invoices enable row level security;
alter table articles enable row level security;

-- Public can read editions, listings, articles
create policy "public read editions" on editions for select using (true);
create policy "public read listings" on listings for select using (true);
create policy "public read published articles" on articles for select using (is_published = true);

-- Users can read/write their own campaigns and ads
create policy "users manage own campaigns" on campaigns
  for all using (auth.uid() = user_id);

create policy "users manage own ads" on ads
  for all using (auth.uid() = user_id);

create policy "users view own invoices" on invoices
  for select using (auth.uid() = user_id);

-- Anyone can subscribe
create policy "anyone can subscribe" on subscribers
  for insert with check (true);
