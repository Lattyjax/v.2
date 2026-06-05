create table if not exists public.leads (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  full_name text not null,
  phone text not null,
  email text,
  promo_code text,
  product_interest text,
  lead_source text default 'Website',
  page_source text,
  status text default 'New',
  county text,
  notes text
);

create index if not exists leads_created_at_idx on public.leads (created_at desc);
create index if not exists leads_status_idx on public.leads (status);
create index if not exists leads_lead_source_idx on public.leads (lead_source);

alter table public.leads enable row level security;

-- Service-role API inserts bypass RLS. Add app policies later for authenticated admin dashboard reads.
