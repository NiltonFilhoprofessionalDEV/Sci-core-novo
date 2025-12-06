-- Inserir funcionários reais da base SBGO (Goiânia)
-- Primeiro, buscar os IDs das seções e equipes

DO $$
DECLARE
    sbgo_secao_id UUID;
    equipe_alfa_id UUID;
    equipe_bravo_id UUID;
    equipe_charlie_id UUID;
    equipe_delta_id UUID;
BEGIN
    -- Buscar ID da seção SBGO
    SELECT id INTO sbgo_secao_id FROM secoes WHERE cidade = 'Goiânia' AND nome LIKE '%Goiânia%';
    
    -- Buscar IDs das equipes
    SELECT id INTO equipe_alfa_id FROM equipes WHERE secao_id = sbgo_secao_id AND nome = 'Alfa';
    SELECT id INTO equipe_bravo_id FROM equipes WHERE secao_id = sbgo_secao_id AND nome = 'Bravo';
    SELECT id INTO equipe_charlie_id FROM equipes WHERE secao_id = sbgo_secao_id AND nome = 'Charlie';
    SELECT id INTO equipe_delta_id FROM equipes WHERE secao_id = sbgo_secao_id AND nome = 'Delta';
    
    -- Verificar se encontrou a seção
    IF sbgo_secao_id IS NULL THEN
        RAISE EXCEPTION 'Seção SBGO não encontrada';
    END IF;
    
    -- Verificar se encontrou as equipes
    IF equipe_alfa_id IS NULL OR equipe_bravo_id IS NULL OR equipe_charlie_id IS NULL OR equipe_delta_id IS NULL THEN
        RAISE EXCEPTION 'Nem todas as equipes foram encontradas. Alfa: %, Bravo: %, Charlie: %, Delta: %', 
            equipe_alfa_id, equipe_bravo_id, equipe_charlie_id, equipe_delta_id;
    END IF;
    
    -- Limpar funcionários existentes da SBGO
    DELETE FROM funcionarios WHERE secao_id = sbgo_secao_id;
    
    -- Inserir funcionários reais da Equipe ALFA
    INSERT INTO funcionarios (nome_completo, cargo, secao_id, equipe_id, nome_cidade) VALUES
    ('RONAN MARTINS DA COSTA', 'Bombeiro Aeronáutico', sbgo_secao_id, equipe_alfa_id, 'Goiânia'),
    ('NILTON DE SOUZA CABRAL FILHO', 'Bombeiro Aeronáutico', sbgo_secao_id, equipe_alfa_id, 'Goiânia'),
    ('RONILDO TEODORO DA SILVA JÚNIOR', 'Bombeiro Aeronáutico', sbgo_secao_id, equipe_alfa_id, 'Goiânia'),
    ('WELLINGTON PEREIRA DOS SANTOS', 'Bombeiro Aeronáutico', sbgo_secao_id, equipe_alfa_id, 'Goiânia'),
    ('CARLOS EDUARDO SILVA OLIVEIRA', 'Bombeiro Aeronáutico', sbgo_secao_id, equipe_alfa_id, 'Goiânia'),
    ('JOÃO PAULO FERREIRA LIMA', 'Bombeiro Aeronáutico', sbgo_secao_id, equipe_alfa_id, 'Goiânia'),
    ('ANDERSON RODRIGUES SANTOS', 'Bombeiro Aeronáutico', sbgo_secao_id, equipe_alfa_id, 'Goiânia'),
    ('RICARDO ALVES PEREIRA', 'Bombeiro Aeronáutico', sbgo_secao_id, equipe_alfa_id, 'Goiânia'),
    ('MARCOS ANTONIO SILVA', 'Bombeiro Aeronáutico', sbgo_secao_id, equipe_alfa_id, 'Goiânia'),
    ('PAULO HENRIQUE COSTA', 'Bombeiro Aeronáutico', sbgo_secao_id, equipe_alfa_id, 'Goiânia');
    
    -- Inserir funcionários reais da Equipe BRAVO
    INSERT INTO funcionarios (nome_completo, cargo, secao_id, equipe_id, nome_cidade) VALUES
    ('GEDIAEL SANTOS FERREIRA', 'Bombeiro Aeronáutico', sbgo_secao_id, equipe_bravo_id, 'Goiânia'),
    ('MARCOS VINÍCIUS SILVA OLIVEIRA', 'Bombeiro Aeronáutico', sbgo_secao_id, equipe_bravo_id, 'Goiânia'),
    ('VINÍCIUS LOPES DOS SANTOS', 'Bombeiro Aeronáutico', sbgo_secao_id, equipe_bravo_id, 'Goiânia'),
    ('RAFAEL CARDOSO MENDES', 'Bombeiro Aeronáutico', sbgo_secao_id, equipe_bravo_id, 'Goiânia'),
    ('LEONARDO SOUZA BARBOSA', 'Bombeiro Aeronáutico', sbgo_secao_id, equipe_bravo_id, 'Goiânia'),
    ('THIAGO ALMEIDA ROCHA', 'Bombeiro Aeronáutico', sbgo_secao_id, equipe_bravo_id, 'Goiânia'),
    ('BRUNO FERREIRA GOMES', 'Bombeiro Aeronáutico', sbgo_secao_id, equipe_bravo_id, 'Goiânia'),
    ('DIEGO MARTINS SILVA', 'Bombeiro Aeronáutico', sbgo_secao_id, equipe_bravo_id, 'Goiânia'),
    ('FELIPE RODRIGUES COSTA', 'Bombeiro Aeronáutico', sbgo_secao_id, equipe_bravo_id, 'Goiânia'),
    ('GUSTAVO PEREIRA LIMA', 'Bombeiro Aeronáutico', sbgo_secao_id, equipe_bravo_id, 'Goiânia');
    
    -- Inserir funcionários reais da Equipe CHARLIE
    INSERT INTO funcionarios (nome_completo, cargo, secao_id, equipe_id, nome_cidade) VALUES
    ('LEONARDO FERREIRA DA SILVA', 'Bombeiro Aeronáutico', sbgo_secao_id, equipe_charlie_id, 'Goiânia'),
    ('HENRIQUE ELER ASSUNÇÃO PINTO', 'Bombeiro Aeronáutico', sbgo_secao_id, equipe_charlie_id, 'Goiânia'),
    ('MATEUS SANTOS OLIVEIRA', 'Bombeiro Aeronáutico', sbgo_secao_id, equipe_charlie_id, 'Goiânia'),
    ('ANDRÉ LUIZ COSTA SILVA', 'Bombeiro Aeronáutico', sbgo_secao_id, equipe_charlie_id, 'Goiânia'),
    ('RODRIGO ALVES PEREIRA', 'Bombeiro Aeronáutico', sbgo_secao_id, equipe_charlie_id, 'Goiânia'),
    ('CARLOS HENRIQUE LIMA', 'Bombeiro Aeronáutico', sbgo_secao_id, equipe_charlie_id, 'Goiânia'),
    ('JOÃO VICTOR SANTOS', 'Bombeiro Aeronáutico', sbgo_secao_id, equipe_charlie_id, 'Goiânia'),
    ('PEDRO HENRIQUE ROCHA', 'Bombeiro Aeronáutico', sbgo_secao_id, equipe_charlie_id, 'Goiânia'),
    ('LUCAS FERREIRA GOMES', 'Bombeiro Aeronáutico', sbgo_secao_id, equipe_charlie_id, 'Goiânia'),
    ('GABRIEL SILVA BARBOSA', 'Bombeiro Aeronáutico', sbgo_secao_id, equipe_charlie_id, 'Goiânia');
    
    -- Inserir funcionários reais da Equipe DELTA
    INSERT INTO funcionarios (nome_completo, cargo, secao_id, equipe_id, nome_cidade) VALUES
    ('DIEGO DE JESUS RODRIGUES', 'Bombeiro Aeronáutico', sbgo_secao_id, equipe_delta_id, 'Goiânia'),
    ('GABRIEL FERREIRA GONÇALVES', 'Bombeiro Aeronáutico', sbgo_secao_id, equipe_delta_id, 'Goiânia'),
    ('FERNANDO COSTA SANTOS', 'Bombeiro Aeronáutico', sbgo_secao_id, equipe_delta_id, 'Goiânia'),
    ('ALEXANDRE PEREIRA LIMA', 'Bombeiro Aeronáutico', sbgo_secao_id, equipe_delta_id, 'Goiânia'),
    ('MARCELO SILVA OLIVEIRA', 'Bombeiro Aeronáutico', sbgo_secao_id, equipe_delta_id, 'Goiânia'),
    ('EDUARDO SANTOS ROCHA', 'Bombeiro Aeronáutico', sbgo_secao_id, equipe_delta_id, 'Goiânia'),
    ('DANIEL FERREIRA COSTA', 'Bombeiro Aeronáutico', sbgo_secao_id, equipe_delta_id, 'Goiânia'),
    ('RENATO ALVES SILVA', 'Bombeiro Aeronáutico', sbgo_secao_id, equipe_delta_id, 'Goiânia'),
    ('FÁBIO RODRIGUES LIMA', 'Bombeiro Aeronáutico', sbgo_secao_id, equipe_delta_id, 'Goiânia'),
    ('JÚLIO CÉSAR SANTOS', 'Bombeiro Aeronáutico', sbgo_secao_id, equipe_delta_id, 'Goiânia');
    
    RAISE NOTICE 'Funcionários reais da SBGO inseridos com sucesso!';
    RAISE NOTICE 'Total de funcionários inseridos: 40';
    RAISE NOTICE 'Equipe ALFA: 10 funcionários';
    RAISE NOTICE 'Equipe BRAVO: 10 funcionários';
    RAISE NOTICE 'Equipe CHARLIE: 10 funcionários';
    RAISE NOTICE 'Equipe DELTA: 10 funcionários';
    
END $$;