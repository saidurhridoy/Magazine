-- Inkwell — Postgres / Supabase mirror of server/db.js
-- Run in the Supabase SQL editor (or `supabase db push`). Money is stored in poisha (৳1 = 100 poisha).
-- Users map to auth.users via profiles.id; RLS policies follow the `user_id = auth.uid()` pattern.

create extension if not exists "pgcrypto";

-- ───────────── profiles (one row per auth user) ─────────────
create table if not exists public.profiles (
  id            uuid primary key references auth.users (id) on delete cascade,
  email         text not null unique,
  name          text not null,
  name_bn       text,
  role          text not null default 'reader' check (role in ('reader', 'editor')),
  title         text,
  avatar_color  text not null default '#0f766e',
  bio           text,
  created_at    timestamptz not null default now()
);

create or replace function public.is_editor() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.profiles where id = auth.uid() and role = 'editor');
$$;

-- ───────────── catalogue ─────────────
create table if not exists public.categories (
  id       bigint generated always as identity primary key,
  slug     text not null unique,
  name_en  text not null,
  name_bn  text not null,
  color    text not null default '#0f766e'
);

create table if not exists public.magazines (
  id              bigint generated always as identity primary key,
  slug            text not null unique,
  title_en        text not null,
  title_bn        text not null default '',
  tagline_en      text not null default '',
  tagline_bn      text not null default '',
  description_en  text not null default '',
  description_bn  text not null default '',
  category_id     bigint references public.categories (id) on delete set null,
  language        text not null default 'bn' check (language in ('bn', 'en', 'both')),
  frequency       text not null default 'monthly',
  price_poisha    integer not null default 35000 check (price_poisha between 0 and 1000000),
  status          text not null default 'draft' check (status in ('published', 'draft')),
  cover_color     text not null default '#0f766e',
  cover_accent    text not null default '#f59e0b',
  cover_style     text not null default 'arcs',
  cover_url       text,
  cover_thumb     text,
  cover_lang      text check (cover_lang in ('bn', 'en', 'both')),
  publisher       text not null default '',
  owner_id        uuid references public.profiles (id) on delete set null,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);
create index if not exists idx_magazines_status on public.magazines (status);
create index if not exists idx_magazines_category on public.magazines (category_id);

create table if not exists public.issues (
  id            bigint generated always as identity primary key,
  magazine_id   bigint not null references public.magazines (id) on delete cascade,
  number        integer not null,
  title_en      text not null default '',
  title_bn      text not null default '',
  published_at  date not null default current_date,
  cover_url     text,
  cover_thumb   text,
  created_at    timestamptz not null default now()
);
create index if not exists idx_issues_magazine on public.issues (magazine_id);

create table if not exists public.articles (
  id            bigint generated always as identity primary key,
  issue_id      bigint not null references public.issues (id) on delete cascade,
  magazine_id   bigint not null references public.magazines (id) on delete cascade,
  title_en      text not null default '',
  title_bn      text not null default '',
  dek_en        text not null default '',
  dek_bn        text not null default '',
  author        text not null default '',
  body_en       text not null default '',
  body_bn       text not null default '',
  word_count    integer not null default 0,
  read_minutes  integer not null default 1,
  position      integer not null default 0,
  status        text not null default 'draft' check (status in ('published', 'draft')),
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);
create index if not exists idx_articles_issue on public.articles (issue_id);
create index if not exists idx_articles_magazine on public.articles (magazine_id);

-- ───────────── reader state ─────────────
create table if not exists public.library (
  user_id      uuid not null references public.profiles (id) on delete cascade,
  magazine_id  bigint not null references public.magazines (id) on delete cascade,
  added_at     timestamptz not null default now(),
  primary key (user_id, magazine_id)
);

create table if not exists public.subscriptions (
  id            bigint generated always as identity primary key,
  user_id       uuid not null references public.profiles (id) on delete cascade,
  magazine_id   bigint not null references public.magazines (id) on delete cascade,
  plan          text not null default 'monthly' check (plan in ('monthly', 'yearly')),
  price_poisha  integer not null,
  status        text not null default 'active' check (status in ('active', 'cancelled')),
  started_at    timestamptz not null default now(),
  renews_at     timestamptz,
  cancelled_at  timestamptz,
  unique (user_id, magazine_id)
);

