-- Verificar políticas RLS da tabela controle_uniformes_recebidos
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
WHERE tablename = 'controle_uniformes_recebidos'
ORDER BY policyname;

-- Verificar se RLS está habilitado
SELECT 
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables 
WHERE tablename = 'controle_uniformes_recebidos';

-- Verificar permissões da tabela
SELECT 
    grantee,
    privilege_type,
    is_grantable
FROM information_schema.table_privileges 
WHERE table_name = 'controle_uniformes_recebidos'
ORDER BY grantee, privilege_type;