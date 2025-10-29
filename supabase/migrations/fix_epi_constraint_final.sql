-- Correção final da constraint check_epi_entregue_valido_nova
-- Garantir que a constraint permita valores 0 quando epi_previsto = 0

-- Remover a constraint existente se ela existir
ALTER TABLE controle_uniformes_recebidos 
DROP CONSTRAINT IF EXISTS check_epi_entregue_valido_nova;

-- Recriar a constraint com lógica corrigida
-- Permitir que epi_entregue seja qualquer valor quando epi_previsto é 0 ou NULL
-- Só validar se epi_previsto > 0
ALTER TABLE controle_uniformes_recebidos 
ADD CONSTRAINT check_epi_entregue_valido_nova 
CHECK (
    epi_entregue IS NULL 
    OR epi_previsto IS NULL 
    OR epi_previsto = 0 
    OR (epi_previsto > 0 AND epi_entregue <= epi_previsto)
);

-- Verificar se a constraint foi criada corretamente
SELECT 
    conname AS constraint_name,
    pg_get_constraintdef(oid) AS constraint_definition
FROM pg_constraint 
WHERE conname = 'check_epi_entregue_valido_nova'
   AND conrelid = (SELECT oid FROM pg_class WHERE relname = 'controle_uniformes_recebidos');