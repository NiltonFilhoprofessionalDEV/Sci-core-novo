-- =====================================================
-- MIGRATION: Remover equipes com nomes em maiúsculo da seção SBCF
-- Data: 2025-01-25
-- Descrição: Remove as equipes ALFA, BRAVO, CHARLIE, DELTA (maiúsculo)
--           mantendo apenas as equipes originais Alfa, Bravo, Charlie, Delta, Foxtrot
-- =====================================================

-- Primeiro, verificar se existem funcionários associados às equipes em maiúsculo
-- e reatribuí-los às equipes corretas (minúsculo)
DO $$
DECLARE
    sbcf_secao_id uuid;
    equipe_alfa_maiusculo uuid;
    equipe_bravo_maiusculo uuid;
    equipe_charlie_maiusculo uuid;
    equipe_delta_maiusculo uuid;
    equipe_alfa_minusculo uuid;
    equipe_bravo_minusculo uuid;
    equipe_charlie_minusculo uuid;
    equipe_delta_minusculo uuid;
BEGIN
    -- Buscar ID da seção SBCF
    SELECT id INTO sbcf_secao_id FROM public.secoes WHERE codigo = 'SBCF';
    
    IF sbcf_secao_id IS NULL THEN
        RAISE EXCEPTION 'Seção SBCF não encontrada';
    END IF;
    
    -- Buscar IDs das equipes em maiúsculo (para remover)
    SELECT id INTO equipe_alfa_maiusculo FROM public.equipes 
    WHERE secao_id = sbcf_secao_id AND nome = 'ALFA';
    
    SELECT id INTO equipe_bravo_maiusculo FROM public.equipes 
    WHERE secao_id = sbcf_secao_id AND nome = 'BRAVO';
    
    SELECT id INTO equipe_charlie_maiusculo FROM public.equipes 
    WHERE secao_id = sbcf_secao_id AND nome = 'CHARLIE';
    
    SELECT id INTO equipe_delta_maiusculo FROM public.equipes 
    WHERE secao_id = sbcf_secao_id AND nome = 'DELTA';
    
    -- Buscar IDs das equipes em minúsculo (para manter)
    SELECT id INTO equipe_alfa_minusculo FROM public.equipes 
    WHERE secao_id = sbcf_secao_id AND nome = 'Alfa';
    
    SELECT id INTO equipe_bravo_minusculo FROM public.equipes 
    WHERE secao_id = sbcf_secao_id AND nome = 'Bravo';
    
    SELECT id INTO equipe_charlie_minusculo FROM public.equipes 
    WHERE secao_id = sbcf_secao_id AND nome = 'Charlie';
    
    SELECT id INTO equipe_delta_minusculo FROM public.equipes 
    WHERE secao_id = sbcf_secao_id AND nome = 'Delta';
    
    -- Reatribuir funcionários das equipes em maiúsculo para as equipes em minúsculo
    -- ALFA -> Alfa
    IF equipe_alfa_maiusculo IS NOT NULL AND equipe_alfa_minusculo IS NOT NULL THEN
        UPDATE public.funcionarios 
        SET equipe_id = equipe_alfa_minusculo 
        WHERE equipe_id = equipe_alfa_maiusculo;
        
        RAISE NOTICE 'Funcionários da equipe ALFA reatribuídos para Alfa';
    END IF;
    
    -- BRAVO -> Bravo
    IF equipe_bravo_maiusculo IS NOT NULL AND equipe_bravo_minusculo IS NOT NULL THEN
        UPDATE public.funcionarios 
        SET equipe_id = equipe_bravo_minusculo 
        WHERE equipe_id = equipe_bravo_maiusculo;
        
        RAISE NOTICE 'Funcionários da equipe BRAVO reatribuídos para Bravo';
    END IF;
    
    -- CHARLIE -> Charlie
    IF equipe_charlie_maiusculo IS NOT NULL AND equipe_charlie_minusculo IS NOT NULL THEN
        UPDATE public.funcionarios 
        SET equipe_id = equipe_charlie_minusculo 
        WHERE equipe_id = equipe_charlie_maiusculo;
        
        RAISE NOTICE 'Funcionários da equipe CHARLIE reatribuídos para Charlie';
    END IF;
    
    -- DELTA -> Delta
    IF equipe_delta_maiusculo IS NOT NULL AND equipe_delta_minusculo IS NOT NULL THEN
        UPDATE public.funcionarios 
        SET equipe_id = equipe_delta_minusculo 
        WHERE equipe_id = equipe_delta_maiusculo;
        
        RAISE NOTICE 'Funcionários da equipe DELTA reatribuídos para Delta';
    END IF;
    
    -- Remover as equipes em maiúsculo
    DELETE FROM public.equipes 
    WHERE secao_id = sbcf_secao_id 
    AND nome IN ('ALFA', 'BRAVO', 'CHARLIE', 'DELTA');
    
    RAISE NOTICE 'Equipes em maiúsculo removidas com sucesso';
    
END $$;