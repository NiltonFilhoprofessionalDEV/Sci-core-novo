-- Configurar políticas RLS para a tabela controle_uniformes_recebidos
-- Data: 2025-01-25
-- Descrição: Políticas de segurança para permitir operações CRUD adequadas

-- Remover políticas existentes se houver
DROP POLICY IF EXISTS "controle_uniformes_select_policy" ON controle_uniformes_recebidos;
DROP POLICY IF EXISTS "controle_uniformes_insert_policy" ON controle_uniformes_recebidos;
DROP POLICY IF EXISTS "controle_uniformes_update_policy" ON controle_uniformes_recebidos;
DROP POLICY IF EXISTS "controle_uniformes_delete_policy" ON controle_uniformes_recebidos;

-- Política SELECT: usuários autenticados da mesma seção
CREATE POLICY "controle_uniformes_select_policy" ON controle_uniformes_recebidos
    FOR SELECT USING (
        auth.uid() IS NOT NULL AND (
            -- Usuário pode ver registros da sua própria seção
            secao_id IN (
                SELECT p.secao_id 
                FROM profiles p 
                WHERE p.id = auth.uid()
            )
            OR
            -- Gestores POP podem ver todos os registros
            EXISTS (
                SELECT 1 FROM profiles p 
                WHERE p.id = auth.uid() 
                AND p.perfil = 'gestor_pop'
            )
        )
    );

-- Política INSERT: usuários autenticados podem inserir registros
CREATE POLICY "controle_uniformes_insert_policy" ON controle_uniformes_recebidos
    FOR INSERT WITH CHECK (
        auth.uid() IS NOT NULL AND (
            -- Usuário pode inserir registros para sua própria seção
            secao_id IN (
                SELECT p.secao_id 
                FROM profiles p 
                WHERE p.id = auth.uid()
            )
            OR
            -- Gestores POP podem inserir em qualquer seção
            EXISTS (
                SELECT 1 FROM profiles p 
                WHERE p.id = auth.uid() 
                AND p.perfil = 'gestor_pop'
            )
        )
    );

-- Política UPDATE: usuários autenticados podem atualizar registros da sua seção
CREATE POLICY "controle_uniformes_update_policy" ON controle_uniformes_recebidos
    FOR UPDATE USING (
        auth.uid() IS NOT NULL AND (
            -- Usuário pode atualizar registros da sua própria seção
            secao_id IN (
                SELECT p.secao_id 
                FROM profiles p 
                WHERE p.id = auth.uid()
            )
            OR
            -- Gestores POP podem atualizar qualquer registro
            EXISTS (
                SELECT 1 FROM profiles p 
                WHERE p.id = auth.uid() 
                AND p.perfil = 'gestor_pop'
            )
        )
    );

-- Política DELETE: usuários autenticados podem deletar registros da sua seção
CREATE POLICY "controle_uniformes_delete_policy" ON controle_uniformes_recebidos
    FOR DELETE USING (
        auth.uid() IS NOT NULL AND (
            -- Usuário pode deletar registros da sua própria seção
            secao_id IN (
                SELECT p.secao_id 
                FROM profiles p 
                WHERE p.id = auth.uid()
            )
            OR
            -- Gestores POP podem deletar qualquer registro
            EXISTS (
                SELECT 1 FROM profiles p 
                WHERE p.id = auth.uid() 
                AND p.perfil = 'gestor_pop'
            )
        )
    );

-- Garantir que RLS está habilitado
ALTER TABLE controle_uniformes_recebidos ENABLE ROW LEVEL SECURITY;