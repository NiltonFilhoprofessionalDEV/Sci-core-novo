-- Habilita RLS e política de leitura para higienizacao_tps
begin;

do $$
begin
  if exists (
    select 1 from pg_class c
    join pg_namespace n on n.oid = c.relnamespace
    where n.nspname = 'public' and c.relname = 'higienizacao_tps' and c.relkind in ('r','p')
  ) then
    execute 'alter table public.higienizacao_tps enable row level security';
    execute 'drop policy if exists read_all_authenticated on public.higienizacao_tps';
    execute '
      create policy read_all_authenticated on public.higienizacao_tps
        for select
        to authenticated
        using (true)
    ';
    execute 'revoke all on public.higienizacao_tps from anon';
    execute 'revoke all on public.higienizacao_tps from authenticated';
    execute 'grant select on public.higienizacao_tps to authenticated';
  end if;
end $$;

commit;


