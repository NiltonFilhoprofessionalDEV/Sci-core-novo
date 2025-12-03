-- Consolida equipes duplicadas por nome e nome_cidade
-- Estratégia: manter a menor UUID (lexicográfica) como canônica e atualizar FKs em todas as tabelas com coluna equipe_id
begin;

-- 1) Identificar duplicatas (mesma cidade e mesmo nome - case-insensitive) em tabela temporária
drop table if exists tmp_equipes_dups;
create temporary table tmp_equipes_dups as
select g.nome_norm, g.nome_cidade, g.keep_id, unnest(g.ids[2:cardinality(g.ids)]) as dup_id
from (
  select lower(e.nome) as nome_norm,
         e.nome_cidade,
         array_agg(e.id order by e.id) as ids,
         (array_agg(e.id order by e.id))[1] as keep_id
  from public.equipes e
  group by lower(e.nome), e.nome_cidade
  having count(*) > 1
) g;

-- 2) Atualizar FKs dinamicamente em todas as tabelas que possuam coluna equipe_id
do $$
declare
  r record;
  t record;
begin
  -- Descobrir dinamicamente todas as tabelas base com FK para equipes(id)
  for t in
    select n.nspname as schemaname, c.relname as tablename
    from pg_constraint fk
    join pg_class c on c.oid = fk.conrelid
    join pg_namespace n on n.oid = c.relnamespace
    where fk.confrelid = 'public.equipes'::regclass
      and fk.contype = 'f'
  loop
    -- Desabilitar apenas triggers de usuário em tabelas problemáticas específicas
    if t.schemaname = 'public' and t.tablename = 'ptr_ba_horas_treinamento' then
      execute format('alter table %I.%I disable trigger user', t.schemaname, t.tablename);
    end if;

    for r in select * from tmp_equipes_dups loop
      execute format('update %I.%I set equipe_id = %L where equipe_id = %L',
                     t.schemaname, t.tablename, r.keep_id, r.dup_id);
    end loop;

    if t.schemaname = 'public' and t.tablename = 'ptr_ba_horas_treinamento' then
      execute format('alter table %I.%I enable trigger user', t.schemaname, t.tablename);
    end if;
  end loop;

  -- Remover duplicatas
  delete from public.equipes e
  using tmp_equipes_dups x
  where e.id = x.dup_id;
end $$;

commit;


