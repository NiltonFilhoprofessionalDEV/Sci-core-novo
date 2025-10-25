-- =====================================================
-- MIGRATION: Inserir funcionários da base de Belo Horizonte (SBCF)
-- Data: 2025-01-25
-- Descrição: Cadastrar os 56 funcionários da seção SBCF (Confins)
--           distribuídos nas equipes existentes: Alfa, Bravo, Charlie e Delta
--           Usando IDs específicos das equipes já criadas
-- =====================================================

DO $$
DECLARE
    sbcf_secao_id UUID;
    equipe_alfa_id UUID := 'd83cc2fc-833f-4707-9e05-1e413e327c10';
    equipe_bravo_id UUID := '740db962-61c5-42a3-b4b9-8336860aa89a';
    equipe_charlie_id UUID := '9595b5c1-0cc6-4dde-b7cf-87acd798c0ef';
    equipe_delta_id UUID := '47aa99e3-db01-4943-affd-1a4ca2619103';
BEGIN
    -- Buscar ID da seção SBCF (Confins/Belo Horizonte)
    SELECT id INTO sbcf_secao_id FROM secoes WHERE codigo = 'SBCF' AND ativa = true;
    
    -- Verificar se encontrou a seção
    IF sbcf_secao_id IS NULL THEN
        RAISE EXCEPTION 'Seção SBCF não encontrada';
    END IF;
    
    -- Limpar funcionários existentes da SBCF
    DELETE FROM funcionarios WHERE secao_id = sbcf_secao_id;
    
    -- Inserir funcionários da Equipe ALFA (funcionários 1-14)
    INSERT INTO funcionarios (nome_completo, email, cargo, secao_id, equipe_id, nome_cidade) VALUES
    ('ALESSANDER EFIGENIO DE MELO', 'meloalessander@gmail.com', 'Bombeiro Aeronáutico', sbcf_secao_id, equipe_alfa_id, 'Belo Horizonte'),
    ('ALEX ALVES GOMES', 'alexalves.lekin@gmail.com', 'Bombeiro Aeronáutico', sbcf_secao_id, equipe_alfa_id, 'Belo Horizonte'),
    ('ALISON ROGER DE SOUZA', 'alison.roger@hotmail.com', 'Bombeiro Aeronáutico', sbcf_secao_id, equipe_alfa_id, 'Belo Horizonte'),
    ('ANDERSON DA SILVA FERREIRA', 'andersonferreiragd94@gmail.com', 'Bombeiro Aeronáutico', sbcf_secao_id, equipe_alfa_id, 'Belo Horizonte'),
    ('ANDRE FURTADO REIS', 'andreareisfb@hotmail.com', 'Bombeiro Aeronáutico', sbcf_secao_id, equipe_alfa_id, 'Belo Horizonte'),
    ('BRUNO MENDES', 'bruno_ti7@yahoo.com.br', 'Bombeiro Aeronáutico', sbcf_secao_id, equipe_alfa_id, 'Belo Horizonte'),
    ('BRUNO VIANA DE CARVALHO', 'brunovianafab@gmail.com', 'Bombeiro Aeronáutico', sbcf_secao_id, equipe_alfa_id, 'Belo Horizonte'),
    ('CARLOS EDUARDO DIAS', 'carloseduardo.kadu10@hotmail.com', 'Bombeiro Aeronáutico', sbcf_secao_id, equipe_alfa_id, 'Belo Horizonte'),
    ('CARLOS EDUARDO SANTOS DA SILVA', 'eduardo-car@live.com', 'Bombeiro Aeronáutico', sbcf_secao_id, equipe_alfa_id, 'Belo Horizonte'),
    ('CESAR BALBINO SILVA', 'cesarbalbis@outlook.com', 'Bombeiro Aeronáutico', sbcf_secao_id, equipe_alfa_id, 'Belo Horizonte'),
    ('CIRLENE DIAS', 'diascirlene63@gmail.com', 'Bombeiro Aeronáutico', sbcf_secao_id, equipe_alfa_id, 'Belo Horizonte'),
    ('DAIANA APARECIDA DA SILVA', 'daianasilva221@gmail.com', 'Bombeiro Aeronáutico', sbcf_secao_id, equipe_alfa_id, 'Belo Horizonte'),
    ('DIEGO RICARDO BARBOSA DOS SANTOS', 'diegoricardo375.dj@gmail.com', 'Bombeiro Aeronáutico', sbcf_secao_id, equipe_alfa_id, 'Belo Horizonte'),
    ('EDERSON RAMOS DA SILVA', 'edersonramos88@yahoo.com', 'Bombeiro Aeronáutico', sbcf_secao_id, equipe_alfa_id, 'Belo Horizonte');
    
    -- Inserir funcionários da Equipe BRAVO (funcionários 15-28)
    INSERT INTO funcionarios (nome_completo, email, cargo, secao_id, equipe_id, nome_cidade) VALUES
    ('ESDRAS HAENDEL DE OLIVEIRA RAMOS', 'esdrasfin@gmail.com', 'Bombeiro Aeronáutico', sbcf_secao_id, equipe_bravo_id, 'Belo Horizonte'),
    ('FELIPE CESAR RAMOS COSTA', 'felipe.crcosta@gmail.com', 'Bombeiro Aeronáutico', sbcf_secao_id, equipe_bravo_id, 'Belo Horizonte'),
    ('FELIPE MIRANDA', 'fmiranda170716@gmail.com', 'Bombeiro Aeronáutico', sbcf_secao_id, equipe_bravo_id, 'Belo Horizonte'),
    ('FERNANDA RODRIGUES DA SILVA', 'nandarod.med@gmail.com', 'Bombeiro Aeronáutico', sbcf_secao_id, equipe_bravo_id, 'Belo Horizonte'),
    ('FERNANDO JOSE RODRIGUES DE SOUZA JUNIOR', 'fernandojuniior1234@gmail.com', 'Bombeiro Aeronáutico', sbcf_secao_id, equipe_bravo_id, 'Belo Horizonte'),
    ('GIOVANNI JULIO DA SILVA', 'giovannijulio_@hotmail.com', 'Bombeiro Aeronáutico', sbcf_secao_id, equipe_bravo_id, 'Belo Horizonte'),
    ('GISELE MARQUES DE SOUSA MARINHO', 'GISELEMARQUESM@MSN.COM', 'Bombeiro Aeronáutico', sbcf_secao_id, equipe_bravo_id, 'Belo Horizonte'),
    ('GRASIELLE BARBOSA LEAO RICHEMBURG', 'richemburg@gmail.com', 'Bombeiro Aeronáutico', sbcf_secao_id, equipe_bravo_id, 'Belo Horizonte'),
    ('GUILHERME VIEIRA FERREIRA', 'vguilherme6996@hotmail.com', 'Bombeiro Aeronáutico', sbcf_secao_id, equipe_bravo_id, 'Belo Horizonte'),
    ('HELIS AUGUSTO GONCALVES PEREIRA', 'helis-gp@hotmail.com', 'Bombeiro Aeronáutico', sbcf_secao_id, equipe_bravo_id, 'Belo Horizonte'),
    ('IURI HENRIQUE DA COSTA E SILVA', 'iurijanauba@gmail.com', 'Bombeiro Aeronáutico', sbcf_secao_id, equipe_bravo_id, 'Belo Horizonte'),
    ('JEFERSON SANTANA DA SILVA', 'j.santanasilva2013@gmail.com', 'Bombeiro Aeronáutico', sbcf_secao_id, equipe_bravo_id, 'Belo Horizonte'),
    ('JEFFERSON SALES AMORIM', 'jeffersom.sa@gmail.com', 'Bombeiro Aeronáutico', sbcf_secao_id, equipe_bravo_id, 'Belo Horizonte'),
    ('JOÃO PAULO BISPO DA ROCHA', 'joaop.rocha48@gmail.com', 'Bombeiro Aeronáutico', sbcf_secao_id, equipe_bravo_id, 'Belo Horizonte');
    
    -- Inserir funcionários da Equipe CHARLIE (funcionários 29-42)
    INSERT INTO funcionarios (nome_completo, email, cargo, secao_id, equipe_id, nome_cidade) VALUES
    ('LEONARDO CALEGARO BATISTA', 'leonardo.c.batista123@gmail.com', 'Bombeiro Aeronáutico', sbcf_secao_id, equipe_charlie_id, 'Belo Horizonte'),
    ('LUCAS ADAUTO DOS REIS', 'lucasadauto.la@gmail.com', 'Bombeiro Aeronáutico', sbcf_secao_id, equipe_charlie_id, 'Belo Horizonte'),
    ('LUCAS GOMES DA ROCHA', 'Lucasgrocha67@gmail.com', 'Bombeiro Aeronáutico', sbcf_secao_id, equipe_charlie_id, 'Belo Horizonte'),
    ('MARCELO CANDIDO MENEZES', 'marcelo.menezes87@gmail.com', 'Bombeiro Aeronáutico', sbcf_secao_id, equipe_charlie_id, 'Belo Horizonte'),
    ('MARCELO DE SOUZA SANTOS', 'marcelossprofissional@gmail.com', 'Bombeiro Aeronáutico', sbcf_secao_id, equipe_charlie_id, 'Belo Horizonte'),
    ('MARCOS VINICIUS AVELAR EGIDIO', 'megidioba@gmail.com', 'Bombeiro Aeronáutico', sbcf_secao_id, equipe_charlie_id, 'Belo Horizonte'),
    ('MATEUS GODINHO DA SILVA', 'mateus_godinhojr@hotmail.com', 'Bombeiro Aeronáutico', sbcf_secao_id, equipe_charlie_id, 'Belo Horizonte'),
    ('MATHEUS FLORENTINO DOS REIS', 'matheusflorentino2008@gmail.com', 'Bombeiro Aeronáutico', sbcf_secao_id, equipe_charlie_id, 'Belo Horizonte'),
    ('MAURILIO COSTA JUNIOR', 'mauriliocostajunior@gmail.com', 'Bombeiro Aeronáutico', sbcf_secao_id, equipe_charlie_id, 'Belo Horizonte'),
    ('MAX DOUGLAS AZEVEDO TOURINHO', 'Maxdouglas705@gmail.com', 'Bombeiro Aeronáutico', sbcf_secao_id, equipe_charlie_id, 'Belo Horizonte'),
    ('MAYCON DA SILVA CELESTINO', 'Mayconsilvafab130@gmail.com', 'Bombeiro Aeronáutico', sbcf_secao_id, equipe_charlie_id, 'Belo Horizonte'),
    ('PAULO HENRIQUE AGUIDO FELIX', 'pauloaguido30@hotmail.com', 'Bombeiro Aeronáutico', sbcf_secao_id, equipe_charlie_id, 'Belo Horizonte'),
    ('PAULO HENRIQUE NASCIMENTO JUNIOR', 'Paullo_jr@hotmail.com', 'Bombeiro Aeronáutico', sbcf_secao_id, equipe_charlie_id, 'Belo Horizonte'),
    ('REGINALDO FAGUNDES DE OLIVEIRA', 'reginaldofagundesdeoliveira@gmail.com', 'Bombeiro Aeronáutico', sbcf_secao_id, equipe_charlie_id, 'Belo Horizonte');
    
    -- Inserir funcionários da Equipe DELTA (funcionários 43-56)
    INSERT INTO funcionarios (nome_completo, email, cargo, secao_id, equipe_id, nome_cidade) VALUES
    ('REINALDO ROBERTO ALVES BATISTA', 'reirrab@hotmail.com', 'Bombeiro Aeronáutico', sbcf_secao_id, equipe_delta_id, 'Belo Horizonte'),
    ('ROBERT FERREIRA', 'robertddi@yahoo.com.br', 'Bombeiro Aeronáutico', sbcf_secao_id, equipe_delta_id, 'Belo Horizonte'),
    ('RODSON DIAS GOMES', 'birodsondias@gmail.com', 'Bombeiro Aeronáutico', sbcf_secao_id, equipe_delta_id, 'Belo Horizonte'),
    ('ROGERIO VERGILIO DA CONCEIÇÃO SANTANA', 'rogerinbr3@hotmail.com', 'Bombeiro Aeronáutico', sbcf_secao_id, equipe_delta_id, 'Belo Horizonte'),
    ('RONALDO DA SILVA JUNIOR', 'ronaldonin28@hotmail.com', 'Bombeiro Aeronáutico', sbcf_secao_id, equipe_delta_id, 'Belo Horizonte'),
    ('SERGIO JUNIOR CARDOSO SILVA', 'sergiojrcardoso@hotmail.com', 'Bombeiro Aeronáutico', sbcf_secao_id, equipe_delta_id, 'Belo Horizonte'),
    ('THIAGO MIRANDA RODRIGUES', 'thiaguinhomirandinha@gmail.com', 'Bombeiro Aeronáutico', sbcf_secao_id, equipe_delta_id, 'Belo Horizonte'),
    ('TIAGO DE SOUZA NEVES', 'tiago_t9@hotmail.com', 'Bombeiro Aeronáutico', sbcf_secao_id, equipe_delta_id, 'Belo Horizonte'),
    ('TIAGO VINICIUS CASTRO LOPES', 'tiagotestalopes@hotmail.com', 'Bombeiro Aeronáutico', sbcf_secao_id, equipe_delta_id, 'Belo Horizonte'),
    ('TULIO DINIZ GONCALVES', 'tuliodiniz87@gmail.com', 'Bombeiro Aeronáutico', sbcf_secao_id, equipe_delta_id, 'Belo Horizonte'),
    ('VINICIUS VEIGA DOS SANTOS', 'Vinicius.vsa2008@hotmail.com', 'Bombeiro Aeronáutico', sbcf_secao_id, equipe_delta_id, 'Belo Horizonte'),
    ('WERLEY DE SOUSA DAMAZIO', 'sousadamazio@gmail.com', 'Bombeiro Aeronáutico', sbcf_secao_id, equipe_delta_id, 'Belo Horizonte'),
    ('STEFANY SILVA BAIÃO', 'stefanysilva189@gmail.com', 'Bombeiro Aeronáutico', sbcf_secao_id, equipe_delta_id, 'Belo Horizonte'),
    ('JEAN CARLOS DE OLIVEIRA VIEIRA', 'jean201089@hotmail.com', 'Bombeiro Aeronáutico', sbcf_secao_id, equipe_delta_id, 'Belo Horizonte');
    
    -- Log de sucesso
    RAISE NOTICE 'Funcionários da base SBCF (Belo Horizonte) inseridos com sucesso!';
    RAISE NOTICE 'Total de funcionários inseridos: 56';
    RAISE NOTICE 'Equipe Alfa: 14 funcionários';
    RAISE NOTICE 'Equipe Bravo: 14 funcionários';
    RAISE NOTICE 'Equipe Charlie: 14 funcionários';
    RAISE NOTICE 'Equipe Delta: 14 funcionários';
    
END $$;

-- =====================================================
-- COMENTÁRIOS E DOCUMENTAÇÃO
-- =====================================================

COMMENT ON TABLE public.funcionarios IS 'Funcionários das bases - incluindo SBCF Belo Horizonte/MG com 56 funcionários';

-- Esta migration:
-- 1. Insere 56 funcionários reais da base SBCF (Confins/Belo Horizonte)
-- 2. Distribui os funcionários igualmente entre as 4 equipes existentes (Alfa, Bravo, Charlie, Delta)
-- 3. Usa IDs específicos das equipes já criadas no banco de dados
-- 4. Cada funcionário possui nome completo, email, cargo e está vinculado à sua equipe
-- 5. Todos os funcionários são cadastrados como "Bombeiro Aeronáutico"
-- 6. A cidade é definida como "Belo Horizonte" para todos os funcionários
-- 7. Remove funcionários existentes da SBCF antes de inserir os novos dados