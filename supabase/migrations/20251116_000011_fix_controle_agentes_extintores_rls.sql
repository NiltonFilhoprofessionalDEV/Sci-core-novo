-- Habilita RLS e política de leitura para controle_agentes_extintores
begin;

do $$
begin
  if exists (
    select 1 from pg_class c
    join pg_namespace n on n.oid = c.relnamespace
    where n.nspname = 'public' and c.relname = 'controle_agentes_extintores' and c.relkind in ('r','p')
  ) then
    execute 'alter table public.controle_agentes_extintores enable row level security';
    execute 'drop policy if exists read_all_authenticated on public.controle_agentes_extintores';
    execute '
      create policy read_all_authenticated on public.controle_agentes_extintores
        for select
        to authenticated
        using (true)
    ';
    execute 'revoke all on public.controle_agentes_extintores from anon';
    execute 'revoke all on public.controle_agentes_extintores from authenticated';
    execute 'grant select on public.controle_agentes_extintores to authenticated';
  end if;
end $$;

commit;


