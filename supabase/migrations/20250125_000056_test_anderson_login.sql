-- =====================================================
-- TESTE: Verificar se Anderson pode fazer login
-- Data: 2025-01-25
-- Descrição: Testar se o usuário Anderson existe e pode autenticar
-- =====================================================

-- 1. Verificar se Anderson existe na tabela auth.users
SELECT 
    'ANDERSON AUTH.USERS' as info,
    id,
    email,
    email_confirmed_at,
    created_at
FROM auth.users 
WHERE email = 'andersonferreiragd94@gmail.com';

-- 2. Verificar se Anderson existe na tabela profiles
SELECT 
    'ANDERSON PROFILES' as info,
    id,
    email,
    nome_completo,
    perfil,
    ativo,
    created_at
FROM public.profiles 
WHERE email = 'andersonferreiragd94@gmail.com';

-- 3. Verificar se as políticas RLS estão funcionando
SELECT 
    'POLÍTICAS RLS ATIVAS' as info,
    policyname,
    cmd
FROM pg_policies 
WHERE schemaname = 'public' AND tablename = 'profiles'
ORDER BY policyname;

-- 4. Testar se conseguimos buscar perfis sem recursão
DO $$
BEGIN
    -- Simular uma consulta que pode causar recursão
    PERFORM id, email, perfil FROM public.profiles LIMIT 1;
    RAISE NOTICE 'TESTE BUSCA PERFIS: Sucesso - Sem recursão infinita detectada';
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'TESTE BUSCA PERFIS: ERRO - %', SQLERRM;
END $$;

SELECT 'TESTE ANDERSON LOGIN CONCLUÍDO' as resultado;