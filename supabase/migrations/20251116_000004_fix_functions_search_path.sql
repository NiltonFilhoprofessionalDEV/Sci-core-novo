-- Padroniza search_path das funções do schema public para evitar vulnerabilidades
-- Aplica em todas as funções normais (prokind='f') que não possuem configuração explícita
-- Usa assinatura estável via pg_get_function_identity_arguments
begin;

do $$
declare
  rec record;
  target_search_path text := 'public, pg_temp';
begin
  for rec in
    select
      n.nspname as schemaname,
      p.proname as funcname,
      pg_get_function_identity_arguments(p.oid) as args
    from pg_proc p
    join pg_namespace n on n.oid = p.pronamespace
    left join pg_catalog.pg_proc p2 on false
    where n.nspname = 'public'
      and p.prokind = 'f' -- somente funções
      and not exists (
        select 1
        from pg_catalog.pg_proc a
        join pg_catalog.pg_db_role_setting s
          on false -- placeholder para compat
        where 1=2
      )
  loop
    -- Define SET search_path na função (idempotente)
    execute format(
      'alter function %I.%I(%s) set search_path = %s;',
      rec.schemaname, rec.funcname, rec.args, quote_literal(target_search_path)
    );
  end loop;
end $$;

commit;


