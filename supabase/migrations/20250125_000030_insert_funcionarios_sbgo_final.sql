-- Inserir funcionários reais da base SBGO (Goiânia)
-- Usando os IDs corretos das equipes encontradas

-- Limpar funcionários existentes da SBGO
DELETE FROM funcionarios WHERE secao_id = '4d8aa88d-7540-45d4-bb5d-e821dd0c010b';

-- Inserir funcionários reais da Equipe ALFA
INSERT INTO funcionarios (nome_completo, cargo, secao_id, equipe_id, nome_cidade) VALUES
('RONAN MARTINS DA COSTA', 'Bombeiro Aeronáutico', '4d8aa88d-7540-45d4-bb5d-e821dd0c010b', 'f7764099-5a7d-456f-97d9-4c7ed305780b', 'Goiânia'),
('NILTON DE SOUZA CABRAL FILHO', 'Bombeiro Aeronáutico', '4d8aa88d-7540-45d4-bb5d-e821dd0c010b', 'f7764099-5a7d-456f-97d9-4c7ed305780b', 'Goiânia'),
('RONILDO TEODORO DA SILVA JÚNIOR', 'Bombeiro Aeronáutico', '4d8aa88d-7540-45d4-bb5d-e821dd0c010b', 'f7764099-5a7d-456f-97d9-4c7ed305780b', 'Goiânia'),
('JONATAZ JÚNIOR DA SILVA NASCIMENTO', 'Bombeiro Aeronáutico', '4d8aa88d-7540-45d4-bb5d-e821dd0c010b', 'f7764099-5a7d-456f-97d9-4c7ed305780b', 'Goiânia'),
('BRENO AUGUSTO MARANHÃO', 'Bombeiro Aeronáutico', '4d8aa88d-7540-45d4-bb5d-e821dd0c010b', 'f7764099-5a7d-456f-97d9-4c7ed305780b', 'Goiânia'),
('LEANDRO LUIZ DE CARVALHO', 'Bombeiro Aeronáutico', '4d8aa88d-7540-45d4-bb5d-e821dd0c010b', 'f7764099-5a7d-456f-97d9-4c7ed305780b', 'Goiânia'),
('RAFAEL BATISTA JUNQUEIRA', 'Bombeiro Aeronáutico', '4d8aa88d-7540-45d4-bb5d-e821dd0c010b', 'f7764099-5a7d-456f-97d9-4c7ed305780b', 'Goiânia'),
('RICARDO RODRIGUES GONÇALVES', 'Bombeiro Aeronáutico', '4d8aa88d-7540-45d4-bb5d-e821dd0c010b', 'f7764099-5a7d-456f-97d9-4c7ed305780b', 'Goiânia'),
('JEFFERSON PEREIRA LOYOLA DOS SANTOS', 'Bombeiro Aeronáutico', '4d8aa88d-7540-45d4-bb5d-e821dd0c010b', 'f7764099-5a7d-456f-97d9-4c7ed305780b', 'Goiânia'),
('SÍLVIO PASSOS DA SILVA', 'Bombeiro Aeronáutico', '4d8aa88d-7540-45d4-bb5d-e821dd0c010b', 'f7764099-5a7d-456f-97d9-4c7ed305780b', 'Goiânia');

