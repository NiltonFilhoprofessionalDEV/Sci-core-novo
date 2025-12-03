-- Ajuste: evitar ENABLE RLS em views (erro 42809) e aplicar apenas em tabelas reais.
begin;

do $$
declare
  rec record;
begin
  for rec in
    select n.nspname as schemaname, c.relname as tablename
    from pg_class c
    join pg_namespace n on n.oid = c.relnamespace
    where n.nspname = 'public'
      and c.relkind in ('r','p') -- apenas tabelas (r) e partições (p)
      and (n.nspname, c.relname) in (
        values
          ('public','equipes'),
          ('public','secoes'),
          ('public','tema_tables_metadata'),
          ('public','tema_tables_summary')
      )
  loop
    execute format('alter table %I.%I enable row level security;', rec.schemaname, rec.tablename);
    execute format('drop policy if exists read_all_authenticated on %I.%I;', rec.schemaname, rec.tablename);
    execute format(
      'create policy read_all_authenticated on %I.%I for select to authenticated using (true);',
      rec.schemaname, rec.tablename
    );

    -- Privilégios mínimos controlados por RLS
    execute format('revoke all on %I.%I from anon;', rec.schemaname, rec.tablename);
    execute format('revoke all on %I.%I from authenticated;', rec.schemaname, rec.tablename);
    execute format('grant select on %I.%I to authenticated;', rec.schemaname, rec.tablename);
  end loop;
end $$;

commit;


