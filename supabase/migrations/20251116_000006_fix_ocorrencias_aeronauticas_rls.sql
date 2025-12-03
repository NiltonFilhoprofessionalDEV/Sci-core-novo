-- Habilita RLS e política de leitura para ocorrencias_aeronauticas
begin;

-- Apenas se for tabela real
do $$
begin
  if exists (
    select 1 from pg_class c
    join pg_namespace n on n.oid = c.relnamespace
    where n.nspname = 'public' and c.relname = 'ocorrencias_aeronauticas' and c.relkind in ('r','p')
  ) then
    execute 'alter table public.ocorrencias_aeronauticas enable row level security';
    execute 'drop policy if exists read_all_authenticated on public.ocorrencias_aeronauticas';
    execute '
      create policy read_all_authenticated on public.ocorrencias_aeronauticas
        for select
        to authenticated
        using (true)
    ';
    -- privilégios mínimos
    execute 'revoke all on public.ocorrencias_aeronauticas from anon';
    execute 'revoke all on public.ocorrencias_aeronauticas from authenticated';
    execute 'grant select on public.ocorrencias_aeronauticas to authenticated';
  end if;
end $$;

commit;


