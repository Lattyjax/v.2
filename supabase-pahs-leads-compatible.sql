-- PAHS standalone leads table
-- Use this when PAHS_LEAD_TARGET=supabase and you want a separate table
-- outside the Hub CRM schema.
--
-- Run in Supabase SQL editor (or psql with DIRECT_URL).

create table if not exists pahs_leads (
  id              uuid primary key default gen_random_uuid(),
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  full_name       text,
  phone           text,
  email           text,
  promo_code      text,
  product_interest text,
  lead_source     text,
  page_source     text,
  status          text not null default 'New',
  county          text,
  notes           text
);

-- Auto-update updated_at
create or replace function update_updated_at_column()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_pahs_leads_updated_at on pahs_leads;
create trigger set_pahs_leads_updated_at
  before update on pahs_leads
  for each row execute function update_updated_at_column();

-- Index for common lookups
create index if not exists pahs_leads_status_idx on pahs_leads (status);
create index if not exists pahs_leads_created_at_idx on pahs_leads (created_at desc);

-- RLS: allow service role full access, deny anon
alter table pahs_leads enable row level security;

create policy "Service role full access" on pahs_leads
  for all using (auth.role() = 'service_role');
