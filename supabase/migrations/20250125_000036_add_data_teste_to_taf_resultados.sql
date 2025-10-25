-- =====================================================
-- Migração: Adicionar coluna data_taf à tabela taf_resultados
-- Data: 25/01/2025
-- Descrição: Adiciona a coluna data_taf para armazenar a data do teste TAF
-- =====================================================

-- Adicionar coluna data_taf à tabela taf_resultados
ALTER TABLE taf_resultados 
ADD COLUMN data_taf DATE;

-- Comentário para documentação
COMMENT ON COLUMN taf_resultados.data_taf IS 'Data em que o teste TAF foi realizado';

-- Log de suc