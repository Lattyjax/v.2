create table if not exists public.tracking_events (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  event_type text not null,
  utm_source text,
  utm_medium text,
  utm_campaign text,
  destination_url text,
  lead_session_id text,
  county text,
  product_interest text
);

alter table public.tracking_events enable row level security;

create policy "Allow anonymous inserts" on public.tracking_events
  for insert with check (true);

create policy "Allow read for authenticated users" on public.tracking_events
  for select to authenticated using (true);
