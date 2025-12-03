-- Verificar nomes específicos que não foram encontrados na base
-- Analisar possíveis variações de nomes

-- Busca flexível por nomes semelhantes
SELECT 
  'PAULO CÉSAR DA SILVA OLIVEIRA' as nome_buscado,
  f.nome_completo as nome_encontrado,
  f.secao_id,
  f.equipe_id,
  e.nome as equipe_nome
FROM funcionarios f
LEFT JOIN equipes e ON f.equipe_id = e.id
WHERE (
  f.nome_completo ILIKE '%PAULO%' AND 
  f.nome_completo ILIKE '%CÉSAR%' AND 
  f.nome_completo ILIKE '%OLIVEIRA%'
) OR f.nome_completo = 'PAULO CÉSAR DA SILVA OLIVEIRA'
ORDER BY f.nome_completo;

-- Verificar todos os funcionários da seção Goiânia por equipe
SELECT 
  e.nome as equipe_nome,
  COUNT(*) as total_funcionarios,
  STRING_AGG(f.nome_completo, ' | ' ORDER BY f.nome_completo) as nomes
FROM funcionarios f
INNER JOIN equipes e ON f.equipe_id = e.id
WHERE f.secao_id = '4d8aa88d-7540-45d4-bb5d-e821dd0c010b'::uuid
GROUP BY e.nome
ORDER BY e.nome;

-- Verificar se os nomes existem exatamente como foram fornecidos
SELECT 
  'RONAN MARTINS DA COSTA' as nome_procurado,
  EXISTS(SELECT 1 FROM funcionarios WHERE nome_completo = 'RONAN MARTINS DA COSTA') as existe
UNION ALL
SELECT 'MAXWELL ALVES LOPES', EXISTS(SELECT 1 FROM funcionarios WHERE nome_completo = 'MAXWELL ALVES LOPES')
UNION ALL
SELECT 'PAULO CÉSAR DA SILVA OLIVEIRA', EXISTS(SELECT 1 FROM funcionarios WHERE nome_completo = 'PAULO CÉSAR DA SILVA OLIVEIRA');