-- Migration: Garantir coluna 'nome_completo' na tabela controle_agentes_extintores
-- Data: 2025-02-07

ALTER TABLE controle_agentes_extintores
ADD COLUMN IF NOT EXISTS nome_completo VARCHAR(255);

COMMENT ON COLUMN controle_agentes_extintores.nome_completo IS 'Nome completo do responsável pelo registro';

UPDATE controle_agentes_extintores
SET nome_completo = COALESCE(nome_completo, '')
WHERE nome_completo IS NULL;

