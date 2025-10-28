-- =====================================================
-- DEBUG: Verificar função handle_new_user e trigger (CORRIGIDO)
-- Data: 2025-01-25
-- Descrição: Investigar problemas com criação automática de perfil
-- =====================================================

-- 1. Verificar se a função handle_new_user existe
SELECT 
    'VERIFICAÇÃO FUNÇÃO' as tipo,
    proname as nome_funcao
FROM pg_proc 
WHERE proname = 'handle_new_user';

-- 2. Verificar se o trigger existe
SELECT 
    'VERIFICAÇÃO TRIGGER' as tipo,
    tgname as nome_trigger,
    tgenabled as habilitado
FROM pg_trigger 
WHERE tgname = 'on_auth_user_created';

-- 3. Verificar políticas RLS na tabela profiles
SELECT 
    'POLÍTICAS RLS PROFILES' as tipo,
    schemaname,
    tablename,
    policyname,
    permissive,
    cmd
FROM pg_policies 
WHERE schemaname = 'public' AND tablename = 'profiles';

-- 4. Verificar se RLS está habilitado
SELECT 
    'STATUS RLS' as tipo,
    schemaname,
    tablename,
    rowsecurity as rls_habilitado
FROM pg_tables 
WHERE schemaname = 'public' AND tablename = 'profiles';

-- 5. Verificar constraints da tabela profiles
SELECT 
    'CONSTRAINTS PROFILES' as tipo,
    conname as nome_constraint,
    contype as tipo_constraint
FROM pg_constraint 
WHERE conrelid = 'public.profiles'::regclass;

-- 6. Testar criação de usuário simulado
DO $$
DECLARE
    test_user_id uuid := gen_random_uuid();
BEGIN
    -- Simular inserção na tabela profiles
    INSERT INTO public.profiles (
        id,
        email,
        nome_completo,
        perfil,
        ativo,
        created_at,
        updated_at
    ) VALUES (
        test_user_id,
        'teste@exemplo.com',
        'USUÁRIO TESTE',
        'ba_ce',
        true,
        NOW(),
        NOW()
    );
    
    -- Deletar o usuário teste
    DELETE FROM public.profiles WHERE id = test_user_id;
    
    RAISE NOTICE 'TESTE INSERÇÃO: Sucesso - Tabela profiles aceita inserções';
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'TESTE INSERÇÃO: ERRO - %', SQLERRM;
END $$;

-- Mensagem final
SELECT 'DEBUG HANDLE_NEW_USER CONCLUÍDO' as resultado;