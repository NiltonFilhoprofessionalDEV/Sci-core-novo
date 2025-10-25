-- =====================================================
-- MIGRATION: Adicionar colunas nome_completo e nome_cidade na tabela taf_resultados
-- Data: 2025-01-25
-- Descrição: Adicionar as colunas nome_completo e nome_cidade para armazenar
--           informações adicionais dos funcionários nos resultados do TAF
-- =====================================================

-- Adicionar coluna nome_completo para armazenar o nome completo da pessoa
ALTER TABLE taf_resultados 
ADD COLUMN nome_completo TEXT;

-- Adicionar coluna nome_cidade para armazenar o nome da cidade conforme a base escolhida
ALTER TABLE taf_resultados 
ADD COLUMN nome_cidade TEXT;

-- Adicionar comentários nas colunas para documentação
COMMENT ON COLUMN taf_resultados.nome_completo IS 'Nome completo do funcionário que realizou o TAF';
COMMENT ON COLUMN taf_resultados.nome_cidade IS 'Nome da cidade/base onde o funcionário está lotado';

-- Log de sucesso
DO $$
BEGIN
    RAISE NOTICE 'Colunas adicionadas com sucesso na tabela taf_resultados!';
    RAISE NOTICE 'Coluna nome_completo: TEXT - Nome completo do funcionário';
    RAISE NOTICE 'Coluna nome_cidade: TEXT - Nome da cidade/base do funcionário';
END $$;

-- =====================================================
-- COMENTÁRIOS ADICIONAIS
-- =====================================================
-- Esta migração adiciona duas colunas importantes na tabela taf_resultados:
-- 1. nome_completo: Permite armazenar o nome completo do funcionário diretamente
--    no resultado do TAF, facilitando consultas e relatórios
-- 2. nome_cidade: Armazena o nome da cidade/base conforme selecionado no 
--    preenchimento, permitindo filtros e agrupamentos por localização