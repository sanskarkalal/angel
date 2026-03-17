-- Angel App — Initial Schema Migration
-- Run this in your Supabase SQL editor or via supabase migrations

-- =============================================
-- TABLE: user_profiles
-- =============================================
create table if not exists public.user_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade unique not null,
  name text not null,
  pronouns text,
  birth_date date,
  birth_time time,
  birth_city text,
  sun_sign text,
  moon_sign text,
  rising_sign text,
  life_path_number integer,
  onboarding_story text,
  intentions text[] default '{}',
  photo_url text,
  onboarding_complete boolean default false,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- =============================================
-- TABLE: daily_readings
-- =============================================
create table if not exists public.daily_readings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  reading_date date not null,
  card_name text not null,
  card_arcana text,
  card_reversed boolean default false,
  reading_text text,
  created_at timestamptz default now() not null,
  unique (user_id, reading_date)
);

-- =============================================
-- TABLE: conversations
-- =============================================
create table if not exists public.conversations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  reading_id uuid references public.daily_readings(id) on delete cascade,
  messages jsonb default '[]'::jsonb not null,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- =============================================
-- INDEXES
-- =============================================
create index if not exists idx_user_profiles_user_id on public.user_profiles(user_id);
create index if not exists idx_daily_readings_user_id on public.daily_readings(user_id);
create index if not exists idx_daily_readings_date on public.daily_readings(reading_date);
create index if not exists idx_daily_readings_user_date on public.daily_readings(user_id, reading_date);
create index if not exists idx_conversations_user_id on public.conversations(user_id);
create index if not exists idx_conversations_reading_id on public.conversations(reading_id);

-- =============================================
-- UPDATED_AT TRIGGER
-- =============================================
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger user_profiles_updated_at
  before update on public.user_profiles
  for each row execute function public.handle_updated_at();

create trigger conversations_updated_at
  before update on public.conversations
  for each row execute function public.handle_updated_at();

-- =============================================
-- ROW LEVEL SECURITY
-- =============================================
alter table public.user_profiles enable row level security;
alter table public.daily_readings enable row level security;
alter table public.conversations enable row level security;

-- user_profiles policies
create policy "Users can view own profile"
  on public.user_profiles for select
  using (auth.uid() = user_id);

create policy "Users can insert own profile"
  on public.user_profiles for insert
  with check (auth.uid() = user_id);

create policy "Users can update own profile"
  on public.user_profiles for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- daily_readings policies
create policy "Users can view own readings"
  on public.daily_readings for select
  using (auth.uid() = user_id);

create policy "Users can insert own readings"
  on public.daily_readings for insert
  with check (auth.uid() = user_id);

-- conversations policies
create policy "Users can view own conversations"
  on public.conversations for select
  using (auth.uid() = user_id);

create policy "Users can insert own conversations"
  on public.conversations for insert
  with check (auth.uid() = user_id);

create policy "Users can update own conversations"
  on public.conversations for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
