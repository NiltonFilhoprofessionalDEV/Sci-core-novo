-- Migration: Garantir coluna 'equipe' na tabela controle_agentes_extintores
-- Data: 2025-02-07

ALTER TABLE controle_agentes_extintores
ADD COLUMN IF NOT EXISTS equipe VARCHAR(255);

COMMENT ON COLUMN controle_agentes_extintores.equipe IS 'Nome da equipe responsável pelo controle';

-- Ajustar valores nulos existentes (se houver)
UPDATE controle_agentes_extintores
SET equipe = COALESCE(equipe, '')
WHERE equipe IS NULL;

