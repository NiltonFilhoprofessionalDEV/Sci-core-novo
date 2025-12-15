-- Migration: Adicionar índices de performance para otimizar queries
-- Data: 2024-12-15
-- Objetivo: Melhorar performance das queries de dashboard e histórico em 10-100x

-- ============================================
-- OCORRÊNCIAS
-- ============================================

-- Índice composto para ocorrências aeronáuticas filtradas por seção e data
CREATE INDEX IF NOT EXISTS idx_ocorrencias_aer_secao_data 
  ON ocorrencias_aeronauticas(secao_id, data_ocorrencia DESC);

-- Índice composto para ocorrências não aeronáuticas filtradas por seção e data
CREATE INDEX IF NOT EXISTS idx_ocorrencias_nao_aer_secao_data 
  ON ocorrencias_nao_aeronauticas(secao_id, data_ocorrencia DESC);

-- ============================================
-- TAF (TESTE DE APTIDÃO FÍSICA)
-- ============================================

-- Índice composto para registros TAF filtrados por seção e data
CREATE INDEX IF NOT EXISTS idx_taf_registros_secao_data 
  ON taf_registros(secao_id, data_teste DESC);

-- Índice para resultados TAF ordenados por data
CREATE INDEX IF NOT EXISTS idx_taf_resultados_data 
  ON taf_resultados(data_taf DESC);

-- ============================================
-- TEMPO DE RESPOSTA E EPR
-- ============================================

-- Índice composto para tempo EPR filtrado por seção e data
CREATE INDEX IF NOT EXISTS idx_tempo_epr_secao_data 
  ON tempo_epr(secao_id, data_exercicio_epr DESC);

-- Índice composto para tempo de resposta filtrado por seção e data
CREATE INDEX IF NOT EXISTS idx_tempo_resposta_secao_data 
  ON tempo_resposta(secao_id, data_tempo_resposta DESC);

-- ============================================
-- PTR-BA (PROGRAMA DE TREINAMENTO)
-- ============================================

-- Índice composto para horas de treinamento filtradas por seção e data
CREATE INDEX IF NOT EXISTS idx_ptr_ba_horas_secao_data 
  ON ptr_ba_horas_treinamento(secao_id, data_ptr_ba DESC);

-- Índice composto para provas teóricas filtradas por seção e data
CREATE INDEX IF NOT EXISTS idx_ptr_ba_provas_secao_data 
  ON ptr_ba_provas_teoricas(secao_id, data_prova DESC);

-- ============================================
-- CONTROLES
-- ============================================

-- Índice composto para controle de agentes extintores
CREATE INDEX IF NOT EXISTS idx_agentes_secao_data 
  ON controle_agentes_extintores(secao_id, data_referencia DESC);

-- Índice composto para controle de uniformes recebidos
CREATE INDEX IF NOT EXISTS idx_uniformes_secao_data 
  ON controle_uniformes_recebidos(secao_id, data_referencia DESC);

-- Índice composto para controle de trocas
CREATE INDEX IF NOT EXISTS idx_trocas_secao_data 
  ON controle_trocas(secao_id, data_referencia DESC);

-- ============================================
-- TPS (TRAJETÓRIA DE POUSO SEGURA)
-- ============================================

-- Índice composto para verificação de TPS
CREATE INDEX IF NOT EXISTS idx_verificacao_tps_secao_data 
  ON verificacao_tps(secao_id, data_referencia DESC);

-- Índice composto para higienização de TPS
CREATE INDEX IF NOT EXISTS idx_higienizacao_tps_secao_data 
  ON higienizacao_tps(secao_id, data_referencia DESC);

-- ============================================
-- OUTROS INDICADORES
-- ============================================

-- Índice composto para atividades acessórias
CREATE INDEX IF NOT EXISTS idx_atividades_secao_data 
  ON atividades_acessorias(secao_id, data_atividade DESC);

-- Índice composto para inspeções de viatura
CREATE INDEX IF NOT EXISTS idx_inspecoes_secao_data 
  ON inspecoes_viatura(secao_id, data DESC);

-- ============================================
-- COMENTÁRIOS
-- ============================================

-- Estes índices otimizam:
-- 1. Filtros por seção (secao_id) - usado em quase todas as queries
-- 2. Ordenação por data descendente - queries sempre buscam registros mais recentes primeiro
-- 3. Range queries de data - filtros de período (último mês, últimos 6 meses, etc)

-- Benefícios esperados:
-- - Queries de dashboard: de table scan → index scan (10-100x mais rápido)
-- - Redução de tempo de resposta: de 3-8s → <2s
-- - Menor carga no banco para queries complexas com múltiplos filtros

