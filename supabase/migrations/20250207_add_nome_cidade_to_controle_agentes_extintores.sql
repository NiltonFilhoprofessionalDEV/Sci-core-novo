-- Migration: Add nome_cidade column to controle_agentes_extintores
-- Date: 2025-02-07

-- Adicionar coluna nome_cidade à tabela, caso ainda não exista
ALTER TABLE controle_agentes_extintores
ADD COLUMN IF NOT EXISTS nome_cidade VARCHAR(255);

COMMENT ON COLUMN controle_agentes_extintores.nome_cidade IS 'Nome da cidade/base onde foi registrado o controle';

-- Garantir que registros existentes recebam algum valor padrão (opcional)
UPDATE controle_agentes_extintores
SET nome_cidade = COALESCE(nome_cidade, '')
WHERE nome_cidade IS NULL;

