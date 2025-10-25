-- =====================================================
-- MIGRATION: Verificar coluna nome_cidade na tabela funcionarios
-- Data: 2025-01-25
-- Descrição: Verificar se a coluna nome_cidade foi adicionada
--           e populada corretamente com os dados das cidades
-- =====================================================

-- Verificar dados da coluna nome_cidade
DO $$
DECLARE
    total_funcionarios INTEGER;
    total_goiania INTEGER;
    total_confins INTEGER;
    total_null INTEGER;
    funcionario_sample RECORD;
BEGIN
    -- Contar total de funcionários
    SELECT COUNT(*) INTO total_funcionarios FROM public.funcionarios;
    
    -- Contar por cidade
    SELECT COUNT(*) INTO total_goiania 
    FROM public.funcionarios 
    WHERE nome_cidade = 'Goiânia';
    
    SELECT COUNT(*) INTO total_confins 
    FROM public.funcionarios 
    WHERE nome_cidade = 'Confins';
    
    SELECT COUNT(*) INTO total_null 
    FROM public.funcionarios 
    WHERE nome_cidade IS NULL;
    
    -- Exibir resultados
    RAISE NOTICE '=== VERIFICAÇÃO DA COLUNA NOME_CIDADE ===';
    RAISE NOTICE 'Total de funcionários no sistema: %', total_funcionarios;
    RAISE NOTICE 'Funcionários em Goiânia: %', total_goiania;
    RAISE NOTICE 'Funcionários em Confins: %', total_confins;
    RAISE NOTICE 'Funcionários sem cidade (NULL): %', total_null;
    
    -- Verificar se os dados estão corretos
    IF total_goiania = 40 AND total_confins = 55 AND total_null = 0 THEN
        RAISE NOTICE '✅ SUCESSO: Coluna nome_cidade populada corretamente!';
        RAISE NOTICE '   - 40 funcionários em Goiânia (SBGO)';
        RAISE NOTICE '   - 55 funcionários em Confins (SBCF)';
        RAISE NOTICE '   - 0 funcionários sem cidade';
    ELSE
        RAISE NOTICE '⚠️  ATENÇÃO: Dados da coluna nome_cidade podem estar incorretos';
        RAISE NOTICE '   - Esperado: 40 Goiânia, 55 Confins, 0 NULL';
        RAISE NOTICE '   - Encontrado: % Goiânia, % Confins, % NULL', total_goiania, total_confins, total_null;
    END IF;
    
    -- Mostrar alguns exemplos de funcionários com suas cidades
    RAISE NOTICE '';
    RAISE NOTICE '=== EXEMPLOS DE FUNCIONÁRIOS POR CIDADE ===';
    
    -- Exemplo de Goiânia
    FOR funcionario_sample IN 
        SELECT f.nome_completo, f.nome_cidade, s.codigo as secao_codigo, e.nome as equipe_nome
        FROM public.funcionarios f
        JOIN public.secoes s ON f.secao_id = s.id
        JOIN public.equipes e ON f.equipe_id = e.id
        WHERE f.nome_cidade = 'Goiânia'
        LIMIT 2
    LOOP
        RAISE NOTICE 'Goiânia: % (Seção: %, Equipe: %)', 
            funcionario_sample.nome_completo, 
            funcionario_sample.secao_codigo, 
            funcionario_sample.equipe_nome;
    END LOOP;
    
    -- Exemplo de Confins
    FOR funcionario_sample IN 
        SELECT f.nome_completo, f.nome_cidade, s.codigo as secao_codigo, e.nome as equipe_nome
        FROM public.funcionarios f
        JOIN public.secoes s ON f.secao_id = s.id
        JOIN public.equipes e ON f.equipe_id = e.id
        WHERE f.nome_cidade = 'Confins'
        LIMIT 2
    LOOP
        RAISE NOTICE 'Confins: % (Seção: %, Equipe: %)', 
            funcionario_sample.nome_completo, 
            funcionario_sample.secao_codigo, 
            funcionario_sample.equipe_nome;
    END LOOP;
    
    RAISE NOTICE '=== FIM DA VERIFICAÇÃO ===';
    
END $$;