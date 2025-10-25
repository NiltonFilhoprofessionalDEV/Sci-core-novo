-- Inserir funcionários reais da base SBGO (Goiânia)
-- Usando os IDs corretos das equipes encontradas

DO $$
DECLARE
    sbgo_secao_id UUID := '4d8aa88d-7540-45d4-bb5d-e821dd0c010b';
    equipe_alfa_id UUID := 'f7764099-5a7d-456f-97d9-4c7ed305780b';
    equipe_bravo_id UUID := 'ad8556a6-ee52-4f5f-80d2-ce1d07b29feb';
    equipe_charlie_id UUID := '04d460df-ceb6-4f9b-a567-07705ff73f88';
    equipe_delta_id UUID := 'c51236e6-9186-4e64-ada2-459e4e2033e6';
BEGIN
    -- Limpar funcionários existentes da SBGO
    DELETE FROM funcionarios WHERE secao_id = sbgo_secao_id;
    
    -- Inserir funcionários reais da Equipe ALFA
    INSERT INTO funcionarios (nome_completo, cargo, secao_id, equipe_id, nome_cidade) VALUES
    ('RONAN MARTINS DA COSTA', 'Bombeiro Aeronáutico', sbgo_secao_id, equipe_alfa_id, 'Goiânia'),
    ('NILTON DE SOUZA CABRAL FILHO', 'Bombeiro Aeronáutico', sbgo_secao_id, equipe_alfa_id, 'Goiânia'),
    ('RONILDO TEODORO DA SILVA JÚNIOR', 'Bombeiro Aeronáutico', sbgo_secao_id, equipe_alfa_id, 'Goiânia'),
    ('JONATAZ JÚNIOR DA SILVA NASCIMENTO', 'Bombeiro Aeronáutico', sbgo_secao_id, equipe_alfa_id, 'Goiânia'),
    ('BRENO AUGUSTO MARANHÃO', 'Bombeiro Aeronáutico', sbgo_secao_id, equipe_alfa_id, 'Goiânia'),
    ('LEANDRO LUIZ DE CARVALHO', 'Bombeiro Aeronáutico', sbgo_secao_id, equipe_alfa_id, 'Goiânia'),
    ('RAFAEL BATISTA JUNQUEIRA', 'Bombeiro Aeronáutico', sbgo_secao_id, equipe_alfa_id, 'Goiânia'),
    ('RICARDO RODRIGUES GONÇALVES', 'Bombeiro Aeronáutico', sbgo_secao_id, equipe_alfa_id, 'Goiânia'),
    ('JEFFERSON PEREIRA LOYOLA DOS SANTOS', 'Bombeiro Aeronáutico', sbgo_secao_id, equipe_alfa_id, 'Goiânia'),
    ('SÍLVIO PASSOS DA SILVA', 'Bombeiro Aeronáutico', sbgo_secao_id, equipe_alfa_id, 'Goiânia');
    
    -- Inserir funcionários reais da Equipe BRAVO
    INSERT INTO funcionarios (nome_completo, cargo, secao_id, equipe_id, nome_cidade) VALUES
    ('GEDIAEL SANTOS FERREIRA', 'Bombeiro Aeronáutico', sbgo_secao_id, equipe_bravo_id, 'Goiânia'),
    ('MARCOS VINÍCIUS SILVA OLIVEIRA', 'Bombeiro Aeronáutico', sbgo_secao_id, equipe_bravo_id, 'Goiânia'),
    ('VINÍCIUS LOPES DOS SANTOS', 'Bombeiro Aeronáutico', sbgo_secao_id, equipe_bravo_id, 'Goiânia'),
    ('GABRIEL MARTINS DE ABREU', 'Bombeiro Aeronáutico', sbgo_secao_id, equipe_bravo_id, 'Goiânia'),
    ('LUIS FERNANDO ABDON NUNES JÚNIOR', 'Bombeiro Aeronáutico', sbgo_secao_id, equipe_bravo_id, 'Goiânia'),
    ('VICTOR ANTUNES BRETAS', 'Bombeiro Aeronáutico', sbgo_secao_id, equipe_bravo_id, 'Goiânia'),
    ('THAÍS CRISTINA DE FREITAS GONTIJO', 'Bombeiro Aeronáutico', sbgo_secao_id, equipe_bravo_id, 'Goiânia'),
    ('ZACARIAS KEVIN VIEIRA NUNES', 'Bombeiro Aeronáutico', sbgo_secao_id, equipe_bravo_id, 'Goiânia'),
    ('PAULO CESAR DA SILVA CARDOSO', 'Bombeiro Aeronáutico', sbgo_secao_id, equipe_bravo_id, 'Goiânia'),
    ('GUSTAVO ALVES DE SOUZA', 'Bombeiro Aeronáutico', sbgo_secao_id, equipe_bravo_id, 'Goiânia');
    
    -- Inserir funcionários reais da Equipe CHARLIE
    INSERT INTO funcionarios (nome_completo, cargo, secao_id, equipe_id, nome_cidade) VALUES
    ('LEONARDO FERREIRA DA SILVA', 'Bombeiro Aeronáutico', sbgo_secao_id, equipe_charlie_id, 'Goiânia'),
    ('NILTON DE SOUZA CABRAL FILHO', 'Bombeiro Aeronáutico', sbgo_secao_id, equipe_charlie_id, 'Goiânia'),
    ('HENRIQUE ELER ASSUNÇÃO PINTO', 'Bombeiro Aeronáutico', sbgo_secao_id, equipe_charlie_id, 'Goiânia'),
    ('GABRIEL ARAÚJO LOPES', 'Bombeiro Aeronáutico', sbgo_secao_id, equipe_charlie_id, 'Goiânia'),
    ('MATHEUS GOMES DOS SANTOS', 'Bombeiro Aeronáutico', sbgo_secao_id, equipe_charlie_id, 'Goiânia'),
    ('CARMEN LIDIA MASCARENHAS', 'Bombeiro Aeronáutico', sbgo_secao_id, equipe_charlie_id, 'Goiânia'),
    ('HELI DE ALMEIDA NERES', 'Bombeiro Aeronáutico', sbgo_secao_id, equipe_charlie_id, 'Goiânia'),
    ('JEFFERSON PEREIRA LOYOLA DOS SANTOS', 'Bombeiro Aeronáutico', sbgo_secao_id, equipe_charlie_id, 'Goiânia'),
    ('THIAGO DE SOUZA MONTEIRO', 'Bombeiro Aeronáutico', sbgo_secao_id, equipe_charlie_id, 'Goiânia'),
    ('IGOR ALMEIDA DOS SANTOS', 'Bombeiro Aeronáutico', sbgo_secao_id, equipe_charlie_id, 'Goiânia');
    
    -- Inserir funcionários reais da Equipe DELTA
    INSERT INTO funcionarios (nome_completo, cargo, secao_id, equipe_id, nome_cidade) VALUES
    ('DIEGO DE JESUS RODRIGUES', 'Bombeiro Aeronáutico', sbgo_secao_id, equipe_delta_id, 'Goiânia'),
    ('GABRIEL FERREIRA GONÇALVES', 'Bombeiro Aeronáutico', sbgo_secao_id, equipe_delta_id, 'Goiânia'),
    ('PEDRO HENRIQUE NUNES RAMOS', 'Bombeiro Aeronáutico', sbgo_secao_id, equipe_delta_id, 'Goiânia'),
    ('LEANDRO SOARES GARCIA', 'Bombeiro Aeronáutico', sbgo_secao_id, equipe_delta_id, 'Goiânia'),
    ('SÍLVIO CÉSAR FERNANDES FILHO', 'Bombeiro Aeronáutico', sbgo_secao_id, equipe_delta_id, 'Goiânia'),
    ('CAMILA GODOY SILVA', 'Bombeiro Aeronáutico', sbgo_secao_id, equipe_delta_id, 'Goiânia'),
    ('NÁRIA SANTANA DA SILVA', 'Bombeiro Aeronáutico', sbgo_secao_id, equipe_delta_id, 'Goiânia'),
    ('JOSÉ ANTÔNIO DE MORAES LEAL', 'Bombeiro Aeronáutico', sbgo_secao_id, equipe_delta_id, 'Goiânia'),
    ('ARIDELCIO ARAÚJO DO NASCIMENTO', 'Bombeiro Aeronáutico', sbgo_secao_id, equipe_delta_id, 'Goiânia'),
    ('PAULO CÉSAR DA SILVA OLIVEIRA', 'Bombeiro Aeronáutico', sbgo_secao_id, equipe_delta_id, 'Goiânia');
    
    RAISE NOTICE 'Funcionários reais da SBGO inseridos com sucesso!';
    RAISE NOTICE 'Total de funcionários inseridos: 40';
    RAISE NOTICE 'Equipe ALFA: 10 funcionários';
    RAISE NOTICE 'Equipe BRAVO: 10 funcionários';
    RAISE NOTICE 'Equipe CHARLIE: 10 funcionários';
    RAISE NOTICE 'Equipe DELTA: 10 funcionários';
    
END $$;