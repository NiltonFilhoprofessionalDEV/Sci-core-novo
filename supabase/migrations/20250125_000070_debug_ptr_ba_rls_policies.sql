-- =====================================================
-- DEBUG: Verificar políticas RLS da tabela ptr_ba_provas_teoricas
-- Data: 2025-01-25
-- Descrição: Investigar erro 42501 na inserção de dados
-- =====================================================

-- 1. Verificar se RLS está habilitado na tabela ptr_ba_provas_teoricas
SELECT 
    'RLS STATUS PTR_BA' as info,
    schemaname,
    tablename,
    rowsecurity as rls_habilitado
FROM pg_tables 
WHERE schemaname = 'public' AND tablename = 'ptr_ba_provas_teoricas';

-- 2. Listar todas as políticas RLS da tabela ptr_ba_provas_teoricas
SELECT 
    'POLÍTICAS RLS PTR_BA' as info,
    policyname,
    cmd,
    permissive,
    roles,
    qual as condicao_where,
    with_check as condicao_with_check
FROM pg_policies 
WHERE schemaname = 'public' AND tablename = 'ptr_ba_provas_teoricas'
ORDER BY cmd, policyname;

-- 3. Verificar permissões GRANT na tabela ptr_ba_provas_teoricas
SELECT 
    'PERMISSÕES GRANT PTR_BA' as info,
    grantee as usuario_role,
    privilege_type as tipo_permissao,
    is_grantable as pode_conceder
FROM information_schema.table_privileges 
WHERE table_schema = 'public' 
AND table_name = 'ptr_ba_provas_teoricas'
AND grantee IN ('authenticated', 'anon', 'public')
ORDER BY grantee, privilege_type;

-- 4. Verificar constraints da tabela ptr_ba_provas_teoricas
SELECT 
    'CONSTRAINTS PTR_BA' as info,
    conname as nome_constraint,
    contype as tipo_constraint,
    pg_get_constraintdef(oid) as definicao
FROM pg_constraint 
WHERE conrelid = 'public.ptr_ba_provas_teoricas'::regclass;

-- 5. Testar se conseguimos inserir dados simulados
DO $$
DECLARE
    test_user_id uuid;
    test_secao_id uuid;
    test_equipe_id uuid;
BEGIN
    -- Buscar um usuário existente
    SELECT id INTO test_user_id FROM public.profiles LIMIT 1;
    
    -- Buscar uma seção existente
    SELECT id INTO test_secao_id FROM public.secoes LIMIT 1;
    
    -- Buscar uma equipe existente
    SELECT id INTO test_equipe_id FROM public.equipes LIMIT 1;
    
    IF test_user_id IS NOT NULL AND test_secao_id IS NOT NULL THEN
        -- Tentar inserir um registro de teste
        INSERT INTO public.ptr_ba_provas_teoricas (
            secao_id,
            equipe_id,
            usuario_id,
            data_referencia,
            nome_cidade,
            data_prova,
            nome_completo,
            nota_prova,
            status,
            observacoes
        ) VALUES (
            test_secao_id,
            test_equipe_id,
            test_user_id,
            CURRENT_DATE,
            'Teste',
            CURRENT_DATE,
            'Teste Usuario',
            8.5,
            'Aprovado',
            'Teste de inserção'
        );
        
        RAISE NOTICE 'TESTE INSERÇÃO PTR_BA: Sucesso - Registro inserido com sucesso';
        
        -- Remover o registro de teste
        DELETE FROM public.ptr_ba_provas_teoricas 
        WHERE observacoes = 'Teste de inserção';
        
    ELSE
        RAISE NOTICE 'TESTE INSERÇÃO PTR_BA: ERRO - Não foi possível encontrar dados de teste (usuário: %, seção: %)', test_user_id, test_secao_id;
    END IF;
    
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'TESTE INSERÇÃO PTR_BA: ERRO - %', SQLERRM;
END $$;

-- 6. Verificar se existe função auth.uid()
SELECT 
    'FUNÇÃO AUTH.UID' as info,
    'Verificação manual necessária' as status;

SELECT 'DEBUG PTR_BA RLS POLICIES CONCLUÍDO' as resultado;