-- =====================================================
-- DEBUG: Verificar função handle_new_user e trigger
-- Data: 2025-01-25
-- Descrição: Investigar problemas com criação automática de perfil
-- =====================================================

-- 1. Verificar se a função handle_new_user existe
SELECT 
    'VERIFICAÇÃO FUNÇÃO' as tipo,
    proname as nome_funcao,
    prosrc as codigo_funcao
FROM pg_proc 
WHERE proname = 'handle_new_user';

-- 2. Verificar se o trigger existe
SELECT 
    'VERIFICAÇÃO TRIGGER' as tipo,
    tgname as nome_trigger,
    tgenabled as habilitado,
    tgtype as tipo_trigger
FROM pg_trigger 
WHERE tgname = 'on_auth_user_created';

-- 3. Verificar se há erros na função
DO $$
BEGIN
    -- Testar se a função pode ser executada
    RAISE NOTICE 'Testando função handle_new_user...';
    
    -- Verificar se as tabelas necessárias existem
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'profiles' AND table_schema = 'public') THEN
        RAISE NOTICE 'ERRO: Tabela public.profiles não existe!';
    END IF;
    
    RAISE NOTICE 'Função handle_new_user verificada com sucesso';
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'ERRO na função handle_new_user: %', SQLERRM;
END $$;

-- 4. Verificar políticas RLS na tabela profiles
SELECT 
    'POLÍTICAS RLS PROFILES' as tipo,
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE schemaname = 'public' AND tablename = 'profiles';

-- 5. Verificar se RLS está habilitado
SELECT 
    'STATUS RLS' as tipo,
    schemaname,
    tablename,
    rowsecurity as rls_habilitado
FROM pg_tables 
WHERE schemaname = 'public' AND tablename = 'profiles';

-- 6. Verificar constraints da tabela profiles
SELECT 
    'CONSTRAINTS PROFILES' as tipo,
    conname as nome_constraint,
    contype as tipo_constraint,
    consrc as definicao
FROM pg_constraint 
WHERE conrelid = 'public.profiles'::regclass;

-- Mensagem final
SELECT 'DEBUG HANDLE_NEW_USER CONCLUÍDO' as resultado;