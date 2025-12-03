-- Habilita RLS e política de leitura para atividades_acessorias
begin;

do $$
begin
  if exists (
    select 1 from pg_class c
    join pg_namespace n on n.oid = c.relnamespace
    where n.nspname = 'public' and c.relname = 'atividades_acessorias' and c.relkind in ('r','p')
  ) then
    execute 'alter table public.atividades_acessorias enable row level security';
    execute 'drop policy if exists read_all_authenticated on public.atividades_acessorias';
    execute '
      create policy read_all_authenticated on public.atividades_acessorias
        for select
        to authenticated
        using (true)
    ';
    execute 'revoke all on public.atividades_acessorias from anon';
    execute 'revoke all on public.atividades_acessorias from authenticated';
    execute 'grant select on public.atividades_acessorias to authenticated';
  end if;
end $$;

commit;