-- Inserir funcionários reais da Equipe BRAVO
INSERT INTO funcionarios (nome_completo, cargo, secao_id, equipe_id, nome_cidade) VALUES
('GEDIAEL SANTOS FERREIRA', 'Bombeiro Aeronáutico', '4d8aa88d-7540-45d4-bb5d-e821dd0c010b', 'ad8556a6-ee52-4f5f-80d2-ce1d07b29feb', 'Goiânia'),
('MARCOS VINÍCIUS SILVA OLIVEIRA', 'Bombeiro Aeronáutico', '4d8aa88d-7540-45d4-bb5d-e821dd0c010b', 'ad8556a6-ee52-4f5f-80d2-ce1d07b29feb', 'Goiânia'),
('VINÍCIUS LOPES DOS SANTOS', 'Bombeiro Aeronáutico', '4d8aa88d-7540-45d4-bb5d-e821dd0c010b', 'ad8556a6-ee52-4f5f-80d2-ce1d07b29feb', 'Goiânia'),
('GABRIEL MARTINS DE ABREU', 'Bombeiro Aeronáutico', '4d8aa88d-7540-45d4-bb5d-e821dd0c010b', 'ad8556a6-ee52-4f5f-80d2-ce1d07b29feb', 'Goiânia'),
('LUIS FERNANDO ABDON NUNES JÚNIOR', 'Bombeiro Aeronáutico', '4d8aa88d-7540-45d4-bb5d-e821dd0c010b', 'ad8556a6-ee52-4f5f-80d2-ce1d07b29feb', 'Goiânia'),
('VICTOR ANTUNES BRETAS', 'Bombeiro Aeronáutico', '4d8aa88d-7540-45d4-bb5d-e821dd0c010b', 'ad8556a6-ee52-4f5f-80d2-ce1d07b29feb', 'Goiânia'),
('THAÍS CRISTINA DE FREITAS GONTIJO', 'Bombeiro Aeronáutico', '4d8aa88d-7540-45d4-bb5d-e821dd0c010b', 'ad8556a6-ee52-4f5f-80d2-ce1d07b29feb', 'Goiânia'),
('ZACARIAS KEVIN VIEIRA NUNES', 'Bombeiro Aeronáutico', '4d8aa88d-7540-45d4-bb5d-e821dd0c010b', 'ad8556a6-ee52-4f5f-80d2-ce1d07b29feb', 'Goiânia'),
('PAULO CESAR DA SILVA CARDOSO', 'Bombeiro Aeronáutico', '4d8aa88d-7540-45d4-bb5d-e821dd0c010b', 'ad8556a6-ee52-4f5f-80d2-ce1d07b29feb', 'Goiânia'),
('GUSTAVO ALVES DE SOUZA', 'Bombeiro Aeronáutico', '4d8aa88d-7540-45d4-bb5d-e821dd0c010b', 'ad8556a6-ee52-4f5f-80d2-ce1d07b29feb', 'Goiânia');

-- Inserir funcionários reais da Equipe CHARLIE
INSERT INTO funcionarios (nome_completo, cargo, secao_id, equipe_id, nome_cidade) VALUES
('LEONARDO FERREIRA DA SILVA', 'Bombeiro Aeronáutico', '4d8aa88d-7540-45d4-bb5d-e821dd0c010b', '04d460df-ceb6-4f9b-a567-07705ff73f88', 'Goiânia'),
('NILTON DE SOUZA CABRAL FILHO', 'Bombeiro Aeronáutico', '4d8aa88d-7540-45d4-bb5d-e821dd0c010b', '04d460df-ceb6-4f9b-a567-07705ff73f88', 'Goiânia'),
('HENRIQUE ELER ASSUNÇÃO PINTO', 'Bombeiro Aeronáutico', '4d8aa88d-7540-45d4-bb5d-e821dd0c010b', '04d460df-ceb6-4f9b-a567-07705ff73f88', 'Goiânia'),
('GABRIEL ARAÚJO LOPES', 'Bombeiro Aeronáutico', '4d8aa88d-7540-45d4-bb5d-e821dd0c010b', '04d460df-ceb6-4f9b-a567-07705ff73f88', 'Goiânia'),
('MATHEUS GOMES DOS SANTOS', 'Bombeiro Aeronáutico', '4d8aa88d-7540-45d4-bb5d-e821dd0c010b', '04d460df-ceb6-4f9b-a567-07705ff73f88', 'Goiânia'),
('CARMEN LIDIA MASCARENHAS', 'Bombeiro Aeronáutico', '4d8aa88d-7540-45d4-bb5d-e821dd0c010b', '04d460df-ceb6-4f9b-a567-07705ff73f88', 'Goiânia'),
('HELI DE ALMEIDA NERES', 'Bombeiro Aeronáutico', '4d8aa88d-7540-45d4-bb5d-e821dd0c010b', '04d460df-ceb6-4f9b-a567-07705ff73f88', 'Goiânia'),
('JEFFERSON PEREIRA LOYOLA DOS SANTOS', 'Bombeiro Aeronáutico', '4d8aa88d-7540-45d4-bb5d-e821dd0c010b', '04d460df-ceb6-4f9b-a567-07705ff73f88', 'Goiânia'),
('THIAGO DE SOUZA MONTEIRO', 'Bombeiro Aeronáutico', '4d8aa88d-7540-45d4-bb5d-e821dd0c010b', '04d460df-ceb6-4f9b-a567-07705ff73f88', 'Goiânia'),
('IGOR ALMEIDA DOS SANTOS', 'Bombeiro Aeronáutico', '4d8aa88d-7540-45d4-bb5d-e821dd0c010b', '04d460df-ceb6-4f9b-a567-07705ff73f88', 'Goiânia');

