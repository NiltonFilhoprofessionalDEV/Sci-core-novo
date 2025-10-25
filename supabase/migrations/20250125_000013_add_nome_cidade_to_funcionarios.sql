-- =====================================================
-- MIGRATION: Adicionar coluna nome_cidade na tabela funcionarios
-- Data: 2025-01-25
-- Descrição: Adicionar coluna nome_cidade e popular com dados
--           das cidades baseado na seção do funcionário
-- =====================================================

-- Adicionar coluna nome_cidade na tabela funcionarios
ALTER TABLE public.funcionarios 
ADD COLUMN nome_cidade VARCHAR(100);

-- Adicionar comentário na coluna
COMMENT ON COLUMN public.funcionarios.nome_cidade IS 'Nome da cidade onde o funcionário trabalha, baseado na seção/base';

-- Popular a coluna nome_cidade baseado na seção
DO $$
DECLARE
    total_updated INTEGER := 0;
    sbgo_count INTEGER := 0;
    sbcf_count INTEGER := 0;
BEGIN
    -- Atualizar funcionários da seção SBGO (Goiânia)
    UPDATE public.funcionarios 
    SET nome_cidade = 'Goiânia'
    FROM public.secoes s
    WHERE funcionarios.secao_id = s.id 
    AND s.codigo = 'SBGO';
    
    GET DIAGNOSTICS sbgo_count = ROW_COUNT;
    
    -- Atualizar funcionários da seção SBCF (Confins)
    UPDATE public.funcionarios 
    SET nome_cidade = 'Confins'
    FROM public.secoes s
    WHERE funcionarios.secao_id = s.id 
    AND s.codigo = 'SBCF';
    
    GET DIAGNOSTICS sbcf_count = ROW_COUNT;
    
    total_updated := sbgo_count + sbcf_count;
    
    -- Log dos resultados
    RAISE NOTICE '=== ATUALIZAÇÃO DA COLUNA NOME_CIDADE ===';
    RAISE NOTICE 'Funcionários SBGO (Goiânia) atualizados: %', sbgo_count;
    RAISE NOTICE 'Funcionários SBCF (Confins) atualizados: %', sbcf_count;
    RAISE NOTICE 'Total de funcionários atualizados: %', total_updated;
    
    IF total_updated > 0 THEN
        RAISE NOTICE '✅ SUCESSO: Coluna nome_cidade populada com sucesso!';
    ELSE
        RAISE NOTICE '⚠️  ATENÇÃO: Nenhum funcionário foi atualizado';
    END IF;
    
    RAISE NOTICE '=== FIM DA ATUALIZAÇÃO ===';
    
END $$;

-- Criar índice na coluna nome_cidade para melhor performance
CREATE INDEX IF NOT EXISTS idx_funcionarios_nome_cidade 
ON public.funcionarios(nome_cidade);

-- =====================================================
-- COMENTÁRIOS E DOCUMENTAÇÃO
-- =====================================================

COMMENT ON INDEX public.idx_funcionarios_nome_cidade IS 'Índice para otimizar consultas por cidade dos funcionários';

-- Esta migration:
-- 1. Adiciona a coluna nome_cidade (VARCHAR(100)) na tabela funcionarios
-- 2. Popula automaticamente os dados baseado na seção:
--    - SBGO → 'Goiânia'
--    - SBCF → 'Confins'
-- 3. Cria índice para performance em consultas por cidade
-- 4. Adiciona comentários para documentação
-- 5. Para futuras seções, a coluna ficará NULL até ser at