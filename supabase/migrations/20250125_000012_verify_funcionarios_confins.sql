-- =====================================================
-- MIGRATION: Verificar funcionários inseridos da base SBCF
-- Data: 2025-01-25
-- Descrição: Query para verificar se os funcionários de Confins
--           foram inseridos corretamente na tabela funcionarios
-- =====================================================

-- Verificar funcionários inseridos da base SBCF (Confins)
DO $$
DECLARE
    funcionario_record RECORD;
    total_funcionarios INTEGER;
    total_alfa INTEGER;
    total_bravo INTEGER;
    total_charlie INTEGER;
    total_delta INTEGER;
    total_geral INTEGER;
BEGIN
    -- Contar total de funcionários da SBCF
    SELECT COUNT(*) INTO total_funcionarios
    FROM public.funcionarios f
    JOIN public.secoes s ON f.secao_id = s.id
    WHERE s.codigo = 'SBCF';
    
    -- Contar por equipe
    SELECT COUNT(*) INTO total_alfa
    FROM public.funcionarios f
    JOIN public.secoes s ON f.secao_id = s.id
    JOIN public.equipes e ON f.equipe_id = e.id
    WHERE s.codigo = 'SBCF' AND e.nome = 'ALFA';
    
    SELECT COUNT(*) INTO total_bravo
    FROM public.funcionarios f
    JOIN public.secoes s ON f.secao_id = s.id
    JOIN public.equipes e ON f.equipe_id = e.id
    WHERE s.codigo = 'SBCF' AND e.nome = 'BRAVO';
    
    SELECT COUNT(*) INTO total_charlie
    FROM public.funcionarios f
    JOIN public.secoes s ON f.secao_id = s.id
    JOIN public.equipes e ON f.equipe_id = e.id
    WHERE s.codigo = 'SBCF' AND e.nome = 'CHARLIE';
    
    SELECT COUNT(*) INTO total_delta
    FROM public.funcionarios f
    JOIN public.secoes s ON f.secao_id = s.id
    JOIN public.equipes e ON f.equipe_id = e.id
    WHERE s.codigo = 'SBCF' AND e.nome = 'DELTA';
    
    -- Contar total geral (SBGO + SBCF)
    SELECT COUNT(*) INTO total_geral FROM public.funcionarios;
    
    -- Exibir resultados
    RAISE NOTICE '=== VERIFICAÇÃO DOS FUNCIONÁRIOS SBCF (CONFINS) ===';
    RAISE NOTICE 'Total de funcionários SBCF inseridos: %', total_funcionarios;
    RAISE NOTICE 'Equipe ALFA: % funcionários', total_alfa;
    RAISE NOTICE 'Equipe BRAVO: % funcionários', total_bravo;
    RAISE NOTICE 'Equipe CHARLIE: % funcionários', total_charlie;
    RAISE NOTICE 'Equipe DELTA: % funcionários', total_delta;
    RAISE NOTICE 'Total geral no sistema: % funcionários', total_geral;
    
    -- Verificar se todos os 55 funcionários foram inseridos
    IF total_funcionarios = 55 THEN
        RAISE NOTICE '✅ SUCESSO: Todos os 55 funcionários de Confins foram inseridos corretamente!';
    ELSE
        RAISE NOTICE '⚠️  ATENÇÃO: Esperado 55 funcionários de Confins, encontrados %', total_funcionarios;
    END IF;
    
    -- Verificar distribuição por equipe (aproximadamente 14 cada)
    IF total_alfa >= 13 AND total_bravo >= 13 AND total_charlie >= 13 AND total_delta >= 13 THEN
        RAISE NOTICE '✅ SUCESSO: Distribuição por equipes está adequada!';
    ELSE
        RAISE NOTICE '⚠️  ATENÇÃO: Distribuição por equipes pode estar desbalanceada';
    END IF;
    
    -- Verificar total geral esperado (40 SBGO + 55 SBCF = 95)
    IF total_geral = 95 THEN
        RAISE NOTICE '✅ SUCESSO: Total geral de funcionários está correto (95 funcionários)!';
    ELSE
        RAISE NOTICE '⚠️  ATENÇÃO: Total geral esperado 95 funcionários, encontrados %', total_geral;
    END IF;
    
    RAISE NOTICE '=== FIM DA VERIFICAÇÃO ===';
    
END $$;