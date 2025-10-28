-- Criar tabela controle_trocas
CREATE TABLE IF NOT EXISTS controle_trocas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nome_cidade VARCHAR(100) NOT NULL,
    nome_usuario VARCHAR(100) NOT NULL,
    equipe VARCHAR(100) NOT NULL,
    data_referencia DATE NOT NULL,
    quantidade_troca INTEGER NOT NULL CHECK (quantidade_troca >= 0),
    observacoes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar índices para otimização
CREATE INDEX idx_controle_trocas_data ON controle_trocas(data_referencia DESC);
CREATE INDEX idx_controle_trocas_equipe ON controle_trocas(equipe);
CREATE INDEX idx_controle_trocas_nome_cidade ON controle_trocas(nome_cidade);

-- Comentários das colunas
COMMENT ON COLUMN controle_trocas.nome_cidade IS 'Nome da cidade/base onde foi realizado o controle';
COMMENT ON COLUMN controle_trocas.nome_usuario IS 'Nome do usuário que registrou o controle';
COMMENT ON COLUMN controle_trocas.equipe IS 'Nome da equipe responsável pelas trocas';
COMMENT ON COLUMN controle_trocas.data_referencia IS 'Data de referência do controle de trocas';
COMMENT ON COLUMN controle_trocas.quantidade_troca IS 'Quantidade mensal de trocas realizadas pela equipe';
COMMENT ON COLUMN controle_trocas.observacoes IS 'Observações adicionais sobre o controle de trocas';

-- Habilitar RLS (Row Level Security)
ALTER TABLE controle_trocas ENABLE ROW LEVEL SECURITY;

-- Política de acesso para usuários autenticados
CREATE POLICY "Usuários autenticados podem inserir controle_trocas" ON controle_trocas
    FOR INSERT TO authenticated
    WITH CHECK (true);

CREATE POLICY "Usuários autenticados podem visualizar controle_trocas" ON controle_trocas
    FOR SELECT TO authenticated
    USING (true);

-- Trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_controle_trocas_updated_at
    BEFORE UPDATE ON controle_trocas
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Comentário da tabela
COMMENT ON TABLE controle_trocas IS 'Registro de controle de trocas mensais por equipe';

-- Conceder permissões para os roles anon e authenticated
GRANT SELECT ON controle_trocas TO anon;
GRANT ALL PRIVILEGES ON controle_trocas TO authenticated;