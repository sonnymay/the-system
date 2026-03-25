-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- User profiles table
create table if not exists public.user_profiles (
  id uuid references auth.users on delete cascade primary key,
  username text not null default '',
  hunter_rank text not null default 'E',
  level integer not null default 1,
  current_xp integer not null default 0,
  total_xp integer not null default 0,
  total_tasks_completed integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Tasks table
create table if not exists public.tasks (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.user_profiles(id) on delete cascade not null,
  title text not null,
  difficulty text not null check (difficulty in ('poring', 'orc', 'drake', 'mvp')),
  xp_value integer not null,
  completed boolean not null default false,
  completed_at timestamptz,
  created_at timestamptz not null default now()
);

-- Daily quests table
create table if not exists public.daily_quests (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.user_profiles(id) on delete cascade not null,
  quest_text text not null,
  current_streak integer not null default 0,
  last_completed_at date,
  created_at timestamptz not null default now()
);

-- Daily completions table
create table if not exists public.daily_completions (
  id uuid default uuid_generate_v4() primary key,
  daily_quest_id uuid references public.daily_quests(id) on delete cascade not null,
  user_id uuid references public.user_profiles(id) on delete cascade not null,
  completed_date date not null,
  created_at timestamptz not null default now(),
  unique(daily_quest_id, completed_date)
);

-- RLS Policies
alter table public.user_profiles enable row level security;
alter table public.tasks enable row level security;
alter table public.daily_quests enable row level security;
alter table public.daily_completions enable row level security;

-- user_profiles policies
create policy "Users can view own profile"
  on public.user_profiles for select using (auth.uid() = id);
create policy "Users can update own profile"
  on public.user_profiles for update using (auth.uid() = id);
create policy "Users can insert own profile"
  on public.user_profiles for insert with check (auth.uid() = id);

-- tasks policies
create policy "Users can view own tasks"
  on public.tasks for select using (auth.uid() = user_id);
create policy "Users can insert own tasks"
  on public.tasks for insert with check (auth.uid() = user_id);
create policy "Users can update own tasks"
  on public.tasks for update using (auth.uid() = user_id);
create policy "Users can delete own tasks"
  on public.tasks for delete using (auth.uid() = user_id);

-- daily_quests policies
create policy "Users can view own daily quests"
  on public.daily_quests for select using (auth.uid() = user_id);
create policy "Users can insert own daily quests"
  on public.daily_quests for insert with check (auth.uid() = user_id);
create policy "Users can update own daily quests"
  on public.daily_quests for update using (auth.uid() = user_id);
create policy "Users can delete own daily quests"
  on public.daily_quests for delete using (auth.uid() = user_id);

-- daily_completions policies
create policy "Users can view own completions"
  on public.daily_completions for select using (auth.uid() = user_id);
create policy "Users can insert own completions"
  on public.daily_completions for insert with check (auth.uid() = user_id);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.user_profiles (id, username)
  values (new.id, coalesce(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1)));
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Updated_at trigger
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger user_profiles_updated_at
  before update on public.user_profiles
  for each row execute procedure public.handle_updated_at();
