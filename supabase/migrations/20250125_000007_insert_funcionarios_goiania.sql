-- =====================================================
-- MIGRATION: Inserir funcionários da base de Goiânia (SBGO)
-- Data: 2025-01-25
-- Descrição: Cadastrar os 40 funcionários da seção SBGO
--           distribuídos nas equipes ALFA, BRAVO, CHARLIE e DELTA
-- =====================================================

-- Primeiro, vamos buscar os IDs necessários e armazenar em variáveis
DO $$
DECLARE
    sbgo_secao_id uuid;
    alfa_equipe_id uuid;
    bravo_equipe_id uuid;
    charlie_equipe_id uuid;
    delta_equipe_id uuid;
BEGIN
    -- Buscar ID da seção SBGO
    SELECT id INTO sbgo_secao_id FROM public.secoes WHERE codigo = 'SBGO';
    
    -- Buscar IDs das equipes da seção SBGO
    SELECT id INTO alfa_equipe_id FROM public.equipes WHERE secao_id = sbgo_secao_id AND nome = 'ALFA';
    SELECT id INTO bravo_equipe_id FROM public.equipes WHERE secao_id = sbgo_secao_id AND nome = 'BRAVO';
    SELECT id INTO charlie_equipe_id FROM public.equipes WHERE secao_id = sbgo_secao_id AND nome = 'CHARLIE';
    SELECT id INTO delta_equipe_id FROM public.equipes WHERE secao_id = sbgo_secao_id AND nome = 'DELTA';
    
    -- Verificar se encontramos todos os IDs necessários
    IF sbgo_secao_id IS NULL THEN
        RAISE EXCEPTION 'Seção SBGO não encontrada';
    END IF;
    
    IF alfa_equipe_id IS NULL OR bravo_equipe_id IS NULL OR charlie_equipe_id IS NULL OR delta_equipe_id IS NULL THEN
        RAISE EXCEPTION 'Uma ou mais equipes não foram encontradas para a seção SBGO';
    END IF;
    
    -- =====================================================
    -- INSERIR FUNCIONÁRIOS DA EQUIPE ALFA
    -- =====================================================
    INSERT INTO public.funcionarios (nome_completo, email, cargo, secao_id, equipe_id) VALUES
    ('RONAN MARTINS DA COSTA', 'ronan.costa@bombeiros.gov.br', 'Bombeiro Aeronáutico', sbgo_secao_id, alfa_equipe_id),
    ('NILTON DE SOUZA CABRAL FILHO', 'nilton.cabral@bombeiros.gov.br', 'Bombeiro Aeronáutico', sbgo_secao_id, alfa_equipe_id),
    ('RONILDO TEODORO DA SILVA JÚNIOR', 'ronildo.silva@bombeiros.gov.br', 'Bombeiro Aeronáutico', sbgo_secao_id, alfa_equipe_id),
    ('JONATAZ JÚNIOR DA SILVA NASCIMENTO', 'jonataz.nascimento@bombeiros.gov.br', 'Bombeiro Aeronáutico', sbgo_secao_id, alfa_equipe_id),
    ('BRENO AUGUSTO MARANHÃO', 'breno.maranhao@bombeiros.gov.br', 'Bombeiro Aeronáutico', sbgo_secao_id, alfa_equipe_id),
    ('LEANDRO LUIZ DE CARVALHO', 'leandro.carvalho@bombeiros.gov.br', 'Bombeiro Aeronáutico', sbgo_secao_id, alfa_equipe_id),
    ('RAFAEL BATISTA JUNQUEIRA', 'rafael.junqueira@bombeiros.gov.br', 'Bombeiro Aeronáutico', sbgo_secao_id, alfa_equipe_id),
    ('RICARDO RODRIGUES GONÇALVES', 'ricardo.goncalves@bombeiros.gov.br', 'Bombeiro Aeronáutico', sbgo_secao_id, alfa_equipe_id),
    ('JEFFERSON PEREIRA LOYOLA DOS SANTOS', 'jefferson.santos@bombeiros.gov.br', 'Bombeiro Aeronáutico', sbgo_secao_id, alfa_equipe_id),
    ('SÍLVIO PASSOS DA SILVA', 'silvio.silva@bombeiros.gov.br', 'Bombeiro Aeronáutico', sbgo_secao_id, alfa_equipe_id);
    
    -- =====================================================
    -- INSERIR FUNCIONÁRIOS DA EQUIPE BRAVO
    -- =====================================================
    INSERT INTO public.funcionarios (nome_completo, email, cargo, secao_id, equipe_id) VALUES
    ('GEDIAEL SANTOS FERREIRA', 'gediael.ferreira@bombeiros.gov.br', 'Bombeiro Aeronáutico', sbgo_secao_id, bravo_equipe_id),
    ('MARCOS VINÍCIUS SILVA OLIVEIRA', 'marcos.oliveira@bombeiros.gov.br', 'Bombeiro Aeronáutico', sbgo_secao_id, bravo_equipe_id),
    ('VINÍCIUS LOPES DOS SANTOS', 'vinicius.santos@bombeiros.gov.br', 'Bombeiro Aeronáutico', sbgo_secao_id, bravo_equipe_id),
    ('GABRIEL MARTINS DE ABREU', 'gabriel.abreu@bombeiros.gov.br', 'Bombeiro Aeronáutico', sbgo_secao_id, bravo_equipe_id),
    ('LUIS FERNANDO ABDON NUNES JÚNIOR', 'luis.nunes@bombeiros.gov.br', 'Bombeiro Aeronáutico', sbgo_secao_id, bravo_equipe_id),
    ('VICTOR ANTUNES BRETAS', 'victor.bretas@bombeiros.gov.br', 'Bombeiro Aeronáutico', sbgo_secao_id, bravo_equipe_id),
    ('THAÍS CRISTINA DE FREITAS GONTIJO', 'thais.gontijo@bombeiros.gov.br', 'Bombeiro Aeronáutico', sbgo_secao_id, bravo_equipe_id),
    ('ZACARIAS KEVIN VIEIRA NUNES', 'zacarias.nunes@bombeiros.gov.br', 'Bombeiro Aeronáutico', sbgo_secao_id, bravo_equipe_id),
    ('PAULO CESAR DA SILVA CARDOSO', 'paulo.cardoso@bombeiros.gov.br', 'Bombeiro Aeronáutico', sbgo_secao_id, bravo_equipe_id),
    ('GUSTAVO ALVES DE SOUZA', 'gustavo.souza@bombeiros.gov.br', 'Bombeiro Aeronáutico', sbgo_secao_id, bravo_equipe_id);
    
    -- =====================================================
    -- INSERIR FUNCIONÁRIOS DA EQUIPE CHARLIE
    -- =====================================================
    INSERT INTO public.funcionarios (nome_completo, email, cargo, secao_id, equipe_id) VALUES
    ('LEONARDO FERREIRA DA SILVA', 'leonardo.silva@bombeiros.gov.br', 'Bombeiro Aeronáutico', sbgo_secao_id, charlie_equipe_id),
    ('NILTON DE SOUZA CABRAL FILHO', 'nilton.cabral2@bombeiros.gov.br', 'Bombeiro Aeronáutico', sbgo_secao_id, charlie_equipe_id),
    ('HENRIQUE ELER ASSUNÇÃO PINTO', 'henrique.pinto@bombeiros.gov.br', 'Bombeiro Aeronáutico', sbgo_secao_id, charlie_equipe_id),
    ('GABRIEL ARAÚJO LOPES', 'gabriel.lopes@bombeiros.gov.br', 'Bombeiro Aeronáutico', sbgo_secao_id, charlie_equipe_id),
    ('MATHEUS GOMES DOS SANTOS', 'matheus.santos@bombeiros.gov.br', 'Bombeiro Aeronáutico', sbgo_secao_id, charlie_equipe_id),
    ('CARMEN LIDIA MASCARENHAS', 'carmen.mascarenhas@bombeiros.gov.br', 'Bombeiro Aeronáutico', sbgo_secao_id, charlie_equipe_id),
    ('HELI DE ALMEIDA NERES', 'heli.neres@bombeiros.gov.br', 'Bombeiro Aeronáutico', sbgo_secao_id, charlie_equipe_id),
    ('JEFFERSON PEREIRA LOYOLA DOS SANTOS', 'jefferson.santos2@bombeiros.gov.br', 'Bombeiro Aeronáutico', sbgo_secao_id, charlie_equipe_id),
    ('THIAGO DE SOUZA MONTEIRO', 'thiago.monteiro@bombeiros.gov.br', 'Bombeiro Aeronáutico', sbgo_secao_id, charlie_equipe_id),
    ('IGOR ALMEIDA DOS SANTOS', 'igor.santos@bombeiros.gov.br', 'Bombeiro Aeronáutico', sbgo_secao_id, charlie_equipe_id);
    
    -- =====================================================
    -- INSERIR FUNCIONÁRIOS DA EQUIPE DELTA
    -- =====================================================
    INSERT INTO public.funcionarios (nome_completo, email, cargo, secao_id, equipe_id) VALUES
    ('DIEGO DE JESUS RODRIGUES', 'diego.rodrigues@bombeiros.gov.br', 'Bombeiro Aeronáutico', sbgo_secao_id, delta_equipe_id),
    ('GABRIEL FERREIRA GONÇALVES', 'gabriel.goncalves@bombeiros.gov.br', 'Bombeiro Aeronáutico', sbgo_secao_id, delta_equipe_id),
    ('PEDRO HENRIQUE NUNES RAMOS', 'pedro.ramos@bombeiros.gov.br', 'Bombeiro Aeronáutico', sbgo_secao_id, delta_equipe_id),
    ('LEANDRO SOARES GARCIA', 'leandro.garcia@bombeiros.gov.br', 'Bombeiro Aeronáutico', sbgo_secao_id, delta_equipe_id),
    ('SÍLVIO CÉSAR FERNANDES FILHO', 'silvio.fernandes@bombeiros.gov.br', 'Bombeiro Aeronáutico', sbgo_secao_id, delta_equipe_id),
    ('CAMILA GODOY SILVA', 'camila.silva@bombeiros.gov.br', 'Bombeiro Aeronáutico', sbgo_secao_id, delta_equipe_id),
    ('NÁRIA SANTANA DA SILVA', 'naria.silva@bombeiros.gov.br', 'Bombeiro Aeronáutico', sbgo_secao_id, delta_equipe_id),
    ('JOSÉ ANTÔNIO DE MORAES LEAL', 'jose.leal@bombeiros.gov.br', 'Bombeiro Aeronáutico', sbgo_secao_id, delta_equipe_id),
    ('ARIDELCIO ARAÚJO DO NASCIMENTO', 'aridelcio.nascimento@bombeiros.gov.br', 'Bombeiro Aeronáutico', sbgo_secao_id, delta_equipe_id),
    ('PAULO CÉSAR DA SILVA OLIVEIRA', 'paulo.oliveira@bombeiros.gov.br', 'Bombeiro Aeronáutico', sbgo_secao_id, delta_equipe_id);
    
    -- Log de sucesso
    RAISE NOTICE 'Funcionários da base SBGO inseridos com sucesso!';
    RAISE NOTICE 'Total de funcionários inseridos: 40';
    RAISE NOTICE 'Equipe ALFA: 10 funcionários';
    RAISE NOTICE 'Equipe BRAVO: 10 funcionários';
    RAISE NOTICE 'Equipe CHARLIE: 10 funcionários';
    RAISE NOTICE 'Equipe DELTA: 10 funcionários';
    
END $$;

-- =====================================================
-- COMENTÁRIOS E DOCUMENTAÇÃO
-- =====================================================

COMMENT ON TABLE public.funcionarios IS 'Cadastro de funcionários (bombeiros) com dados da base SBGO - Goiânia/GO inseridos';

-- Funcionários inseridos:
-- - 40 bombeiros aeronáuticos da base SBGO
-- - Distribuídos igualmente entre as 4 equipes (ALFA, BRAVO, CHARLIE, DELTA)
-- - Emails fictícios gerados baseados nos nomes
-- - Todos com cargo "Bombeiro Aeronáutico"
-- - Vinculados à seção SBGO e suas respectivas equipes