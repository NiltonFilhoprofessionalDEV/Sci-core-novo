-- Migration: Adicionar colunas específicas para ocorrências aeronáuticas
-- Criado em: 2025-01-21 16:00:00
-- Descrição: Adiciona colunas necessárias para o formulário de ocorrências aeronáuticas

-- Adicionar colunas específicas à tabela ocorrencias_aeronauticas
ALTER TABLE ocorrencias_aeronauticas 
ADD COLUMN IF NOT EXISTS data_ocorrencia DATE NOT NULL DEFAULT CURRENT_DATE;

ALTER TABLE ocorrencias_aeronauticas 
ADD COLUMN IF NOT EXISTS tipo_ocorrencia VARCHAR(100) NOT NULL DEFAULT 'Emergência Aeronáutica';

ALTER TABLE ocorrencias_aeronauticas 
ADD COLUMN IF NOT EXISTS posicionamento_intervencao VARCHAR(50) NOT NULL DEFAULT '';

ALTER TABLE ocorrencias_aeronauticas 
ADD COLUMN IF NOT EXISTS local_ocorrencia TEXT NOT NULL DEFAULT '';

ALTER TABLE ocorrencias_aeronauticas 
ADD COLUMN IF NOT EXISTS hora_acionamento TIME NOT NULL DEFAULT '00:00:00';

ALTER TABLE ocorrencias_aeronauticas 
ADD COLUMN IF NOT EXISTS tempo_chegada_primeiro_cci TIME NOT NULL DEFAULT '00:00:00';

ALTER TABLE ocorrencias_aeronauticas 
ADD COLUMN IF NOT EXISTS tempo_chegada_ultimo_cci TIME NOT NULL DEFAULT '00:00:00';

ALTER TABLE ocorrencias_aeronauticas 
ADD COLUMN IF NOT EXISTS hora_termino TIME NOT NULL DEFAULT '00:00:00';

-- Adicionar coluna calculada para tempo total da ocorrência
ALTER TABLE ocorrencias_aeronauticas 
ADD COLUMN IF NOT EXISTS tempo_total_ocorrencia INTERVAL;

-- Criar função para calcular tempo total da ocorrência
CREATE OR REPLACE FUNCTION calculate_tempo_total_ocorrencia()
RETURNS TRIGGER AS $$
BEGIN
    -- Calcular a diferença entre hora_termino e hora_acionamento
    NEW.tempo_total_ocorrencia := NEW.hora_termino - NEW.hora_acionamento;
    
    -- Se o resultado for negativo (término no dia seguinte), adicionar 24 horas
    IF NEW.tempo_total_ocorrencia < INTERVAL '0' THEN
        NEW.tempo_total_ocorrencia := NEW.tempo_total_ocorrencia + INTERVAL '24 hours';
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Criar trigger para calcular automaticamente o tempo total
DROP TRIGGER IF EXISTS trigger_calculate_tempo_total ON ocorrencias_aeronauticas;
CREATE TRIGGER trigger_calculate_tempo_total
    BEFORE INSERT OR UPDATE ON ocorrencias_aeronauticas
    FOR EACH ROW
    EXECUTE FUNCTION calculate_tempo_total_ocorrencia();

-- Comentários para documentação
COMMENT ON COLUMN ocorrencias_aeronauticas.data_ocorrencia IS 'Data em que ocorreu a emergência aeronáutica';
COMMENT ON COLUMN ocorrencias_aeronauticas.tipo_ocorrencia IS 'Tipo da ocorrência (padrão: Emergência Aeronáutica)';
COMMENT ON COLUMN ocorrencias_aeronauticas.posicionamento_intervencao IS 'Tipo de ação: Posicionamento ou Intervenção';
COMMENT ON COLUMN ocorrencias_aeronauticas.local_ocorrencia IS 'Local onde ocorreu a emergência (Grade, Taxway, Pista, etc.)';
COMMENT ON COLUMN ocorrencias_aeronauticas.hora_acionamento IS 'Horário do acionamento da equipe';
COMMENT ON COLUMN ocorrencias_aeronauticas.tempo_chegada_primeiro_cci IS 'Tempo para chegada do primeiro CCI';
COMMENT ON COLUMN ocorrencias_aeronauticas.tempo_chegada_ultimo_cci IS 'Tempo para chegada do último CCI';
COMMENT ON COLUMN ocorrencias_aeronauticas.hora_termino IS 'Horário de término da ocorrência';
COMMENT ON COLUMN ocorrencias_aeronauticas.tempo_total_ocorrencia IS 'Tempo total da ocorrência (calculado automaticamente)';