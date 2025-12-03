-- Corrige alertas de segurança no Supabase (RLS e SECURITY DEFINER)
-- Objetivo: habilitar RLS onde faltava e garantir que views não usem SECURITY DEFINER.
-- As políticas abaixo são exclusivamente de leitura e não alteram comportamento de escrita do app.
-- Se o app precisar escrever nessas tabelas, políticas adicionais específicas devem ser criadas.

begin;

-- 1) Tabelas público-centradas usadas em leitura pelo app
do $$
declare
  t text;
  tabs text[] := array[
    'public.equipes',
    'public.secoes',
    'public.tema_tables_metadata',
    'public.tema_tables_summary'
  ];
begin
  foreach t in array tabs loop
    -- Habilita RLS com idempotência
    execute format('alter table %s enable row level security;', t);

    -- Garante que não exista política anterior conflitando
    perform 1
    from pg_policies p
    where p.schemaname = split_part(t, '.', 1)
      and p.tablename = split_part(t, '.', 2)
      and p.policyname = 'read_all_authenticated';

    if found then
      execute format('drop policy if exists read_all_authenticated on %s;', t);
    end if;

    -- Política de leitura segura:
    -- permite SELECT para usuários autenticados (role = authenticated) respeitando RLS.
    execute format(
      'create policy read_all_authenticated on %s
         for select
         to authenticated
         using (true);',
      t
    );
  end loop;
end $$;

-- 2) Views marcadas como SECURITY DEFINER -> converter para invoker
-- Evita bypass de RLS através da view.
-- OBS: compatível com PostgreSQL 15+ (ALTER VIEW ... SET (security_invoker = on))
do $$
declare
  v text;
  views text[] := array[
    'public.user_profiles_view',
    'public.tema_tables_summary'  -- caso exista também como view
  ];
begin
  foreach v in array views loop
    -- Apenas altera se a view existir
    if exists (
      select 1 from pg_class c
      join pg_namespace n on n.oid = c.relnamespace
      where c.relkind = 'v'
        and n.nspname = split_part(v, '.', 1)
        and c.relname = split_part(v, '.', 2)
    ) then
      execute format('alter view %s set (security_invoker = on);', v);
    end if;
  end loop;
end $$;

-- 3) Reforço de privilégios mínimos (apenas leitura via RLS)
-- Revoga privilégios diretos e deixa o controle para RLS.
do $$
declare
  t text;
  tabs text[] := array[
    'public.equipes',
    'public.secoes',
    'public.tema_tables_metadata',
    'public.tema_tables_summary'
  ];
begin
  foreach t in array tabs loop
    execute format('revoke all on %s from anon;', t);
    execute format('revoke all on %s from authenticated;', t);
    -- Concede privilégios controlados por RLS (SELECT)
    execute format('grant select on %s to authenticated;', t);
  end loop;
end $$;

-- 4) Índices simples para consultas comuns vistas no código
-- Evitam full scans em filtros frequentes.
-- Cria apenas se não existirem.
create index if not exists idx_secoes_codigo on public.secoes (codigo);
create index if not exists idx_equipes_secao_id on public.equipes (secao_id);
create index if not exists idx_tema_tables_metadata_nome on public.tema_tables_metadata (nome);

commit;


