-- Importar TODOS os funcionários faltantes do TAF
-- Abordagem mais flexível que cria registros mesmo sem funcionário na base

WITH todos_funcionarios_taf AS (
  SELECT * FROM (VALUES
    -- ALFA - 23/09/2025 (10 funcionários)
    ('RONAN MARTINS DA COSTA', 37, '00:01:45', 'Alfa', '2025-09-23'),
    ('MAXWELL ALVES LOPES', 33, '00:01:36', 'Alfa', '2025-09-23'),
    ('RONILDO TEODORO DA SILVA JÚNIOR', 43, '00:02:20', 'Alfa', '2025-09-23'),
    ('WDSON JUNIOR PINHEIRO DA SILVA', 29, '00:01:41', 'Alfa', '2025-09-23'),
    ('BRENO AUGUSTO MARANHÃO', 28, '00:01:54', 'Alfa', '2025-09-23'),
    ('SÍLVIO PASSOS DA SILVA', 29, '00:02:23', 'Alfa', '2025-09-23'),
    ('RICARDO RODRIGUES GONÇALVES', 35, '00:02:20', 'Alfa', '2025-09-23'),
    ('LAURA MARIA CARVALHAIS DE SOUZA', 42, '00:02:27', 'Alfa', '2025-09-23'),
    ('NILTON DE SOUZA CABRAL FILHO', 29, '00:01:50', 'Alfa', '2025-09-23'),
    ('IGOR ALMEIDA DOS SANTOS', 28, '00:01:48', 'Alfa', '2025-09-23'),
    
    -- BRAVO - 24/09/2025 (10 funcionários)
    ('GEDIAEL SANTOS FERREIRA', 33, '00:01:37', 'Bravo', '2025-09-24'),
    ('ZACARIAS KEVIN VIEIRA NUNES', 27, '00:01:59', 'Bravo', '2025-09-24'),
    ('LUIS FERNANDO ABDON NUNES JÚNIOR', 29, '00:02:03', 'Bravo', '2025-09-24'),
    ('GABRIEL ARAÚJO LOPES', 30, '00:01:45', 'Bravo', '2025-09-24'),
    ('GABRIEL MARTINS DE ABREU', 30, '00:01:58', 'Bravo', '2025-09-24'),
    ('THAÍS CRISTINA DE FREITAS GONTIJO', 34, '00:02:45', 'Bravo', '2025-09-24'),
    ('PAULO AUGUSTO CARDOSO NORONHA', 33, '00:01:56', 'Bravo', '2025-09-24'),
    ('GUSTAVO ALVES DE SOUZA', 28, '00:02:17', 'Bravo', '2025-09-24'),
    ('VICTOR ANTUNES BRETAS', 29, '00:02:39', 'Bravo', '2025-09-24'),
    ('MARCOS VINÍCIUS SILVA OLIVEIRA', 27, '00:02:07', 'Bravo', '2025-09-24'),
    
    -- CHARLIE - 25/09/2025 (8 funcionários)
    ('MATHEUS GOMES DOS SANTOS', 29, '00:01:45', 'Charlie', '2025-09-25'),
    ('KAIQUE CHARLES RATKEIVISZ', 31, '00:01:58', 'Charlie', '2025-09-25'),
    ('VINÍCIUS LOPES DOS SANTOS', 28, '00:01:43', 'Charlie', '2025-09-25'),
    ('RAFAEL BATISTA JUNQUEIRA', 29, '00:01:37', 'Charlie', '2025-09-25'),
    ('CARMEN LÍDIA MASCARENHAS', 46, '00:02:47', 'Charlie', '2025-09-25'),
    ('HELI DE ALMEIDA NERES', 29, '00:01:45', 'Charlie', '2025-09-25'),
    ('JEFFERSON PEREIRA LOYOLA DOS SANTOS', 27, '00:01:45', 'Charlie', '2025-09-25'),
    ('LEANDRO LUIS DE CARVALHO', 27, '00:01:45', 'Charlie', '2025-09-25'),
    
    -- DELTA - 26/09/2025 (11 funcionários)
    ('DIEGO DE JESUS RODRIGUES', 38, '00:02:06', 'Delta', '2025-09-26'),
    ('GABRIEL FERREIRA GONÇALVES', 30, '00:02:05', 'Delta', '2025-09-26'),
    ('LEANDRO SOARES GARCIA', 29, '00:01:57', 'Delta', '2025-09-26'),
    ('PEDRO HENRIQUE NUNES RAMOS', 34, '00:01:41', 'Delta', '2025-09-26'),
    ('ARIDELCIO ARAUJO DO NASCIMENTO', 47, '00:01:44', 'Delta', '2025-09-26'),
    ('CAMILA GODOY SILVA', 38, '00:02:19', 'Delta', '2025-09-26'),
    ('JOSÉ ANTÔNIO DE MORAES LEAL', 40, '00:01:38', 'Delta', '2025-09-26'),
    ('NÁRIA SANTANA DA SILVA', 34, '00:02:38', 'Delta', '2025-09-26'),
    ('PAULO CÉSAR DA SILVA OLIVEIRA', NULL, 'atestado médico', 'Delta', '2025-09-26'),
    ('SÍLVIO CÉSAR FERNANDES FILHO', 29, '00:01:57', 'Delta', '2025-09-26'),
    ('HENRIQUE ELER ASSUNÇÃO PINTO', 29, '00:03:27', 'Delta', '2025-09-26')
  ) AS v(nome_completo, idade, tempo_total, equipe_nome, data_teste)
),
-- Verifica quem já está importado
ja_importados AS (
  SELECT DISTINCT
    tr.nome_completo,
    tr.nome_equipe,
    tr.data_taf
  FROM taf_resultados tr
  WHERE tr.observacoes LIKE '%TAF Goiânia - Set 2025%'
     OR tr.observacoes = 'Atestado médico - Resultado importado'
),
-- Identifica os faltantes
faltantes AS (
  SELECT 
    tf.nome_completo,
    tf.idade,
    tf.tempo_total,
    tf.equipe_nome,
    tf.data_teste::date as data_teste,
    'FALTANTE' as status
  FROM todos_funcionarios_taf tf
  LEFT JOIN ja_importados ji ON tf.nome_completo = ji.nome_completo 
    AND tf.equipe_nome = ji.nome_equipe 
    AND tf.data_teste::date = ji.data_taf
  WHERE ji.nome_completo IS NULL
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
-- Calcula desempenho usando a lógica oficial
desempenho_calculado AS (
  SELECT 
    f.nome_completo,
    f.idade,
    f.tempo_total,
    f.equipe_nome,
    f.data_teste,
    CASE 
      WHEN f.tempo_total = 'atestado médico' THEN NULL
      WHEN f.tempo_total IS NULL THEN NULL
      WHEN f.idade <= 39 THEN
        CASE 
          WHEN f.tempo_total <= '00:02:00' THEN 10
          WHEN f.tempo_total <= '00:02:20' THEN 9
          WHEN f.tempo_total <= '00:02:40' THEN 8
          WHEN f.tempo_total <= '00:03:00' THEN 7
          ELSE 0
        END
      WHEN f.idade >= 40 THEN
        CASE 
          WHEN f.tempo_total <= '00:03:00' THEN 10
          WHEN f.tempo_total <= '00:03:20' THEN 9
          WHEN f.tempo_total <= '00:03:40' THEN 8
          WHEN f.tempo_total <= '00:04:00' THEN 7
          ELSE 0
        END
      ELSE NULL
    END as desempenho,
    rt.taf_registro_id,
    'Goiânia' as nome_cidade
  FROM faltantes f
  INNER JOIN equipe_mapping em ON f.equipe_nome = em.nome
  INNER JOIN registros_taf rt ON rt.equipe_id = em.equipe_id AND rt.data_teste = f.data_teste
)
-- Insere TODOS os faltantes
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
  '00000000-0000-0000-0000-000000000000'::uuid as funcionario_id, -- ID genérico para funcionários não encontrados
  COALESCE(idade, 1) as idade,
  CASE WHEN tempo_total = 'atestado médico' THEN NULL ELSE tempo_total END,
  desempenho,
  nome_completo,
  nome_cidade,
  equipe_nome,
  data_teste,
  CASE 
    WHEN tempo_total = 'atestado médico' THEN 'Atestado médico - Resultado importado (funcionário não cadastrado)'
    ELSE 'Resultado importado com dados reais do TAF Goiânia - Set 2025 (funcionário não cadastrado)'
  END
FROM desempenho_calculado
ORDER BY data_teste, equipe_nome, nome_completo;

-- Retorna estatísticas da importação
SELECT 
  'Funcionários TAF faltantes importados:' as status,
  COUNT(*) as total
FROM taf_resultados
WHERE observacoes LIKE '%(funcionário não cadastrado)%';

-- Total geral agora
SELECT 
  nome_equipe,
  COUNT(*) as total_funcionarios,
  COUNT(CASE WHEN observacoes LIKE '%funcionário não cadastrado%' THEN 1 END) as sem_cadastro
FROM taf_resultados
WHERE observacoes LIKE '%TAF Goiânia - Set 2025%'
GROUP BY nome_equipe
ORDER BY nome_equipe;