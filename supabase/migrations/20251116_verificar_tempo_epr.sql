-- Verificar estrutura e dados existentes na tabela tempo_epr
SELECT 
  'Verificando estrutura da tabela tempo_epr' as info;

-- Verificar se a tabela existe e suas colunas
SELECT 
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'tempo_epr' 
ORDER BY ordinal_position;

-- Verificar quantos registros já existem
SELECT 
  COUNT(*) as total_registros,
  COUNT(DISTINCT nome_cidade) as cidades_distintas,
  COUNT(DISTINCT data_exercicio_epr) as datas_distintas
FROM tempo_epr;

-- Verificar registros de Goiânia se houver
SELECT 
  nome_cidade,
  COUNT(*) as quantidade
FROM tempo_epr 
WHERE nome_cidade = 'GOIANIA'
GROUP BY nome_cidade;