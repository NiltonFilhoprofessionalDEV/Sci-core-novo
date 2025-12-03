-- Criar registros TAF para Goiânia se não existirem
-- Datas: 23-26 de setembro de 2025

WITH equipes_goiânia AS (
  SELECT * FROM (VALUES
    ('f7764099-5a7d-456f-97d9-4c7ed305780b'::uuid, 'Alfa'),
    ('ad8556a6-ee52-4f5f-80d2-ce1d07b29feb'::uuid, 'Bravo'),
    ('04d460df-ceb6-4f9b-a567-07705ff73f88'::uuid, 'Charlie'),
    ('c51236e6-9186-4e64-ada2-459e4e2033e6'::uuid, 'Delta')
  ) AS v(equipe_id, nome)
),
datas_taf AS (
  SELECT * FROM (VALUES
    ('2025-09-23'::date, 'Alfa'),
    ('2025-09-24'::date, 'Bravo'),
    ('2025-09-25'::date, 'Charlie'),
    ('2025-09-26'::date, 'Delta')
  ) AS v(data_teste, equipe_nome)
),
-- Cria registros TAF apenas se não existirem
registros_a_criar AS (
  SELECT 
    '4d8aa88d-7540-45d4-bb5d-e821dd0c010b'::uuid as secao_id,
    eg.equipe_id,
    dt.data_teste
  FROM datas_taf dt
  INNER JOIN equipes_goiânia eg ON dt.equipe_nome = eg.nome
  WHERE NOT EXISTS (
    SELECT 1 
    FROM taf_registros tr 
    WHERE tr.secao_id = '4d8aa88d-7540-45d4-bb5d-e821dd0c010b'::uuid
      AND tr.equipe_id = eg.equipe_id
      AND tr.data_teste = dt.data_teste
  )
)
INSERT INTO taf_registros (secao_id, equipe_id, data_teste)
SELECT secao_id, equipe_id, data_teste
FROM registros_a_criar
ORDER BY data_teste, equipe_id;

-- Verifica os registros criados
SELECT 
  'Registros TAF criados:' as status,
  COUNT(*) as total
FROM taf_registros
WHERE secao_id = '4d8aa88d-7540-45d4-bb5d-e821dd0c010b'::uuid
  AND data_teste BETWEEN '2025-09-23' AND '2025-09-26';