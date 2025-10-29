-- =====================================================
-- CORREÇÃO FINAL: Políticas RLS da tabela auth.users
-- Data: 2025-01-25
-- Descrição: Corrigir definitivamente o erro 42501 na tabela auth.users
-- =====================================================

-- 1. Remover todas as políticas RLS existentes da tabela auth.users
DO $$
BEGIN
    -- Dropar todas as políticas existentes
    DROP POLICY IF EXISTS "Users can view own profile" ON auth.users;
    DROP POLICY IF EXISTS "Users can update own profile" ON auth.users;
    DROP POLICY IF EXISTS "Enable read access for authenticated users" ON auth.users;
    DROP POLICY IF EXISTS "Enable select for users based on user_id" ON auth.users;
    DROP POLICY IF EXISTS "Allow authenticated users to read own data" ON auth.users;
    DROP POLICY IF EXISTS "authenticated_users_select" ON auth.users;
    
    RAISE NOTICE 'Políticas RLS removidas da tabela auth.users';
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Erro ao remover políticas: %', SQLERRM;
END $$;

-- 2. Garantir que RLS está habilitado
ALTER TABLE auth.users ENABLE ROW LEVEL SECURITY;

-- 3. Criar política RLS simples e funcional
CREATE POLICY "authenticated_users_can_read_own_data" ON auth.users
    FOR SELECT 
    USING (auth.uid() = id);

-- 4. Garantir permissões corretas no schema auth
GRANT USAGE ON SCHEMA auth TO authenticated;
GRANT SELECT ON auth.users TO authenticated;

-- 5. Garantir permissões corretas no schema public
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO authenticated;

-- 6. Criar política mais permissiva para a tabela profiles (evitar recursão)
DO $$
BEGIN
    -- Remover políticas problemáticas da tabela profiles
    DROP POLICY IF EXISTS "profiles_select_own" ON public.profiles;
    DROP POLICY IF EXISTS "profiles_update_own" ON public.profiles;
    DROP POLICY IF EXISTS "profiles_insert_own" ON public.profiles;
    DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
    DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
    DROP POLICY IF EXISTS "Gestores can view all profiles" ON public.profiles;
    DROP POLICY IF EXISTS "Gerentes can view section profiles" ON public.profiles;
    
    RAISE NOTICE 'Políticas RLS removidas da tabela profiles';
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Erro ao remover políticas profiles: %', SQLERRM;
END $$;

-- 7. Criar políticas simples para a tabela profiles
CREATE POLICY "profiles_select_policy" ON public.profiles
    FOR SELECT 
    USING (auth.uid() = id);

CREATE POLICY "profiles_update_policy" ON public.profiles
    FOR UPDATE 
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

CREATE POLICY "profiles_insert_policy" ON public.profiles
    FOR INSERT 
    WITH CHECK (auth.uid() = id);

-- 8. Verificar se as políticas foram criadas corretamente
SELECT 
    'POLÍTICAS AUTH.USERS' as tabela,
    policyname,
    cmd
FROM pg_policies 
WHERE schemaname = 'auth' AND tablename = 'users'
ORDER BY policyname;

SELECT 
    'POLÍTICAS PROFILES' as tabela,
    policyname,
    cmd
FROM pg_policies 
WHERE schemaname = 'public' AND tablename = 'profiles'
ORDER BY policyname;

-- 9. Log de sucesso
DO $$
BEGIN
    RAISE NOTICE '=== CORREÇÃO FINAL APLICADA COM SUCESSO ===';
    RAISE NOTICE 'Política RLS criada para auth.users: authenticated_users_can_read_own_data';
    RAISE NOTICE 'Políticas RLS criadas para profiles: select, update, insert';
    RAISE NOTICE 'Permissões GRANT aplicadas para authenticated role';
    RAISE NOTICE 'Sistema deve funcionar corretamente agora';
END $$;

SELECT 'CORREÇÃO FINAL AUTH.USERS CONCLUÍDA' as resultado;