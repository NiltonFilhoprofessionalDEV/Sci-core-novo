-- Migração: Criar tabela controle_uniformes_recebidos
-- Data: 2025-01-25
-- Descrição: Tabela para controle de uniformes e EPIs recebidos pelas equipes

-- Criar tabela controle_uniformes_recebidos
CREATE TABLE IF NOT EXISTS controle_uniformes_recebidos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nome_cidade VARCHAR(100) NOT NULL,
    nome_usuario VARCHAR(100) NOT NULL,
    equipe VARCHAR(50) NOT NULL,
    data DATE NOT NULL,
    epi_entregue INTEGER NOT NULL CHECK (epi_entregue >= 0),
    epi_previsto INTEGER NOT NULL CHECK (epi_previsto > 0),
    uniforme_entregue INTEGER NOT NULL CHECK (uniforme_entregue >= 0),
    uniforme_previsto INTEGER NOT NULL CHECK (uniforme_previsto > 0),
    porcentagem_epi DECIMAL(5,2) NOT NULL CHECK (porcentagem_epi >= 0 AND porcentagem_epi <= 100),
    porcentagem_uniforme DECIMAL(5,2) NOT NULL CHECK (porcentagem_uniforme >= 0 AND porcentagem_uniforme <= 100),
    observacoes TEXT,
    user_id UUID DEFAULT auth.uid(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_controle_uniformes_data ON controle_uniformes_recebidos(data DESC);
CREATE INDEX IF NOT EXISTS idx_controle_uniformes_equipe ON controle_uniformes_recebidos(equipe);
CREATE INDEX IF NOT EXISTS idx_controle_uniformes_cidade ON controle_uniformes_recebidos(nome_cidade);

-- Constraint para validar que entregues não excedam previstos
ALTER TABLE controle_uniformes_recebidos 
ADD CONSTRAINT check_epi_entregue_valido 
CHECK (epi_entregue <= epi_previsto);

ALTER TABLE controle_uniformes_recebidos 
ADD CONSTRAINT check_uniforme_entregue_valido 
CHECK (uniforme_entregue <= uniforme_previsto);

-- Trigger para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_controle_uniformes_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_controle_uniformes_updated_at 
    BEFORE UPDATE ON controle_uniformes_recebidos 
    FOR EACH ROW EXECUTE FUNCTION update_controle_uniformes_updated_at();

-- Políticas RLS (Row Level Security)
ALTER TABLE controle_uniformes_recebidos ENABLE ROW LEVEL SECURITY;

-- Política para usuários autenticados poderem ver todos os registros
CREATE POLICY "Users can view controle_uniformes records" ON controle_uniformes_recebidos
    FOR SELECT USING (auth.role() = 'authenticated');

-- Política para usuários autenticados poderem inserir registros
CREATE POLICY "Users can insert controle_uniformes records" ON controle_uniformes_recebidos
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Política para usuários autenticados poderem atualizar registros
CREATE POLICY "Users can update controle_uniformes records" ON controle_uniformes_recebidos
    FOR UPDATE USING (auth.role() = 'authenticated');

-- Política para usuários autenticados poderem deletar registros
CREATE POLICY "Users can delete controle_uniformes records" ON controle_uniformes_recebidos
    FOR DELETE USING (auth.role() = 'authenticated');

-- Grants para roles do Supabase
GRANT SELECT ON controle_uniformes_recebidos TO anon;
GRANT ALL PRIVILEGES ON controle_uniformes_recebidos TO authenticated;

-- Comentários para documentação
COMMENT ON TABLE controle_uniformes_recebidos IS 'Tabela para controle de uniformes e EPIs recebidos pelas equipes operacionais';
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