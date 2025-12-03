-- Habilita RLS e política de leitura para verificacao_tps
begin;

do $$
begin
  if exists (
    select 1 from pg_class c
    join pg_namespace n on n.oid = c.relnamespace
    where n.nspname = 'public' and c.relname = 'verificacao_tps' and c.relkind in ('r','p')
  ) then
    execute 'alter table public.verificacao_tps enable row level security';
    execute 'drop policy if exists read_all_authenticated on public.verificacao_tps';
    execute '
      create policy read_all_authenticated on public.verificacao_tps
        for select
        to authenticated
        using (true)
    ';
    execute 'revoke all on public.verificacao_tps from anon';
    execute 'revoke all on public.verificacao_tps from authenticated';
    execute 'grant select on public.verificacao_tps to authenticated';
  end if;
end $$;

commit;


