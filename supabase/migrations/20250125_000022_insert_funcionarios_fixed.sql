-- Inserir funcionários de Goiânia (SBGO) e Confins (SBCF)
-- Versão corrigida que verifica se as equipes existem

DO $$
DECLARE
    sbgo_secao_id UUID;
    sbcf_secao_id UUID;
    equipe_record RECORD;
    equipes_sbgo UUID[];
    equipes_sbcf UUID[];
    equipe_idx INTEGER;
BEGIN
    -- Buscar IDs das seções
    SELECT id INTO sbgo_secao_id FROM secoes WHERE codigo = 'SBGO' AND ativa = true;
    SELECT id INTO sbcf_secao_id FROM secoes WHERE codigo = 'SBCF' AND ativa = true;
    
    -- Verificar se encontrou as seções
    IF sbgo_secao_id IS NULL THEN
        RAISE EXCEPTION 'Seção SBGO não encontrada';
    END IF;
    
    IF sbcf_secao_id IS NULL THEN
        RAISE EXCEPTION 'Seção SBCF não encontrada';
    END IF;
    
    -- Buscar todas as equipes ativas de SBGO
    SELECT ARRAY(SELECT id FROM equipes WHERE secao_id = sbgo_secao_id AND ativa = true ORDER BY nome) INTO equipes_sbgo;
    
    -- Buscar todas as equipes ativas de SBCF
    SELECT ARRAY(SELECT id FROM equipes WHERE secao_id = sbcf_secao_id AND ativa = true ORDER BY nome) INTO equipes_sbcf;
    
    -- Verificar se há equipes disponíveis
    IF array_length(equipes_sbgo, 1) IS NULL OR array_length(equipes_sbgo, 1) = 0 THEN
        RAISE EXCEPTION 'Nenhuma equipe ativa encontrada para SBGO';
    END IF;
    
    IF array_length(equipes_sbcf, 1) IS NULL OR array_length(equipes_sbcf, 1) = 0 THEN
        RAISE EXCEPTION 'Nenhuma equipe ativa encontrada para SBCF';
    END IF;
    
    -- Limpar funcionários existentes (se houver)
    DELETE FROM funcionarios WHERE secao_id IN (sbgo_secao_id, sbcf_secao_id);
    
    -- Inserir funcionários de Goiânia (SBGO) - distribuindo entre as equipes disponíveis
    equipe_idx := 1;
    
    -- Funcionários para primeira equipe (ou única equipe disponível)
    INSERT INTO funcionarios (nome_completo, email, cargo, secao_id, equipe_id, nome_cidade) VALUES
    ('João Silva', 'joao.silva@email.com', 'Bombeiro Aeronáutico', sbgo_secao_id, equipes_sbgo[equipe_idx], 'Goiânia'),
    ('Pedro Santos', 'pedro.santos@email.com', 'Bombeiro Aeronáutico', sbgo_secao_id, equipes_sbgo[equipe_idx], 'Goiânia'),
    ('Carlos Oliveira', 'carlos.oliveira@email.com', 'Bombeiro Aeronáutico', sbgo_secao_id, equipes_sbgo[equipe_idx], 'Goiânia'),
    ('Ana Costa', 'ana.costa@email.com', 'Bombeiro Aeronáutico', sbgo_secao_id, equipes_sbgo[equipe_idx], 'Goiânia'),
    ('Maria Ferreira', 'maria.ferreira@email.com', 'Bombeiro Aeronáutico', sbgo_secao_id, equipes_sbgo[equipe_idx], 'Goiânia'),
    ('José Almeida', 'jose.almeida@email.com', 'Bombeiro Aeronáutico', sbgo_secao_id, equipes_sbgo[equipe_idx], 'Goiânia'),
    ('Paulo Rodrigues', 'paulo.rodrigues@email.com', 'Bombeiro Aeronáutico', sbgo_secao_id, equipes_sbgo[equipe_idx], 'Goiânia'),
    ('Luiza Martins', 'luiza.martins@email.com', 'Bombeiro Aeronáutico', sbgo_secao_id, equipes_sbgo[equipe_idx], 'Goiânia'),
    ('Rafael Pereira', 'rafael.pereira@email.com', 'Bombeiro Aeronáutico', sbgo_secao_id, equipes_sbgo[equipe_idx], 'Goiânia'),
    ('Fernanda Lima', 'fernanda.lima@email.com', 'Bombeiro Aeronáutico', sbgo_secao_id, equipes_sbgo[equipe_idx], 'Goiânia');
    
    -- Se há mais equipes, distribuir mais funcionários
    IF array_length(equipes_sbgo, 1) > 1 THEN
        equipe_idx := 2;
        INSERT INTO funcionarios (nome_completo, email, cargo, secao_id, equipe_id, nome_cidade) VALUES
        ('Bruno Carvalho', 'bruno.carvalho@email.com', 'Bombeiro Aeronáutico', sbgo_secao_id, equipes_sbgo[equipe_idx], 'Goiânia'),
        ('Juliana Souza', 'juliana.souza@email.com', 'Bombeiro Aeronáutico', sbgo_secao_id, equipes_sbgo[equipe_idx], 'Goiânia'),
        ('Ricardo Barbosa', 'ricardo.barbosa@email.com', 'Bombeiro Aeronáutico', sbgo_secao_id, equipes_sbgo[equipe_idx], 'Goiânia'),
        ('Camila Rocha', 'camila.rocha@email.com', 'Bombeiro Aeronáutico', sbgo_secao_id, equipes_sbgo[equipe_idx], 'Goiânia'),
        ('Diego Nascimento', 'diego.nascimento@email.com', 'Bombeiro Aeronáutico', sbgo_secao_id, equipes_sbgo[equipe_idx], 'Goiânia'),
        ('Patrícia Gomes', 'patricia.gomes@email.com', 'Bombeiro Aeronáutico', sbgo_secao_id, equipes_sbgo[equipe_idx], 'Goiânia'),
        ('Marcos Dias', 'marcos.dias@email.com', 'Bombeiro Aeronáutico', sbgo_secao_id, equipes_sbgo[equipe_idx], 'Goiânia'),
        ('Larissa Cunha', 'larissa.cunha@email.com', 'Bombeiro Aeronáutico', sbgo_secao_id, equipes_sbgo[equipe_idx], 'Goiânia'),
        ('Thiago Moreira', 'thiago.moreira@email.com', 'Bombeiro Aeronáutico', sbgo_secao_id, equipes_sbgo[equipe_idx], 'Goiânia'),
        ('Gabriela Reis', 'gabriela.reis@email.com', 'Bombeiro Aeronáutico', sbgo_secao_id, equipes_sbgo[equipe_idx], 'Goiânia');
    END IF;
    
    -- Se há 3 ou mais equipes
    IF array_length(equipes_sbgo, 1) > 2 THEN
        equipe_idx := 3;
        INSERT INTO funcionarios (nome_completo, email, cargo, secao_id, equipe_id, nome_cidade) VALUES
        ('Leonardo Cardoso', 'leonardo.cardoso@email.com', 'Bombeiro Aeronáutico', sbgo_secao_id, equipes_sbgo[equipe_idx], 'Goiânia'),
        ('Vanessa Teixeira', 'vanessa.teixeira@email.com', 'Bombeiro Aeronáutico', sbgo_secao_id, equipes_sbgo[equipe_idx], 'Goiânia'),
        ('Gustavo Mendes', 'gustavo.mendes@email.com', 'Bombeiro Aeronáutico', sbgo_secao_id, equipes_sbgo[equipe_idx], 'Goiânia'),
        ('Priscila Araújo', 'priscila.araujo@email.com', 'Bombeiro Aeronáutico', sbgo_secao_id, equipes_sbgo[equipe_idx], 'Goiânia'),
        ('Felipe Castro', 'felipe.castro@email.com', 'Bombeiro Aeronáutico', sbgo_secao_id, equipes_sbgo[equipe_idx], 'Goiânia'),
        ('Renata Vieira', 'renata.vieira@email.com', 'Bombeiro Aeronáutico', sbgo_secao_id, equipes_sbgo[equipe_idx], 'Goiânia'),
        ('André Correia', 'andre.correia@email.com', 'Bombeiro Aeronáutico', sbgo_secao_id, equipes_sbgo[equipe_idx], 'Goiânia'),
        ('Tatiana Lopes', 'tatiana.lopes@email.com', 'Bombeiro Aeronáutico', sbgo_secao_id, equipes_sbgo[equipe_idx], 'Goiânia'),
        ('Rodrigo Farias', 'rodrigo.farias@email.com', 'Bombeiro Aeronáutico', sbgo_secao_id, equipes_sbgo[equipe_idx], 'Goiânia'),
        ('Isabela Monteiro', 'isabela.monteiro@email.com', 'Bombeiro Aeronáutico', sbgo_secao_id, equipes_sbgo[equipe_idx], 'Goiânia');
    END IF;
    
    -- Se há 4 ou mais equipes
    IF array_length(equipes_sbgo, 1) > 3 THEN
        equipe_idx := 4;
        INSERT INTO funcionarios (nome_completo, email, cargo, secao_id, equipe_id, nome_cidade) VALUES
        ('Mateus Ribeiro', 'mateus.ribeiro@email.com', 'Bombeiro Aeronáutico', sbgo_secao_id, equipes_sbgo[equipe_idx], 'Goiânia'),
        ('Carolina Freitas', 'carolina.freitas@email.com', 'Bombeiro Aeronáutico', sbgo_secao_id, equipes_sbgo[equipe_idx], 'Goiânia'),
        ('Vinicius Azevedo', 'vinicius.azevedo@email.com', 'Bombeiro Aeronáutico', sbgo_secao_id, equipes_sbgo[equipe_idx], 'Goiânia'),
        ('Letícia Campos', 'leticia.campos@email.com', 'Bombeiro Aeronáutico', sbgo_secao_id, equipes_sbgo[equipe_idx], 'Goiânia'),
        ('Danilo Pinto', 'danilo.pinto@email.com', 'Bombeiro Aeronáutico', sbgo_secao_id, equipes_sbgo[equipe_idx], 'Goiânia'),
        ('Adriana Nunes', 'adriana.nunes@email.com', 'Bombeiro Aeronáutico', sbgo_secao_id, equipes_sbgo[equipe_idx], 'Goiânia'),
        ('Fabio Melo', 'fabio.melo@email.com', 'Bombeiro Aeronáutico', sbgo_secao_id, equipes_sbgo[equipe_idx], 'Goiânia'),
        ('Stephanie Torres', 'stephanie.torres@email.com', 'Bombeiro Aeronáutico', sbgo_secao_id, equipes_sbgo[equipe_idx], 'Goiânia'),
        ('Lucas Ramos', 'lucas.ramos@email.com', 'Bombeiro Aeronáutico', sbgo_secao_id, equipes_sbgo[equipe_idx], 'Goiânia'),
        ('Beatriz Cavalcanti', 'beatriz.cavalcanti@email.com', 'Bombeiro Aeronáutico', sbgo_secao_id, equipes_sbgo[equipe_idx], 'Goiânia');
    END IF;
    
    -- Inserir funcionários de Confins (SBCF) - distribuindo entre as equipes disponíveis
    equipe_idx := 1;
    
    -- Funcionários para primeira equipe de Confins
    INSERT INTO funcionarios (nome_completo, email, cargo, secao_id, equipe_id, nome_cidade) VALUES
    ('Alexandre Moura', 'alexandre.moura@email.com', 'Bombeiro Aeronáutico', sbcf_secao_id, equipes_sbcf[equipe_idx], 'Confins'),
    ('Bianca Ferraz', 'bianca.ferraz@email.com', 'Bombeiro Aeronáutico', sbcf_secao_id, equipes_sbcf[equipe_idx], 'Confins'),
    ('Caio Mendonça', 'caio.mendonca@email.com', 'Bombeiro Aeronáutico', sbcf_secao_id, equipes_sbcf[equipe_idx], 'Confins'),
    ('Daniela Borges', 'daniela.borges@email.com', 'Bombeiro Aeronáutico', sbcf_secao_id, equipes_sbcf[equipe_idx], 'Confins'),
    ('Eduardo Tavares', 'eduardo.tavares@email.com', 'Bombeiro Aeronáutico', sbcf_secao_id, equipes_sbcf[equipe_idx], 'Confins'),
    ('Flávia Machado', 'flavia.machado@email.com', 'Bombeiro Aeronáutico', sbcf_secao_id, equipes_sbcf[equipe_idx], 'Confins'),
    ('Guilherme Paiva', 'guilherme.paiva@email.com', 'Bombeiro Aeronáutico', sbcf_secao_id, equipes_sbcf[equipe_idx], 'Confins'),
    ('Helena Vargas', 'helena.vargas@email.com', 'Bombeiro Aeronáutico', sbcf_secao_id, equipes_sbcf[equipe_idx], 'Confins'),
    ('Igor Batista', 'igor.batista@email.com', 'Bombeiro Aeronáutico', sbcf_secao_id, equipes_sbcf[equipe_idx], 'Confins'),
    ('Jéssica Caldeira', 'jessica.caldeira@email.com', 'Bombeiro Aeronáutico', sbcf_secao_id, equipes_sbcf[equipe_idx], 'Confins');
    
    -- Se há mais equipes em Confins, distribuir mais funcionários
    IF array_length(equipes_sbcf, 1) > 1 THEN
        equipe_idx := 2;
        INSERT INTO funcionarios (nome_completo, email, cargo, secao_id, equipe_id, nome_cidade) VALUES
        ('Kevin Nogueira', 'kevin.nogueira@email.com', 'Bombeiro Aeronáutico', sbcf_secao_id, equipes_sbcf[equipe_idx], 'Confins'),
        ('Luana Silveira', 'luana.silveira@email.com', 'Bombeiro Aeronáutico', sbcf_secao_id, equipes_sbcf[equipe_idx], 'Confins'),
        ('Marcelo Fonseca', 'marcelo.fonseca@email.com', 'Bombeiro Aeronáutico', sbcf_secao_id, equipes_sbcf[equipe_idx], 'Confins'),
        ('Natália Rezende', 'natalia.rezende@email.com', 'Bombeiro Aeronáutico', sbcf_secao_id, equipes_sbcf[equipe_idx], 'Confins'),
        ('Otávio Brandão', 'otavio.brandao@email.com', 'Bombeiro Aeronáutico', sbcf_secao_id, equipes_sbcf[equipe_idx], 'Confins'),
        ('Paula Miranda', 'paula.miranda@email.com', 'Bombeiro Aeronáutico', sbcf_secao_id, equipes_sbcf[equipe_idx], 'Confins'),
        ('Quintino Lacerda', 'quintino.lacerda@email.com', 'Bombeiro Aeronáutico', sbcf_secao_id, equipes_sbcf[equipe_idx], 'Confins'),
        ('Raquel Duarte', 'raquel.duarte@email.com', 'Bombeiro Aeronáutico', sbcf_secao_id, equipes_sbcf[equipe_idx], 'Confins'),
        ('Sérgio Campos', 'sergio.campos@email.com', 'Bombeiro Aeronáutico', sbcf_secao_id, equipes_sbcf[equipe_idx], 'Confins'),
        ('Tânia Veloso', 'tania.veloso@email.com', 'Bombeiro Aeronáutico', sbcf_secao_id, equipes_sbcf[equipe_idx], 'Confins');
    END IF;
    
    -- Se há 3 ou mais equipes em Confins
    IF array_length(equipes_sbcf, 1) > 2 THEN
        equipe_idx := 3;
        INSERT INTO funcionarios (nome_completo, email, cargo, secao_id, equipe_id, nome_cidade) VALUES
        ('Ulisses Prado', 'ulisses.prado@email.com', 'Bombeiro Aeronáutico', sbcf_secao_id, equipes_sbcf[equipe_idx], 'Confins'),
        ('Viviane Coelho', 'viviane.coelho@email.com', 'Bombeiro Aeronáutico', sbcf_secao_id, equipes_sbcf[equipe_idx], 'Confins'),
        ('Wagner Brito', 'wagner.brito@email.com', 'Bombeiro Aeronáutico', sbcf_secao_id, equipes_sbcf[equipe_idx], 'Confins'),
        ('Ximena Aguiar', 'ximena.aguiar@email.com', 'Bombeiro Aeronáutico', sbcf_secao_id, equipes_sbcf[equipe_idx], 'Confins'),
        ('Yuri Sampaio', 'yuri.sampaio@email.com', 'Bombeiro Aeronáutico', sbcf_secao_id, equipes_sbcf[equipe_idx], 'Confins'),
        ('Zilda Moraes', 'zilda.moraes@email.com', 'Bombeiro Aeronáutico', sbcf_secao_id, equipes_sbcf[equipe_idx], 'Confins'),
        ('Antônio Ribas', 'antonio.ribas@email.com', 'Bombeiro Aeronáutico', sbcf_secao_id, equipes_sbcf[equipe_idx], 'Confins'),
        ('Bárbara Leal', 'barbara.leal@email.com', 'Bombeiro Aeronáutico', sbcf_secao_id, equipes_sbcf[equipe_idx], 'Confins'),
        ('César Andrade', 'cesar.andrade@email.com', 'Bombeiro Aeronáutico', sbcf_secao_id, equipes_sbcf[equipe_idx], 'Confins'),
        ('Débora Siqueira', 'debora.siqueira@email.com', 'Bombeiro Aeronáutico', sbcf_secao_id, equipes_sbcf[equipe_idx], 'Confins');
    END IF;
    
    -- Se há 4 ou mais equipes em Confins
    IF array_length(equipes_sbcf, 1) > 3 THEN
        equipe_idx := 4;
        INSERT INTO funcionarios (nome_completo, email, cargo, secao_id, equipe_id, nome_cidade) VALUES
        ('Evandro Teles', 'evandro.teles@email.com', 'Bombeiro Aeronáutico', sbcf_secao_id, equipes_sbcf[equipe_idx], 'Confins'),
        ('Fabiana Godoy', 'fabiana.godoy@email.com', 'Bombeiro Aeronáutico', sbcf_secao_id, equipes_sbcf[equipe_idx], 'Confins'),
        ('Geraldo Viana', 'geraldo.viana@email.com', 'Bombeiro Aeronáutico', sbcf_secao_id, equipes_sbcf[equipe_idx], 'Confins'),
        ('Heloísa Franco', 'heloisa.franco@email.com', 'Bombeiro Aeronáutico', sbcf_secao_id, equipes_sbcf[equipe_idx], 'Confins'),
        ('Ivo Carmo', 'ivo.carmo@email.com', 'Bombeiro Aeronáutico', sbcf_secao_id, equipes_sbcf[equipe_idx], 'Confins'),
        ('Joana Espírito', 'joana.espirito@email.com', 'Bombeiro Aeronáutico', sbcf_secao_id, equipes_sbcf[equipe_idx], 'Confins'),
        ('Klaus Medeiros', 'klaus.medeiros@email.com', 'Bombeiro Aeronáutico', sbcf_secao_id, equipes_sbcf[equipe_idx], 'Confins'),
        ('Lívia Cunha', 'livia.cunha@email.com', 'Bombeiro Aeronáutico', sbcf_secao_id, equipes_sbcf[equipe_idx], 'Confins'),
        ('Mário Ximenes', 'mario.ximenes@email.com', 'Bombeiro Aeronáutico', sbcf_secao_id, equipes_sbcf[equipe_idx], 'Confins'),
        ('Norma Queiroz', 'norma.queiroz@email.com', 'Bombeiro Aeronáutico', sbcf_secao_id, equipes_sbcf[equipe_idx], 'Confins');
    END IF;
    
    RAISE NOTICE 'Funcionários inseridos com sucesso! SBGO: % equipes, SBCF: % equipes', array_length(equipes_sbgo, 1), array_length(equipes_sbcf, 1);
    
END $$;