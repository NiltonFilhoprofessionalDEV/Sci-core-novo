-- Ajuste de segurança para views que aparecem como 'Unrestricted' no Advisor
begin;

-- Tenta habilitar security_invoker nas views (ignora se não suportado)
do $$
declare
  v text;
  views text[] := array[
    'public.user_profiles_view',
    'public.tema_tables_summary'
  ];
begin
  foreach v in array views loop
    if exists (
      select 1 from pg_class c
      join pg_namespace n on n.oid = c.relnamespace
      where c.relkind = 'v'
        and n.nspname = split_part(v, '.', 1)
        and c.relname = split_part(v, '.', 2)
    ) then
      begin
        execute format('alter view %s set (security_invoker = on);', v);
      exception when others then
        -- Se não suportado, apenas segue para a etapa de privilégios
        perform 1;
      end;
    end if;
  end loop;
end $$;

-- Remover exposição direta dessas views
do $$
declare
  v record;
begin
  for v in
    select n.nspname as schemaname, c.relname as viewname
    from pg_class c
    join pg_namespace n on n.oid = c.relnamespace
    where (n.nspname, c.relname) in (values
      ('public','user_profiles_view'),
      ('public','tema_tables_summary')
    )
      and c.relkind in ('v','m') -- view normal ou materializada
  loop
    execute format('revoke all on %I.%I from anon;', v.schemaname, v.viewname);
    execute format('revoke all on %I.%I from authenticated;', v.schemaname, v.viewname);
    -- Se necessário no app, conceder apenas a authenticated:
    execute format('grant select on %I.%I to authenticated;', v.schemaname, v.viewname);
  end loop;
end $$;

commit;


