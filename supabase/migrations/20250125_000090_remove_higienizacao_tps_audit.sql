-- Migração para remover completamente a tabela de auditoria higienizacao_tps_audit
-- Data: 2025-01-25
-- Descrição: Simplificar o sistema removendo auditoria e mantendo apenas a tabela principal

-- Remover trigger de auditoria se existir
DROP TRIGGER IF EXISTS trigger_audit_higienizacao_tps ON higienizacao_tps;

-- Remover função de auditoria se existir
DROP FUNCTION IF EXISTS audit_higienizacao_tps();

-- Remover políticas RLS da tabela de auditoria
DROP POLICY IF EXISTS "Users can view their own audit logs" ON higienizacao_tps_audit;

-- Revogar permissões da tabela de auditoria
REVOKE ALL ON higienizacao_tps_audit FROM authenticated;

-- Remover tabela de auditoria completamente
DROP TABLE IF EXISTS higienizacao_tps_audit CASCADE;

-- Comentário para documentação
COMMENT ON TABLE higienizacao_tps IS 'Tabela principal para registro de higienização de TPs - sistema simplificado sem auditoria';