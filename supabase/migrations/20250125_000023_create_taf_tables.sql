-- Migration: Criar tabelas para o sistema TAF (Teste de Aptidão Física)
-- Data: 2025-01-25
-- Descrição: Criação das tabelas taf_registros e taf_resultados com função de cálculo automático

-- Criar tabela de registros de TAF
CREATE TABLE taf_registros (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    secao_id UUID NOT NULL REFERENCES secoes(id),
    equipe_id UUID NOT NULL REFERENCES equipes(id),
    data_teste DATE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar tabela de resultados individuais do TAF
CREATE TABLE taf_resultados (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    taf_registro_id UUID NOT NULL REFERENCES taf_registros(id) ON DELETE CASCADE,
    funcionario_id UUID NOT NULL REFERENCES funcionarios(id),
    idade INTEGER NOT NULL CHECK (idade > 0 AND idade < 100),
    tempo_total VARCHAR(8), -- Formato HH:MM:SS
    desempenho INTEGER CHECK (desempenho >= 0 AND desempenho <= 10),
    observacoes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar índices para otimização de consultas
CREATE INDEX idx_taf_registros_secao_id ON taf_registros(secao_id);
CREATE INDEX idx_taf_registros_equipe_id ON taf_registros(equipe_id);
CREATE INDEX idx_taf_registros_data_teste ON taf_registros(data_teste DESC);
CREATE INDEX idx_taf_resultados_registro_id ON taf_resultados(taf_registro_id);
CREATE INDEX idx_taf_resultados_funcionario_id ON taf_resultados(funcionario_id);
CREATE INDEX idx_taf_resultados_desempenho ON taf_resultados(desempenho DESC);

-- Função para calcular desempenho baseado na idade e tempo
CREATE OR REPLACE FUNCTION calcular_desempenho_taf(idade_param INTEGER, tempo_param VARCHAR)
RETURNS INTEGER AS $$
DECLARE
    tempo_segundos INTEGER;
    desempenho INTEGER;
BEGIN
    -- Se tempo não foi informado, retorna NULL (não realizado)
    IF tempo_param IS NULL OR tempo_param = '' THEN
        RETURN NULL;
    END IF;
    
    -- Converter tempo HH:MM:SS para segundos
    tempo_segundos := EXTRACT(EPOCH FROM tempo_param::TIME);
    
    -- Calcular desempenho baseado na idade
    IF idade_param <= 39 THEN
        -- Critérios para idade <= 39 anos
        IF tempo_segundos <= 120 THEN -- 00:02:00
            desempenho := 10;
        ELSIF tempo_segundos <= 140 THEN -- 00:02:20
            desempenho := 9;
        ELSIF tempo_segundos <= 160 THEN -- 00:02:40
            desempenho := 8;
        ELSIF tempo_segundos <= 180 THEN -- 00:03:00
            desempenho := 7;
        ELSE
            desempenho := 0; -- Reprovado
        END IF;
    ELSE
        -- Critérios para idade >= 40 anos
        IF tempo_segundos <= 180 THEN -- 00:03:00
            desempenho := 10;
        ELSIF tempo_segundos <= 200 THEN -- 00:03:20
            desempenho := 9;
        ELSIF tempo_segundos <= 220 THEN -- 00:03:40
            desempenho := 8;
        ELSIF tempo_segundos <= 240 THEN -- 00:04:00
            desempenho := 7;
        ELSE
            desempenho := 0; -- Reprovado
        END IF;
    END IF;
    
    RETURN desempenho;
END;
$$ LANGUAGE plpgsql;

-- Políticas de segurança RLS para taf_registros
ALTER TABLE taf_registros ENABLE ROW LEVEL SECURITY;

-- Permitir leitura para usuários anônimos
GRANT SELECT ON taf_registros TO anon;

-- Permitir todas as operações para usuários autenticados
GRANT ALL PRIVILEGES ON taf_registros TO authenticated;

-- Políticas de segurança RLS para taf_resultados
ALTER TABLE taf_resultados ENABLE ROW LEVEL SECURITY;

-- Permitir leitura para usuários anônimos
GRANT SELECT ON taf_resultados TO anon;

-- Permitir todas as operações para usuários autenticados
GRANT ALL PRIVILEGES ON taf_resultados TO authenticated;

-- Comentários nas tabelas
COMMENT ON TABLE taf_registros IS 'Registros de sessões de TAF (Teste de Aptidão Física)';
COMMENT ON TABLE taf_resultados IS 'Resultados individuais dos funcionários nos testes TAF';
COMMENT ON FUNCTION calcular_desempenho_taf(INTEGER, VARCHAR) IS 'Calcula o desempenho do TAF baseado na idade e tempo do funcionário';