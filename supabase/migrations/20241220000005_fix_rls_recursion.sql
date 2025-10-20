-- =====================================================
-- CORREÇÃO DE RECURSÃO INFINITA NAS POLÍTICAS RLS
-- =====================================================
-- Data: 2024-12-20
-- Objetivo: Corrigir erro 42P17 - infinite recursion detected in policy for relation "profiles"

-- 1. REMOVER POLÍTICAS PROBLEMÁTICAS DA TABELA PROFILES
-- =====================================================

-- Dropar todas as políticas existentes da tabela profiles
DROP POLICY IF EXISTS "Usuários podem ver seu próprio perfil" ON public.profiles;
DROP POLICY IF EXISTS "Usuários podem atualizar seu próprio perfil" ON public.profiles;
DROP POLICY IF EXISTS "Gestor POP pode ver todos os perfis" ON public.profiles;
DROP POLICY IF EXISTS "Gerente pode ver perfis da sua seção" ON public.profiles;

-- 2. RECRIAR POLÍTICAS SIMPLIFICADAS E SEGURAS
-- =====================================================

-- Política básica: usuário vê apenas seu próprio perfil
CREATE POLICY "profiles_select_own" ON public.profiles
    FOR SELECT USING (auth.uid() = id);

-- Política básica: usuário atualiza apenas seu próprio perfil
CREATE POLICY "profiles_update_own" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

-- Política para inserção: permitir criação de perfil próprio
CREATE POLICY "profiles_insert_own" ON public.profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- 3. POLÍTICAS ESPECIAIS PARA GESTORES (SEM RECURSÃO)
-- =====================================================

-- Gestor POP pode ver todos os perfis (usando função auxiliar)
CREATE OR REPLACE FUNCTION public.is_gestor_pop()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
    SELECT EXISTS (
        SELECT 1 
        FROM auth.users u
        WHERE u.id = auth.uid()
        AND u.raw_user_meta_data->>'perfil' = 'gestor_pop'
    );
$$;

-- Política para Gestor POP ver todos os perfis
CREATE POLICY "profiles_select_gestor_pop" ON public.profiles
    FOR SELECT USING (public.is_gestor_pop());

-- Função para verificar se é gerente da mesma seção
CREATE OR REPLACE FUNCTION public.is_gerente_same_secao(target_secao_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
    SELECT EXISTS (
        SELECT 1 
        FROM auth.users u
        WHERE u.id = auth.uid()
        AND u.raw_user_meta_data->>'perfil' = 'gerente_secao'
        AND (u.raw_user_meta_data->>'secao_id')::uuid = target_secao_id
    );
$$;

-- Política para Gerente ver perfis da sua seção
CREATE POLICY "profiles_select_gerente_secao" ON public.profiles
    FOR SELECT USING (
        secao_id IS NOT NULL 
        AND public.is_gerente_same_secao(secao_id)
    );

-- 4. COMENTÁRIOS E OBSERVAÇÕES
-- =====================================================

-- OBSERVAÇÕES IMPORTANTES:
-- 1. As políticas foram simplificadas para evitar recursão
-- 2. Usamos funções auxiliares para verificações complexas
-- 3. As funções usam auth.users.raw_user_meta_data em vez da tabela profiles
-- 4. Isso quebra a dependência circular que causava a recursão
-- 5. As políticas são aplicadas em ordem de prioridade (mais específicas primeiro)

-- TESTE RECOMENDADO:
-- Após aplicar esta migração, testar:
-- 1. Login com usuários de teste
-- 2. Carregamento de perfis
-- 3. Verificar se não há mais erro 42P17