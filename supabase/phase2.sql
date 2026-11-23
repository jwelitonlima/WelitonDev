-- EspIAn · Fase 2 — aparelhos, sessões e acesso do painel admin
-- Antes de rodar:
--   1) Troque SEU_EMAIL_AQUI (1 vez, na função abaixo) pelo e-mail do usuário admin
--      que você criar em Authentication > Users no Supabase.
--   2) Rode tudo no SQL Editor. Pode ser executado mais de uma vez.

-- ───────── Quem é o admin ─────────
create or replace function public.is_espian_admin() returns boolean
language sql stable as $$
  select coalesce(lower(auth.jwt() ->> 'email') = lower('SEU_EMAIL_AQUI'), false)
$$;
grant execute on function public.is_espian_admin() to authenticated;

-- ───────── Aparelhos ─────────
create table if not exists public.devices (
  id uuid primary key default gen_random_uuid(),
  num bigint generated always as identity,   -- "Aparelho #3"
  created_at timestamptz not null default now(),
  first_seen timestamptz not null default now(),
  last_seen timestamptz not null default now(),
  visits int not null default 0,
  alias text,
  notes text,
  is_owner boolean not null default false,
  vids text[] not null default '{}',
  ip_hashes text[] not null default '{}',
  fp_hash text,
  hw_hash text,
  model text,
  os text,
  browser text,
  device_kind text,
  screen text,
  gpu text,
  tz text,
  lang text,
  last_city text,
  last_region text,
  last_country text
);
create index if not exists devices_vids_gin on public.devices using gin (vids);
create index if not exists devices_fp_idx on public.devices (fp_hash);
create index if not exists devices_hw_idx on public.devices (hw_hash);
create index if not exists devices_last_seen_idx on public.devices (last_seen desc);

-- ───────── Sessões (uma linha por visita; o painel lê daqui) ─────────
create table if not exists public.sessions (
  sid text primary key,
  visitor_id text not null,
  device_id uuid references public.devices(id) on delete set null,
  match_confidence text,
  match_reason text,
  visit_no int,
  started_at timestamptz not null default now(),
  ended_at timestamptz,
  duration_s int,
  active_s int,
  pages int,
  clicks int,
  max_scroll int,
  actions int,
  city text,
  region text,
  country text,
  browser text,
  os text,
  device_kind text,
  referrer text,
  utm text,
  is_returning boolean,
  report_mid bigint,
  summary jsonb,
  created_at timestamptz not null default now()
);
create index if not exists sessions_started_idx on public.sessions (started_at desc);
create index if not exists sessions_device_idx on public.sessions (device_id, started_at desc);
create index if not exists events_session_idx on public.events (session_id, id);

-- ───────── Segurança (RLS) ─────────
alter table public.devices enable row level security;
alter table public.sessions enable row level security;
alter table public.events enable row level security;

grant select, insert, update, delete on public.devices, public.sessions to service_role;
grant usage, select on all sequences in schema public to service_role;
grant select on public.events, public.devices, public.sessions to authenticated;
-- o painel só pode editar estes 3 campos do aparelho
grant update (alias, notes, is_owner) on public.devices to authenticated;

drop policy if exists "service_all_devices" on public.devices;
create policy "service_all_devices" on public.devices for all to service_role using (true) with check (true);
drop policy if exists "service_all_sessions" on public.sessions;
create policy "service_all_sessions" on public.sessions for all to service_role using (true) with check (true);

drop policy if exists "admin_read_events" on public.events;
create policy "admin_read_events" on public.events for select to authenticated using (public.is_espian_admin());
drop policy if exists "admin_read_devices" on public.devices;
create policy "admin_read_devices" on public.devices for select to authenticated using (public.is_espian_admin());
drop policy if exists "admin_update_devices" on public.devices;
create policy "admin_update_devices" on public.devices for update to authenticated
  using (public.is_espian_admin()) with check (public.is_espian_admin());
drop policy if exists "admin_read_sessions" on public.sessions;
create policy "admin_read_sessions" on public.sessions for select to authenticated using (public.is_espian_admin());

-- ───────── Retenção (opcional): apaga eventos e sessões antigos ─────────
create or replace function public.espian_purge(days int default 90) returns void
language sql as $$
  delete from public.events where created_at < now() - make_interval(days => days);
  delete from public.sessions where started_at < now() - make_interval(days => days);
$$;
-- Para rodar todo dia às 4h (exige a extensão pg_cron ativada):
-- select cron.schedule('espian-purge', '0 4 * * *', 'select public.espian_purge(90)');
