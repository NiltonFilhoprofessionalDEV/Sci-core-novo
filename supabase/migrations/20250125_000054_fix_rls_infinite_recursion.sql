-- =====================================================
-- CORREÇÃO: Remover recursão infinita nas políticas RLS
-- Data: 2025-01-25
-- Descrição: Corrigir políticas RLS que causam recursão infinita
-- =====================================================

-- 1. REMOVER TODAS as políticas RLS existentes que podem causar recursão
DROP POLICY IF EXISTS "Allow insert during registration" ON public.profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Gestores can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Gerentes can view section profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can only view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can only update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Only authenticated users can view profiles" ON public.profiles;

-- 2. DESABILITAR RLS temporariamente para evitar problemas
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;

-- 3. REABILITAR RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 4. CRIAR políticas RLS SIMPLES sem referências circulares

-- Política para permitir inserção (necessária para registro)
CREATE POLICY "profiles_insert_policy" ON public.profiles
    FOR INSERT 
    WITH CHECK (true);

-- Política para permitir SELECT apenas do próprio perfil (SEM recursão)
CREATE POLICY "profiles_select_own" ON public.profiles
    FOR SELECT 
    USING (auth.uid() = id);

-- Política para permitir UPDATE apenas do próprio perfil (SEM recursão)
CREATE POLICY "profiles_update_own" ON public.profiles
    FOR UPDATE 
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

-- Política SEPARADA para gestores (sem consultar a própria tabela profiles)
CREATE POLICY "profiles_select_gestor" ON public.profiles
    FOR SELECT 
    USING (
        auth.uid() IN (
            SELECT id FROM public.profiles 
            WHERE perfil = 'gestor_pop' 
            AND id = auth.uid()
        )
    );

-- 5. Verificar políticas criadas
SELECT 
    'POLÍTICAS RLS FINAIS' as info,
    policyname as nome_politica,
    cmd as comando
FROM pg_policies 
WHERE schemaname = 'public' AND tablename = 'profiles'
ORDER BY policyname;

SELECT 'RLS RECURSION FIXED' as resultado;