-- Hub CRM Table Hardening — Row Level Security
-- ─────────────────────────────────────────────────────────────────────────────
-- WARNING: Review carefully before running in production.
-- These policies allow ONLY the service_role key (used by Prisma / server-side)
-- to read/write CRM data. Anon and authenticated Supabase client keys are denied.
--
-- If you use Supabase Auth + client-side Supabase queries you will need to
-- add per-user policies BEFORE enabling RLS, or those queries will break.
--
-- Run in Supabase SQL editor or psql with DIRECT_URL.
-- ─────────────────────────────────────────────────────────────────────────────

-- Enable RLS on all Hub CRM tables
alter table "Contact"              enable row level security;
alter table "Inquiry"              enable row level security;
alter table "Appointment"          enable row level security;
alter table "Task"                 enable row level security;
alter table "Event"                enable row level security;
alter table "SystemEvent"          enable row level security;
alter table "ConversationThread"   enable row level security;
alter table "ConversationMessage"  enable row level security;
alter table "AiRun"                enable row level security;
alter table "Note"                 enable row level security;
alter table "ContentAsset"         enable row level security;
alter table "CalendarConnection"   enable row level security;
alter table "CalendarEvent"        enable row level security;

-- Helper: drop existing policies before recreating (idempotent)
do $$ declare
  tbl text;
  pol text;
begin
  for tbl, pol in
    select tablename, policyname
    from pg_policies
    where schemaname = 'public'
      and tablename in (
        'Contact','Inquiry','Appointment','Task','Event','SystemEvent',
        'ConversationThread','ConversationMessage','AiRun','Note',
        'ContentAsset','CalendarConnection','CalendarEvent'
      )
  loop
    execute format('drop policy if exists %I on %I', pol, tbl);
  end loop;
end $$;

-- Grant service_role full access on every table
do $$ declare
  tbl text;
begin
  for tbl in select unnest(array[
    'Contact','Inquiry','Appointment','Task','Event','SystemEvent',
    'ConversationThread','ConversationMessage','AiRun','Note',
    'ContentAsset','CalendarConnection','CalendarEvent'
  ]) loop
    execute format(
      'create policy "Service role full access" on %I for all using (auth.role() = ''service_role'')',
      tbl
    );
  end loop;
end $$;

-- LeadSession is used by ingest-event — harden it too if it exists
do $$ begin
  if exists (select 1 from information_schema.tables where table_name = 'LeadSession') then
    alter table "LeadSession" enable row level security;
    execute 'create policy "Service role full access" on "LeadSession" for all using (auth.role() = ''service_role'')';
  end if;
end $$;
