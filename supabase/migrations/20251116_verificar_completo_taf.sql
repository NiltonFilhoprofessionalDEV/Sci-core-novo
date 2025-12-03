-- Verificação detalhada de todos os 39 funcionários TAF
-- Comparação completa entre esperado e importado

-- Lista completa dos 39 funcionários que deveriam estar na base
WITH lista_completa AS (
  SELECT * FROM (VALUES
    -- ALFA - 23/09/2025 (10 funcionários)
    ('RONAN MARTINS DA COSTA', 'Alfa', '2025-09-23'),
    ('MAXWELL ALVES LOPES', 'Alfa', '2025-09-23'),
    ('RONILDO TEODORO DA SILVA JÚNIOR', 'Alfa', '2025-09-23'),
    ('WDSON JUNIOR PINHEIRO DA SILVA', 'Alfa', '2025-09-23'),
    ('BRENO AUGUSTO MARANHÃO', 'Alfa', '2025-09-23'),
    ('SÍLVIO PASSOS DA SILVA', 'Alfa', '2025-09-23'),
    ('RICARDO RODRIGUES GONÇALVES', 'Alfa', '2025-09-23'),
    ('LAURA MARIA CARVALHAIS DE SOUZA', 'Alfa', '2025-09-23'),
    ('NILTON DE SOUZA CABRAL FILHO', 'Alfa', '2025-09-23'),
    ('IGOR ALMEIDA DOS SANTOS', 'Alfa', '2025-09-23'),
    
    -- BRAVO - 24/09/2025 (10 funcionários)
    ('GEDIAEL SANTOS FERREIRA', 'Bravo', '2025-09-24'),
    ('ZACARIAS KEVIN VIEIRA NUNES', 'Bravo', '2025-09-24'),
    ('LUIS FERNANDO ABDON NUNES JÚNIOR', 'Bravo', '2025-09-24'),
    ('GABRIEL ARAÚJO LOPES', 'Bravo', '2025-09-24'),
    ('GABRIEL MARTINS DE ABREU', 'Bravo', '2025-09-24'),
    ('THAÍS CRISTINA DE FREITAS GONTIJO', 'Bravo', '2025-09-24'),
    ('PAULO AUGUSTO CARDOSO NORONHA', 'Bravo', '2025-09-24'),
    ('GUSTAVO ALVES DE SOUZA', 'Bravo', '2025-09-24'),
    ('VICTOR ANTUNES BRETAS', 'Bravo', '2025-09-24'),
    ('MARCOS VINÍCIUS SILVA OLIVEIRA', 'Bravo', '2025-09-24'),
    
    -- CHARLIE - 25/09/2025 (8 funcionários)
    ('MATHEUS GOMES DOS SANTOS', 'Charlie', '2025-09-25'),
    ('KAIQUE CHARLES RATKEIVISZ', 'Charlie', '2025-09-25'),
    ('VINÍCIUS LOPES DOS SANTOS', 'Charlie', '2025-09-25'),
    ('RAFAEL BATISTA JUNQUEIRA', 'Charlie', '2025-09-25'),
    ('CARMEN LÍDIA MASCARENHAS', 'Charlie', '2025-09-25'),
    ('HELI DE ALMEIDA NERES', 'Charlie', '2025-09-25'),
    ('JEFFERSON PEREIRA LOYOLA DOS SANTOS', 'Charlie', '2025-09-25'),
    ('LEANDRO LUIS DE CARVALHO', 'Charlie', '2025-09-25'),
    
    -- DELTA - 26/09/2025 (11 funcionários)
    ('DIEGO DE JESUS RODRIGUES', 'Delta', '2025-09-26'),
    ('GABRIEL FERREIRA GONÇALVES', 'Delta', '2025-09-26'),
    ('LEANDRO SOARES GARCIA', 'Delta', '2025-09-26'),
    ('PEDRO HENRIQUE NUNES RAMOS', 'Delta', '2025-09-26'),
    ('ARIDELCIO ARAUJO DO NASCIMENTO', 'Delta', '2025-09-26'),
    ('CAMILA GODOY SILVA', 'Delta', '2025-09-26'),
    ('JOSÉ ANTÔNIO DE MORAES LEAL', 'Delta', '2025-09-26'),
    ('NÁRIA SANTANA DA SILVA', 'Delta', '2025-09-26'),
    ('PAULO CÉSAR DA SILVA OLIVEIRA', 'Delta', '2025-09-26'),
    ('SÍLVIO CÉSAR FERNANDES FILHO', 'Delta', '2025-09-26'),
    ('HENRIQUE ELER ASSUNÇÃO PINTO', 'Delta', '2025-09-26')
  ) AS v(nome_completo, equipe_nome, data_teste)
),
-- Verifica quem está realmente importado
importados_atuais AS (
  SELECT 
    tr.nome_completo,
    tr.nome_equipe,
    tr.data_taf
  FROM taf_resultados tr
  WHERE tr.observacoes LIKE '%TAF Goiânia - Set 2025%'
     OR tr.observacoes = 'Atestado médico - Resultado importado'
),
-- Comparação detalhada
comparacao_completa AS (
  SELECT 
  lc.nome_completo,
  lc.equipe_nome,
  lc.data_teste::date as data_teste,
    CASE 
      WHEN ia.nome_completo IS NOT NULL THEN 'IMPORTADO'
      ELSE 'FALTANTE'
    END as status
  FROM lista_completa lc
  LEFT JOIN importados_atuais ia ON lc.nome_completo = ia.nome_completo 
    AND lc.equipe_nome = ia.nome_equipe 
    AND lc.data_teste::date = ia.data_taf::date
)
SELECT 
  equipe_nome,
  data_teste,
  COUNT(*) as total_esperado,
  COUNT(CASE WHEN status = 'IMPORTADO' THEN 1 END) as total_importado,
  COUNT(CASE WHEN status = 'FALTANTE' THEN 1 END) as total_faltante,
  STRING_AGG(CASE WHEN status = 'FALTANTE' THEN nome_completo END, ', ') as nomes_faltantes
FROM comparacao_completa
GROUP BY equipe_nome, data_teste
ORDER BY data_teste, equipe_nome;