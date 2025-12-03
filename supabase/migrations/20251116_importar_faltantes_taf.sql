-- Importar funcionários TAF faltantes
-- Adiciona os registros que não foram importados na primeira vez

WITH funcionarios_faltantes AS (
  SELECT * FROM (VALUES
    -- ALFA - 23/09/2025 (todos já importados)
    
    -- BRAVO - 24/09/2025 (todos já importados)
    
    -- CHARLIE - 25/09/2025 (todos já importados)
    
    -- DELTA - 26/09/2025 (faltando 2 funcionários)
    ('PAULO CÉSAR DA SILVA OLIVEIRA', NULL, 'atestado médico', 'Delta', '2025-09-26'),
    ('SÍLVIO CÉSAR FERNANDES FILHO', 29, '00:01:57', 'Delta', '2025-09-26')
  ) AS v(nome_completo, idade, tempo_total, equipe_nome, data_teste)
),
equipe_mapping AS (
  SELECT * FROM (VALUES
    ('Alfa', 'f7764099-5a7d-456f-97d9-4c7ed305780b'::uuid),
    ('Bravo', 'ad8556a6-ee52-4f5f-80d2-ce1d07b29feb'::uuid),
    ('Charlie', '04d460df-ceb6-4f9b-a567-07705ff73f88'::uuid),
    ('Delta', 'c51236e6-9186-4e64-ada2-459e4e2033e6'::uuid)
  ) AS v(nome, equipe_id)
),
registros_taf AS (
  SELECT 
    tr.id as taf_registro_id,
    tr.secao_id,
    tr.equipe_id,
    tr.data_teste,
    em.nome as nome_equipe
  FROM taf_registros tr
  INNER JOIN equipe_mapping em ON tr.equipe_id = em.equipe_id
  WHERE tr.secao_id = '4d8aa88d-7540-45d4-bb5d-e821dd0c010b'::uuid -- Goiânia
),
funcionarios_encontrados AS (
  SELECT 
    ff.nome_completo,
    ff.idade,
    ff.tempo_total,
    ff.equipe_nome,
    ff.data_teste::date,
    f.id as funcionario_id,
    f.nome_cidade,
    rt.taf_registro_id
  FROM funcionarios_faltantes ff
  INNER JOIN funcionarios f ON ff.nome_completo = f.nome_completo
  INNER JOIN equipe_mapping em ON ff.equipe_nome = em.nome
  INNER JOIN registros_taf rt ON rt.equipe_id = em.equipe_id AND rt.data_teste = ff.data_teste::date
  WHERE f.secao_id = '4d8aa88d-7540-45d4-bb5d-e821dd0c010b'::uuid -- Goiânia
    AND f.equipe_id = em.equipe_id
),
-- Calcula desempenho usando a lógica oficial
desempenho_calculado AS (
  SELECT 
    *,
    CASE 
      WHEN tempo_total = 'atestado médico' THEN NULL
      WHEN tempo_total IS NULL THEN NULL
      WHEN idade <= 39 THEN
        CASE 
          WHEN tempo_total <= '00:02:00' THEN 10
          WHEN tempo_total <= '00:02:20' THEN 9
          WHEN tempo_total <= '00:02:40' THEN 8
          WHEN tempo_total <= '00:03:00' THEN 7
          ELSE 0
        END
      WHEN idade >= 40 THEN
        CASE 
          WHEN tempo_total <= '00:03:00' THEN 10
          WHEN tempo_total <= '00:03:20' THEN 9
          WHEN tempo_total <= '00:03:40' THEN 8
          WHEN tempo_total <= '00:04:00' THEN 7
          ELSE 0
        END
      ELSE NULL
    END as desempenho
  FROM funcionarios_encontrados
)
-- Insere os resultados TAF faltantes
INSERT INTO taf_resultados (
  taf_registro_id,
  funcionario_id,
  idade,
  tempo_total,
  desempenho,
  nome_completo,
  nome_cidade,
  nome_equipe,
  data_taf,
  observacoes
)
SELECT 
  taf_registro_id,
  funcionario_id,
  COALESCE(idade, 1) as idade,
  CASE WHEN tempo_total = 'atestado médico' THEN NULL ELSE tempo_total END,
  desempenho,
  nome_completo,
  nome_cidade,
  equipe_nome,
  data_teste,
  CASE 
    WHEN tempo_total = 'atestado médico' THEN 'Atestado médico - Resultado importado'
    ELSE 'Resultado importado com dados reais do TAF Goiânia - Set 2025'
  END
FROM desempenho_calculado
ORDER BY data_teste, equipe_nome, nome_completo;

-- Retorna estatísticas da importação
SELECT 
  'Funcionários faltantes importados:' as status,
  COUNT(*) as total
FROM taf_resultados
WHERE observacoes = 'Resultado importado com dados reais do TAF Goiânia - Set 2025'
   OR observacoes = 'Atestado médico - Resultado importado';

-- Total geral agora
SELECT 
  nome_equipe,
  COUNT(*) as total_funcionarios
FROM taf_resultados
WHERE observacoes LIKE '%TAF Goiânia - Set 2025%'
GROUP BY nome_equipe
ORDER BY nome_equipe;