-- Migração: Alterar tabela controle_uniformes_recebidos
-- Data: 2025-01-25
-- Descrição: Adicionar colunas necessárias para o modal de controle de uniformes recebidos

-- Adicionar novas colunas à tabela existente
ALTER TABLE controle_uniformes_recebidos 
ADD COLUMN IF NOT EXISTS nome_cidade VARCHAR(100),
ADD COLUMN IF NOT EXISTS nome_usuario VARCHAR(100),
ADD COLUMN IF NOT EXISTS equipe VARCHAR(50),
ADD COLUMN IF NOT EXISTS data DATE,
ADD COLUMN IF NOT EXISTS epi_entregue INTEGER CHECK (epi_entregue >= 0),
ADD COLUMN IF NOT EXISTS epi_previsto INTEGER CHECK (epi_previsto > 0),
ADD COLUMN IF NOT EXISTS uniforme_entregue INTEGER CHECK (uniforme_entregue >= 0),
ADD COLUMN IF NOT EXISTS uniforme_previsto INTEGER CHECK (uniforme_previsto > 0),
ADD COLUMN IF NOT EXISTS porcentagem_epi DECIMAL(5,2) CHECK (porcentagem_epi >= 0 AND porcentagem_epi <= 100),
ADD COLUMN IF NOT EXISTS porcentagem_uniforme DECIMAL(5,2) CHECK (porcentagem_uniforme >= 0 AND porcentagem_uniforme <= 100),
ADD COLUMN IF NOT EXISTS observacoes TEXT;

-- Criar índices para performance nas novas colunas
CREATE INDEX IF NOT EXISTS idx_controle_uniformes_data_nova ON controle_uniformes_recebidos(data DESC);
CREATE INDEX IF NOT EXISTS idx_controle_uniformes_equipe_nova ON controle_uniformes_recebidos(equipe);
CREATE INDEX IF NOT EXISTS idx_controle_uniformes_cidade_nova ON controle_uniformes_recebidos(nome_cidade);

-- Adicionar constraints para validar que entregues não excedam previstos
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'check_epi_entregue_valido_nova' 
        AND table_name = 'controle_uniformes_recebidos'
    ) THEN
        ALTER TABLE controle_uniformes_recebidos 
        ADD CONSTRAINT check_epi_entregue_valido_nova 
        CHECK (epi_entregue IS NULL OR epi_previsto IS NULL OR epi_entregue <= epi_previsto);
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'check_uniforme_entregue_valido_nova' 
        AND table_name = 'controle_uniformes_recebidos'
    ) THEN
        ALTER TABLE controle_uniformes_recebidos 
        ADD CONSTRAINT check_uniforme_entregue_valido_nova 
        CHECK (uniforme_entregue IS NULL OR uniforme_previsto IS NULL OR uniforme_entregue <= uniforme_previsto);
    END IF;
END $$;

-- Comentários para documentação das novas colunas
COMMENT ON COLUMN controle_uniformes_recebidos.nome_cidade IS 'Nome da cidade/base onde ocorreu a entrega';
COMMENT ON COLUMN controle_uniformes_recebidos.nome_usuario IS 'Nome do usuário que registrou a entrega';
COMMENT ON COLUMN controle_uniformes_recebidos.equipe IS 'Nome da equipe que recebeu os uniformes/EPIs';
COMMENT ON COLUMN controle_uniformes_recebidos.data IS 'Data da entrega dos uniformes/EPIs';
COMMENT ON COLUMN controle_uniformes_recebidos.epi_entregue IS 'Quantidade de EPIs efetivamente entregues';
COMMENT ON COLUMN controle_uniformes_recebidos.epi_previsto IS 'Quantidade de EPIs prevista para entrega';
COMMENT ON COLUMN controle_uniformes_recebidos.uniforme_entregue IS 'Quantidade de uniformes efetivamente entregues';
COMMENT ON COLUMN controle_uniformes_recebidos.uniforme_previsto IS 'Quantidade de uniformes prevista para entrega';
COMMENT ON COLUMN controle_uniformes_recebidos.porcentagem_epi IS 'Porcentagem de EPIs entregues em relação ao previsto';
COMMENT ON COLUMN controle_uniformes_recebidos.porcentagem_uniforme IS 'Porcentagem de uniformes entregues em relação ao previsto';
COMMENT ON COLUMN controle_uniformes_recebidos.observacoes IS 'Observações adicionais sobre a entrega';