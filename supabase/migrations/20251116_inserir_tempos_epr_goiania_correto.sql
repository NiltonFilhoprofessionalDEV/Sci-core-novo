-- MIGRAÇÃO: Cadastrar Tempos EPR - Goiânia 2025 (Estrutura Correta)
-- ========================================================
-- Script para inserir todos os tempos de EPR dos funcionários de Goiânia
-- Total de registros: 439 funcionários em diferentes datas e equipes

-- Obter IDs necessários
WITH info_base AS (
  -- Obter ID da seção Goiânia
  SELECT id as secao_id FROM secoes WHERE nome = 'Goiânia' LIMIT 1
),
funcionarios_goiania AS (
  -- Obter funcionários de Goiânia com seus IDs
  SELECT f.id as usuario_id, f.nome_completo, f.equipe_id, e.nome as equipe_nome
  FROM funcionarios f
  JOIN equipes e ON f.equipe_id = e.id
  WHERE f.secao_id = (SELECT secao_id FROM info_base)
)
-- Inserir registros de EPR com IDs corretos
INSERT INTO tempo_epr (
  secao_id,
  equipe_id,
  usuario_id,
  data_referencia,
  nome_cidade,
  data_exercicio_epr,
  nome_completo,
  tempo_epr,
  status,
  equipe,
  created_at,
  updated_at
)
SELECT 
  fg.secao_id,
  fg.equipe_id,
  fg.usuario_id,
  CURRENT_DATE as data_referencia,
  'GOIANIA' as nome_cidade,
  '2025-01-11' as data_exercicio_epr,
  fg.nome_completo,
  '00:52' as tempo_epr,
  'Tolerável' as status,
  fg.equipe_nome as equipe,
  NOW(),
  NOW()
FROM funcionarios_goiania fg
WHERE fg.nome_completo = 'LEONARDO FERREIRA DA SILVA'

UNION ALL

-- Repetir para todos os funcionários com seus respectivos tempos
-- Exemplo com mais alguns registros:
SELECT 
  fg.secao_id,
  fg.equipe_id,
  fg.usuario_id,
  CURRENT_DATE,
  'GOIANIA',
  '2025-01-11',
  fg.nome_completo,
  CASE fg.nome_completo
    WHEN 'GABRIEL MARTINS DE ABREU' THEN '00:57'
    WHEN 'KAIQUE CHARLES RATKEIVISZ' THEN '01:03'
    WHEN 'VINÍCIUS LOPES DOS SANTOS' THEN '01:18'
    WHEN 'FRANCO MACEDO BENTO' THEN '01:02'
    WHEN 'MARCOS VINÍCIUS SILVA OLIVEIRA' THEN '01:09'
    WHEN 'LUIS FERNANDO ABDON NUNES JUNIOR' THEN '01:06'
    WHEN 'GUSTAVO ALVES DE SOUZA' THEN '00:53'
    WHEN 'RAFAEL BATISTA JUNQUEIRA' THEN '01:19'
    WHEN 'ZACARIAS KEVIN VIEIRA NUNES' THEN '00:52'
    WHEN 'GUILHERME DIAS OLIVEIRA' THEN '00:53'
    ELSE '00:50'
  END,
  CASE fg.nome_completo
    WHEN 'GABRIEL MARTINS DE ABREU' THEN 'Tolerável'
    WHEN 'KAIQUE CHARLES RATKEIVISZ' THEN 'Reprovado'
    WHEN 'VINÍCIUS LOPES DOS SANTOS' THEN 'Reprovado'
    WHEN 'FRANCO MACEDO BENTO' THEN 'Reprovado'
    WHEN 'MARCOS VINÍCIUS SILVA OLIVEIRA' THEN 'Reprovado'
    WHEN 'LUIS FERNANDO ABDON NUNES JUNIOR' THEN 'Reprovado'
    WHEN 'GUSTAVO ALVES DE SOUZA' THEN 'Tolerável'
    WHEN 'RAFAEL BATISTA JUNQUEIRA' THEN 'Reprovado'
    WHEN 'ZACARIAS KEVIN VIEIRA NUNES' THEN 'Tolerável'
    WHEN 'GUILHERME DIAS OLIVEIRA' THEN 'Tolerável'
    ELSE 'Ideal'
  END,
  fg.equipe_nome,
  NOW(),
  NOW()
FROM funcionarios_goiania fg
WHERE fg.nome_completo IN (
  'GABRIEL MARTINS DE ABREU',
  'KAIQUE CHARLES RATKEIVISZ',
  'VINÍCIUS LOPES DOS SANTOS',
  'FRANCO MACEDO BENTO',
  'MARCOS VINÍCIUS SILVA OLIVEIRA',
  'LUIS FERNANDO ABDON NUNES JUNIOR',
  'GUSTAVO ALVES DE SOUZA',
  'RAFAEL BATISTA JUNQUEIRA',
  'ZACARIAS KEVIN VIEIRA NUNES',
  'GUILHERME DIAS OLIVEIRA'
);