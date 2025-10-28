-- Adicionar colunas necessárias para o modal de Controle de Trocas
ALTER TABLE controle_trocas 
ADD COLUMN IF NOT EXISTS nome_cidade VARCHAR(100),
ADD COLUMN IF NOT EXISTS nome_usuario VARCHAR(100),
ADD COLUMN IF NOT EXISTS equipe VARCHAR(100),
ADD COLUMN IF NOT EXISTS quantidade_troca INTEGER CHECK (quantidade_troca >= 0),
ADD COLUMN IF NOT EXISTS observacoes TEXT;

-- Criar índices para otimização
CREATE INDEX IF NOT EXISTS idx_controle_trocas_equipe_nome ON controle_trocas(equipe);
CREATE INDEX IF NOT EXISTS idx_controle_trocas_nome_cidade ON controle_trocas(nome_cidade);

-- Comentários das novas colunas
COMMENT ON COLUMN controle_trocas.nome_cidade IS 'Nome da cidade/base onde foi realizado o controle';
COMMENT ON COLUMN controle_trocas.nome_usuario IS 'Nome do usuário que registrou o controle';
COMMENT ON COLUMN controle_trocas.equipe IS 'Nome da equipe responsável pelas trocas';
COMMENT ON COLUMN controle_trocas.quantidade_troca IS 'Quantidade mensal de trocas realizadas pela equipe';
COMMENT ON COLUMN controle_trocas.observacoes IS 'Observações adicionais sobre o controle de trocas';

-- Conceder permissões para os roles anon e authenticated
GRANT SELECT ON controle_trocas TO anon;
GRANT ALL PRIVILEGES ON controle_trocas TO authenticated;