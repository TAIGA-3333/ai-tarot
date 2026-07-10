create table if not exists public.premium_entitlements (
  client_session_id text primary key,
  stripe_customer_id text,
  stripe_subscription_id text,
  is_premium boolean not null default false,
  source text not null default 'unknown',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists premium_entitlements_customer_idx
  on public.premium_entitlements (stripe_customer_id);

create index if not exists premium_entitlements_subscription_idx
  on public.premium_entitlements (stripe_subscription_id);

alter table public.premium_entitlements enable row level security;

drop policy if exists "service role manages premium entitlements" on public.premium_entitlements;
create policy "service role manages premium entitlements"
  on public.premium_entitlements
  for all
  using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');

create table if not exists public.reading_events (
  id bigserial primary key,
  client_session_id text,
  theme text not null,
  card_count integer not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists reading_events_created_idx
  on public.reading_events (created_at desc);

create index if not exists reading_events_theme_idx
  on public.reading_events (theme);

alter table public.reading_events enable row level security;

drop policy if exists "service role manages reading events" on public.reading_events;
create policy "service role manages reading events"
  on public.reading_events
  for all
  using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');
