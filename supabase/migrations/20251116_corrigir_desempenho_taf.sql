-- Corrigir cálculo de desempenho TAF para usar a lógica correta do sistema
-- Atualiza os resultados importados com a lógica por faixa etária

WITH tempos_convertidos AS (
  SELECT 
    id,
    funcionario_id,
    nome_completo,
    idade,
    tempo_total,
    desempenho as desempenho_atual,
    data_taf,
    nome_equipe,
    -- Converter tempo HH:MM:SS para segundos
    CASE 
      WHEN tempo_total ~ '^([0-1]?[0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]$' THEN
        CAST(split_part(tempo_total, ':', 1) AS INTEGER) * 3600 +
        CAST(split_part(tempo_total, ':', 2) AS INTEGER) * 60 +
        CAST(split_part(tempo_total, ':', 3) AS INTEGER)
      ELSE NULL
    END as tempo_segundos
  FROM taf_resultados
  WHERE observacoes = 'Resultado importado com dados reais do TAF Goiânia - Set 2025'
),
desempenho_corrigido AS (
  SELECT 
    *,
    CASE 
      WHEN tempo_segundos IS NULL THEN NULL
      WHEN idade <= 39 THEN
        CASE 
          WHEN tempo_segundos <= 120 THEN 10  -- ≤ 2:00
          WHEN tempo_segundos <= 140 THEN 9   -- ≤ 2:20
          WHEN tempo_segundos <= 160 THEN 8   -- ≤ 2:40
          WHEN tempo_segundos <= 180 THEN 7   -- ≤ 3:00
          ELSE 0  -- Reprovado
        END
      WHEN idade >= 40 THEN
        CASE 
          WHEN tempo_segundos <= 180 THEN 10  -- ≤ 3:00
          WHEN tempo_segundos <= 200 THEN 9   -- ≤ 3:20
          WHEN tempo_segundos <= 220 THEN 8   -- ≤ 3:40
          WHEN tempo_segundos <= 240 THEN 7   -- ≤ 4:00
          ELSE 0  -- Reprovado
        END
      ELSE NULL
    END as novo_desempenho
  FROM tempos_convertidos
)
UPDATE taf_resultados 
SET desempenho = dc.novo_desempenho,
    observacoes = 'Resultado importado e corrigido com lógica TAF oficial - Set 2025'
FROM desempenho_corrigido dc
WHERE taf_resultados.id = dc.id
  AND taf_resultados.observacoes = 'Resultado importado com dados reais do TAF Goiânia - Set 2025';

-- Relatório de correções realizadas
SELECT 
  nome_equipe,
  COUNT(*) as total_funcionarios,
  COUNT(CASE WHEN desempenho = 0 THEN 1 END) as reprovados,
  COUNT(CASE WHEN desempenho >= 7 THEN 1 END) as aprovados,
  AVG(desempenho)::numeric(10,2) as desempenho_medio,
  MIN(CASE WHEN desempenho = 0 THEN tempo_total END) as melhor_tempo_reprovado,
  MAX(CASE WHEN desempenho >= 7 THEN tempo_total END) as pior_tempo_aprovado
FROM taf_resultados
WHERE observacoes = 'Resultado importado e corrigido com lógica TAF oficial - Set 2025'
GROUP BY nome_equipe
ORDER BY nome_equipe;

-- Detalhes dos funcionários com mudança significativa
SELECT 
  nome_completo,
  nome_equipe,
  idade,
  tempo_total,
  desempenho as nota_final,
  CASE 
    WHEN desempenho = 0 THEN 'REPROVADO'
    WHEN desempenho >= 8 THEN 'EXCELENTE'
    WHEN desempenho >= 7 THEN 'APROVADO'
    ELSE 'REGULAR'
  END as classificacao
FROM taf_resultados
WHERE observacoes = 'Resultado importado e corrigido com lógica TAF oficial - Set 2025'
ORDER BY nome_equipe, desempenho DESC, tempo_total;