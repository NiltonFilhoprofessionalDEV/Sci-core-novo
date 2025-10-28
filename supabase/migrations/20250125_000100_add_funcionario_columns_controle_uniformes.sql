-- Adicionar colunas funcionario_id e nome_completo à tabela controle_uniformes_recebidos
-- Data: 2025-01-25
-- Descrição: Permite salvar dados individuais de cada funcionário da equipe

-- Adicionar coluna funcionario_id (foreign key para funcionarios)
ALTER TABLE controle_uniformes_recebidos 
ADD COLUMN IF NOT EXISTS funcionario_id UUID REFERENCES funcionarios(id);

-- Adicionar coluna nome_completo para registrar o nome do funcionário
ALTER TABLE controle_uniformes_recebidos 
ADD COLUMN IF NOT EXISTS nome_completo TEXT;

-- Adicionar comentários nas colunas
COMMENT ON COLUMN controle_uniformes_recebidos.funcionario_id IS 'ID do funcionário que recebeu os uniformes/EPIs';
COMMENT ON COLUMN controle_uniformes_recebidos.nome_completo IS 'Nome completo do funcionário que recebeu os uniformes/EPIs';

-- Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_controle_uniformes_funcionario_id 
ON controle_uniformes_recebidos(funcionario_id);

CREATE INDEX IF NOT EXISTS idx_controle_uniformes_secao_equipe_funcionario 
ON controle_uniformes_recebidos(secao_id, equipe_id, funcionario_id);

-- Atualizar trigger para updated_at se não existir
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Aplicar trigger na tabela se não existir
DROP TRIGGER IF EXISTS update_controle_uniformes_updated_at ON controle_uniformes_recebidos;
CREATE TRIGGER update_controle_uniformes_updated_at
    BEFORE UPDATE ON controle_uniformes_recebidos
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();