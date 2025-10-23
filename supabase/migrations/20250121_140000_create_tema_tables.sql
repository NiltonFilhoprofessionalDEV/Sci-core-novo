-- =====================================================
-- CRIAÇÃO DE TABELAS PARA TEMAS DE INDICADORES
-- =====================================================
-- Data: 2025-01-21 14:00:00
-- Descrição: Criação de 14 tabelas separadas para cada tema de indicadores
-- Estrutura: Apenas estrutura básica (sem colunas específicas ainda)
-- Segurança: RLS habilitado para isolamento entre bases
-- =====================================================

-- Extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- 1. OCORRÊNCIAS AERONÁUTICAS
-- =====================================================
CREATE TABLE IF NOT EXISTS ocorrencias_aeronauticas (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    secao_id UUID NOT NULL REFERENCES secoes(id) ON DELETE CASCADE,
    equipe_id UUID REFERENCES equipes(id) ON DELETE SET NULL,
    usuario_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    data_referencia DATE NOT NULL DEFAULT CURRENT_DATE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Comentário da tabela
COMMENT ON TABLE ocorrencias_aeronauticas IS 'Registro de eventos relacionados a aeronaves e operações aéreas';

-- =====================================================
-- 2. OCORRÊNCIAS NÃO AERONÁUTICAS
-- =====================================================
CREATE TABLE IF NOT EXISTS ocorrencias_nao_aeronauticas (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    secao_id UUID NOT NULL REFERENCES secoes(id) ON DELETE CASCADE,
    equipe_id UUID REFERENCES equipes(id) ON DELETE SET NULL,
    usuario_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    data_referencia DATE NOT NULL DEFAULT CURRENT_DATE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE ocorrencias_nao_aeronauticas IS 'Eventos e emergências não relacionados a aeronaves';

-- =====================================================
-- 3. ATIVIDADES ACESSÓRIAS
-- =====================================================
CREATE TABLE IF NOT EXISTS atividades_acessorias (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    secao_id UUID NOT NULL REFERENCES secoes(id) ON DELETE CASCADE,
    equipe_id UUID REFERENCES equipes(id) ON DELETE SET NULL,
    usuario_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    data_referencia DATE NOT NULL DEFAULT CURRENT_DATE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE atividades_acessorias IS 'Atividades complementares e de apoio às operações';

-- =====================================================
-- 4. TAF (TERMINAL AERODROME FORECAST)
-- =====================================================
CREATE TABLE IF NOT EXISTS taf_previsoes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    secao_id UUID NOT NULL REFERENCES secoes(id) ON DELETE CASCADE,
    equipe_id UUID REFERENCES equipes(id) ON DELETE SET NULL,
    usuario_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    data_referencia DATE NOT NULL DEFAULT CURRENT_DATE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE taf_previsoes IS 'Terminal Aerodrome Forecast - Previsão meteorológica';

-- =====================================================
-- 5. PTR-BA - PROVA TEÓRICA
-- =====================================================
CREATE TABLE IF NOT EXISTS ptr_ba_provas_teoricas (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    secao_id UUID NOT NULL REFERENCES secoes(id) ON DELETE CASCADE,
    equipe_id UUID REFERENCES equipes(id) ON DELETE SET NULL,
    usuario_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    data_referencia DATE NOT NULL DEFAULT CURRENT_DATE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE ptr_ba_provas_teoricas IS 'Registro de provas teóricas do programa de treinamento';

-- =====================================================
-- 6. PTR-BA - HORAS DE TREINAMENTO
-- =====================================================
CREATE TABLE IF NOT EXISTS ptr_ba_horas_treinamento (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    secao_id UUID NOT NULL REFERENCES secoes(id) ON DELETE CASCADE,
    equipe_id UUID REFERENCES equipes(id) ON DELETE SET NULL,
    usuario_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    data_referencia DATE NOT NULL DEFAULT CURRENT_DATE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE ptr_ba_horas_treinamento IS 'Controle de horas práticas de treinamento';

-- =====================================================
-- 7. INSPEÇÕES DE VIATURAS
-- =====================================================
CREATE TABLE IF NOT EXISTS inspecoes_viaturas (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    secao_id UUID NOT NULL REFERENCES secoes(id) ON DELETE CASCADE,
    equipe_id UUID REFERENCES equipes(id) ON DELETE SET NULL,
    usuario_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    data_referencia DATE NOT NULL DEFAULT CURRENT_DATE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE inspecoes_viaturas IS 'Verificações e manutenção preventiva de veículos';

-- =====================================================
-- 8. TEMPO EPR
-- =====================================================
CREATE TABLE IF NOT EXISTS tempo_epr (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    secao_id UUID NOT NULL REFERENCES secoes(id) ON DELETE CASCADE,
    equipe_id UUID REFERENCES equipes(id) ON DELETE SET NULL,
    usuario_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    data_referencia DATE NOT NULL DEFAULT CURRENT_DATE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE tempo_epr IS 'Controle de tempo de Equipamento de Proteção Respiratória';

-- =====================================================
-- 9. TEMPO RESPOSTA
-- =====================================================
CREATE TABLE IF NOT EXISTS tempo_resposta (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    secao_id UUID NOT NULL REFERENCES secoes(id) ON DELETE CASCADE,
    equipe_id UUID REFERENCES equipes(id) ON DELETE SET NULL,
    usuario_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    data_referencia DATE NOT NULL DEFAULT CURRENT_DATE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE tempo_resposta IS 'Medição de tempos de resposta a emergências';

-- =====================================================
-- 10. CONTROLE DE AGENTES EXTINTORES
-- =====================================================
CREATE TABLE IF NOT EXISTS controle_agentes_extintores (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    secao_id UUID NOT NULL REFERENCES secoes(id) ON DELETE CASCADE,
    equipe_id UUID REFERENCES equipes(id) ON DELETE SET NULL,
    usuario_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    data_referencia DATE NOT NULL DEFAULT CURRENT_DATE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE controle_agentes_extintores IS 'Gestão e controle de agentes químicos extintores';

-- =====================================================
-- 11. CONTROLE DE TROCAS
-- =====================================================
CREATE TABLE IF NOT EXISTS controle_trocas (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    secao_id UUID NOT NULL REFERENCES secoes(id) ON DELETE CASCADE,
    equipe_id UUID REFERENCES equipes(id) ON DELETE SET NULL,
    usuario_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    data_referencia DATE NOT NULL DEFAULT CURRENT_DATE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE controle_trocas IS 'Gerenciamento de trocas de plantão e escalas';

-- =====================================================
-- 12. VERIFICAÇÃO DE TPS
-- =====================================================
CREATE TABLE IF NOT EXISTS verificacao_tps (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    secao_id UUID NOT NULL REFERENCES secoes(id) ON DELETE CASCADE,
    equipe_id UUID REFERENCES equipes(id) ON DELETE SET NULL,
    usuario_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    data_referencia DATE NOT NULL DEFAULT CURRENT_DATE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE verificacao_tps IS 'Verificação de Equipamentos de Proteção Individual';

-- =====================================================
-- 13. HIGIENIZAÇÃO DE TPS
-- =====================================================
CREATE TABLE IF NOT EXISTS higienizacao_tps (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    secao_id UUID NOT NULL REFERENCES secoes(id) ON DELETE CASCADE,
    equipe_id UUID REFERENCES equipes(id) ON DELETE SET NULL,
    usuario_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    data_referencia DATE NOT NULL DEFAULT CURRENT_DATE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE higienizacao_tps IS 'Limpeza e desinfecção de equipamentos de proteção';

-- =====================================================
-- 14. CONTROLE DE UNIFORMES RECEBIDOS
-- =====================================================
CREATE TABLE IF NOT EXISTS controle_uniformes_recebidos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    secao_id UUID NOT NULL REFERENCES secoes(id) ON DELETE CASCADE,
    equipe_id UUID REFERENCES equipes(id) ON DELETE SET NULL,
    usuario_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    data_referencia DATE NOT NULL DEFAULT CURRENT_DATE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE controle_uniformes_recebidos IS 'Gestão de recebimento e distribuição de uniformes';

-- =====================================================
-- HABILITAÇÃO DO RLS (ROW LEVEL SECURITY)
-- =====================================================

-- Habilitar RLS em todas as tabelas
ALTER TABLE ocorrencias_aeronauticas ENABLE ROW LEVEL SECURITY;
ALTER TABLE ocorrencias_nao_aeronauticas ENABLE ROW LEVEL SECURITY;
ALTER TABLE atividades_acessorias ENABLE ROW LEVEL SECURITY;
ALTER TABLE taf_previsoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE ptr_ba_provas_teoricas ENABLE ROW LEVEL SECURITY;
ALTER TABLE ptr_ba_horas_treinamento ENABLE ROW LEVEL SECURITY;
ALTER TABLE inspecoes_viaturas ENABLE ROW LEVEL SECURITY;
ALTER TABLE tempo_epr ENABLE ROW LEVEL SECURITY;
ALTER TABLE tempo_resposta ENABLE ROW LEVEL SECURITY;
ALTER TABLE controle_agentes_extintores ENABLE ROW LEVEL SECURITY;
ALTER TABLE controle_trocas ENABLE ROW LEVEL SECURITY;
ALTER TABLE verificacao_tps ENABLE ROW LEVEL SECURITY;
ALTER TABLE higienizacao_tps ENABLE ROW LEVEL SECURITY;
ALTER TABLE controle_uniformes_recebidos ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- POLÍTICAS RLS PARA ISOLAMENTO ENTRE BASES
-- =====================================================

-- Função auxiliar para verificar se o usuário é gestor POP
CREATE OR REPLACE FUNCTION is_gestor_pop()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM profiles 
        WHERE id = auth.uid() 
        AND perfil = 'gestor_pop'
        AND ativo = true
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função auxiliar para obter a seção do usuário atual
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

-- =====================================================
-- POLÍTICAS PARA OCORRÊNCIAS AERONÁUTICAS
-- =====================================================

-- Política de SELECT: Gestor POP vê tudo, outros veem apenas sua seção
CREATE POLICY "ocorrencias_aeronauticas_select_policy" ON ocorrencias_aeronauticas
    FOR SELECT USING (
        is_gestor_pop() OR secao_id = get_user_secao_id()
    );

-- Política de INSERT: Apenas na própria seção
CREATE POLICY "ocorrencias_aeronauticas_insert_policy" ON ocorrencias_aeronauticas
    FOR INSERT WITH CHECK (
        secao_id = get_user_secao_id()
    );

-- Política de UPDATE: Apenas registros da própria seção
CREATE POLICY "ocorrencias_aeronauticas_update_policy" ON ocorrencias_aeronauticas
    FOR UPDATE USING (
        is_gestor_pop() OR secao_id = get_user_secao_id()
    );

-- Política de DELETE: Apenas registros da própria seção
CREATE POLICY "ocorrencias_aeronauticas_delete_policy" ON ocorrencias_aeronauticas
    FOR DELETE USING (
        is_gestor_pop() OR secao_id = get_user_secao_id()
    );

-- =====================================================
-- MACRO PARA CRIAR POLÍTICAS IDÊNTICAS PARA TODAS AS TABELAS
-- =====================================================

-- Aplicar as mesmas políticas para todas as outras tabelas
DO $$
DECLARE
    table_name TEXT;
    table_names TEXT[] := ARRAY[
        'ocorrencias_nao_aeronauticas',
        'atividades_acessorias',
        'taf_previsoes',
        'ptr_ba_provas_teoricas',
        'ptr_ba_horas_treinamento',
        'inspecoes_viaturas',
        'tempo_epr',
        'tempo_resposta',
        'controle_agentes_extintores',
        'controle_trocas',
        'verificacao_tps',
        'higienizacao_tps',
        'controle_uniformes_recebidos'
    ];
BEGIN
    FOREACH table_name IN ARRAY table_names
    LOOP
        -- Política de SELECT
        EXECUTE format('
            CREATE POLICY "%s_select_policy" ON %s
                FOR SELECT USING (
                    is_gestor_pop() OR secao_id = get_user_secao_id()
                )', table_name, table_name);
        
        -- Política de INSERT
        EXECUTE format('
            CREATE POLICY "%s_insert_policy" ON %s
                FOR INSERT WITH CHECK (
                    secao_id = get_user_secao_id()
                )', table_name, table_name);
        
        -- Política de UPDATE
        EXECUTE format('
            CREATE POLICY "%s_update_policy" ON %s
                FOR UPDATE USING (
                    is_gestor_pop() OR secao_id = get_user_secao_id()
                )', table_name, table_name);
        
        -- Política de DELETE
        EXECUTE format('
            CREATE POLICY "%s_delete_policy" ON %s
                FOR DELETE USING (
                    is_gestor_pop() OR secao_id = get_user_secao_id()
                )', table_name, table_name);
    END LOOP;
END $$;

-- =====================================================
-- ÍNDICES PARA PERFORMANCE
-- =====================================================

-- Criar índices em colunas frequentemente consultadas
DO $$
DECLARE
    table_name TEXT;
    table_names TEXT[] := ARRAY[
        'ocorrencias_aeronauticas',
        'ocorrencias_nao_aeronauticas',
        'atividades_acessorias',
        'taf_previsoes',
        'ptr_ba_provas_teoricas',
        'ptr_ba_horas_treinamento',
        'inspecoes_viaturas',
        'tempo_epr',
        'tempo_resposta',
        'controle_agentes_extintores',
        'controle_trocas',
        'verificacao_tps',
        'higienizacao_tps',
        'controle_uniformes_recebidos'
    ];
BEGIN
    FOREACH table_name IN ARRAY table_names
    LOOP
        -- Índice para secao_id (usado nas políticas RLS)
        EXECUTE format('CREATE INDEX IF NOT EXISTS idx_%s_secao_id ON %s(secao_id)', table_name, table_name);
        
        -- Índice para data_referencia (consultas por período)
        EXECUTE format('CREATE INDEX IF NOT EXISTS idx_%s_data_referencia ON %s(data_referencia)', table_name, table_name);
        
        -- Índice para usuario_id (consultas por usuário)
        EXECUTE format('CREATE INDEX IF NOT EXISTS idx_%s_usuario_id ON %s(usuario_id)', table_name, table_name);
        
        -- Índice composto para consultas frequentes
        EXECUTE format('CREATE INDEX IF NOT EXISTS idx_%s_secao_data ON %s(secao_id, data_referencia)', table_name, table_name);
    END LOOP;
END $$;

-- =====================================================
-- TRIGGERS PARA UPDATED_AT
-- =====================================================

-- Função para atualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Aplicar trigger em todas as tabelas
DO $$
DECLARE
    table_name TEXT;
    table_names TEXT[] := ARRAY[
        'ocorrencias_aeronauticas',
        'ocorrencias_nao_aeronauticas',
        'atividades_acessorias',
        'taf_previsoes',
        'ptr_ba_provas_teoricas',
        'ptr_ba_horas_treinamento',
        'inspecoes_viaturas',
        'tempo_epr',
        'tempo_resposta',
        'controle_agentes_extintores',
        'controle_trocas',
        'verificacao_tps',
        'higienizacao_tps',
        'controle_uniformes_recebidos'
    ];
BEGIN
    FOREACH table_name IN ARRAY table_names
    LOOP
        EXECUTE format('
            CREATE TRIGGER trigger_%s_updated_at
                BEFORE UPDATE ON %s
                FOR EACH ROW
                EXECUTE FUNCTION update_updated_at_column()', table_name, table_name);
    END LOOP;
END $$;

-- =====================================================
-- DOCUMENTAÇÃO E METADADOS
-- =====================================================

-- Criar tabela de metadados das tabelas de temas
CREATE TABLE IF NOT EXISTS tema_tables_metadata (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    table_name VARCHAR(100) NOT NULL UNIQUE,
    tema_id VARCHAR(100) NOT NULL,
    tema_nome VARCHAR(200) NOT NULL,
    tema_descricao TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE tema_tables_metadata IS 'Metadados das tabelas de temas para documentação e rastreamento';

-- Inserir metadados das tabelas criadas
INSERT INTO tema_tables_metadata (table_name, tema_id, tema_nome, tema_descricao) VALUES
('ocorrencias_aeronauticas', 'ocorrencias-aeronauticas', 'Ocorrências Aeronáuticas', 'Registro de eventos relacionados a aeronaves e operações aéreas'),
('ocorrencias_nao_aeronauticas', 'ocorrencia-nao-aeronautica', 'Ocorrência Não Aeronáutica', 'Eventos e emergências não relacionados a aeronaves'),
('atividades_acessorias', 'atividades-acessorias', 'Atividades Acessórias', 'Atividades complementares e de apoio às operações'),
('taf_previsoes', 'taf', 'TAF', 'Terminal Aerodrome Forecast - Previsão meteorológica'),
('ptr_ba_provas_teoricas', 'ptr-ba-prova-teorica', 'PTR-BA - Prova Teórica', 'Registro de provas teóricas do programa de treinamento'),
('ptr_ba_horas_treinamento', 'ptr-ba-horas-treinamento', 'PTR-BA - Horas de Treinamento', 'Controle de horas práticas de treinamento'),
('inspecoes_viaturas', 'inspecoes-viaturas', 'Inspeções de Viaturas', 'Verificações e manutenção preventiva de veículos'),
('tempo_epr', 'tempo-epr', 'Tempo EPR', 'Controle de tempo de Equipamento de Proteção Respiratória'),
('tempo_resposta', 'tempo-resposta', 'Tempo Resposta', 'Medição de tempos de resposta a emergências'),
('controle_agentes_extintores', 'controle-agentes-extintores', 'Controle de Agentes Extintores', 'Gestão e controle de agentes químicos extintores'),
('controle_trocas', 'controle-trocas', 'Controle de Trocas', 'Gerenciamento de trocas de plantão e escalas'),
('verificacao_tps', 'verificacao-tps', 'Verificação de TPS', 'Verificação de Equipamentos de Proteção Individual'),
('higienizacao_tps', 'higienizacao-tps', 'Higienização de TPS', 'Limpeza e desinfecção de equipamentos de proteção'),
('controle_uniformes_recebidos', 'controle-uniformes-recebidos', 'Controle de Uniformes Recebidos', 'Gestão de recebimento e distribuição de uniformes')
ON CONFLICT (table_name) DO NOTHING;

-- =====================================================
-- RESUMO DA MIGRAÇÃO
-- =====================================================

-- Criar view para resumo das tabelas criadas
CREATE OR REPLACE VIEW tema_tables_summary AS
SELECT 
    tm.table_name,
    tm.tema_nome,
    tm.tema_descricao,
    pg_size_pretty(pg_total_relation_size(tm.table_name::regclass)) as table_size,
    (SELECT COUNT(*) FROM information_schema.columns 
     WHERE table_name = tm.table_name AND table_schema = 'public') as column_count,
    tm.created_at
FROM tema_tables_metadata tm
ORDER BY tm.tema_nome;

COMMENT ON VIEW tema_tables_summary IS 'Resumo das tabelas de temas criadas com informações de tamanho e estrutura';