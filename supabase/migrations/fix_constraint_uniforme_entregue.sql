-- Corrigir constraint check_uniforme_entregue_valido_nova
-- O problema é que a constraint não permite valores NULL ou 0 para uniforme_previsto
-- quando uniforme_entregue é maior que 0

-- Remover a constraint existente
ALTER TABLE controle_uniformes_recebidos 
DROP CONSTRAINT IF EXISTS check_uniforme_entregue_valido_nova;

-- Recriar a constraint com lógica corrigida
-- Permitir que uniforme_entregue seja 0 mesmo quando uniforme_previsto é 0
-- Só validar se ambos os valores não são NULL
ALTER TABLE controle_uniformes_recebidos 
ADD CONSTRAINT check_uniforme_entregue_valido_nova 
CHECK (
    uniforme_entregue IS NULL 
    OR uniforme_previsto IS NULL 
    OR uniforme_previsto = 0 
    OR uniforme_entregue <= uniforme_previsto
);

-- Fazer o mesmo para EPI para consistência
ALTER TABLE controle_uniformes_recebidos 
DROP CONSTRAINT IF EXISTS check_epi_entregue_valido_nova;

ALTER TABLE controle_uniformes_recebidos 
ADD CONSTRAINT check_epi_entregue_valido_nova 
CHECK (
    epi_entregue IS NULL 
    OR epi_previsto IS NULL 
    OR epi_previsto = 0 
    OR epi_entregue <= epi_previsto
);