create table if not exists public.profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users (id) on delete cascade,
  first_name text not null check (char_length(trim(first_name)) > 0),
  surname text not null check (char_length(trim(surname)) > 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function public.handle_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger set_profiles_updated_at
before update on public.profiles
for each row
execute function public.handle_updated_at();

alter table public.profiles enable row level security;

create policy "profiles_select_own_record"
on public.profiles
for select
using (auth.uid() = user_id);

create policy "profiles_insert_own_record"
on public.profiles
for insert
with check (auth.uid() = user_id);

create policy "profiles_update_own_record"
on public.profiles
for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "profiles_delete_own_record"
on public.profiles
for delete
using (auth.uid() = user_id);
