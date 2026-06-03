-- ============================================================
-- SwapSpot initial schema
-- Run this in Supabase Dashboard → SQL Editor
-- ============================================================

-- PostGIS (must be enabled in Dashboard → Extensions first)
create extension if not exists postgis;

-- ============================================================
-- Tables
-- ============================================================

create table if not exists communities (
  id            uuid primary key default gen_random_uuid(),
  name          text not null,
  type          text not null check (type in ('dorm', 'apartment', 'campus')),
  geofence      geography null,
  email_domains text[] not null default '{}',
  created_at    timestamptz not null default now()
);

create table if not exists users (
  id            uuid primary key references auth.users(id) on delete cascade,
  name          text not null,
  community_id  uuid references communities(id),
  verified      bool not null default false,
  rep_score     int not null default 0,
  socials       jsonb,
  created_at    timestamptz not null default now()
);

create table if not exists moves (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references users(id) on delete cascade,
  move_date   date not null,
  direction   text not null check (direction in ('out', 'in')),
  status      text not null default 'planning' check (status in ('planning', 'active', 'done')),
  created_at  timestamptz not null default now()
);

create table if not exists listings (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null references users(id) on delete cascade,
  community_id    uuid not null references communities(id),
  move_id         uuid references moves(id),
  title           text not null,
  description     text,
  price_cents     int not null default 0,
  kind            text not null check (kind in ('sale', 'free')),
  status          text not null default 'available' check (status in ('available', 'pending', 'gone')),
  category        text,
  images          text[] not null default '{}',
  available_until date,
  created_at      timestamptz not null default now()
);

create table if not exists conversations (
  id          uuid primary key default gen_random_uuid(),
  listing_id  uuid not null references listings(id),
  buyer_id    uuid not null references users(id),
  seller_id   uuid not null references users(id),
  created_at  timestamptz not null default now(),
  unique(listing_id, buyer_id)
);

create table if not exists messages (
  id              uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references conversations(id) on delete cascade,
  sender_id       uuid not null references users(id),
  body            text not null,
  created_at      timestamptz not null default now()
);

-- ============================================================
-- Indexes
-- ============================================================

create index if not exists listings_community_status_idx on listings(community_id, status, created_at desc);
create index if not exists listings_user_idx on listings(user_id);
create index if not exists messages_conversation_idx on messages(conversation_id, created_at asc);
create index if not exists moves_user_idx on moves(user_id);

-- ============================================================
-- Helper: get caller's community_id (used in RLS policies)
-- ============================================================

create or replace function get_my_community_id()
returns uuid
language sql
security definer
stable
as $$
  select community_id from users where id = auth.uid()
$$;

-- ============================================================
-- Row Level Security
-- ============================================================

alter table communities    enable row level security;
alter table users          enable row level security;
alter table moves          enable row level security;
alter table listings       enable row level security;
alter table conversations  enable row level security;
alter table messages       enable row level security;

-- communities: public read (needed for sign-up domain matching & discovery)
create policy "communities_select_public"
  on communities for select using (true);

-- users: read own community members or own row; write own row only
create policy "users_select_community"
  on users for select
  using (community_id = get_my_community_id() or id = auth.uid());

create policy "users_insert_own"
  on users for insert
  with check (id = auth.uid());

create policy "users_update_own"
  on users for update
  using (id = auth.uid())
  with check (id = auth.uid());

-- moves: own rows only
create policy "moves_select_own"
  on moves for select
  using (user_id = auth.uid());

create policy "moves_insert_own"
  on moves for insert
  with check (user_id = auth.uid());

create policy "moves_update_own"
  on moves for update
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy "moves_delete_own"
  on moves for delete
  using (user_id = auth.uid());

-- listings: read same community; write/update/delete own
create policy "listings_select_community"
  on listings for select
  using (community_id = get_my_community_id());

create policy "listings_insert_own"
  on listings for insert
  with check (user_id = auth.uid() and community_id = get_my_community_id());

create policy "listings_update_own"
  on listings for update
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy "listings_delete_own"
  on listings for delete
  using (user_id = auth.uid());

-- conversations: buyer or seller only
create policy "conversations_select_participant"
  on conversations for select
  using (buyer_id = auth.uid() or seller_id = auth.uid());

create policy "conversations_insert_buyer"
  on conversations for insert
  with check (buyer_id = auth.uid());

-- messages: participants in the conversation
create policy "messages_select_participant"
  on messages for select
  using (
    exists (
      select 1 from conversations c
      where c.id = conversation_id
        and (c.buyer_id = auth.uid() or c.seller_id = auth.uid())
    )
  );

create policy "messages_insert_participant"
  on messages for insert
  with check (
    sender_id = auth.uid()
    and exists (
      select 1 from conversations c
      where c.id = conversation_id
        and (c.buyer_id = auth.uid() or c.seller_id = auth.uid())
    )
  );
