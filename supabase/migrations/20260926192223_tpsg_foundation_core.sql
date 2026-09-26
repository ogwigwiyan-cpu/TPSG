begin;

create table if not exists system.source_registry (
  source_id uuid primary key default gen_random_uuid(),
  source_code text not null unique,
  source_name text not null,
  source_type text not null check (source_type in ('GOVERNMENT','ELECTORAL','GIS','OPEN_DATA','COMMERCIAL','COMMUNITY','INTERNAL','OTHER')),
  provider_name text,
  provider_url text,
  authority_level text check (authority_level in ('AUTHORITATIVE','OFFICIAL','PRIMARY','SECONDARY','COMMUNITY','UNKNOWN')),
  licence_name text,
  licence_url text,
  usage_rights text,
  terms_version text,
  active boolean not null default true,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists system.source_dataset (
  dataset_id uuid primary key default gen_random_uuid(),
  source_id uuid not null references system.source_registry(source_id),
  dataset_code text not null,
  dataset_name text not null,
  description text,
  external_dataset_id text,
  version_label text,
  effective_from timestamptz,
  effective_to timestamptz,
  retrieved_at timestamptz,
  licence_name text,
  licence_url text,
  usage_rights text,
  geographic_coverage text,
  format text,
  endpoint_url text,
  checksum_sha256 text,
  import_method text,
  status text not null default 'ACTIVE' check (status in ('ACTIVE','SUPERSEDED','RETIRED','QUARANTINED')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(source_id, dataset_code, version_label)
);

create table if not exists system.external_identifier (
  external_identifier_id uuid primary key default gen_random_uuid(),
  dataset_id uuid references system.source_dataset(dataset_id),
  entity_type text not null,
  internal_id uuid not null,
  external_id text not null,
  external_label text,
  first_seen_at timestamptz not null default now(),
  last_seen_at timestamptz,
  metadata jsonb not null default '{}'::jsonb,
  unique(dataset_id, entity_type, external_id)
);

create table if not exists system.ingestion_run (
  ingestion_run_id uuid primary key default gen_random_uuid(),
  dataset_id uuid not null references system.source_dataset(dataset_id),
  started_at timestamptz not null default now(),
  completed_at timestamptz,
  status text not null default 'STARTED' check (status in ('STARTED','SUCCEEDED','PARTIAL','FAILED','CANCELLED')),
  records_seen bigint not null default 0,
  records_inserted bigint not null default 0,
  records_updated bigint not null default 0,
  records_rejected bigint not null default 0,
  error_count bigint not null default 0,
  source_checksum_sha256 text,
  notes text
);

create table if not exists geography.place_type (
  place_type_code text primary key,
  label text not null,
  description text,
  level_order integer not null,
  is_jurisdiction boolean not null default false,
  is_addressable boolean not null default false
);

insert into geography.place_type (place_type_code,label,description,level_order,is_jurisdiction,is_addressable) values
('COUNTRY','Country','National geographic unit',10,true,false),
('PROVINCE','Province','Provincial geographic unit',20,true,false),
('DISTRICT','District','District municipality or equivalent district',30,true,false),
('MUNICIPALITY','Municipality','Local municipality or metropolitan municipality',40,true,false),
('WARD','Ward','Municipal ward',50,true,false),
('VOTING_DISTRICT','Voting District','Electoral voting district',55,true,false),
('COMMUNITY','Community','Community-level civic geography',60,false,false),
('SUB_COMMUNITY','Sub-community','Sub-community geography',65,false,false),
('SUBURB','Suburb','Named suburb',70,false,false),
('SETTLEMENT','Settlement','Named settlement',75,false,false),
('AREA','Area','Named civic/geographic area',80,false,false),
('STREET','Street','Street or road',90,false,true),
('STREET_SEGMENT','Street Segment','Addressable street segment',95,true,true),
('FACILITY','Facility','Public or relevant civic facility',100,false,true),
('SERVICE_AREA','Service Area','Operational service catchment',110,true,false),
('ADDRESS','Address','Address/location reference',120,false,true),
('OTHER','Other','Other geographic object',999,false,false)
on conflict (place_type_code) do nothing;

create table if not exists geography.place (
  place_id uuid primary key default gen_random_uuid(),
  place_type_code text not null references geography.place_type(place_type_code),
  parent_place_id uuid references geography.place(place_id),
  canonical_name text not null,
  official_name text,
  normalized_name text,
  slug text,
  description text,
  centroid extensions.geography(Point,4326),
  geometry extensions.geography(Geometry,4326),
  source_dataset_id uuid references system.source_dataset(dataset_id),
  external_id text,
  valid_from timestamptz,
  valid_to timestamptz,
  is_current boolean not null default true,
  privacy_level text not null default 'PUBLIC' check (privacy_level in ('PRIVATE','RESTRICTED','COMMUNITY','AGGREGATED','PUBLIC','OFFICIAL','LEGALLY_RESTRICTED')),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists place_geometry_gix on geography.place using gist (geometry);
create index if not exists place_centroid_gix on geography.place using gist (centroid);
create index if not exists place_parent_idx on geography.place(parent_place_id);
create index if not exists place_type_idx on geography.place(place_type_code);
create index if not exists place_name_trgm_idx on geography.place using gin (canonical_name extensions.gin_trgm_ops);

create table if not exists geography.place_relationship (
  relationship_id uuid primary key default gen_random_uuid(),
  from_place_id uuid not null references geography.place(place_id),
  to_place_id uuid not null references geography.place(place_id),
  relationship_type text not null,
  valid_from timestamptz,
  valid_to timestamptz,
  source_dataset_id uuid references system.source_dataset(dataset_id),
  confidence text check (confidence in ('LOW','MEDIUM','HIGH','UNKNOWN')),
  metadata jsonb not null default '{}'::jsonb,
  unique(from_place_id,to_place_id,relationship_type,valid_from)
);

create table if not exists geography.boundary (
  boundary_id uuid primary key default gen_random_uuid(),
  place_id uuid not null references geography.place(place_id),
  dataset_id uuid references system.source_dataset(dataset_id),
  boundary_version text,
  valid_from timestamptz,
  valid_to timestamptz,
  geometry extensions.geography(MultiPolygon,4326) not null,
  checksum_sha256 text,
  is_current boolean not null default true,
  created_at timestamptz not null default now()
);
create index if not exists boundary_geometry_gix on geography.boundary using gist (geometry);
create index if not exists boundary_place_idx on geography.boundary(place_id);

create table if not exists geography.address (
  address_id uuid primary key default gen_random_uuid(),
  place_id uuid references geography.place(place_id),
  address_text text,
  normalized_address text,
  location extensions.geography(Point,4326),
  source_dataset_id uuid references system.source_dataset(dataset_id),
  external_id text,
  privacy_level text not null default 'RESTRICTED' check (privacy_level in ('PRIVATE','RESTRICTED','PUBLIC')),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
create index if not exists address_location_gix on geography.address using gist (location);

create table if not exists identity.person (
  person_id uuid primary key references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create table if not exists identity.profile (
  person_id uuid primary key references identity.person(person_id),
  display_name text,
  preferred_language text,
  accessibility_preferences jsonb not null default '{}'::jsonb,
  civic_profile_visibility text not null default 'RESTRICTED' check (civic_profile_visibility in ('PRIVATE','RESTRICTED','PUBLIC')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create table if not exists identity.person_location (
  person_location_id uuid primary key default gen_random_uuid(),
  person_id uuid not null references identity.person(person_id),
  place_id uuid references geography.place(place_id),
  address_id uuid references geography.address(address_id),
  point extensions.geography(Point,4326),
  location_source text not null default 'USER_DECLARED' check (location_source in ('USER_DECLARED','USER_SELECTED','GPS','GEOCODED','IMPORTED','INFERRED')),
  confidence text not null default 'UNKNOWN' check (confidence in ('LOW','MEDIUM','HIGH','UNKNOWN')),
  valid_from timestamptz not null default now(),
  valid_to timestamptz,
  is_current boolean not null default true,
  privacy_level text not null default 'PRIVATE' check (privacy_level in ('PRIVATE','RESTRICTED','COMMUNITY','AGGREGATED','PUBLIC')),
  created_at timestamptz not null default now()
);
create index if not exists person_location_point_gix on identity.person_location using gist (point);
create index if not exists person_location_person_idx on identity.person_location(person_id);

create table if not exists civic.matter (
  matter_id uuid primary key default gen_random_uuid(),
  reporter_person_id uuid references identity.person(person_id),
  original_statement text not null,
  language_code text,
  matter_type_code text,
  status text not null default 'SUBMITTED' check (status in ('SUBMITTED','TRIAGING','IN_PROGRESS','COMPLETION_CLAIMED','VERIFICATION_PENDING','VERIFIED','DISPUTED','REOPENED','CLOSED','WITHDRAWN')),
  visibility text not null default 'PRIVATE' check (visibility in ('PRIVATE','RESTRICTED','PUBLIC')),
  processing_status text not null default 'PENDING' check (processing_status in ('PENDING','PROCESSING','COMPLETED','FAILED')),
  classification_status text not null default 'PENDING' check (classification_status in ('PENDING','COMPLETED','FAILED','HUMAN_REVIEW_REQUIRED')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists matter_reporter_idx on civic.matter(reporter_person_id);
create index if not exists matter_status_idx on civic.matter(status);
create index if not exists matter_created_idx on civic.matter(created_at desc);

create table if not exists civic.matter_location (
  matter_location_id uuid primary key default gen_random_uuid(),
  matter_id uuid not null references civic.matter(matter_id),
  place_id uuid references geography.place(place_id),
  point extensions.geography(Point,4326),
  location_precision text not null default 'UNKNOWN' check (location_precision in ('ADDRESS','STREET_SEGMENT','STREET','AREA','COMMUNITY','WARD','MUNICIPALITY','DISTRICT','PROVINCE','COUNTRY','UNKNOWN')),
  resolution_status text not null default 'UNRESOLVED' check (resolution_status in ('RESOLVED','PARTIALLY_RESOLVED','UNRESOLVED')),
  confidence text not null default 'UNKNOWN' check (confidence in ('LOW','MEDIUM','HIGH','UNKNOWN')),
  source text,
  created_at timestamptz not null default now()
);
create index if not exists matter_location_point_gix on civic.matter_location using gist (point);
create index if not exists matter_location_matter_idx on civic.matter_location(matter_id);

create table if not exists taxonomy.domain (
  domain_id uuid primary key default gen_random_uuid(),
  code text not null unique,
  name text not null,
  description text,
  version text not null default '1.0',
  active boolean not null default true,
  created_at timestamptz not null default now()
);
create table if not exists taxonomy.category (
  category_id uuid primary key default gen_random_uuid(),
  domain_id uuid not null references taxonomy.domain(domain_id),
  code text not null,
  name text not null,
  description text,
  active boolean not null default true,
  unique(domain_id,code)
);
create table if not exists taxonomy.subcategory (
  subcategory_id uuid primary key default gen_random_uuid(),
  category_id uuid not null references taxonomy.category(category_id),
  code text not null,
  name text not null,
  description text,
  active boolean not null default true,
  unique(category_id,code)
);

create table if not exists taxonomy.matter_type (
  matter_type_code text primary key,
  label text not null,
  description text
);
insert into taxonomy.matter_type(matter_type_code,label) values
('NEED','Need'),('WANT','Want'),('PREFERENCE','Preference'),('ISSUE','Issue'),('INCIDENT','Incident'),('PROPOSAL','Proposal'),('QUESTION','Question'),('REQUEST','Request'),('COMPLAINT','Complaint'),('SUGGESTION','Suggestion'),('PETITION','Petition'),('POLL','Poll'),('COMMITMENT','Commitment'),('DUTY','Duty'),('PROJECT','Project'),('POLICY','Policy'),('PROGRAMME','Programme'),('SERVICE','Service'),('FACILITY','Facility'),('INFRASTRUCTURE','Infrastructure'),('EVENT','Event'),('CLAIM','Claim'),('RESPONSE','Response'),('DISPUTE','Dispute')
on conflict (matter_type_code) do nothing;

create table if not exists taxonomy.condition (
  condition_code text primary key,
  label text not null,
  description text
);
insert into taxonomy.condition(condition_code,label) values
('UNAVAILABLE','Unavailable'),('BROKEN','Broken'),('DAMAGED','Damaged'),('UNSAFE','Unsafe'),('BLOCKED','Blocked'),('LEAKING','Leaking'),('OVERFLOWING','Overflowing'),('DISCONNECTED','Disconnected'),('DELAYED','Delayed'),('INACCESSIBLE','Inaccessible'),('OVERCROWDED','Overcrowded'),('UNDERCAPACITY','Under-capacity'),('OVERCAPACITY','Over-capacity'),('INCOMPLETE','Incomplete'),('ABANDONED','Abandoned'),('DETERIORATING','Deteriorating'),('CONTAMINATED','Contaminated'),('UNRELIABLE','Unreliable'),('UNAFFORDABLE','Unaffordable'),('INADEQUATE','Inadequate'),('INSUFFICIENT','Insufficient'),('DUPLICATED','Duplicated'),('POORLY_MAINTAINED','Poorly maintained'),('NEWLY_REQUIRED','Newly required'),('RECURRING','Recurring'),('SYSTEMIC','Systemic'),('DISPUTED','Disputed')
on conflict (condition_code) do nothing;

create table if not exists civic.matter_classification (
  matter_classification_id uuid primary key default gen_random_uuid(),
  matter_id uuid not null references civic.matter(matter_id),
  domain_id uuid references taxonomy.domain(domain_id),
  category_id uuid references taxonomy.category(category_id),
  subcategory_id uuid references taxonomy.subcategory(subcategory_id),
  matter_type_code text references taxonomy.matter_type(matter_type_code),
  condition_code text references taxonomy.condition(condition_code),
  confidence text not null default 'LOW' check (confidence in ('LOW','MEDIUM','HIGH')),
  source text not null default 'SYSTEM',
  model_name text,
  model_version text,
  human_reviewed boolean not null default false,
  created_at timestamptz not null default now(),
  unique(matter_id)
);

create table if not exists civic.matter_status_history (
  matter_status_event_id uuid primary key default gen_random_uuid(),
  matter_id uuid not null references civic.matter(matter_id),
  previous_status text,
  new_status text not null,
  actor_type text not null,
  actor_id uuid,
  reason text,
  created_at timestamptz not null default now()
);

create table if not exists audit.event (
  audit_event_id uuid primary key default gen_random_uuid(),
  event_type text not null,
  actor_type text,
  actor_id uuid,
  entity_type text,
  entity_id uuid,
  request_id text,
  occurred_at timestamptz not null default now(),
  payload jsonb not null default '{}'::jsonb
);
create index if not exists audit_event_entity_idx on audit.event(entity_type,entity_id);
create index if not exists audit_event_time_idx on audit.event(occurred_at desc);

do $$
declare r record;
begin
  for r in
    select n.nspname as schema_name, c.relname as table_name
    from pg_class c join pg_namespace n on n.oid=c.relnamespace
    where c.relkind='r' and n.nspname in ('identity','geography','civic','taxonomy','responsibility','evidence','verification','priority','political','election','governance','commitment','plan','project','finance','performance','notification','analytics','audit','system')
  loop
    execute format('alter table %I.%I enable row level security', r.schema_name, r.table_name);
  end loop;
end $$;

commit;
