-- Organizations (companies)
create table if not exists organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  created_at timestamptz default now()
);

-- Vehicles
create table if not exists vehicles (
  id uuid primary key default gen_random_uuid(),
  org_id uuid references organizations(id),
  unit_number text not null,
  make text,
  model text,
  year int,
  vin text,
  status text default 'pending' check (status in ('safe', 'fail', 'pending')),
  last_inspection_at timestamptz,
  created_at timestamptz default now()
);

-- Inspection assignments
create table if not exists inspection_assignments (
  id uuid primary key default gen_random_uuid(),
  vehicle_id uuid references vehicles(id),
  org_id uuid references organizations(id),
  token text unique not null default encode(gen_random_bytes(16), 'hex'),
  driver_name text,
  assigned_by text,
  status text default 'pending' check (status in ('pending', 'completed', 'expired')),
  due_at timestamptz,
  created_at timestamptz default now()
);

-- Inspection results
create table if not exists inspections (
  id uuid primary key default gen_random_uuid(),
  assignment_id uuid references inspection_assignments(id),
  vehicle_id uuid references vehicles(id),
  driver_name text,
  driver_signature text,
  odometer int,
  overall_status text check (overall_status in ('safe', 'fail')),
  defects jsonb default '[]',
  items jsonb not null,
  notes text,
  completed_at timestamptz default now()
);

-- Enable Row Level Security
alter table organizations enable row level security;
alter table vehicles enable row level security;
alter table inspection_assignments enable row level security;
alter table inspections enable row level security;

-- RLS Policies for organizations
create policy "Users can view their organization" on organizations
  for select using (auth.uid() is not null);

create policy "Authenticated users can create organizations" on organizations
  for insert with check (auth.uid() is not null);

-- RLS Policies for vehicles
create policy "Users can view vehicles" on vehicles
  for select using (auth.uid() is not null);

create policy "Users can insert vehicles" on vehicles
  for insert with check (auth.uid() is not null);

create policy "Users can update vehicles" on vehicles
  for update using (auth.uid() is not null);

-- RLS Policies for inspection_assignments
create policy "Users can view assignments" on inspection_assignments
  for select using (auth.uid() is not null);

create policy "Users can create assignments" on inspection_assignments
  for insert with check (auth.uid() is not null);

create policy "Users can update assignments" on inspection_assignments
  for update using (auth.uid() is not null);

-- Public access for token-based inspection
create policy "Public can view assignment by token" on inspection_assignments
  for select using (true);

create policy "Public can update assignment status" on inspection_assignments
  for update using (true);

-- RLS Policies for inspections
create policy "Users can view inspections" on inspections
  for select using (auth.uid() is not null);

create policy "Public can insert inspections" on inspections
  for insert with check (true);

-- Public can update vehicles (for inspection completion)
create policy "Public can update vehicle status" on vehicles
  for update using (true);
