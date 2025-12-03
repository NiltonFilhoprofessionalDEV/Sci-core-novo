-- Índices genéricos para colunas mais filtradas no app
-- Cria índices em todas as tabelas do schema public que possuam as colunas:
-- secao_id, equipe_id, ativa, data, data_referencia, usuario_id
-- Também cria composto (secao_id, equipe_id) quando ambos existem.
begin;

do $$
declare
  rec record;
  tbl regclass;
  has_secao boolean;
  has_equipe boolean;
begin
  for rec in
    select table_schema, table_name
    from information_schema.tables
    where table_schema = 'public'
      and table_type = 'BASE TABLE'
  loop
    tbl := format('%I.%I', rec.table_schema, rec.table_name)::regclass;

    -- Índices simples
    perform 1
    from information_schema.columns
    where table_schema = rec.table_schema and table_name = rec.table_name and column_name = 'secao_id';
    if found then
      execute format('create index if not exists %I on %s (secao_id);', rec.table_name || '_secao_id_idx', tbl);
    end if;

    perform 1
    from information_schema.columns
    where table_schema = rec.table_schema and table_name = rec.table_name and column_name = 'equipe_id';
    if found then
      execute format('create index if not exists %I on %s (equipe_id);', rec.table_name || '_equipe_id_idx', tbl);
    end if;

    perform 1
    from information_schema.columns
    where table_schema = rec.table_schema and table_name = rec.table_name and column_name = 'ativa';
    if found then
      execute format('create index if not exists %I on %s (ativa);', rec.table_name || '_ativa_idx', tbl);
    end if;

    perform 1
    from information_schema.columns
    where table_schema = rec.table_schema and table_name = rec.table_name and column_name = 'data';
    if found then
      execute format('create index if not exists %I on %s (data);', rec.table_name || '_data_idx', tbl);
    end if;

    perform 1
    from information_schema.columns
    where table_schema = rec.table_schema and table_name = rec.table_name and column_name = 'data_referencia';
    if found then
      execute format('create index if not exists %I on %s (data_referencia);', rec.table_name || '_data_referencia_idx', tbl);
    end if;

    perform 1
    from information_schema.columns
    where table_schema = rec.table_schema and table_name = rec.table_name and column_name = 'usuario_id';
    if found then
      execute format('create index if not exists %I on %s (usuario_id);', rec.table_name || '_usuario_id_idx', tbl);
    end if;

    -- Índice composto (secao_id, equipe_id) quando ambos existirem
    select exists (
             select 1 from information_schema.columns
             where table_schema = rec.table_schema and table_name = rec.table_name and column_name = 'secao_id'
           ),
           exists (
             select 1 from information_schema.columns
             where table_schema = rec.table_schema and table_name = rec.table_name and column_name = 'equipe_id'
           )
      into has_secao, has_equipe;

    if has_secao and has_equipe then
      execute format('create index if not exists %I on %s (secao_id, equipe_id);', rec.table_name || '_secao_equipe_idx', tbl);
    end if;
  end loop;
end $$;

commit;


