-- Verificar a constraint atual
SELECT 
    conname,
    pg_get_constraintdef(oid) AS definition
FROM pg_constraint 
WHERE conrelid = 'controle_uniformes_recebidos'::regclass 
AND conname = 'check_uniforme_entregue_valido_nova';

-- Remover a constraint existente se ela existir
ALTER TABLE controle_uniformes_recebidos 
DROP CONSTRAINT IF EXISTS check_uniforme_entregue_valido_nova;

-- Recriar a constraint com lógica correta
-- A constraint deve permitir:
-- 1. uniforme_previsto NULL ou 0 (sem validação adicional)
-- 2. uniforme_entregue <= uniforme_previsto quando uniforme_previsto > 0
ALTER TABLE controle_uniformes_recebidos 
ADD CONSTRAINT check_uniforme_entregue_valido_nova 
CHECK (
    uniforme_entregue IS NULL 
    OR uniforme_previsto IS NULL 
    OR uniforme_previsto = 0 
    OR (uniforme_previsto > 0 AND uniforme_entregue <= uniforme_previsto)
);

-- Verificar se a constraint foi criada corretamente
SELECT 
    conname,
    pg_get_constraintdef(oid) AS definition
FROM pg_constraint 
WHERE conrelid = 'controle_uniformes_recebidos'::regclass 
AND conname = 'check_uniforme_entregue_valido_nova';