-- Configurar permissões para a tabela atividades_acessorias
-- Migration para garantir acesso adequado aos roles anon e authenticated

-- Conceder permissões básicas para o role anon (usuários não logados)
GRANT SELECT ON atividades_acessorias TO anon;

-- Conceder permissões completas para o role authenticated (usuários logados)
GRANT ALL PRIVILEGES ON atividades_acessorias TO authenticated;

-- Verificar se as políticas RLS existem e criar se necessário
DO $$
BEGIN
    -- Política para SELECT (usuários autenticados podem ver todos os registros)
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'atividades_acessorias' 
        AND policyname = 'atividades_acessorias_select_policy'
    ) THEN
        CREATE POLICY atividades_acessorias_select_policy ON atividades_acessorias
            FOR SELECT USING (auth.role() = 'authenticated');
    END IF;

    -- Política para INSERT (usuários autenticados podem inserir registros)
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'atividades_acessorias' 
        AND policyname = 'atividades_acessorias_insert_policy'
    ) THEN
        CREATE POLICY atividades_acessorias_insert_policy ON atividades_acessorias
            FOR INSERT WITH CHECK (auth.role() = 'authenticated');
    END IF;

    -- Política para UPDATE (usuários autenticados podem atualizar seus próprios registros)
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'atividades_acessorias' 
        AND policyname = 'atividades_acessorias_update_policy'
    ) THEN
        CREATE POLICY atividades_acessorias_update_policy ON atividades_acessorias
            FOR UPDATE USING (auth.role() = 'authenticated');
    END IF;

    -- Política para DELETE (usuários autenticados podem deletar seus próprios registros)
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'atividades_acessorias' 
        AND policyname = 'atividades_acessorias_delete_policy'
    ) THEN
        CREATE POLICY atividades_acessorias_delete_policy ON atividades_acessorias
            FOR DELETE USING (auth.role() = 'authenticated');
    END IF;
END
$$;