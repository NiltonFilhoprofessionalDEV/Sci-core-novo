-- =====================================================
-- MIGRATION: Adicionar coluna nome_equipe na tabela taf_resultados
-- Data: 2025-01-25
-- Descrição: Adicionar a coluna nome_equipe para armazenar
--           o nome da equipe nos resultados do TAF
-- =====================================================

-- Adicionar coluna nome_equipe para armazenar o nome da equipe
ALTER TABLE taf_resultados 
ADD COLUMN nome_equipe TEXT;

-- Adicionar comentário na coluna para documentação
COMMENT ON COLUMN taf_resultados.nome_equipe IS 'Nome da equipe onde o funcionário realizou o TAF';

-- Log de sucesso
DO $$
BEGIN
    RAISE NOTICE 'Coluna nome_equipe adicionada com sucesso na tabela taf_resultados!';
    RAISE NOTICE 'Coluna nome_equipe: TEXT - Nome da equipe do funcionário';
END $$;

-- =====================================================
-- COMENTÁRIOS ADICIONAIS
-- =====================================================
-- Esta migração adiciona a coluna nome_equipe na tabela taf_resultados:
-- - nome_equipe: Permite armazenar o nome da equipe diretamente
--   no resultado do TAF, facilitando consultas e relatórios por equipe
-- - Complementa as colunas nome_completo e nome_cidade já existentes
-- - Permite filtros e agrupamentos por equipe nos relatórios