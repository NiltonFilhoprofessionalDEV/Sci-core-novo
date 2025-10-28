-- Adicionar coluna quantidade_itens_nao_conforme à tabela inspecoes_viatura
-- Data: 2025-01-25
-- Descrição: Adiciona campo para registrar a quantidade de itens não conforme encontrados durante as inspeções

-- Adicionar a nova coluna
ALTER TABLE inspecoes_viatura 
ADD COLUMN quantidade_itens_nao_conforme INTEGER DEFAULT 0 NOT NULL;

-- Adicionar comentário na coluna
COMMENT ON COLUMN inspecoes_viatura.quantidade_itens_nao_conforme IS 'Quantidade de itens não conforme encontrados durante a inspeção';

-- Criar índice para otimizar consultas por quantidade de itens não conforme
CREATE INDEX idx_inspecoes_viatura_quantidade_itens_nao_conforme 
ON inspecoes_viatura(quantidade_itens_nao_conforme);

-- Adicionar constraint para garantir que o valor seja não negativo
ALTER TABLE inspecoes_viatura 
ADD CONSTRAINT chk_quantidade_itens_nao_conforme_positive 
CHECK (quantidade_itens_nao_conforme >= 0);