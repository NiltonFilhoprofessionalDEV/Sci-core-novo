-- =====================================================
-- MIGRATION: Inserir funcionários da base SBCF (Confins)
-- Data: 2025-01-25
-- Descrição: Inserir 55 funcionários da base de Confins/MG
--           distribuídos igualmente nas 4 equipes (ALFA, BRAVO, CHARLIE, DELTA)
-- =====================================================

DO $$
DECLARE
    sbcf_secao_id uuid;
    alfa_equipe_id uuid;
    bravo_equipe_id uuid;
    charlie_equipe_id uuid;
    delta_equipe_id uuid;
BEGIN
    -- Buscar ID da seção SBCF
    SELECT id INTO sbcf_secao_id FROM public.secoes WHERE codigo = 'SBCF';
    
    IF sbcf_secao_id IS NULL THEN
        RAISE EXCEPTION 'Seção SBCF não encontrada';
    END IF;
    
    -- Buscar IDs das equipes
    SELECT id INTO alfa_equipe_id FROM public.equipes WHERE secao_id = sbcf_secao_id AND nome = 'ALFA';
    SELECT id INTO bravo_equipe_id FROM public.equipes WHERE secao_id = sbcf_secao_id AND nome = 'BRAVO';
    SELECT id INTO charlie_equipe_id FROM public.equipes WHERE secao_id = sbcf_secao_id AND nome = 'CHARLIE';
    SELECT id INTO delta_equipe_id FROM public.equipes WHERE secao_id = sbcf_secao_id AND nome = 'DELTA';
    
    IF alfa_equipe_id IS NULL OR bravo_equipe_id IS NULL OR charlie_equipe_id IS NULL OR delta_equipe_id IS NULL THEN
        RAISE EXCEPTION 'Uma ou mais equipes não foram encontradas para a seção SBCF';
    END IF;
    
    -- Inserir funcionários da equipe ALFA (14 funcionários)
    INSERT INTO public.funcionarios (nome_completo, email, cargo, secao_id, equipe_id) VALUES
    ('ALESSANDER EFIGENIO DE MELO', 'meloalessander@gmail.com', 'Bombeiro Aeronáutico', sbcf_secao_id, alfa_equipe_id),
    ('ALEX ALVES GOMES', 'alexalves.lekin@gmail.com', 'Bombeiro Aeronáutico', sbcf_secao_id, alfa_equipe_id),
    ('ALISON ROGER DE SOUZA', 'alison.roger@hotmail.com', 'Bombeiro Aeronáutico', sbcf_secao_id, alfa_equipe_id),
    ('ANDERSON DA SILVA FERREIRA', 'andersonferreiragd94@gmail.com', 'Bombeiro Aeronáutico', sbcf_secao_id, alfa_equipe_id),
    ('ANDRE FURTADO REIS', 'andreareisfb@hotmail.com', 'Bombeiro Aeronáutico', sbcf_secao_id, alfa_equipe_id),
    ('BRUNO MENDES', 'bruno_ti7@yahoo.com.br', 'Bombeiro Aeronáutico', sbcf_secao_id, alfa_equipe_id),
    ('BRUNO VIANA DE CARVALHO', 'brunovianafab@gmail.com', 'Bombeiro Aeronáutico', sbcf_secao_id, alfa_equipe_id),
    ('CARLOS EDUARDO DIAS', 'carloseduardo.kadu10@hotmail.com', 'Bombeiro Aeronáutico', sbcf_secao_id, alfa_equipe_id),
    ('CARLOS EDUARDO SANTOS DA SILVA', 'eduardo-car@live.com', 'Bombeiro Aeronáutico', sbcf_secao_id, alfa_equipe_id),
    ('CESAR BALBINO SILVA', 'cesarbalbis@outlook.com', 'Bombeiro Aeronáutico', sbcf_secao_id, alfa_equipe_id),
    ('CIRLENE DIAS', 'diascirlene63@gmail.com', 'Bombeiro Aeronáutico', sbcf_secao_id, alfa_equipe_id),
    ('DAIANA APARECIDA DA SILVA', 'daianasilva221@gmail.com', 'Bombeiro Aeronáutico', sbcf_secao_id, alfa_equipe_id),
    ('DIEGO RICARDO BARBOSA DOS SANTOS', 'diegoricardo375.dj@gmail.com', 'Bombeiro Aeronáutico', sbcf_secao_id, alfa_equipe_id),
    ('EDERSON RAMOS DA SILVA', 'edersonramos88@yahoo.com', 'Bombeiro Aeronáutico', sbcf_secao_id, alfa_equipe_id);
    
    -- Inserir funcionários da equipe BRAVO (14 funcionários)
    INSERT INTO public.funcionarios (nome_completo, email, cargo, secao_id, equipe_id) VALUES
    ('ESDRAS HAENDEL DE OLIVEIRA RAMOS', 'esdrasfin@gmail.com', 'Bombeiro Aeronáutico', sbcf_secao_id, bravo_equipe_id),
    ('FELIPE CESAR RAMOS COSTA', 'felipe.crcosta@gmail.com', 'Bombeiro Aeronáutico', sbcf_secao_id, bravo_equipe_id),
    ('FELIPE MIRANDA', 'fmiranda170716@gmail.com', 'Bombeiro Aeronáutico', sbcf_secao_id, bravo_equipe_id),
    ('FERNANDA RODRIGUES DA SILVA', 'nandarod.med@gmail.com', 'Bombeiro Aeronáutico', sbcf_secao_id, bravo_equipe_id),
    ('FERNANDO JOSE RODRIGUES DE SOUZA JUNIOR', 'fernandojuniior1234@gmail.com', 'Bombeiro Aeronáutico', sbcf_secao_id, bravo_equipe_id),
    ('GIOVANNI JULIO DA SILVA', 'giovannijulio_@hotmail.com', 'Bombeiro Aeronáutico', sbcf_secao_id, bravo_equipe_id),
    ('GISELE MARQUES DE SOUSA MARINHO', 'GISELEMARQUESM@MSN.COM', 'Bombeiro Aeronáutico', sbcf_secao_id, bravo_equipe_id),
    ('GRASIELLE BARBOSA LEAO RICHEMBURG', 'richemburg@gmail.com', 'Bombeiro Aeronáutico', sbcf_secao_id, bravo_equipe_id),
    ('GUILHERME VIEIRA FERREIRA', 'vguilherme6996@hotmail.com', 'Bombeiro Aeronáutico', sbcf_secao_id, bravo_equipe_id),
    ('HELIS AUGUSTO GONCALVES PEREIRA', 'helis-gp@hotmail.com', 'Bombeiro Aeronáutico', sbcf_secao_id, bravo_equipe_id),
    ('IURI HENRIQUE DA COSTA E SILVA', 'iurijanauba@gmail.com', 'Bombeiro Aeronáutico', sbcf_secao_id, bravo_equipe_id),
    ('JEFERSON SANTANA DA SILVA', 'j.santanasilva2013@gmail.com', 'Bombeiro Aeronáutico', sbcf_secao_id, bravo_equipe_id),
    ('JEFFERSON SALES AMORIM', 'jeffersom.sa@gmail.com', 'Bombeiro Aeronáutico', sbcf_secao_id, bravo_equipe_id),
    ('JOÃO PAULO BISPO DA ROCHA', 'joaop.rocha48@gmail.com', 'Bombeiro Aeronáutico', sbcf_secao_id, bravo_equipe_id);
    
    -- Inserir funcionários da equipe CHARLIE (14 funcionários)
    INSERT INTO public.funcionarios (nome_completo, email, cargo, secao_id, equipe_id) VALUES
    ('LEONARDO CALEGARO BATISTA', 'leonardo.c.batista123@gmail.com', 'Bombeiro Aeronáutico', sbcf_secao_id, charlie_equipe_id),
    ('LUCAS ADAUTO DOS REIS', 'lucasadauto.la@gmail.com', 'Bombeiro Aeronáutico', sbcf_secao_id, charlie_equipe_id),
    ('LUCAS GOMES DA ROCHA', 'Lucasgrocha67@gmail.com', 'Bombeiro Aeronáutico', sbcf_secao_id, charlie_equipe_id),
    ('MARCELO CANDIDO MENEZES', 'marcelo.menezes87@gmail.com', 'Bombeiro Aeronáutico', sbcf_secao_id, charlie_equipe_id),
    ('MARCELO DE SOUZA SANTOS', 'marcelossprofissional@gmail.com', 'Bombeiro Aeronáutico', sbcf_secao_id, charlie_equipe_id),
    ('MARCOS VINICIUS AVELAR EGIDIO', 'megidioba@gmail.com', 'Bombeiro Aeronáutico', sbcf_secao_id, charlie_equipe_id),
    ('MATEUS GODINHO DA SILVA', 'mateus_godinhojr@hotmail.com', 'Bombeiro Aeronáutico', sbcf_secao_id, charlie_equipe_id),
    ('MATHEUS FLORENTINO DOS REIS', 'matheusflorentino2008@gmail.com', 'Bombeiro Aeronáutico', sbcf_secao_id, charlie_equipe_id),
    ('MAURILIO COSTA JUNIOR', 'mauriliocostajunior@gmail.com', 'Bombeiro Aeronáutico', sbcf_secao_id, charlie_equipe_id),
    ('MAX DOUGLAS AZEVEDO TOURINHO', 'Maxdouglas705@gmail.com', 'Bombeiro Aeronáutico', sbcf_secao_id, charlie_equipe_id),
    ('MAYCON DA SILVA CELESTINO', 'Mayconsilvafab130@gmail.com', 'Bombeiro Aeronáutico', sbcf_secao_id, charlie_equipe_id),
    ('PAULO HENRIQUE AGUIDO FELIX', 'pauloaguido30@hotmail.com', 'Bombeiro Aeronáutico', sbcf_secao_id, charlie_equipe_id),
    ('PAULO HENRIQUE NASCIMENTO JUNIOR', 'Paullo_jr@hotmail.com', 'Bombeiro Aeronáutico', sbcf_secao_id, charlie_equipe_id),
    ('REGINALDO FAGUNDES DE OLIVEIRA', 'reginaldofagundesdeoliveira@gmail.com', 'Bombeiro Aeronáutico', sbcf_secao_id, charlie_equipe_id);
    
    -- Inserir funcionários da equipe DELTA (13 funcionários)
    INSERT INTO public.funcionarios (nome_completo, email, cargo, secao_id, equipe_id) VALUES
    ('REINALDO ROBERTO ALVES BATISTA', 'reirrab@hotmail.com', 'Bombeiro Aeronáutico', sbcf_secao_id, delta_equipe_id),
    ('ROBERT FERREIRA', 'robertddi@yahoo.com.br', 'Bombeiro Aeronáutico', sbcf_secao_id, delta_equipe_id),
    ('RODSON DIAS GOMES', 'birodsondias@gmail.com', 'Bombeiro Aeronáutico', sbcf_secao_id, delta_equipe_id),
    ('ROGERIO VERGILIO DA CONCEIÇÃO SANTANA', 'rogerinbr3@hotmail.com', 'Bombeiro Aeronáutico', sbcf_secao_id, delta_equipe_id),
    ('RONALDO DA SILVA JUNIOR', 'ronaldonin28@hotmail.com', 'Bombeiro Aeronáutico', sbcf_secao_id, delta_equipe_id),
    ('SERGIO JUNIOR CARDOSO SILVA', 'sergiojrcardoso@hotmail.com', 'Bombeiro Aeronáutico', sbcf_secao_id, delta_equipe_id),
    ('THIAGO MIRANDA RODRIGUES', 'thiaguinhomirandinha@gmail.com', 'Bombeiro Aeronáutico', sbcf_secao_id, delta_equipe_id),
    ('TIAGO DE SOUZA NEVES', 'tiago_t9@hotmail.com', 'Bombeiro Aeronáutico', sbcf_secao_id, delta_equipe_id),
    ('TIAGO VINICIUS CASTRO LOPES', 'tiagotestalopes@hotmail.com', 'Bombeiro Aeronáutico', sbcf_secao_id, delta_equipe_id),
    ('TULIO DINIZ GONCALVES', 'tuliodiniz87@gmail.com', 'Bombeiro Aeronáutico', sbcf_secao_id, delta_equipe_id),
    ('VINICIUS VEIGA DOS SANTOS', 'Vinicius.vsa2008@hotmail.com', 'Bombeiro Aeronáutico', sbcf_secao_id, delta_equipe_id),
    ('WERLEY DE SOUSA DAMAZIO', 'sousadamazio@gmail.com', 'Bombeiro Aeronáutico', sbcf_secao_id, delta_equipe_id),
    ('STEFANY SILVA BAIÃO', 'stefanysilva189@gmail.com', 'Bombeiro Aeronáutico', sbcf_secao_id, delta_equipe_id);
    
    -- Inserir último funcionário na equipe DELTA para completar 55
    INSERT INTO public.funcionarios (nome_completo, email, cargo, secao_id, equipe_id) VALUES
    ('JEAN CARLOS DE OLIVEIRA VIEIRA', 'jean201089@hotmail.com', 'Bombeiro Aeronáutico', sbcf_secao_id, delta_equipe_id);
    
    -- Log de sucesso
    RAISE NOTICE 'Funcionários da base SBCF (Confins) inseridos com sucesso!';
    RAISE NOTICE 'Total: 55 funcionários distribuídos em 4 equipes';
    RAISE NOTICE 'ALFA: 14 funcionários, BRAVO: 14 funcionários, CHARLIE: 14 funcionários, DELTA: 14 funcionários';
    
END $$;

-- =====================================================
-- COMENTÁRIOS E DOCUMENTAÇÃO
-- =====================================================

COMMENT ON TABLE public.funcionarios IS 'Funcionários das bases SBGO (Goiânia) e SBCF (Confins) inseridos';

-- Esta migration:
-- 1. Insere 55 funcionários da base SBCF (Confins/MG)
-- 2. Distribui os funcionários em 4 equipes (14, 14, 14, 14)
-- 3. Usa os emails reais fornecidos pelo usuário
-- 4. Define cargo como "Bombeiro Aeronáutico" para todos
-- 5. Associa corretamente com seção SBCF e suas respectivas equipes