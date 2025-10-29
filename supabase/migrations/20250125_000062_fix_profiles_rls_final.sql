-- =====================================================
-- Corrigir políticas RLS da tabela profiles definitivamente
-- =====================================================

-- 1. Remover todas as políticas existentes
DROP POLICY IF EXISTS "profiles_insert_policy" ON public.profiles;
DROP POLICY IF EXISTS "profiles_select_own" ON public.profiles;
DROP POLICY IF EXISTS "profiles_update_own" ON public.profiles;
DROP POLICY IF EXISTS "profiles_select_gestor" ON public.profiles;

-- 2. Criar políticas RLS mais simples e funcionais

-- Política para permitir inserção (necessária para registro)
CREATE POLICY "allow_insert_profiles" ON public.profiles
    FOR INSERT 
    WITH CHECK (auth.uid() = id);

-- Política para permitir SELECT do próprio perfil
CREATE POLICY "allow_select_own_profile" ON public.profiles
    FOR SELECT 
    USING (auth.uid() = id);

-- Política para permitir UPDATE do próprio perfil
CREATE POLICY "allow_update_own_profile" ON public.profiles
    FOR UPDATE 
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

-- Política para gestores verem todos os perfis (sem recursão)
CREATE POLICY "allow_gestor_select_all" ON public.profiles
    FOR SELECT 
    USING (
        EXISTS (
            SELECT 1 FROM auth.users 
            WHERE auth.users.id = auth.uid()
            AND auth.users.raw_user_meta_data->>'perfil' = 'gestor_pop'
        )
    );

-- 3. Garantir permissões corretas
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT USAGE ON SCHEMA public TO authenticated;

-- 4. Verificar se o usuário Ronan existe e está ativo
UPDATE public.profiles 
SET ativo = true 
WHERE email = 'bace.alfa.goiania@medmais.com';

-- 5. Log de verificação
DO $$
DECLARE
    user_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO user_count 
    FROM public.profiles 
    WHERE email = 'bace.alfa.goiania@medmais.com' AND ativo = true;
    
    RAISE NOTICE 'Políticas RLS da tabela profiles corrigidas!';
    RAISE NOTICE 'Usuário Ronan Martins encontrado e ativo: %', CASE WHEN user_count > 0 THEN 'SIM' ELSE 'NÃO' END;
END $$;