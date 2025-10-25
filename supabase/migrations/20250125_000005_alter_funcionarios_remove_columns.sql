-- =====================================================
-- MIGRATION: Remover colunas desnecessárias da tabela funcionarios
-- Data: 2025-01-25
-- Descrição: Remove colunas cpf, telefone, matricula, data_admissao, 
--           data_demissao, ativo e observacoes da tabela funcionarios
-- =====================================================

-- Remover constraint única antes de remover a coluna matricula
ALTER TABLE public.funcionarios DROP CONSTRAINT IF EXISTS unique_matricula_por_secao;

-- Remover índices relacionados às colunas que serão excluídas
DROP INDEX IF EXISTS idx_funcionarios_cpf;
DROP INDEX IF EXISTS idx_funcionarios_matricula;
DROP INDEX IF EXISTS idx_funcionarios_ativo;

-- Remover as colunas especificadas
ALTER TABLE public.funcionarios DROP COLUMN IF EXISTS cpf;
ALTER TABLE public.funcionarios DROP COLUMN IF EXISTS telefone;
ALTER TABLE public.funcionarios DROP COLUMN IF EXISTS matricula;
ALTER TABLE public.funcionarios DROP COLUMN IF EXISTS data_admissao;
ALTER TABLE public.funcionarios DROP COLUMN IF EXISTS data_demissao;
ALTER TABLE public.funcionarios DROP COLUMN IF EXISTS ativo;
ALTER TABLE public.funcionarios DROP COLUMN IF EXISTS observacoes;

-- Atualizar comentário da tabela para refletir as mudanças
COMMENT ON TABLE public.funcionarios IS 'Cadastro simplificado de funcionários (bombeiros) de cada seção, vinculados às suas respectivas equipes';

-- A tabela funcionarios agora contém apenas:
-- - id (uuid, PK)
-- - nome_completo (varchar, NOT NULL)
-- - email (varchar, UNIQUE)
-- - cargo (varchar, NOT NULL)
-- - secao_id (uuid, FK para secoes, NOT NULL)
-- - equipe_id (uuid, FK para equipes, NOT NULL)
-- - created_at (timestamptz)
-- - updated_at (timestamptz)