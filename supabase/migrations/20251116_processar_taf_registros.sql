-- Processar registros TAF e criar resultados para funcionários
-- Este script lê taf_registros e cria entradas em taf_resultados para cada funcionário da equipe

WITH registros_taf AS (
  -- Seleciona todos os registros TAF que ainda não têm resultados processados
  SELECT 
    tr.id as taf_registro_id,
    tr.secao_id,
    tr.equipe_id,
    tr.data_teste,
    s.nome as nome_secao,
    e.nome as nome_equipe
  FROM taf_registros tr
  INNER JOIN secoes s ON tr.secao_id = s.id
  INNER JOIN equipes e ON tr.equipe_id = e.id
  WHERE NOT EXISTS (
    SELECT 1 
    FROM taf_resultados tr2 
    WHERE tr2.taf_registro_id = tr.id
  )
),
funcionarios_ativos AS (
  -- Seleciona todos os funcionários ativos das equipes/secções dos registros TAF
  SELECT 
    f.id as funcionario_id,
    f.nome_completo,
    f.nome_cidade,
    f.secao_id,
    f.equipe_id,
    -- Calcula idade baseada na data do teste (estimativa)
    EXTRACT(YEAR FROM AGE(CURRENT_DATE, f.created_at))::int as idade_estimada
  FROM funcionarios f
  WHERE f.secao_id IN (SELECT secao_id FROM registros_taf)
    AND f.equipe_id IN (SELECT equipe_id FROM registros_taf)
),
resultados_a_criar AS (
  -- Cria combinação de todos os funcionários com seus respectivos registros TAF
  SELECT 
    rt.taf_registro_id,
    rt.data_teste,
    rt.nome_secao,
    rt.nome_equipe,
    fa.funcionario_id,
    fa.nome_completo,
    fa.nome_cidade,
    -- Usa idade estimada ou valor padrão
    CASE 
      WHEN fa.idade_estimada > 0 AND fa.idade_estimada < 100 THEN fa.idade_estimada
      ELSE 30 -- Valor padrão se idade não puder ser estimada
    END as idade
  FROM registros_taf rt
  INNER JOIN funcionarios_ativos fa 
    ON rt.secao_id = fa.secao_id 
    AND rt.equipe_id = fa.equipe_id
)
-- Insere os resultados TAF para cada funcionário
INSERT INTO taf_resultados (
  taf_registro_id,
  funcionario_id,
  idade,
  nome_completo,
  nome_cidade,
  nome_equipe,
  data_taf,
  tempo_total,
  desempenho,
  observacoes
)
SELECT 
  taf_registro_id,
  funcionario_id,
  idade,
  nome_completo,
  nome_cidade,
  nome_equipe,
  data_teste,
  NULL as tempo_total, -- Será preenchido posteriormente
  NULL as desempenho,   -- Será preenchido posteriormente  
  'Resultado criado automaticamente - aguardando avaliação' as observacoes
FROM resultados_a_criar
ORDER BY taf_registro_id, nome_completo;

-- Retorna estatísticas do processamento
SELECT 
  COUNT(*) as total_resultados_criados,
  COUNT(DISTINCT taf_registro_id) as registros_processados,
  COUNT(DISTINCT funcionario_id) as funcionarios_diferentes
FROM taf_resultados
WHERE observacoes = 'Resultado criado automaticamente - aguardando avaliação';