create table if not exists public.reviews (
  id           bigint generated always as identity primary key,
  user_id      uuid not null references public.profiles (id) on delete cascade,
  magazine_id  bigint not null references public.magazines (id) on delete cascade,
  rating       integer not null check (rating between 1 and 5),
  body         text not null default '',
  lang         text not null default 'bn',
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),
  unique (user_id, magazine_id)
);

create table if not exists public.bookmarks (
  user_id     uuid not null references public.profiles (id) on delete cascade,
  article_id  bigint not null references public.articles (id) on delete cascade,
  created_at  timestamptz not null default now(),
  primary key (user_id, article_id)
);

create table if not exists public.progress (
  user_id     uuid not null references public.profiles (id) on delete cascade,
  article_id  bigint not null references public.articles (id) on delete cascade,
  percent     integer not null default 0 check (percent between 0 and 100),
  updated_at  timestamptz not null default now(),
  primary key (user_id, article_id)
);

create table if not exists public.events (
  id           bigint generated always as identity primary key,
  user_id      uuid references public.profiles (id) on delete set null,
  type         text not null,
  magazine_id  bigint references public.magazines (id) on delete cascade,
  article_id   bigint references public.articles (id) on delete cascade,
  created_at   timestamptz not null default now()
);
create index if not exists idx_events_created on public.events (created_at);
create index if not exists idx_events_user on public.events (user_id);

-- ───────────── row level security ─────────────
alter table public.profiles      enable row level security;
alter table public.categories    enable row level security;
alter table public.magazines     enable row level security;
alter table public.issues        enable row level security;
alter table public.articles      enable row level security;
alter table public.library       enable row level security;
alter table public.subscriptions enable row level security;
alter table public.reviews       enable row level security;
alter table public.bookmarks     enable row level security;
alter table public.progress      enable row level security;
alter table public.events        enable row level security;

-- Profiles: read your own; editors read all; update your own (role changes stay server-side).
create policy "profiles self read"   on public.profiles for select using (id = auth.uid() or public.is_editor());
create policy "profiles self update" on public.profiles for update using (id = auth.uid())
  with check (id = auth.uid() and role = (select role from public.profiles where id = auth.uid()));

-- Catalogue: everyone sees published content; editors see and write everything.
create policy "categories public read" on public.categories for select using (true);
create policy "categories editor write" on public.categories for all using (public.is_editor()) with check (public.is_editor());

create policy "magazines public read" on public.magazines for select using (status = 'published' or public.is_editor());
create policy "magazines editor write" on public.magazines for all using (public.is_editor()) with check (public.is_editor());

create policy "issues public read" on public.issues for select
  using (public.is_editor() or exists (select 1 from public.magazines m where m.id = magazine_id and m.status = 'published'));
create policy "issues editor write" on public.issues for all using (public.is_editor()) with check (public.is_editor());

create policy "articles signed-in read" on public.articles for select using (
  public.is_editor() or (auth.uid() is not null and status = 'published'
    and exists (select 1 from public.magazines m where m.id = magazine_id and m.status = 'published')));
create policy "articles editor write" on public.articles for all using (public.is_editor()) with check (public.is_editor());

-- Per-user rows: the `user_id = auth.uid()` pattern.
create policy "library own" on public.library for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "bookmarks own" on public.bookmarks for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "progress own" on public.progress for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "subscriptions own read" on public.subscriptions for select using (user_id = auth.uid() or public.is_editor());
create policy "subscriptions own write" on public.subscriptions for all using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy "reviews public read" on public.reviews for select using (true);
create policy "reviews own write" on public.reviews for insert with check (user_id = auth.uid());
create policy "reviews own update" on public.reviews for update using (user_id = auth.uid());
create policy "reviews own or editor delete" on public.reviews for delete using (user_id = auth.uid() or public.is_editor());

create policy "events insert own" on public.events for insert with check (user_id = auth.uid() or user_id is null);
create policy "events editor read" on public.events for select using (public.is_editor() or user_id = auth.uid());

-- Covers: create a public `covers` storage bucket; editors upload, everyone reads.
-- insert into storage.buckets (id, name, public) values ('covers', 'covers', true) on conflict do nothing;
-- create policy "covers public read" on storage.objects for select using (bucket_id = 'covers');
-- create policy "covers editor write" on storage.objects for all using (bucket_id = 'covers' and public.is_editor())
--   with check (bucket_id = 'covers' and public.is_editor());
