-- =====================================================
-- Corrigir políticas RLS para permitir inserção de perfis
-- Data: 2025-01-25
-- =====================================================

-- Verificar políticas RLS atuais
SELECT 
    'POLÍTICAS RLS ATUAIS' as info,
    policyname,
    cmd,
    permissive
FROM pg_policies 
WHERE schemaname = 'public' AND tablename = 'profiles';

-- Remover políticas restritivas que podem estar bloqueando inserção
DROP POLICY IF EXISTS "Users can only view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can only update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Only authenticated users can view profiles" ON public.profiles;

-- Criar política que permite inserção durante o registro
CREATE POLICY "Allow insert during registration" ON public.profiles
    FOR INSERT 
    WITH CHECK (true);

-- Criar política que permite usuários verem seu próprio perfil
CREATE POLICY "Users can view own profile" ON public.profiles
    FOR SELECT 
    USING (auth.uid() = id);

-- Criar política que permite usuários atualizarem seu próprio perfil
CREATE POLICY "Users can update own profile" ON public.profiles
    FOR UPDATE 
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

-- Política para gestores verem todos os perfis
CREATE POLICY "Gestores can view all profiles" ON public.profiles
    FOR SELECT 
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles p 
            WHERE p.id = auth.uid() 
            AND p.perfil = 'gestor_pop'
        )
    );

-- Política para gerentes verem perfis da sua seção
CREATE POLICY "Gerentes can view section profiles" ON public.profiles
    FOR SELECT 
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles p 
            WHERE p.id = auth.uid() 
            AND p.perfil = 'gerente_secao'
            AND p.secao_id = profiles.secao_id
        )
    );

-- Verificar políticas após criação
SELECT 
    'POLÍTICAS RLS FINAIS' as info,
    policyname,
    cmd,
    permissive
FROM pg_policies 
WHERE schemaname = 'public' AND tablename = 'profiles';

SELECT 'RLS POLICIES FIXED' as resultado;