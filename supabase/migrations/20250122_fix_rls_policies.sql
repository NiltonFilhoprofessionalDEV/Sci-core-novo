-- Migração para corrigir políticas RLS que estão causando ERR_ABORTED
-- Data: 2025-01-22

-- Primeiro, vamos remover as políticas existentes que podem estar causando problemas
DROP POLICY IF EXISTS "ocorrencias_aeronauticas_select_policy" ON ocorrencias_aeronauticas;
DROP POLICY IF EXISTS "ocorrencias_nao_aeronauticas_select_policy" ON ocorrencias_nao_aeronauticas;
DROP POLICY IF EXISTS "ptr_ba_provas_teoricas_select_policy" ON ptr_ba_provas_teoricas;
DROP POLICY IF EXISTS "ptr_ba_horas_treinamento_select_policy" ON ptr_ba_horas_treinamento;
DROP POLICY IF EXISTS "tempo_epr_select_policy" ON tempo_epr;
DROP POLICY IF EXISTS "tempo_resposta_select_policy" ON tempo_resposta;
DROP POLICY IF EXISTS "controle_agentes_extintores_select_policy" ON controle_agentes_extintores;
DROP POLICY IF EXISTS "controle_trocas_select_policy" ON controle_trocas;
DROP POLICY IF EXISTS "verificacao_tps_select_policy" ON verificacao_tps;
DROP POLICY IF EXISTS "higienizacao_tps_select_policy" ON higienizacao_tps;
DROP POLICY IF EXISTS "controle_uniformes_recebidos_select_policy" ON controle_uniformes_recebidos;
DROP POLICY IF EXISTS "atividades_acessorias_select_policy" ON atividades_acessorias;

-- Criar políticas mais simples e funcionais
-- Política para ocorrencias_aeronauticas
CREATE POLICY "ocorrencias_aeronauticas_select_policy" ON ocorrencias_aeronauticas
FOR SELECT USING (
    -- Gestor POP vê tudo
    is_gestor_pop() OR 
    -- Outros usuários veem apenas sua seção
    (secao_id = get_user_secao_id())
);

-- Política para ocorrencias_nao_aeronauticas
CREATE POLICY "ocorrencias_nao_aeronauticas_select_policy" ON ocorrencias_nao_aeronauticas
FOR SELECT USING (
    is_gestor_pop() OR 
    (secao_id = get_user_secao_id())
);

-- Política para ptr_ba_provas_teoricas
CREATE POLICY "ptr_ba_provas_teoricas_select_policy" ON ptr_ba_provas_teoricas
FOR SELECT USING (
    is_gestor_pop() OR 
    (secao_id = get_user_secao_id())
);

-- Política para ptr_ba_horas_treinamento
CREATE POLICY "ptr_ba_horas_treinamento_select_policy" ON ptr_ba_horas_treinamento
FOR SELECT USING (
    is_gestor_pop() OR 
    (secao_id = get_user_secao_id())
);

-- Política para tempo_epr
CREATE POLICY "tempo_epr_select_policy" ON tempo_epr
FOR SELECT USING (
    is_gestor_pop() OR 
    (secao_id = get_user_secao_id())
);

-- Política para tempo_resposta
CREATE POLICY "tempo_resposta_select_policy" ON tempo_resposta
FOR SELECT USING (
    is_gestor_pop() OR 
    (secao_id = get_user_secao_id())
);

-- Política para controle_agentes_extintores
CREATE POLICY "controle_agentes_extintores_select_policy" ON controle_agentes_extintores
FOR SELECT USING (
    is_gestor_pop() OR 
    (secao_id = get_user_secao_id())
);

-- Política para controle_trocas
CREATE POLICY "controle_trocas_select_policy" ON controle_trocas
FOR SELECT USING (
    is_gestor_pop() OR 
    (secao_id = get_user_secao_id())
);

-- Política para verificacao_tps
CREATE POLICY "verificacao_tps_select_policy" ON verificacao_tps
FOR SELECT USING (
    is_gestor_pop() OR 
    (secao_id = get_user_secao_id())
);

-- Política para higienizacao_tps
CREATE POLICY "higienizacao_tps_select_policy" ON higienizacao_tps
FOR SELECT USING (
    is_gestor_pop() OR 
    (secao_id = get_user_secao_id())
);

-- Política para controle_uniformes_recebidos
CREATE POLICY "controle_uniformes_recebidos_select_policy" ON controle_uniformes_recebidos
FOR SELECT USING (
    is_gestor_pop() OR 
    (secao_id = get_user_secao_id())
);

-- Política para atividades_acessorias
CREATE POLICY "atividades_acessorias_select_policy" ON atividades_acessorias
FOR SELECT USING (
    is_gestor_pop() OR 
    (secao_id = get_user_secao_id())
);

-- Garantir que as funções auxiliares existam e estejam corretas
CREATE OR REPLACE FUNCTION is_gestor_pop()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN (
        SELECT perfil = 'gestor_pop' AND ativo = true
        FROM profiles 
        WHERE id = auth.uid()
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION get_user_secao_id()
RETURNS UUID AS $$
BEGIN
    RETURN (
        SELECT secao_id FROM profiles 
        WHERE id = auth.uid() 
        AND ativo = true
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Comentário final
COMMENT ON FUNCTION is_gestor_pop() IS 'Verifica se o usuário atual é um gestor POP ativo';
COMMENT ON FUNCTION get_user_secao_id() IS 'Retorna o ID da seção do usuário atual';