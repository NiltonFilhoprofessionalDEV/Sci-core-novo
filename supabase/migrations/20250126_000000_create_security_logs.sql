-- Criar tabela para logs de segurança
CREATE TABLE IF NOT EXISTS security_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    action TEXT NOT NULL,
    target_secao_id UUID REFERENCES secoes(id) ON DELETE SET NULL,
    user_secao_id UUID REFERENCES secoes(id) ON DELETE SET NULL,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    ip_address INET,
    user_agent TEXT,
    details JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_security_logs_user_id ON security_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_security_logs_timestamp ON security_logs(timestamp);
CREATE INDEX IF NOT EXISTS idx_security_logs_action ON security_logs(action);
CREATE INDEX IF NOT EXISTS idx_security_logs_target_secao_id ON security_logs(target_secao_id);

-- Habilitar RLS
ALTER TABLE security_logs ENABLE ROW LEVEL SECURITY;

-- Política para permitir que usuários vejam apenas seus próprios logs
CREATE POLICY "Users can view their own security logs" ON security_logs
    FOR SELECT USING (auth.uid() = user_id);

-- Política para permitir inserção de logs (sistema interno)
CREATE POLICY "Allow system to insert security logs" ON security_logs
    FOR INSERT WITH CHECK (true);

-- Política para administradores verem todos os logs (se necessário)
-- CREATE POLICY "Admins can view all security logs" ON security_logs
--     FOR SELECT USING (
--         EXISTS (
--             SELECT 1 FROM profiles 
--             WHERE profiles.id = auth.uid() 
--             AND profiles.role = 'admin'
--         )
--     );

-- Comentários para documentação
COMMENT ON TABLE security_logs IS 'Tabela para registrar tentativas de acesso não autorizado e violações de segurança';
COMMENT ON COLUMN security_logs.user_id IS 'ID do usuário que tentou a operação';
COMMENT ON COLUMN security_logs.action IS 'Tipo de ação tentada (ex: CREATE_OCORRENCIA, UPDATE_TAF, etc.)';
COMMENT ON COLUMN security_logs.target_secao_id IS 'ID da seção/base que o usuário tentou acessar';
COMMENT ON COLUMN security_logs.user_secao_id IS 'ID da seção/base real do usuário';
COMMENT ON COLUMN security_logs.ip_address IS 'Endereço IP da tentativa';
COMMENT ON COLUMN security_logs.user_agent IS 'User agent do navegador';
COMMENT ON COLUMN security_logs.details IS 'Detalhes adicionais em formato JSON';