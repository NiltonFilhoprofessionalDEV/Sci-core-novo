-- =====================================================
-- DEBUG: Verificar políticas RLS da tabela auth.users
-- Data: 2025-01-25
-- Descrição: Investigar políticas RLS que podem estar causando erro 42501
-- =====================================================

-- 1. Verificar se RLS está habilitado na tabela auth.users
SELECT 
    'RLS STATUS AUTH.USERS' as info,
    schemaname,
    tablename,
    rowsecurity as rls_habilitado
FROM pg_tables 
WHERE schemaname = 'auth' AND tablename = 'users';

-- 2. Listar todas as políticas RLS da tabela auth.users
SELECT 
    'POLÍTICAS RLS AUTH.USERS' as info,
    policyname,
    cmd,
    permissive,
    roles,
    qual as condicao_where,
    with_check as condicao_with_check
FROM pg_policies 
WHERE schemaname = 'auth' AND tablename = 'users'
ORDER BY cmd, policyname;

-- 3. Verificar permissões GRANT na tabela auth.users
SELECT 
    'PERMISSÕES GRANT AUTH.USERS' as info,
    grantee as usuario_role,
    privilege_type as tipo_permissao,
    is_grantable as pode_conceder
FROM information_schema.table_privileges 
WHERE table_schema = 'auth' 
AND table_name = 'users'
AND grantee IN ('authenticated', 'anon', 'public')
ORDER BY grantee, privilege_type;

-- 4. Verificar permissões no schema auth (usando pg_namespace)
SELECT 
    'PERMISSÕES SCHEMA AUTH' as info,
    'Verificação manual necessária' as usuario_role,
    'USAGE' as tipo_permissao;

-- 5. Testar se conseguimos acessar auth.users com auth.uid()
DO $$
DECLARE
    test_result RECORD;
BEGIN
    -- Simular uma consulta que pode estar falhando
    SELECT COUNT(*) as total INTO test_result FROM auth.users LIMIT 1;
    RAISE NOTICE 'TESTE ACESSO AUTH.USERS: Sucesso - Total de usuários: %', test_result.total;
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'TESTE ACESSO AUTH.USERS: ERRO - %', SQLERRM;
END $$;

-- 6. Verificar se existe função get_user_profile_data
SELECT 
    'FUNÇÃO GET_USER_PROFILE_DATA' as info,
    proname as nome_funcao,
    prosecdef as security_definer
FROM pg_proc 
WHERE proname = 'get_user_profile_data';

-- 7. Verificar se existe view user_profiles_view
SELECT 
    'VIEW USER_PROFILES_VIEW' as info,
    viewname as nome_view
FROM pg_views 
WHERE schemaname = 'public' AND viewname = 'user_profiles_view';

SELECT 'DEBUG AUTH.USERS POLICIES CONCLUÍDO' as resultado;