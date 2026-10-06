create extension if not exists pgcrypto;

create schema if not exists geography;

create table if not exists geography.countries (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  name text not null unique,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists geography.provinces (
  id uuid primary key default gen_random_uuid(),
  country_id uuid not null references geography.countries (id) on delete restrict,
  code text not null,
  name text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (country_id, code),
  unique (country_id, name)
);

create table if not exists geography.municipalities (
  id uuid primary key default gen_random_uuid(),
  province_id uuid not null references geography.provinces (id) on delete restrict,
  code text not null,
  name text not null,
  municipality_type text not null default 'MUNICIPALITY' check (
    municipality_type in ('METROPOLITAN', 'CITY', 'MUNICIPALITY', 'DISTRICT', 'LOCAL')
  ),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (province_id, code),
  unique (province_id, name)
);

create table if not exists geography.wards (
  id uuid primary key default gen_random_uuid(),
  municipality_id uuid not null references geography.municipalities (id) on delete restrict,
  code text not null,
  name text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (municipality_id, code),
  unique (municipality_id, name)
);

create table if not exists geography.communities (
  id uuid primary key default gen_random_uuid(),
  ward_id uuid references geography.wards (id) on delete restrict,
  code text not null,
  name text not null,
  locality_type text not null default 'LOCALITY' check (
    locality_type in ('COMMUNITY', 'SUBURB', 'TOWNSHIP', 'VILLAGE', 'LOCALITY', 'OTHER')
  ),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (ward_id, code),
  unique (ward_id, name)
);

create table if not exists geography.street_localities (
  id uuid primary key default gen_random_uuid(),
  community_id uuid references geography.communities (id) on delete restrict,
  code text not null,
  name text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (community_id, code),
  unique (community_id, name)
);

alter table public.profiles
  add column if not exists country_id uuid references geography.countries (id),
  add column if not exists province_id uuid references geography.provinces (id),
  add column if not exists municipality_id uuid references geography.municipalities (id),
  add column if not exists ward_id uuid references geography.wards (id),
  add column if not exists community_id uuid references geography.communities (id),
  add column if not exists street_locality_id uuid references geography.street_localities (id);

create table if not exists public.profile_geographic_associations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users (id) on delete cascade,
  country_id uuid references geography.countries (id) on delete set null,
  province_id uuid references geography.provinces (id) on delete set null,
  municipality_id uuid references geography.municipalities (id) on delete set null,
  ward_id uuid references geography.wards (id) on delete set null,
  community_id uuid references geography.communities (id) on delete set null,
  street_locality_id uuid references geography.street_localities (id) on delete set null,
  exact_location_private boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function geography.validate_profile_geographic_hierarchy()
returns trigger
language plpgsql
as $$
begin
  if new.country_id is not null and new.province_id is not null then
    if not exists (
      select 1
      from geography.provinces p
      where p.id = new.province_id
        and p.country_id = new.country_id
    ) then
      raise exception 'Selected province must belong to the selected country.';
    end if;
  end if;

  if new.province_id is not null and new.municipality_id is not null then
    if not exists (
      select 1
      from geography.municipalities m
      where m.id = new.municipality_id
        and m.province_id = new.province_id
    ) then
      raise exception 'Selected municipality must belong to the selected province.';
    end if;
  end if;

  if new.municipality_id is not null and new.ward_id is not null then
    if not exists (
      select 1
      from geography.wards w
      where w.id = new.ward_id
        and w.municipality_id = new.municipality_id
    ) then
      raise exception 'Selected ward must belong to the selected municipality.';
    end if;
  end if;

  if new.ward_id is not null and new.community_id is not null then
    if not exists (
      select 1
      from geography.communities c
      where c.id = new.community_id
        and c.ward_id = new.ward_id
    ) then
      raise exception 'Selected community must belong to the selected ward.';
    end if;
  end if;

  return new;
end;
$$;

create trigger profile_geographic_association_hierarchy_check
before insert or update on public.profile_geographic_associations
for each row
execute function geography.validate_profile_geographic_hierarchy();

alter table geography.countries enable row level security;
alter table geography.provinces enable row level security;
alter table geography.municipalities enable row level security;
alter table geography.wards enable row level security;
alter table geography.communities enable row level security;
alter table geography.street_localities enable row level security;

alter table public.profile_geographic_associations enable row level security;

create policy "geography_reference_data_readable"
on geography.countries for select using (true);
create policy "geography_province_data_readable"
on geography.provinces for select using (true);
create policy "geography_municipality_data_readable"
on geography.municipalities for select using (true);
create policy "geography_ward_data_readable"
on geography.wards for select using (true);
create policy "geography_community_data_readable"
on geography.communities for select using (true);
create policy "geography_street_locality_data_readable"
on geography.street_localities for select using (true);

create policy "profile_geography_select_own_record"
on public.profile_geographic_associations
for select using (auth.uid() = user_id);

create policy "profile_geography_insert_own_record"
on public.profile_geographic_associations
for insert with check (auth.uid() = user_id);

create policy "profile_geography_update_own_record"
on public.profile_geographic_associations
for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "profile_geography_delete_own_record"
on public.profile_geographic_associations
for delete using (auth.uid() = user_id);
