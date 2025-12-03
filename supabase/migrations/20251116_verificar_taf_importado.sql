-- Verificar dados importados do TAF
-- Consulta para validar os resultados importados

SELECT 
  tr.nome_equipe,
  tr.data_taf,
  COUNT(*) as total_funcionarios,
  AVG(tr.idade)::int as idade_media,
  AVG(tr.desempenho)::numeric(10,2) as desempenho_medio,
  MIN(tr.tempo_total) as melhor_tempo,
  MAX(tr.tempo_total) as pior_tempo
FROM taf_resultados tr
WHERE tr.observacoes = 'Resultado importado com dados reais do TAF Goiânia - Set 2025'
GROUP BY tr.nome_equipe, tr.data_taf
ORDER BY tr.data_taf, tr.nome_equipe;

-- Detalhes por equipe
SELECT 
  tr.nome_equipe as equipe,
  tr.nome_completo as funcionario,
  tr.idade,
  tr.tempo_total,
  tr.desempenho,
  tr.nome_cidade as cidade
FROM taf_resultados tr
WHERE tr.observacoes = 'Resultado importado com dados reais do TAF Goiânia - Set 2025'
ORDER BY tr.data_taf, tr.nome_equipe, tr.nome_completo;