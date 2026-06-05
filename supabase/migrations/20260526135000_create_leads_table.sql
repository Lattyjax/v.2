create table if not exists public.leads (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  full_name text,
  email text,
  phone text,
  county text,
  product_interest text,
  lead_source text,
  page_source text,
  status text default 'New',
  utm_source text default 'unknown',
  utm_medium text default 'unknown',
  utm_campaign text default 'unknown',
  utm_term text,
  utm_content text,
  notes text
);

alter table public.leads enable row level security;

create policy "Allow insert for everyone" on public.leads
  for insert with check (true);

create policy "Allow read for authenticated users" on public.leads
  for select to authenticated using (true);
