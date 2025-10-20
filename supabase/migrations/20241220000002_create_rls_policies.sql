-- =====================================================
-- POLÍTICAS RLS (ROW LEVEL SECURITY)
-- Sistema de Indicadores Bombeiro MedMais
-- =====================================================

-- =====================================================
-- 1. HABILITAR RLS EM TODAS AS TABELAS
-- =====================================================
ALTER TABLE public.secoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.equipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.indicadores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.preenchimentos ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- 2. POLÍTICAS PARA TABELA SEÇÕES
-- =====================================================

-- Gestor POP: vê todas as seções
CREATE POLICY "Gestor POP pode ver todas as seções" ON public.secoes
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND perfil = 'gestor_pop' AND ativo = true
        )
    );

-- Gerente de Seção: vê apenas sua seção
CREATE POLICY "Gerente pode ver sua seção" ON public.secoes
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() 
            AND perfil = 'gerente_secao' 
            AND secao_id = public.secoes.id 
            AND ativo = true
        )
    );

-- BA-CE: vê apenas sua seção
CREATE POLICY "BA-CE pode ver sua seção" ON public.secoes
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() 
            AND perfil = 'ba_ce' 
            AND secao_id = public.secoes.id 
            AND ativo = true
        )
    );

-- =====================================================
-- 3. POLÍTICAS PARA TABELA EQUIPES
-- =====================================================

-- Gestor POP: vê todas as equipes
CREATE POLICY "Gestor POP pode ver todas as equipes" ON public.equipes
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND perfil = 'gestor_pop' AND ativo = true
        )
    );

-- Gerente de Seção: vê equipes da sua seção
CREATE POLICY "Gerente pode ver equipes da sua seção" ON public.equipes
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() 
            AND perfil = 'gerente_secao' 
            AND secao_id = public.equipes.secao_id 
            AND ativo = true
        )
    );

-- BA-CE: vê equipes da sua seção
CREATE POLICY "BA-CE pode ver equipes da sua seção" ON public.equipes
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() 
            AND perfil = 'ba_ce' 
            AND secao_id = public.equipes.secao_id 
            AND ativo = true
        )
    );

-- =====================================================
-- 4. POLÍTICAS PARA TABELA PROFILES
-- =====================================================

-- Usuários podem ver apenas seu próprio perfil
CREATE POLICY "Usuários podem ver seu próprio perfil" ON public.profiles
    FOR SELECT USING (auth.uid() = id);

-- Usuários podem atualizar apenas seu próprio perfil (campos limitados)
CREATE POLICY "Usuários podem atualizar seu próprio perfil" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

-- Gestor POP pode ver todos os perfis
CREATE POLICY "Gestor POP pode ver todos os perfis" ON public.profiles
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND perfil = 'gestor_pop' AND ativo = true
        )
    );

-- Gerente pode ver perfis da sua seção
CREATE POLICY "Gerente pode ver perfis da sua seção" ON public.profiles
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.profiles p1
            WHERE p1.id = auth.uid() 
            AND p1.perfil = 'gerente_secao' 
            AND p1.secao_id = public.profiles.secao_id 
            AND p1.ativo = true
        )
    );

-- =====================================================
-- 5. POLÍTICAS PARA TABELA INDICADORES
-- =====================================================

-- Todos os usuários autenticados podem ver indicadores ativos
CREATE POLICY "Usuários autenticados podem ver indicadores" ON public.indicadores
    FOR SELECT USING (
        auth.role() = 'authenticated' AND ativo = true
    );

-- Apenas Gestor POP pode gerenciar indicadores (inserir, atualizar, deletar)
CREATE POLICY "Gestor POP pode gerenciar indicadores" ON public.indicadores
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND perfil = 'gestor_pop' AND ativo = true
        )
    );

-- =====================================================
-- 6. POLÍTICAS PARA TABELA PREENCHIMENTOS
-- =====================================================

-- Gestor POP: vê todos os preenchimentos
CREATE POLICY "Gestor POP pode ver todos os preenchimentos" ON public.preenchimentos
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND perfil = 'gestor_pop' AND ativo = true
        )
    );

-- Gerente de Seção: vê preenchimentos da sua seção
CREATE POLICY "Gerente pode ver preenchimentos da sua seção" ON public.preenchimentos
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() 
            AND perfil = 'gerente_secao' 
            AND secao_id = public.preenchimentos.secao_id 
            AND ativo = true
        )
    );

-- BA-CE: vê preenchimentos da sua seção
CREATE POLICY "BA-CE pode ver preenchimentos da sua seção" ON public.preenchimentos
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() 
            AND perfil = 'ba_ce' 
            AND secao_id = public.preenchimentos.secao_id 
            AND ativo = true
        )
    );

