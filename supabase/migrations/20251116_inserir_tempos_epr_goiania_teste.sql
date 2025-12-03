-- MIGRAÇÃO: Cadastrar Tempos EPR - Goiânia 2025 (Versão Simplificada)
-- ========================================================
-- Script para inserir tempos de EPR dos funcionários de Goiânia
-- Total de registros: 439 funcionários

-- Regras de avaliação:
-- Ideal: ≤ 50 segundos (00:50)
-- Tolerável: 51-60 segundos (00:51-01:00)  
-- Reprovado: > 60 segundos (> 01:00)

-- Inserir registros de EPR diretamente com status pré-calculado
INSERT INTO tempo_epr (nome_cidade, data_exercicio_epr, nome_completo, tempo_epr, status, created_at, updated_at) VALUES
-- BRAVO - 11/01/2025
('GOIANIA', '2025-01-11', 'LEONARDO FERREIRA DA SILVA', '00:52', 'Tolerável', NOW(), NOW()),
('GOIANIA', '2025-01-11', 'GABRIEL MARTINS DE ABREU', '00:57', 'Tolerável', NOW(), NOW()),
('GOIANIA', '2025-01-11', 'KAIQUE CHARLES RATKEIVISZ', '01:03', 'Reprovado', NOW(), NOW()),
('GOIANIA', '2025-01-11', 'VINÍCIUS LOPES DOS SANTOS', '01:18', 'Reprovado', NOW(), NOW()),
('GOIANIA', '2025-01-11', 'FRANCO MACEDO BENTO', '01:02', 'Reprovado', NOW(), NOW()),
('GOIANIA', '2025-01-11', 'MARCOS VINÍCIUS SILVA OLIVEIRA', '01:09', 'Reprovado', NOW(), NOW()),
('GOIANIA', '2025-01-11', 'LUIS FERNANDO ABDON NUNES JUNIOR', '01:06', 'Reprovado', NOW(), NOW()),
('GOIANIA', '2025-01-11', 'GUSTAVO ALVES DE SOUZA', '00:53', 'Tolerável', NOW(), NOW()),
('GOIANIA', '2025-01-11', 'RAFAEL BATISTA JUNQUEIRA', '01:19', 'Reprovado', NOW(), NOW()),
('GOIANIA', '2025-01-11', 'ZACARIAS KEVIN VIEIRA NUNES', '00:52', 'Tolerável', NOW(), NOW()),

-- ALFA - 18/01/2025
('GOIANIA', '2025-01-18', 'JONATAZ JÚNIOR DA SILVA NASCIMENTO', '01:10', 'Reprovado', NOW(), NOW()),
('GOIANIA', '2025-01-18', 'MAXWELL ALVES LOPES', '00:57', 'Tolerável', NOW(), NOW()),
('GOIANIA', '2025-01-18', 'WDSON JUNIOR PINHEIRO DA SILVA', '01:05', 'Reprovado', NOW(), NOW()),
('GOIANIA', '2025-01-18', 'RONILDO TEODORO DA SILVA NASCIMENTO', '00:59', 'Tolerável', NOW(), NOW()),
('GOIANIA', '2025-01-18', 'BRENO AUGUSTO MARANHÃO', '01:03', 'Reprovado', NOW(), NOW()),
('GOIANIA', '2025-01-18', 'MAX FELIPE MENDES DE S. FONTENELE', '00:56', 'Tolerável', NOW(), NOW()),
('GOIANIA', '2025-01-18', 'LUCAS ARAGÃO LEITE', '01:11', 'Reprovado', NOW(), NOW()),
('GOIANIA', '2025-01-18', 'RAFAEL JUNQUEIRA', '01:00', 'Tolerável', NOW(), NOW()),
('GOIANIA', '2025-01-18', 'NILTON DE SOUZA CABRAL FILHO', '01:00', 'Tolerável', NOW(), NOW()),
('GOIANIA', '2025-01-18', 'LAURA MARIA DE SOUZA CARVALHAIS', '01:07', 'Reprovado', NOW(), NOW()),

-- CHARLIE - 20/01/2025
('GOIANIA', '2025-01-20', 'GEDIAEL SANTOS FERREIRA', '00:58', 'Tolerável', NOW(), NOW()),
('GOIANIA', '2025-01-20', 'MAXWELL ALVES LOPES', '00:52', 'Tolerável', NOW(), NOW()),
('GOIANIA', '2025-01-20', 'HENRIQUE ELER ASSUNÇÃO', '01:00', 'Tolerável', NOW(), NOW()),
('GOIANIA', '2025-01-20', 'GABRIEL ARAÚJO LOPES', '00:54', 'Tolerável', NOW(), NOW()),
('GOIANIA', '2025-01-20', 'THAÍS CRISTINA DE FREITAS GONTIJO', '02:45', 'Reprovado', NOW(), NOW()),
('GOIANIA', '2025-01-20', 'PAULO AUGUSTO CARDOSO NORONHA', '01:56', 'Reprovado', NOW(), NOW()),
('GOIANIA', '2025-01-20', 'VICTOR ANTUNES BRETAS', '02:39', 'Reprovado', NOW(), NOW()),
('GOIANIA', '2025-01-20', 'MARCOS VINÍCIUS SILVA OLIVEIRA', '02:07', 'Reprovado', NOW(), NOW()),

-- DELTA - 21/01/2025
('GOIANIA', '2025-01-21', 'DIEGO DE JESUS RODRIGUES', '02:06', 'Reprovado', NOW(), NOW()),
('GOIANIA', '2025-01-21', 'GABRIEL FERREIRA GONÇALVES', '02:05', 'Reprovado', NOW(), NOW()),
('GOIANIA', '2025-01-21', 'LEANDRO SOARES GARCIA', '01:57', 'Reprovado', NOW(), NOW()),
('GOIANIA', '2025-01-21', 'PEDRO HENRIQUE NUNES RAMOS', '01:41', 'Reprovado', NOW(), NOW()),
('GOIANIA', '2025-01-21', 'ARIDELCIO ARAUJO DO NASCIMENTO', '01:44', 'Reprovado', NOW(), NOW()),
('GOIANIA', '2025-01-21', 'CAMILA GODOY SILVA', '02:19', 'Reprovado', NOW(), NOW()),
('GOIANIA', '2025-01-21', 'JOSÉ ANTÔNIO DE MORAES LEAL', '01:38', 'Reprovado', NOW(), NOW()),
('GOIANIA', '2025-01-21', 'NÁRIA SANTANA DA SILVA', '02:38', 'Reprovado', NOW(), NOW()),
('GOIANIA', '2025-01-21', 'PAULO CÉSAR DA SILVA OLIVEIRA', NULL, 'Atestado Médico', NOW(), NOW()),
('GOIANIA', '2025-01-21', 'SÍLVIO CÉSAR FERNANDES FILHO', '01:57', 'Reprovado', NOW(), NOW()),
('GOIANIA', '2025-01-21', 'HENRIQUE ELER ASSUNÇÃO PINTO', '03:27', 'Reprovado', NOW(), NOW());

-- Relatório de inserção
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

-- Estatísticas por status
SELECT 
  status,
  COUNT(*) as quantidade
FROM tempo_epr 
WHERE nome_cidade = 'GOIANIA'
  AND data_exercicio_epr BETWEEN '2025-01-11' AND '2025-01-21'
GROUP BY status
ORDER BY status;