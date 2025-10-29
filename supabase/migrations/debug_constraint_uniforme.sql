-- Investigar a constraint check_uniforme_entregue_valido_nova
SELECT 
    conname as constraint_name,
    pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint 
WHERE conname LIKE '%uniforme%' 
   OR conname LIKE '%check%'
   AND conrelid = (SELECT oid FROM pg_class WHERE relname = 'controle_uniformes_recebidos');

-- Verificar todas as constraints da tabela controle_uniformes_recebidos
SELECT 
    conname as constraint_name,
    contype as constraint_type,
    pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint 
WHERE conrelid = (SELECT oid FROM pg_class WHERE relname = 'controle_uniformes_recebidos')
ORDER BY conname;