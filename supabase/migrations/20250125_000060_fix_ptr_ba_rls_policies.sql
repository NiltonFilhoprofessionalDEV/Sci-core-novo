-- =====================================================
-- Corrigir políticas RLS da tabela ptr_ba_provas_teoricas
-- =====================================================

-- Remover políticas existentes que podem estar causando problemas
DROP POLICY IF EXISTS "allow_read_ptr_ba_provas" ON ptr_ba_provas_teoricas;
DROP POLICY IF EXISTS "allow_insert_ptr_ba_provas" ON ptr_ba_provas_teoricas;
DROP POLICY IF EXISTS "allow_update_ptr_ba_provas" ON ptr_ba_provas_teoricas;

-- Criar políticas RLS mais específicas e seguras

-- Política de leitura: usuários autenticados podem ler todos os registros
CREATE POLICY "ptr_ba_select_policy" ON ptr_ba_provas_teoricas
    FOR SELECT 
    USING (auth.uid() IS NOT NULL);

-- Política de inserção: usuários autenticados podem inserir registros
-- Garantir que o usuario_id seja o próprio usuário logado
CREATE POLICY "ptr_ba_insert_policy" ON ptr_ba_provas_teoricas
    FOR INSERT 
    WITH CHECK (
        auth.uid() IS NOT NULL 
        AND usuario_id = auth.uid()
    );

-- Política de atualização: usuários podem atualizar apenas seus próprios registros
CREATE POLICY "ptr_ba_update_policy" ON ptr_ba_provas_teoricas
    FOR UPDATE 
    USING (auth.uid() IS NOT NULL AND usuario_id = auth.uid())
    WITH CHECK (auth.uid() IS NOT NULL AND usuario_id = auth.uid());

-- Política de exclusão: usuários podem excluir apenas seus próprios registros
CREATE POLICY "ptr_ba_delete_policy" ON ptr_ba_provas_teoricas
    FOR DELETE 
    USING (auth.uid() IS NOT NULL AND usuario_id = auth.uid());

-- Garantir que as permissões estejam corretas
GRANT SELECT, INSERT, UPDATE, DELETE ON ptr_ba_provas_teoricas TO authenticated;
GRANT USAGE ON SCHEMA public TO authenticated;

-- Log de sucesso
DO $$
BEGIN
    RAISE NOTICE 'Políticas RLS da tabela ptr_ba_provas_teoricas corrigidas com sucesso!';
    RAISE NOTICE 'Políticas criadas: ptr_ba_select_policy, ptr_ba_insert_policy, ptr_ba_update_policy, ptr_ba_delete_policy';
    RAISE NOTICE 'Usuários autenticados podem inserir registros com usuario_id = auth.uid()';
END $$;