-- Relatório detalhado das correções de desempenho TAF
-- Compara os desempenhos antigos vs novos

WITH desempenhos_anteriores AS (
  SELECT 
    nome_completo,
    nome_equipe,
    idade,
    tempo_total,
    desempenho as desempenho_anterior,
    data_taf,
    observacoes
  FROM taf_resultados
  WHERE observacoes = 'Resultado importado e corrigido com lógica TAF oficial - Set 2025'
),
-- Recalcula os desempenhos usando a lógica antiga (para comparação)
desempenho_antigo_calculado AS (
  SELECT 
    *,
    CASE 
      WHEN tempo_total <= '00:01:40' THEN 10
      WHEN tempo_total <= '00:01:50' THEN 9
      WHEN tempo_total <= '00:02:00' THEN 8
      WHEN tempo_total <= '00:02:10' THEN 7
      WHEN tempo_total <= '00:02:20' THEN 6
      WHEN tempo_total <= '00:02:30' THEN 5
      WHEN tempo_total <= '00:02:40' THEN 4
      WHEN tempo_total <= '00:02:50' THEN 3
      WHEN tempo_total <= '00:03:00' THEN 2
      ELSE 1
    END as desempenho_antigo_logica
  FROM desempenhos_anteriores
),
-- Recalcula usando a nova lógica oficial
desempenho_novo_calculado AS (
  SELECT 
    *,
    CASE 
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
    END as desempenho_novo_logica
  FROM desempenho_antigo_calculado
)
SELECT 
  nome_equipe,
  nome_completo,
  idade,
  tempo_total,
  desempenho_anterior as nota_antiga,
  desempenho_novo_logica as nota_nova,
  CASE 
    WHEN desempenho_anterior = desempenho_novo_logica THEN 'IGUAL'
    WHEN desempenho_novo_logica = 0 AND desempenho_anterior > 0 THEN 'REPROVADO_AGORA'
    WHEN desempenho_novo_logica > desempenho_anterior THEN 'MELHOROU'
    ELSE 'PIOROU'
  END as mudanca,
  CASE 
    WHEN desempenho_novo_logica = 0 THEN 'REPROVADO'
    WHEN desempenho_novo_logica >= 8 THEN 'EXCELENTE'
    WHEN desempenho_novo_logica >= 7 THEN 'APROVADO'
    ELSE 'REGULAR'
  END as classificacao_nova
FROM desempenho_novo_calculado
ORDER BY 
  CASE WHEN desempenho_novo_logica = 0 AND desempenho_anterior > 0 THEN 1 ELSE 2 END,
  nome_equipe,
  desempenho_novo_logica DESC,
  tempo_total;