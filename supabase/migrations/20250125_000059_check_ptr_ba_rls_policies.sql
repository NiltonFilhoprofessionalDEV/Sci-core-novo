-- =====================================================
-- Verificar políticas RLS da tabela ptr_ba_provas_teoricas
-- =====================================================

-- Verificar se RLS está habilitado
SELECT 
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables 
WHERE tablename = 'ptr_ba_provas_teoricas';

-- Listar todas as políticas RLS existentes
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'ptr_ba_provas_teoricas'
ORDER BY cmd, policyname;

-- Verificar se existem políticas de INSERT
SELECT 
    policyname,
    cmd,
    roles,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'ptr_ba_provas_teoricas' 
AND cmd = 'INSERT';