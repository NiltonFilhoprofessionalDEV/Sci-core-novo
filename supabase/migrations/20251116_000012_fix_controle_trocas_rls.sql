-- Habilita RLS e política de leitura para controle_trocas
begin;

do $$
begin
  if exists (
    select 1 from pg_class c
    join pg_namespace n on n.oid = c.relnamespace
    where n.nspname = 'public' and c.relname = 'controle_trocas' and c.relkind in ('r','p')
  ) then
    execute 'alter table public.controle_trocas enable row level security';
    execute 'drop policy if exists read_all_authenticated on public.controle_trocas';
    execute '
      create policy read_all_authenticated on public.controle_trocas
        for select
        to authenticated
        using (true)
    ';
    execute 'revoke all on public.controle_trocas from anon';
    execute 'revoke all on public.controle_trocas from authenticated';
    execute 'grant select on public.controle_trocas to authenticated';
  end if;
end $$;

commit;


