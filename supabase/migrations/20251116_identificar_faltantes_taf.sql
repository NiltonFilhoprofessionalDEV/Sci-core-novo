-- Identificar funcionários TAF faltantes comparando com dados originais
-- Lista completa de funcionários que deveriam estar importados

WITH funcionarios_esperados AS (
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
funcionarios_importados AS (
  SELECT 
    tr.nome_completo,
    tr.nome_equipe,
    tr.data_taf
  FROM taf_resultados tr
  WHERE tr.observacoes LIKE '%TAF Goiânia - Set 2025%'
),
funcionarios_faltantes AS (
  SELECT 
    fe.nome_completo,
    fe.equipe_nome,
    fe.data_teste::date as data_teste,
    fe.idade,
    fe.tempo_total,
    'FALTANTE' as status
  FROM funcionarios_esperados fe
  LEFT JOIN funcionarios_importados fi ON fe.nome_completo = fi.nome_completo 
    AND fe.equipe_nome = fi.nome_equipe 
    AND fe.data_teste::date = fi.data_taf::date
  WHERE fi.nome_completo IS NULL
),
funcionarios_importados_ok AS (
  SELECT 
    fi.nome_completo,
    fi.nome_equipe,
    fi.data_taf,
    'IMPORTADO' as status
  FROM funcionarios_importados fi
)
SELECT 
  status,
  nome_completo,
  equipe_nome,
  data_teste,
  idade,
  tempo_total
FROM funcionarios_faltantes
UNION ALL
SELECT 
  status,
  nome_completo,
  nome_equipe,
  data_taf,
  NULL as idade,
  NULL as tempo_total
FROM funcionarios_importados_ok
ORDER BY status, data_teste, equipe_nome, nome_completo;