-- Inserir funcionários reais da Equipe DELTA
INSERT INTO funcionarios (nome_completo, cargo, secao_id, equipe_id, nome_cidade) VALUES
('DIEGO DE JESUS RODRIGUES', 'Bombeiro Aeronáutico', '4d8aa88d-7540-45d4-bb5d-e821dd0c010b', 'c51236e6-9186-4e64-ada2-459e4e2033e6', 'Goiânia'),
('GABRIEL FERREIRA GONÇALVES', 'Bombeiro Aeronáutico', '4d8aa88d-7540-45d4-bb5d-e821dd0c010b', 'c51236e6-9186-4e64-ada2-459e4e2033e6', 'Goiânia'),
('PEDRO HENRIQUE NUNES RAMOS', 'Bombeiro Aeronáutico', '4d8aa88d-7540-45d4-bb5d-e821dd0c010b', 'c51236e6-9186-4e64-ada2-459e4e2033e6', 'Goiânia'),
('LEANDRO SOARES GARCIA', 'Bombeiro Aeronáutico', '4d8aa88d-7540-45d4-bb5d-e821dd0c010b', 'c51236e6-9186-4e64-ada2-459e4e2033e6', 'Goiânia'),
('SÍLVIO CÉSAR FERNANDES FILHO', 'Bombeiro Aeronáutico', '4d8aa88d-7540-45d4-bb5d-e821dd0c010b', 'c51236e6-9186-4e64-ada2-459e4e2033e6', 'Goiânia'),
('CAMILA GODOY SILVA', 'Bombeiro Aeronáutico', '4d8aa88d-7540-45d4-bb5d-e821dd0c010b', 'c51236e6-9186-4e64-ada2-459e4e2033e6', 'Goiânia'),
('NÁRIA SANTANA DA SILVA', 'Bombeiro Aeronáutico', '4d8aa88d-7540-45d4-bb5d-e821dd0c010b', 'c51236e6-9186-4e64-ada2-459e4e2033e6', 'Goiânia'),
('JOSÉ ANTÔNIO DE MORAES LEAL', 'Bombeiro Aeronáutico', '4d8aa88d-7540-45d4-bb5d-e821dd0c010b', 'c51236e6-9186-4e64-ada2-459e4e2033e6', 'Goiânia'),
('ARIDELCIO ARAÚJO DO NASCIMENTO', 'Bombeiro Aeronáutico', '4d8aa88d-7540-45d4-bb5d-e821dd0c010b', 'c51236e6-9186-4e64-ada2-459e4e2033e6', 'Goiânia'),
('PAULO CÉSAR DA SILVA OLIVEIRA', 'Bombeiro Aeronáutico', '4d8aa88d-7540-45d4-bb5d-e821dd0c010b', 'c51236e6-9186-4e64-ada2-459e4e2033e6', 'Goiânia');