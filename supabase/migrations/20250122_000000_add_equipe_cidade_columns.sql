-- Migration para adicionar colunas obrigatórias 'equipe' e 'cidade_aeroporto'
-- nas tabelas de ocorrências aeronáuticas e não aeronáuticas

-- Adicionar coluna 'equipe' na tabela ocorrencias_aeronauticas
ALTER TABLE public.ocorrencias_aeronauticas 
ADD COLUMN IF NOT EXISTS equipe TEXT NOT NULL DEFAULT '';

-- Adicionar coluna 'cidade_aeroporto' na tabela ocorrencias_aeronauticas
ALTER TABLE public.ocorrencias_aeronauticas 
ADD COLUMN IF NOT EXISTS cidade_aeroporto TEXT NOT NULL DEFAULT '';

-- Adicionar coluna 'cidade_aeroporto' na tabela ocorrencias_nao_aeronauticas
ALTER TABLE public.ocorrencias_nao_aeronauticas 
ADD COLUMN IF NOT EXISTS cidade_aeroporto TEXT NOT NULL DEFAULT '';

-- Atualizar a coluna 'equipe' existente na tabela ocorrencias_nao_aeronauticas para ser NOT NULL
-- Primeiro, definir um valor padrão para registros existentes que possam ter valor NULL
UPDATE public.ocorrencias_nao_aeronauticas 
SET equipe = '' 
WHERE equipe IS NULL;

-- Agora alterar a coluna para NOT NULL
ALTER TABLE public.ocorrencias_nao_aeronauticas 
ALTER COLUMN equipe SET NOT NULL;

-- Adicionar comentários para documentar as colunas
COMMENT ON COLUMN public.ocorrencias_aeronauticas.equipe IS 'Nome da equipe que atendeu a ocorrência aeronáutica';
COMMENT ON COLUMN public.ocorrencias_aeronauticas.cidade_aeroporto IS 'Nome da cidade correspondente ao aeroporto da ocorrência';
COMMENT ON COLUMN public.ocorrencias_nao_aeronauticas.cidade_aeroporto IS 'Nome da cidade correspondente ao aeroporto da ocorrência';

-- Atualizar comentário da coluna equipe existente
COMMENT ON COLUMN public.ocorrencias_nao_aeronauticas.equipe IS 'Nome da equipe que atendeu a ocorrência não aeronáutica';