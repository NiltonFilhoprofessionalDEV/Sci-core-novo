-- =====================================================
-- CORREÇÃO DEFINITIVA: Limpar e recriar políticas RLS
-- Data: 2025-01-25
-- Descrição: Remover TODAS as políticas e recriar sem recursão
-- =====================================================

-- 1. DESABILITAR RLS temporariamente
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;

-- 2. REMOVER TODAS as políticas existentes (forçar remoção)
DO $$
DECLARE
    policy_record RECORD;
BEGIN
    FOR policy_record IN 
        SELECT policyname 
        FROM pg_policies 
        WHERE schemaname = 'public' AND tablename = 'profiles'
    LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || policy_record.policyname || '" ON public.profiles';
    END LOOP;
END $$;

-- 3. REABILITAR RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 4. CRIAR políticas RLS SIMPLES e SEGURAS

-- Permitir inserção para novos usuários
CREATE POLICY "allow_insert" ON public.profiles
    FOR INSERT 
    WITH CHECK (true);

-- Permitir que usuários vejam apenas seu próprio perfil
CREATE POLICY "view_own_profile" ON public.profiles
    FOR SELECT 
    USING (auth.uid() = id);

-- Permitir que usuários atualizem apenas seu próprio perfil
CREATE POLICY "update_own_profile" ON public.profiles
    FOR UPDATE 
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

-- 5. Verificar se as políticas foram criadas corretamente
SELECT 
    'POLÍTICAS CRIADAS' as status,
    policyname,
    cmd
FROM pg_policies 
WHERE schemaname = 'public' AND tablename = 'profiles'
ORDER BY policyname;

-- 6. Verificar se RLS está ativo
SELECT 
    'RLS STATUS' as status,
    rowsecurity as ativo
FROM pg_tables 
WHERE schemaname = 'public' AND tablename = 'profiles';

SELECT 'RLS POLICIES COMPLETELY FIXED' as resultado;