-- Debug da constraint check_epi_entregue_valido_nova
-- Verificar se a constraint existe e sua definição atual

SELECT 
    conname AS constraint_name,
    pg_get_constraintdef(oid) AS constraint_definition
FROM pg_constraint 
WHERE conname LIKE '%epi%' 
   OR conname LIKE '%check%'
   AND conrelid = (SELECT oid FROM pg_class WHERE relname = 'controle_uniformes_recebidos');

-- Verificar todas as constraints da tabela controle_uniformes_recebidos
SELECT 
    conname AS constraint_name,
    contype AS constraint_type,
    pg_get_constraintdef(oid) AS constraint_definition
FROM pg_constraint 
WHERE conrelid = (SELECT oid FROM pg_class WHERE relname = 'controle_uniformes_recebidos')
ORDER BY conname;