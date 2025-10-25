-- =====================================================
-- MIGRATION: Corrigir políticas RLS para tabelas TAF
-- Data: 2025-01-25
-- Descrição: Adicionar políticas RLS necessárias para permitir
--           INSERT, UPDATE e DELETE nas tabelas taf_registros e taf_resultados
-- =====================================================

-- =====================================================
-- POLÍTICAS RLS PARA TAF_REGISTROS
-- =====================================================

-- Política para SELECT (usuários autenticados podem ver todos os registros)
CREATE POLICY "taf_registros_select_policy" ON taf_registros
    FOR SELECT TO authenticated
    USING (true);

-- Política para INSERT (usuários autenticados podem inserir registros)
CREATE POLICY "taf_registros_insert_policy" ON taf_registros
    FOR INSERT TO authenticated
    WITH CHECK (true);

-- Política para UPDATE (usuários autenticados podem atualizar registros)
CREATE POLICY "taf_registros_update_policy" ON taf_registros
    FOR UPDATE TO authenticated
    USING (true)
    WITH CHECK (true);

-- Política para DELETE (usuários autenticados podem deletar registros)
CREATE POLICY "taf_registros_delete_policy" ON taf_registros
    FOR DELETE TO authenticated
    USING (true);

-- =====================================================
-- POLÍTICAS RLS PARA TAF_RESULTADOS
-- =====================================================

-- Política para SELECT (usuários autenticados podem ver todos os registros)
CREATE POLICY "taf_resultados_select_policy" ON taf_resultados
    FOR SELECT TO authenticated
    USING (true);

-- Política para INSERT (usuários autenticados podem inserir registros)
CREATE POLICY "taf_resultados_insert_policy" ON taf_resultados
    FOR INSERT TO authenticated
    WITH CHECK (true);

-- Política para UPDATE (usuários autenticados podem atualizar registros)
CREATE POLICY "taf_resultados_update_policy" ON taf_resultados
    FOR UPDATE TO authenticated
    USING (true)
    WITH CHECK (true);

-- Política para DELETE (usuários autenticados podem deletar registros)
CREATE POLICY "taf_resultados_delete_policy" ON taf_resultados
    FOR DELETE TO authenticated
    USING (true);

-- =====================================================
-- COMENTÁRIOS E LOGS
-- =====================================================

-- Log de sucesso
DO $$
BEGIN
    RAISE NOTICE 'Políticas RLS para tabelas TAF criadas com sucesso!';
    RAISE NOTICE 'Tabela taf_registros: SELECT, INSERT, UPDATE, DELETE habilitados para authenticated';
    RAISE NOTICE 'Tabela taf_resultados: SELECT, INSERT, UPDATE, DELETE habilitados para authenticated';
END $$;