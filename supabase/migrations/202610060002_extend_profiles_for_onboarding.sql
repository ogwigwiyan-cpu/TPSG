alter table public.profiles
  add column if not exists mobile_number text,
  add column if not exists mobile_verified boolean not null default false,
  add column if not exists preferred_language text,
  add column if not exists age_band text,
  add column if not exists gender text not null default 'NOT_PROVIDED',
  add column if not exists employment_status text not null default 'NOT_PROVIDED',
  add column if not exists province text,
  add column if not exists municipality text,
  add column if not exists ward text,
  add column if not exists community text,
  add column if not exists street_locality text,
  add column if not exists exact_location_private boolean not null default true,
  add column if not exists privacy_level text not null default 'EXACT_LOCATION_PRIVATE',
  add column if not exists onboarding_state text not null default 'NOT_STARTED',
  add column if not exists accepted_policy_version text,
  add column if not exists accepted_at timestamptz,
  add column if not exists profile_visibility text not null default 'PRIVATE';

alter table public.profiles
  add constraint profiles_onboarding_state_check
  check (onboarding_state in ('NOT_STARTED', 'IN_PROGRESS', 'COMPLETED')) not valid;

alter table public.profiles
  add constraint profiles_privacy_level_check
  check (privacy_level in ('EXACT_LOCATION_PRIVATE', 'WARD_VISIBLE', 'MUNICIPALITY_VISIBLE', 'PROVINCE_VISIBLE')) not valid;

alter table public.profiles
  add constraint profiles_age_band_check
  check (age_band is null or age_band in ('UNDER_18', '18_24', '25_34', '35_44', '45_54', '55_64', '65_PLUS')) not valid;

alter table public.profiles
  add constraint profiles_language_check
  check (
    preferred_language is null or preferred_language in (
      'English',
      'Afrikaans',
      'isiZulu',
      'isiXhosa',
      'Sesotho',
      'Setswana',
      'Sepedi',
      'siSwati',
      'Tshivenda',
      'Xitsonga',
      'isiNdebele'
    )
  ) not valid;

alter table public.profiles
  add constraint profiles_gender_check
  check (gender in ('NOT_PROVIDED', 'WOMAN', 'MAN', 'NON_BINARY', 'OTHER')) not valid;

alter table public.profiles
  add constraint profiles_employment_status_check
  check (employment_status in ('EMPLOYED', 'SELF_EMPLOYED', 'UNEMPLOYED', 'STUDENT', 'RETIRED', 'OTHER', 'NOT_PROVIDED')) not valid;

alter table public.profiles
  validate constraint profiles_onboarding_state_check,
  validate constraint profiles_privacy_level_check,
  validate constraint profiles_age_band_check,
  validate constraint profiles_language_check,
  validate constraint profiles_gender_check,
  validate constraint profiles_employment_status_check;

create table if not exists public.profile_capabilities (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  capability text not null,
  created_at timestamptz not null default now(),
  unique (user_id, capability)
);

alter table public.profile_capabilities enable row level security;

create policy "profile_capabilities_select_own_records"
on public.profile_capabilities
for select
using (auth.uid() = user_id);

create policy "profile_capabilities_insert_own_records"
on public.profile_capabilities
for insert
with check (auth.uid() = user_id);

create policy "profile_capabilities_delete_own_records"
on public.profile_capabilities
for delete
using (auth.uid() = user_id);
