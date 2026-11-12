-- Limite de uploads de arte por cliente (20 por hora). Guarda só um hash do IP.
create table if not exists public.upload_log (
  id bigint generated always as identity primary key,
  client_key text not null,
  created_at timestamptz not null default now()
);
create index if not exists upload_log_key_idx on public.upload_log(client_key, created_at desc);
alter table public.upload_log enable row level security; -- sem políticas: só a service role acessa

-- Limpeza: registros com mais de 1 dia não servem para nada.
-- (Opcional) agende no Supabase: Database → Cron →
--   delete from public.upload_log where created_at < now() - interval '1 day';
