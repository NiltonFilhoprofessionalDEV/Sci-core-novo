-- Verificar registros TAF existentes para Goiânia
SELECT 
  tr.id,
  s.nome as secao_nome,
  e.nome as equipe_nome,
  tr.data_teste,
  tr.created_at
FROM taf_registros tr
INNER JOIN secoes s ON tr.secao_id = s.id
INNER JOIN equipes e ON tr.equipe_id = e.id
WHERE tr.secao_id = '4d8aa88d-7540-45d4-bb5d-e821dd0c010b'::uuid -- Goiânia
ORDER BY tr.data_teste, e.nome;