-- Habilita RLS e política de leitura para ptr_ba_horas_treinamento
begin;

do $$
begin
  if exists (
    select 1 from pg_class c
    join pg_namespace n on n.oid = c.relnamespace
    where n.nspname = 'public' and c.relname = 'ptr_ba_horas_treinamento' and c.relkind in ('r','p')
  ) then
    execute 'alter table public.ptr_ba_horas_treinamento enable row level security';
    execute 'drop policy if exists read_all_authenticated on public.ptr_ba_horas_treinamento';
    execute '
      create policy read_all_authenticated on public.ptr_ba_horas_treinamento
        for select
        to authenticated
        using (true)
    ';
    execute 'revoke all on public.ptr_ba_horas_treinamento from anon';
    execute 'revoke all on public.ptr_ba_horas_treinamento from authenticated';
    execute 'grant select on public.ptr_ba_horas_treinamento to authenticated';
  end if;
end $$;

commit;


