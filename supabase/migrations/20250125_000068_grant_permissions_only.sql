-- =====================================================
-- CORREÇÃO: Apenas permissões GRANT (sem modificar RLS)
-- Data: 2025-01-25
-- Descrição: Aplicar apenas permissões necessárias sem tocar na tabela auth.users
-- =====================================================

-- 1. Garantir permissões corretas no schema auth
GRANT USAGE ON SCHEMA auth TO authenticated;
GRANT SELECT ON auth.users TO authenticated;

-- 2. Garantir permissões corretas no schema public
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO authenticated;

-- 3. Corrigir políticas apenas da tabela profiles (que podemos modificar)
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
    DROP POLICY IF EXISTS "profiles_select_policy" ON public.profiles;
    DROP POLICY IF EXISTS "profiles_update_policy" ON public.profiles;
    DROP POLICY IF EXISTS "profiles_insert_policy" ON public.profiles;
    
    RAISE NOTICE 'Políticas RLS removidas da tabela profiles';
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Erro ao remover políticas profiles: %', SQLERRM;
END $$;

-- 4. Criar políticas simples para a tabela profiles
CREATE POLICY "profiles_select_authenticated" ON public.profiles
    FOR SELECT 
    USING (auth.uid() = id);

CREATE POLICY "profiles_update_authenticated" ON public.profiles
    FOR UPDATE 
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

CREATE POLICY "profiles_insert_authenticated" ON public.profiles
    FOR INSERT 
    WITH CHECK (auth.uid() = id);

-- 5. Verificar políticas da tabela profiles
SELECT 
    'POLÍTICAS PROFILES FINAIS' as info,
    policyname,
    cmd
FROM pg_policies 
WHERE schemaname = 'public' AND tablename = 'profiles'
ORDER BY policyname;

-- 6. Log de sucesso
DO $$
BEGIN
    RAISE NOTICE '=== PERMISSÕES APLICADAS COM SUCESSO ===';
    RAISE NOTICE 'Permissões GRANT aplicadas para authenticated role';
    RAISE NOTICE 'Políticas RLS da tabela profiles corrigidas';
    RAISE NOTICE 'Tabela auth.users mantida sem alterações';
END $$;

SELECT 'PERMISSÕES APLICADAS COM SUCESSO' as resultado;