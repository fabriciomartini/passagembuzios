-- Passagem de Serviço Búzios — base compartilhada (colar no SQL Editor do Supabase e executar)
create table if not exists public.bz_kv (
  k text primary key,
  v text,
  autor text,
  atualizado timestamptz not null default now()
);
create index if not exists bz_kv_atualizado on public.bz_kv (atualizado);

create or replace function public.bz_kv_touch() returns trigger language plpgsql as $$
begin new.atualizado := clock_timestamp(); return new; end $$;
drop trigger if exists bz_kv_touch on public.bz_kv;
create trigger bz_kv_touch before insert or update on public.bz_kv
  for each row execute function public.bz_kv_touch();

alter table public.bz_kv enable row level security;
drop policy if exists bz_kv_ler on public.bz_kv;
drop policy if exists bz_kv_inserir on public.bz_kv;
drop policy if exists bz_kv_alterar on public.bz_kv;
create policy bz_kv_ler on public.bz_kv for select to anon using (true);
create policy bz_kv_inserir on public.bz_kv for insert to anon with check (true);
create policy bz_kv_alterar on public.bz_kv for update to anon using (true) with check (true);
grant select, insert, update on public.bz_kv to anon;
