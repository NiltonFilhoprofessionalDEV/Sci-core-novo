-- Inserir funcionários de Goiânia (SBGO) e Confins (SBCF)
-- Primeiro, vamos buscar os IDs das seções e equipes

-- Variáveis para armazenar os IDs (serão substituídos pelos valores reais)
DO $$
DECLARE
    sbgo_secao_id UUID;
    sbcf_secao_id UUID;
    sbgo_alfa_id UUID;
    sbgo_bravo_id UUID;
    sbgo_charlie_id UUID;
    sbgo_delta_id UUID;
    sbcf_alfa_id UUID;
    sbcf_bravo_id UUID;
    sbcf_charlie_id UUID;
    sbcf_delta_id UUID;
BEGIN
    -- Buscar IDs das seções
    SELECT id INTO sbgo_secao_id FROM secoes WHERE codigo = 'SBGO' AND ativa = true;
    SELECT id INTO sbcf_secao_id FROM secoes WHERE codigo = 'SBCF' AND ativa = true;
    
    -- Buscar IDs das equipes SBGO
    SELECT id INTO sbgo_alfa_id FROM equipes WHERE secao_id = sbgo_secao_id AND nome = 'Equipe ALFA' AND ativa = true;
    SELECT id INTO sbgo_bravo_id FROM equipes WHERE secao_id = sbgo_secao_id AND nome = 'Equipe BRAVO' AND ativa = true;
    SELECT id INTO sbgo_charlie_id FROM equipes WHERE secao_id = sbgo_secao_id AND nome = 'Equipe CHARLIE' AND ativa = true;
    SELECT id INTO sbgo_delta_id FROM equipes WHERE secao_id = sbgo_secao_id AND nome = 'Equipe DELTA' AND ativa = true;
    
    -- Buscar IDs das equipes SBCF
    SELECT id INTO sbcf_alfa_id FROM equipes WHERE secao_id = sbcf_secao_id AND nome = 'Equipe ALFA' AND ativa = true;
    SELECT id INTO sbcf_bravo_id FROM equipes WHERE secao_id = sbcf_secao_id AND nome = 'Equipe BRAVO' AND ativa = true;
    SELECT id INTO sbcf_charlie_id FROM equipes WHERE secao_id = sbcf_secao_id AND nome = 'Equipe CHARLIE' AND ativa = true;
    SELECT id INTO sbcf_delta_id FROM equipes WHERE secao_id = sbcf_secao_id AND nome = 'Equipe DELTA' AND ativa = true;
    
    -- Verificar se encontrou as seções
    IF sbgo_secao_id IS NULL THEN
        RAISE EXCEPTION 'Seção SBGO não encontrada';
    END IF;
    
    IF sbcf_secao_id IS NULL THEN
        RAISE EXCEPTION 'Seção SBCF não encontrada';
    END IF;
    
    -- Limpar funcionários existentes (se houver)
    DELETE FROM funcionarios WHERE secao_id IN (sbgo_secao_id, sbcf_secao_id);
    
    -- Inserir funcionários de Goiânia (SBGO) - Equipe ALFA
    INSERT INTO funcionarios (nome_completo, email, cargo, secao_id, equipe_id, nome_cidade) VALUES
    ('João Silva', 'joao.silva@email.com', 'Bombeiro Aeronáutico', sbgo_secao_id, sbgo_alfa_id, 'Goiânia'),
    ('Pedro Santos', 'pedro.santos@email.com', 'Bombeiro Aeronáutico', sbgo_secao_id, sbgo_alfa_id, 'Goiânia'),
    ('Carlos Oliveira', 'carlos.oliveira@email.com', 'Bombeiro Aeronáutico', sbgo_secao_id, sbgo_alfa_id, 'Goiânia'),
    ('Ana Costa', 'ana.costa@email.com', 'Bombeiro Aeronáutico', sbgo_secao_id, sbgo_alfa_id, 'Goiânia'),
    ('Maria Ferreira', 'maria.ferreira@email.com', 'Bombeiro Aeronáutico', sbgo_secao_id, sbgo_alfa_id, 'Goiânia'),
    ('José Almeida', 'jose.almeida@email.com', 'Bombeiro Aeronáutico', sbgo_secao_id, sbgo_alfa_id, 'Goiânia'),
    ('Paulo Rodrigues', 'paulo.rodrigues@email.com', 'Bombeiro Aeronáutico', sbgo_secao_id, sbgo_alfa_id, 'Goiânia'),
    ('Luiza Martins', 'luiza.martins@email.com', 'Bombeiro Aeronáutico', sbgo_secao_id, sbgo_alfa_id, 'Goiânia'),
    ('Rafael Pereira', 'rafael.pereira@email.com', 'Bombeiro Aeronáutico', sbgo_secao_id, sbgo_alfa_id, 'Goiânia'),
    ('Fernanda Lima', 'fernanda.lima@email.com', 'Bombeiro Aeronáutico', sbgo_secao_id, sbgo_alfa_id, 'Goiânia');
    
    -- Inserir funcionários de Goiânia (SBGO) - Equipe BRAVO
    INSERT INTO funcionarios (nome_completo, email, cargo, secao_id, equipe_id, nome_cidade) VALUES
    ('Bruno Carvalho', 'bruno.carvalho@email.com', 'Bombeiro Aeronáutico', sbgo_secao_id, sbgo_bravo_id, 'Goiânia'),
    ('Juliana Souza', 'juliana.souza@email.com', 'Bombeiro Aeronáutico', sbgo_secao_id, sbgo_bravo_id, 'Goiânia'),
    ('Ricardo Barbosa', 'ricardo.barbosa@email.com', 'Bombeiro Aeronáutico', sbgo_secao_id, sbgo_bravo_id, 'Goiânia'),
    ('Camila Rocha', 'camila.rocha@email.com', 'Bombeiro Aeronáutico', sbgo_secao_id, sbgo_bravo_id, 'Goiânia'),
    ('Diego Nascimento', 'diego.nascimento@email.com', 'Bombeiro Aeronáutico', sbgo_secao_id, sbgo_bravo_id, 'Goiânia'),
    ('Patrícia Gomes', 'patricia.gomes@email.com', 'Bombeiro Aeronáutico', sbgo_secao_id, sbgo_bravo_id, 'Goiânia'),
    ('Marcos Dias', 'marcos.dias@email.com', 'Bombeiro Aeronáutico', sbgo_secao_id, sbgo_bravo_id, 'Goiânia'),
    ('Larissa Cunha', 'larissa.cunha@email.com', 'Bombeiro Aeronáutico', sbgo_secao_id, sbgo_bravo_id, 'Goiânia'),
    ('Thiago Moreira', 'thiago.moreira@email.com', 'Bombeiro Aeronáutico', sbgo_secao_id, sbgo_bravo_id, 'Goiânia'),
    ('Gabriela Reis', 'gabriela.reis@email.com', 'Bombeiro Aeronáutico', sbgo_secao_id, sbgo_bravo_id, 'Goiânia');
    
    -- Inserir funcionários de Goiânia (SBGO) - Equipe CHARLIE
    INSERT INTO funcionarios (nome_completo, email, cargo, secao_id, equipe_id, nome_cidade) VALUES
    ('Leonardo Cardoso', 'leonardo.cardoso@email.com', 'Bombeiro Aeronáutico', sbgo_secao_id, sbgo_charlie_id, 'Goiânia'),
    ('Vanessa Teixeira', 'vanessa.teixeira@email.com', 'Bombeiro Aeronáutico', sbgo_secao_id, sbgo_charlie_id, 'Goiânia'),
    ('Gustavo Mendes', 'gustavo.mendes@email.com', 'Bombeiro Aeronáutico', sbgo_secao_id, sbgo_charlie_id, 'Goiânia'),
    ('Priscila Araújo', 'priscila.araujo@email.com', 'Bombeiro Aeronáutico', sbgo_secao_id, sbgo_charlie_id, 'Goiânia'),
    ('Felipe Castro', 'felipe.castro@email.com', 'Bombeiro Aeronáutico', sbgo_secao_id, sbgo_charlie_id, 'Goiânia'),
    ('Renata Vieira', 'renata.vieira@email.com', 'Bombeiro Aeronáutico', sbgo_secao_id, sbgo_charlie_id, 'Goiânia'),
    ('André Correia', 'andre.correia@email.com', 'Bombeiro Aeronáutico', sbgo_secao_id, sbgo_charlie_id, 'Goiânia'),
    ('Tatiana Lopes', 'tatiana.lopes@email.com', 'Bombeiro Aeronáutico', sbgo_secao_id, sbgo_charlie_id, 'Goiânia'),
    ('Rodrigo Farias', 'rodrigo.farias@email.com', 'Bombeiro Aeronáutico', sbgo_secao_id, sbgo_charlie_id, 'Goiânia'),
    ('Isabela Monteiro', 'isabela.monteiro@email.com', 'Bombeiro Aeronáutico', sbgo_secao_id, sbgo_charlie_id, 'Goiânia');
    
    -- Inserir funcionários de Goiânia (SBGO) - Equipe DELTA
    INSERT INTO funcionarios (nome_completo, email, cargo, secao_id, equipe_id, nome_cidade) VALUES
    ('Mateus Ribeiro', 'mateus.ribeiro@email.com', 'Bombeiro Aeronáutico', sbgo_secao_id, sbgo_delta_id, 'Goiânia'),
    ('Carolina Freitas', 'carolina.freitas@email.com', 'Bombeiro Aeronáutico', sbgo_secao_id, sbgo_delta_id, 'Goiânia'),
    ('Vinicius Azevedo', 'vinicius.azevedo@email.com', 'Bombeiro Aeronáutico', sbgo_secao_id, sbgo_delta_id, 'Goiânia'),
    ('Letícia Campos', 'leticia.campos@email.com', 'Bombeiro Aeronáutico', sbgo_secao_id, sbgo_delta_id, 'Goiânia'),
    ('Danilo Pinto', 'danilo.pinto@email.com', 'Bombeiro Aeronáutico', sbgo_secao_id, sbgo_delta_id, 'Goiânia'),
    ('Adriana Nunes', 'adriana.nunes@email.com', 'Bombeiro Aeronáutico', sbgo_secao_id, sbgo_delta_id, 'Goiânia'),
    ('Fabio Melo', 'fabio.melo@email.com', 'Bombeiro Aeronáutico', sbgo_secao_id, sbgo_delta_id, 'Goiânia'),
    ('Stephanie Torres', 'stephanie.torres@email.com', 'Bombeiro Aeronáutico', sbgo_secao_id, sbgo_delta_id, 'Goiânia'),
    ('Lucas Ramos', 'lucas.ramos@email.com', 'Bombeiro Aeronáutico', sbgo_secao_id, sbgo_delta_id, 'Goiânia'),
    ('Beatriz Cavalcanti', 'beatriz.cavalcanti@email.com', 'Bombeiro Aeronáutico', sbgo_secao_id, sbgo_delta_id, 'Goiânia');
    
    -- Inserir funcionários de Confins (SBCF) - Equipe ALFA
    INSERT INTO funcionarios (nome_completo, email, cargo, secao_id, equipe_id, nome_cidade) VALUES
    ('Alexandre Santos', 'alexandre.santos@email.com', 'Bombeiro Aeronáutico', sbcf_secao_id, sbcf_alfa_id, 'Confins'),
    ('Mariana Silva', 'mariana.silva@email.com', 'Bombeiro Aeronáutico', sbcf_secao_id, sbcf_alfa_id, 'Confins'),
    ('Roberto Costa', 'roberto.costa@email.com', 'Bombeiro Aeronáutico', sbcf_secao_id, sbcf_alfa_id, 'Confins'),
    ('Fernanda Oliveira', 'fernanda.oliveira@email.com', 'Bombeiro Aeronáutico', sbcf_secao_id, sbcf_alfa_id, 'Confins'),
    ('Marcelo Pereira', 'marcelo.pereira@email.com', 'Bombeiro Aeronáutico', sbcf_secao_id, sbcf_alfa_id, 'Confins'),
    ('Juliana Martins', 'juliana.martins@email.com', 'Bombeiro Aeronáutico', sbcf_secao_id, sbcf_alfa_id, 'Confins'),
    ('Eduardo Almeida', 'eduardo.almeida@email.com', 'Bombeiro Aeronáutico', sbcf_secao_id, sbcf_alfa_id, 'Confins'),
    ('Patricia Lima', 'patricia.lima@email.com', 'Bombeiro Aeronáutico', sbcf_secao_id, sbcf_alfa_id, 'Confins'),
    ('Gustavo Rodrigues', 'gustavo.rodrigues@email.com', 'Bombeiro Aeronáutico', sbcf_secao_id, sbcf_alfa_id, 'Confins'),
    ('Amanda Ferreira', 'amanda.ferreira@email.com', 'Bombeiro Aeronáutico', sbcf_secao_id, sbcf_alfa_id, 'Confins');
    
    -- Inserir funcionários de Confins (SBCF) - Equipe BRAVO
    INSERT INTO funcionarios (nome_completo, email, cargo, secao_id, equipe_id, nome_cidade) VALUES
    ('Daniel Carvalho', 'daniel.carvalho@email.com', 'Bombeiro Aeronáutico', sbcf_secao_id, sbcf_bravo_id, 'Confins'),
    ('Camila Souza', 'camila.souza@email.com', 'Bombeiro Aeronáutico', sbcf_secao_id, sbcf_bravo_id, 'Confins'),
    ('Fernando Barbosa', 'fernando.barbosa@email.com', 'Bombeiro Aeronáutico', sbcf_secao_id, sbcf_bravo_id, 'Confins'),
    ('Larissa Rocha', 'larissa.rocha@email.com', 'Bombeiro Aeronáutico', sbcf_secao_id, sbcf_bravo_id, 'Confins'),
    ('Thiago Nascimento', 'thiago.nascimento@email.com', 'Bombeiro Aeronáutico', sbcf_secao_id, sbcf_bravo_id, 'Confins'),
    ('Renata Gomes', 'renata.gomes@email.com', 'Bombeiro Aeronáutico', sbcf_secao_id, sbcf_bravo_id, 'Confins'),
    ('André Dias', 'andre.dias@email.com', 'Bombeiro Aeronáutico', sbcf_secao_id, sbcf_bravo_id, 'Confins'),
    ('Vanessa Cunha', 'vanessa.cunha@email.com', 'Bombeiro Aeronáutico', sbcf_secao_id, sbcf_bravo_id, 'Confins'),
    ('Ricardo Moreira', 'ricardo.moreira@email.com', 'Bombeiro Aeronáutico', sbcf_secao_id, sbcf_bravo_id, 'Confins'),
    ('Priscila Reis', 'priscila.reis@email.com', 'Bombeiro Aeronáutico', sbcf_secao_id, sbcf_bravo_id, 'Confins');
    
    -- Inserir funcionários de Confins (SBCF) - Equipe CHARLIE
    INSERT INTO funcionarios (nome_completo, email, cargo, secao_id, equipe_id, nome_cidade) VALUES
    ('Leandro Cardoso', 'leandro.cardoso@email.com', 'Bombeiro Aeronáutico', sbcf_secao_id, sbcf_charlie_id, 'Confins'),
    ('Tatiana Teixeira', 'tatiana.teixeira@email.com', 'Bombeiro Aeronáutico', sbcf_secao_id, sbcf_charlie_id, 'Confins'),
    ('Felipe Mendes', 'felipe.mendes@email.com', 'Bombeiro Aeronáutico', sbcf_secao_id, sbcf_charlie_id, 'Confins'),
    ('Carolina Araújo', 'carolina.araujo@email.com', 'Bombeiro Aeronáutico', sbcf_secao_id, sbcf_charlie_id, 'Confins'),
    ('Rodrigo Castro', 'rodrigo.castro@email.com', 'Bombeiro Aeronáutico', sbcf_secao_id, sbcf_charlie_id, 'Confins'),
    ('Isabela Vieira', 'isabela.vieira@email.com', 'Bombeiro Aeronáutico', sbcf_secao_id, sbcf_charlie_id, 'Confins'),
    ('Paulo Correia', 'paulo.correia@email.com', 'Bombeiro Aeronáutico', sbcf_secao_id, sbcf_charlie_id, 'Confins'),
    ('Stephanie Lopes', 'stephanie.lopes@email.com', 'Bombeiro Aeronáutico', sbcf_secao_id, sbcf_charlie_id, 'Confins'),
    ('Vinicius Farias', 'vinicius.farias@email.com', 'Bombeiro Aeronáutico', sbcf_secao_id, sbcf_charlie_id, 'Confins'),
    ('Letícia Monteiro', 'leticia.monteiro@email.com', 'Bombeiro Aeronáutico', sbcf_secao_id, sbcf_charlie_id, 'Confins');
    
    -- Inserir funcionários de Confins (SBCF) - Equipe DELTA
    INSERT INTO funcionarios (nome_completo, email, cargo, secao_id, equipe_id, nome_cidade) VALUES
    ('Bruno Ribeiro', 'bruno.ribeiro@email.com', 'Bombeiro Aeronáutico', sbcf_secao_id, sbcf_delta_id, 'Confins'),
    ('Adriana Freitas', 'adriana.freitas@email.com', 'Bombeiro Aeronáutico', sbcf_secao_id, sbcf_delta_id, 'Confins'),
    ('Lucas Azevedo', 'lucas.azevedo@email.com', 'Bombeiro Aeronáutico', sbcf_secao_id, sbcf_delta_id, 'Confins'),
    ('Gabriela Campos', 'gabriela.campos@email.com', 'Bombeiro Aeronáutico', sbcf_secao_id, sbcf_delta_id, 'Confins'),
    ('Mateus Pinto', 'mateus.pinto@email.com', 'Bombeiro Aeronáutico', sbcf_secao_id, sbcf_delta_id, 'Confins'),
    ('Beatriz Nunes', 'beatriz.nunes@email.com', 'Bombeiro Aeronáutico', sbcf_secao_id, sbcf_delta_id, 'Confins'),
    ('Diego Melo', 'diego.melo@email.com', 'Bombeiro Aeronáutico', sbcf_secao_id, sbcf_delta_id, 'Confins'),
    ('Mariana Torres', 'mariana.torres@email.com', 'Bombeiro Aeronáutico', sbcf_secao_id, sbcf_delta_id, 'Confins'),
    ('Rafael Ramos', 'rafael.ramos@email.com', 'Bombeiro Aeronáutico', sbcf_secao_id, sbcf_delta_id, 'Confins'),
    ('Ana Cavalcanti', 'ana.cavalcanti@email.com', 'Bombeiro Aeronáutico', sbcf_secao_id, sbcf_delta_id, 'Confins');
    
    -- Verificar inserções
    RAISE NOTICE 'Funcionários inseridos com sucesso!';
    RAISE NOTICE 'Total de funcionários SBGO: %', (SELECT COUNT(*) FROM funcionarios WHERE secao_id = sbgo_secao_id);
    RAISE NOTICE 'Total de funcionários SBCF: %', (SELECT COUNT(*) FROM funcionarios WHERE secao_id = sbcf_secao_id);
    
END $$;