-- =====================================================
-- MIGRATION: Verificar funcionários inseridos da base SBGO
-- Data: 2025-01-25
-- Descrição: Query para verificar se os funcionários de Goiânia
--           foram inseridos corretamente na tabela funcionarios
-- =====================================================

-- Verificar funcionários inseridos da base SBGO (Goiânia)
DO $$
DECLARE
    funcionario_record RECORD;
    total_funcionarios INTEGER;
    total_alfa INTEGER;
    total_bravo INTEGER;
    total_charlie INTEGER;
    total_delta INTEGER;
BEGIN
    -- Contar total de funcionários da SBGO
    SELECT COUNT(*) INTO total_funcionarios
    FROM public.funcionarios f
    JOIN public.secoes s ON f.secao_id = s.id
    WHERE s.codigo = 'SBGO';
    
    -- Contar por equipe
    SELECT COUNT(*) INTO total_alfa
    FROM public.funcionarios f
    JOIN public.secoes s ON f.secao_id = s.id
    JOIN public.equipes e ON f.equipe_id = e.id
    WHERE s.codigo = 'SBGO' AND e.nome = 'ALFA';
    
    SELECT COUNT(*) INTO total_bravo
    FROM public.funcionarios f
    JOIN public.secoes s ON f.secao_id = s.id
    JOIN public.equipes e ON f.equipe_id = e.id
    WHERE s.codigo = 'SBGO' AND e.nome = 'BRAVO';
    
    SELECT COUNT(*) INTO total_charlie
    FROM public.funcionarios f
    JOIN public.secoes s ON f.secao_id = s.id
    JOIN public.equipes e ON f.equipe_id = e.id
    WHERE s.codigo = 'SBGO' AND e.nome = 'CHARLIE';
    
    SELECT COUNT(*) INTO total_delta
    FROM public.funcionarios f
    JOIN public.secoes s ON f.secao_id = s.id
    JOIN public.equipes e ON f.equipe_id = e.id
    WHERE s.codigo = 'SBGO' AND e.nome = 'DELTA';
    
    -- Exibir resultados
    RAISE NOTICE '=== VERIFICAÇÃO DOS FUNCIONÁRIOS SBGO (GOIÂNIA) ===';
    RAISE NOTICE 'Total de funcionários inseridos: %', total_funcionarios;
    RAISE NOTICE 'Equipe ALFA: % funcionários', total_alfa;
    RAISE NOTICE 'Equipe BRAVO: % funcionários', total_bravo;
    RAISE NOTICE 'Equipe CHARLIE: % funcionários', total_charlie;
    RAISE NOTICE 'Equipe DELTA: % funcionários', total_delta;
    
    -- Verificar se todos os 40 funcionários foram inseridos
    IF total_funcionarios = 40 THEN
        RAISE NOTICE '✅ SUCESSO: Todos os 40 funcionários foram inseridos corretamente!';
    ELSE
        RAISE NOTICE '⚠️  ATENÇÃO: Esperado 40 funcionários, encontrados %', total_funcionarios;
    END IF;
    
    -- Verificar distribuição por equipe (10 cada)
    IF total_alfa = 10 AND total_bravo = 10 AND total_charlie = 10 AND total_delta = 10 THEN
        RAISE NOTICE '✅ SUCESSO: Distribuição por equipes está correta (10 funcionários cada)!';
    ELSE
        RAISE NOTICE '⚠️  ATENÇÃO: Distribuição por equipes não está balanceada';
    END IF;
    
    RAISE NOTICE '=== FIM DA VERIFICAÇÃO ===';
    
END $$;