-- =====================================================
-- Migration: Adicionar colunas para controle de agentes extintores
-- Data: 2025-01-25
-- Descrição: Adicionar colunas necessárias para o modal de controle de agentes extintores
-- =====================================================

-- Adicionar colunas para estoque atual
ALTER TABLE controle_agentes_extintores 
ADD COLUMN IF NOT EXISTS quantidade_estoque_po_quimico NUMERIC(10,2) DEFAULT 0 CHECK (quantidade_estoque_po_quimico >= 0);

ALTER TABLE controle_agentes_extintores 
ADD COLUMN IF NOT EXISTS quantidade_estoque_lge NUMERIC(10,2) DEFAULT 0 CHECK (quantidade_estoque_lge >= 0);

ALTER TABLE controle_agentes_extintores 
ADD COLUMN IF NOT EXISTS quantidade_estoque_nitrogenio INTEGER DEFAULT 0 CHECK (quantidade_estoque_nitrogenio >= 0);

-- Adicionar colunas para quantidade exigida
ALTER TABLE controle_agentes_extintores 
ADD COLUMN IF NOT EXISTS quantidade_exigida_po_quimico NUMERIC(10,2) DEFAULT 0 CHECK (quantidade_exigida_po_quimico >= 0);

ALTER TABLE controle_agentes_extintores 
ADD COLUMN IF NOT EXISTS quantidade_exigida_lge NUMERIC(10,2) DEFAULT 0 CHECK (quantidade_exigida_lge >= 0);

ALTER TABLE controle_agentes_extintores 
ADD COLUMN IF NOT EXISTS quantidade_exigida_nitrogenio INTEGER DEFAULT 0 CHECK (quantidade_exigida_nitrogenio >= 0);

-- Adicionar coluna para observações
ALTER TABLE controle_agentes_extintores 
ADD COLUMN IF NOT EXISTS observacoes TEXT;

-- Comentários nas novas colunas
COMMENT ON COLUMN controle_agentes_extintores.quantidade_estoque_po_quimico IS 'Quantidade atual em estoque de pó químico (Kg)';
COMMENT ON COLUMN controle_agentes_extintores.quantidade_estoque_lge IS 'Quantidade atual em estoque de LGE (Lts)';
COMMENT ON COLUMN controle_agentes_extintores.quantidade_estoque_nitrogenio IS 'Quantidade atual em estoque de nitrogênio (unidades)';
COMMENT ON COLUMN controle_agentes_extintores.quantidade_exigida_po_quimico IS 'Quantidade exigida de pó químico (Kg)';
COMMENT ON COLUMN controle_agentes_extintores.quantidade_exigida_lge IS 'Quantidade exigida de LGE (Lts)';
COMMENT ON COLUMN controle_agentes_extintores.quantidade_exigida_nitrogenio IS 'Quantidade exigida de nitrogênio (unidades)';
COMMENT ON COLUMN controle_agentes_extintores.observacoes IS 'Observações sobre o controle de agentes extintores';

-- Atualizar comentário da tabela
COMMENT ON TABLE controle_agentes_extintores IS 'Registro de controle de agentes extintores por equipe';

-- Criar índices adicionais para performance
CREATE INDEX IF NOT EXISTS idx_controle_agentes_extintores_data_referencia ON controle_agentes_extintores(data_referencia DESC);
CREATE INDEX IF NOT EXISTS idx_controle_agentes_extintores_secao_id ON controle_agentes_extintores(secao_id);
CREATE INDEX IF NOT EXISTS idx_controle_agentes_extintores_equipe_id ON controle_agentes_extintores(equipe_id);