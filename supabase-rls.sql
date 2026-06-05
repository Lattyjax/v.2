-- Run this in Supabase SQL Editor after running: npx prisma migrate deploy
-- This locks down all tables to service-role only (Prisma server-side access only)

alter table if exists public."Contact" enable row level security;
alter table if exists public."Inquiry" enable row level security;
alter table if exists public."Appointment" enable row level security;
alter table if exists public."Event" enable row level security;
alter table if exists public."Task" enable row level security;
alter table if exists public."InquiryStageHistory" enable row level security;
alter table if exists public."EmailLog" enable row level security;

create policy service_role_contact on public."Contact" for all
  using (auth.role() = 'service_role') with check (auth.role() = 'service_role');

create policy service_role_inquiry on public."Inquiry" for all
  using (auth.role() = 'service_role') with check (auth.role() = 'service_role');

create policy service_role_appointment on public."Appointment" for all
  using (auth.role() = 'service_role') with check (auth.role() = 'service_role');

create policy service_role_event on public."Event" for all
  using (auth.role() = 'service_role') with check (auth.role() = 'service_role');

create policy service_role_task on public."Task" for all
  using (auth.role() = 'service_role') with check (auth.role() = 'service_role');

create policy service_role_history on public."InquiryStageHistory" for all
  using (auth.role() = 'service_role') with check (auth.role() = 'service_role');

create policy service_role_emaillog on public."EmailLog" for all
  using (auth.role() = 'service_role') with check (auth.role() = 'service_role');

revoke all on table public."Contact" from anon, authenticated;
revoke all on table public."Inquiry" from anon, authenticated;
revoke all on table public."Appointment" from anon, authenticated;
revoke all on table public."Event" from anon, authenticated;
revoke all on table public."Task" from anon, authenticated;
revoke all on table public."InquiryStageHistory" from anon, authenticated;
revoke all on table public."EmailLog" from anon, authenticated;
