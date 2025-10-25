-- =====================================================
-- MIGRATION: Remover coluna created_by da tabela atividades_acessorias
-- Sistema de Indicadores Bombeiro MedMais
-- Data: 25/01/2025
-- =====================================================

-- Remover o índice da coluna created_by se existir
DROP INDEX IF EXISTS idx_atividades_acessorias_created_by;

-- Remover a coluna created_by da tabela atividades_acessorias
ALTER TABLE public.atividades_acessorias 
DROP COLUMN IF EXISTS created_by;

-- Comentário sobre a alteração
COMMENT ON TABLE public.atividades_acessorias IS 'Tabela de atividades acessórias - coluna created_by removida em 25/01/2025';