-- BA-CE: pode inserir preenchimentos apenas para sua equipe/seção
CREATE POLICY "BA-CE pode inserir preenchimentos" ON public.preenchimentos
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() 
            AND perfil = 'ba_ce' 
            AND secao_id = public.preenchimentos.secao_id 
            AND (equipe_id = public.preenchimentos.equipe_id OR public.preenchimentos.equipe_id IS NULL)
            AND ativo = true
        )
        AND usuario_id = auth.uid()
    );

-- BA-CE: pode atualizar apenas seus próprios preenchimentos
CREATE POLICY "BA-CE pode atualizar seus preenchimentos" ON public.preenchimentos
    FOR UPDATE USING (
        usuario_id = auth.uid() 
        AND EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND perfil = 'ba_ce' AND ativo = true
        )
    );

-- Gerente e Gestor POP podem atualizar preenchimentos (para correções)
CREATE POLICY "Gerente pode atualizar preenchimentos da sua seção" ON public.preenchimentos
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() 
            AND perfil IN ('gerente_secao', 'gestor_pop')
            AND (perfil = 'gestor_pop' OR secao_id = public.preenchimentos.secao_id)
            AND ativo = true
        )
    );

-- =====================================================
-- 7. PERMISSÕES PARA ROLES ANÔNIMOS E AUTENTICADOS
-- =====================================================

-- Permissões básicas para role anônimo (apenas para login)
GRANT USAGE ON SCHEMA public TO anon;

-- Permissões para usuários autenticados
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT SELECT ON public.secoes TO authenticated;
GRANT SELECT ON public.equipes TO authenticated;
GRANT ALL PRIVILEGES ON public.profiles TO authenticated;
GRANT SELECT ON public.indicadores TO authenticated;
GRANT ALL PRIVILEGES ON public.preenchimentos TO authenticated;

-- Permissões especiais para Gestor POP (via políticas RLS)
GRANT INSERT, UPDATE, DELETE ON public.indicadores TO authenticated;

-- =====================================================
-- 8. FUNÇÕES AUXILIARES PARA VERIFICAÇÃO DE PERMISSÕES
-- =====================================================

-- Função para verificar se usuário é Gestor POP
CREATE OR REPLACE FUNCTION public.is_gestor_pop()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE id = auth.uid() AND perfil = 'gestor_pop' AND ativo = true
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para verificar se usuário é Gerente de uma seção específica
CREATE OR REPLACE FUNCTION public.is_gerente_secao(secao_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE id = auth.uid() 
        AND perfil = 'gerente_secao' 
        AND secao_id = secao_uuid 
        AND ativo = true
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para verificar se usuário é BA-CE de uma seção específica
CREATE OR REPLACE FUNCTION public.is_bace_secao(secao_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE id = auth.uid() 
        AND perfil = 'ba_ce' 
        AND secao_id = secao_uuid 
        AND ativo = true
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para obter seções visíveis para o usuário atual
CREATE OR REPLACE FUNCTION public.get_secoes_visiveis()
RETURNS TABLE(secao_id UUID, nome VARCHAR, codigo VARCHAR) AS $$
BEGIN
    -- Gestor POP vê todas
    IF public.is_gestor_pop() THEN
        RETURN QUERY 
        SELECT s.id, s.nome, s.codigo 
        FROM public.secoes s 
        WHERE s.ativa = true 
        ORDER BY s.nome;
    ELSE
        -- Gerente e BA-CE veem apenas sua seção
        RETURN QUERY 
        SELECT s.id, s.nome, s.codigo 
        FROM public.secoes s 
        INNER JOIN public.profiles p ON p.secao_id = s.id 
        WHERE p.id = auth.uid() AND p.ativo = true AND s.ativa = true;
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 9. COMENTÁRIOS PARA DOCUMENTAÇÃO
-- =====================================================
COMMENT ON POLICY "Gestor POP pode ver todas as seções" ON public.secoes IS 'Gestor POP tem acesso total a todas as seções';
COMMENT ON POLICY "Gerente pode ver sua seção" ON public.secoes IS 'Gerente de Seção vê apenas sua seção específica';
COMMENT ON POLICY "BA-CE pode ver sua seção" ON public.secoes IS 'BA-CE vê apenas a seção onde sua equipe está localizada';

COMMENT ON FUNCTION public.is_gestor_pop() IS 'Verifica se o usuário atual é Gestor POP ativo';
COMMENT ON FUNCTION public.get_secoes_visiveis() IS 'Retorna as seções que o usuário atual pode visualizar baseado em seu perfil';