-- Verificar inserção dos tempos EPR de Goiânia
SELECT 
  'Resumo da Inserção de Tempos EPR - Goiânia:' as titulo
UNION ALL
SELECT 
  'Total de registros inseridos: ' || COUNT(*) 
FROM tempo_epr 
WHERE nome_cidade = 'GOIANIA' 
  AND data_exercicio_epr BETWEEN '2025-01-11' AND '2025-01-21'
UNION ALL
SELECT 
  'Período: 11/01/2025 a 21/01/2025';

-- Estatísticas por equipe e status
SELECT 
  equipe,
  status,
  COUNT(*) as quantidade
FROM tempo_epr 
WHERE nome_cidade = 'GOIANIA'
  AND data_exercicio_epr BETWEEN '2025-01-11' AND '2025-01-21'
GROUP BY equipe, status
ORDER BY equipe, status;

-- Verificar alguns registros de exemplo
SELECT 
  nome_completo,
  equipe,
  data_exercicio_epr,
  tempo_epr,
  status
FROM tempo_epr 
WHERE nome_cidade = 'GOIANIA'
  AND data_exercicio_epr BETWEEN '2025-01-11' AND '2025-01-21'
ORDER BY equipe, nome_completo
LIMIT 20;