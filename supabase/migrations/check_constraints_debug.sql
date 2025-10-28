-- Verificar todas as constraints da tabela controle_uniformes_recebidos
SELECT 
    conname AS constraint_name,
    contype AS constraint_type,
    pg_get_constraintdef(oid) AS constraint_definition
FROM pg_constraint 
WHERE conrelid = 'controle_uniformes_recebidos'::regclass
ORDER BY conname;

-- Verificar especificamente a constraint check_uniforme_entregue_valido_nova
SELECT 
    conname,
    pg_get_constraintdef(oid) AS definition
FROM pg_constraint 
WHERE conrelid = 'controle_uniformes_recebidos'::regclass 
AND conname = 'check_uniforme_entregue_valido_nova';

-- Verificar dados que podem estar violando a constraint
SELECT 
    id,
    uniforme_previsto,
    uniforme_entregue,
    epi_previsto,
    epi_entregue,
    CASE 
        WHEN uniforme_previsto IS NULL OR uniforme_previsto = 0 THEN 'uniforme_previsto_null_or_zero'
        WHEN uniforme_entregue > uniforme_previsto THEN 'uniforme_entregue_maior_que_previsto'
        ELSE 'ok'
    END as status_uniforme,
    CASE 
        WHEN epi_previsto IS NULL OR epi_previsto = 0 THEN 'epi_previsto_null_or_zero'
        WHEN epi_entregue > epi_previsto THEN 'epi_entregue_maior_que_previsto'
        ELSE 'ok'
    END as status_epi
FROM controle_uniformes_recebidos
WHERE 
    (uniforme_previsto IS NOT NULL AND uniforme_previsto > 0 AND uniforme_entregue > uniforme_previsto)
    OR
    (epi_previsto IS NOT NULL AND epi_previsto > 0 AND epi_entregue > epi_previsto)
LIMIT 10;