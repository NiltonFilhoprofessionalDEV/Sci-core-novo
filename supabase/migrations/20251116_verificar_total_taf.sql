-- Verificar quantidade atual de registros TAF por equipe
SELECT 
  tr.nome_equipe,
  COUNT(*) as total_registros,
  COUNT(CASE WHEN tr.desempenho = 0 THEN 1 END) as reprovados,
  COUNT(CASE WHEN tr.desempenho >= 7 THEN 1 END) as aprovados,
  AVG(tr.desempenho)::numeric(10,2) as desempenho_medio,
  MIN(tr.tempo_total) as melhor_tempo,
  MAX(tr.tempo_total) as pior_tempo
FROM taf_resultados tr
WHERE tr.observacoes LIKE '%TAF Goiânia - Set 2025%'
GROUP BY tr.nome_equipe
ORDER BY tr.nome_equipe;