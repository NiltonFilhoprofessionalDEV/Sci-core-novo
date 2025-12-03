-- Habilita RLS e política de leitura para tempo_resposta
begin;

do $$
begin
  if exists (
    select 1 from pg_class c
    join pg_namespace n on n.oid = c.relnamespace
    where n.nspname = 'public' and c.relname = 'tempo_resposta' and c.relkind in ('r','p')
  ) then
    execute 'alter table public.tempo_resposta enable row level security';
    execute 'drop policy if exists read_all_authenticated on public.tempo_resposta';
    execute '
      create policy read_all_authenticated on public.tempo_resposta
        for select
        to authenticated
        using (true)
    ';
    execute 'revoke all on public.tempo_resposta from anon';
    execute 'revoke all on public.tempo_resposta from authenticated';
    execute 'grant select on public.tempo_resposta to authenticated';
  end if;
end $$;

commit;


