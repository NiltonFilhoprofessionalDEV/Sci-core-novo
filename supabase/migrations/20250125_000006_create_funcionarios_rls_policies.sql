-- =====================================================
-- POLÍTICAS RLS PARA TABELA FUNCIONARIOS
-- Data: 2025-01-25
-- Descrição: Configurar Row Level Security para a tabela funcionarios
--           seguindo o padrão de isolamento por seção
-- =====================================================

-- Habilitar RLS na tabela funcionarios
ALTER TABLE public.funcionarios ENABLE ROW LEVEL SECURITY;

-- Conceder permissões básicas para roles
GRANT SELECT ON public.funcionarios TO anon;
GRANT ALL PRIVILEGES ON public.funcionarios TO authenticated;

-- =====================================================
-- POLÍTICAS PARA VISUALIZAÇÃO (SELECT)
-- =====================================================

-- Gestor POP: pode ver todos os funcionários
CREATE POLICY "Gestor POP pode ver todos os funcionários" ON public.funcionarios
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() 
            AND perfil = 'gestor_pop' 
            AND ativo = true
        )
    );

-- Gerente de Seção: pode ver funcionários da sua seção
CREATE POLICY "Gerente pode ver funcionários da sua seção" ON public.funcionarios
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() 
            AND perfil = 'gerente_secao' 
            AND secao_id = public.funcionarios.secao_id 
            AND ativo = true
        )
    );

-- BA-CE: pode ver funcionários da sua seção
CREATE POLICY "BA-CE pode ver funcionários da sua seção" ON public.funcionarios
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() 
            AND perfil = 'ba_ce' 
            AND secao_id = public.funcionarios.secao_id 
            AND ativo = true
        )
    );

-- =====================================================
-- POLÍTICAS PARA INSERÇÃO (INSERT)
-- =====================================================

-- Gestor POP: pode inserir funcionários em qualquer seção
CREATE POLICY "Gestor POP pode inserir funcionários" ON public.funcionarios
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() 
            AND perfil = 'gestor_pop' 
            AND ativo = true
        )
    );

-- Gerente de Seção: pode inserir funcionários apenas na sua seção
CREATE POLICY "Gerente pode inserir funcionários na sua seção" ON public.funcionarios
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() 
            AND perfil = 'gerente_secao' 
            AND secao_id = public.funcionarios.secao_id 
            AND ativo = true
        )
    );

-- BA-CE: pode inserir funcionários apenas na sua seção/equipe
CREATE POLICY "BA-CE pode inserir funcionários na sua seção" ON public.funcionarios
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() 
            AND perfil = 'ba_ce' 
            AND secao_id = public.funcionarios.secao_id 
            AND (equipe_id = public.funcionarios.equipe_id OR public.funcionarios.equipe_id IS NOT NULL)
            AND ativo = true
        )
    );

-- =====================================================
-- POLÍTICAS PARA ATUALIZAÇÃO (UPDATE)
-- =====================================================

-- Gestor POP: pode atualizar qualquer funcionário
CREATE POLICY "Gestor POP pode atualizar funcionários" ON public.funcionarios
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() 
            AND perfil = 'gestor_pop' 
            AND ativo = true
        )
    );

-- Gerente de Seção: pode atualizar funcionários da sua seção
CREATE POLICY "Gerente pode atualizar funcionários da sua seção" ON public.funcionarios
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() 
            AND perfil = 'gerente_secao' 
            AND secao_id = public.funcionarios.secao_id 
            AND ativo = true
        )
    );

-- BA-CE: pode atualizar funcionários da sua seção
CREATE POLICY "BA-CE pode atualizar funcionários da sua seção" ON public.funcionarios
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() 
            AND perfil = 'ba_ce' 
            AND secao_id = public.funcionarios.secao_id 
            AND ativo = true
        )
    );

-- =====================================================
-- POLÍTICAS PARA EXCLUSÃO (DELETE)
-- =====================================================

-- Apenas Gestor POP pode excluir funcionários
CREATE POLICY "Apenas Gestor POP pode excluir funcionários" ON public.funcionarios
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() 
            AND perfil = 'gestor_pop' 
            AND ativo = true
        )
    );

-- =====================================================
-- COMENTÁRIOS E DOCUMENTAÇÃO
-- =====================================================

COMMENT ON TABLE public.funcionarios IS 'Cadastro simplificado de funcionários (bombeiros) com RLS habilitado para isolamento por seção';

-- As políticas garantem que:
-- 1. Gestor POP tem acesso total a todos os funcionários
-- 2. Gerentes de Seção podem gerenciar apenas funcionários da sua seção
-- 3. BA-CE podem ver e gerenciar funcionários da sua seção
-- 4. Apenas Gestor POP pode excluir funcionários
-- 5. Isolamento completo entre seções para usuários não-gestores