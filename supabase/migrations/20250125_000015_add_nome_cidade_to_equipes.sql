-- =====================================================
-- MIGRATION: Adicionar coluna nome_cidade na tabela equipes
-- Data: 2025-01-25
-- Descrição: Adicionar coluna nome_cidade e popular com dados
--           das cidades baseado na seção à qual cada equipe pertence
-- =====================================================

-- Adicionar coluna nome_cidade na tabela equipes
ALTER TABLE public.equipes 
ADD COLUMN nome_cidade VARCHAR(100);

-- Adicionar comentário na coluna
COMMENT ON COLUMN public.equipes.nome_cidade IS 'Nome da cidade onde a equipe está localizada, baseado na seção/base';

-- Popular a coluna nome_cidade baseado na seção
DO $$
DECLARE
    total_updated INTEGER := 0;
    sbgo_count INTEGER := 0;
    sbcf_count INTEGER := 0;
BEGIN
    -- Atualizar equipes da seção SBGO (Goiânia)
    UPDATE public.equipes 
    SET nome_cidade = 'Goiânia'
    FROM public.secoes s
    WHERE equipes.secao_id = s.id 
    AND s.codigo = 'SBGO';
    
    GET DIAGNOSTICS sbgo_count = ROW_COUNT;
    
    -- Atualizar equipes da seção SBCF (Confins)
    UPDATE public.equipes 
    SET nome_cidade = 'Confins'
    FROM public.secoes s
    WHERE equipes.secao_id = s.id 
    AND s.codigo = 'SBCF';
    
    GET DIAGNOSTICS sbcf_count = ROW_COUNT;
    
    total_updated := sbgo_count + sbcf_count;
    
    -- Log dos resultados
    RAISE NOTICE '=== ATUALIZAÇÃO DA COLUNA NOME_CIDADE (EQUIPES) ===';
    RAISE NOTICE 'Equipes SBGO (Goiânia) atualizadas: %', sbgo_count;
    RAISE NOTICE 'Equipes SBCF (Confins) atualizadas: %', sbcf_count;
    RAISE NOTICE 'Total de equipes atualizadas: %', total_updated;
    
    IF total_updated > 0 THEN
        RAISE NOTICE '✅ SUCESSO: Coluna nome_cidade populada com sucesso na tabela equipes!';
    ELSE
        RAISE NOTICE '⚠️  ATENÇÃO: Nenhuma equipe foi atualizada';
    END IF;
    
    RAISE NOTICE '=== FIM DA ATUALIZAÇÃO ===';
    
END $$;

-- Criar índice na coluna nome_cidade para melhor performance
CREATE INDEX IF NOT EXISTS idx_equipes_nome_cidade 
ON public.equipes(nome_cidade);

-- =====================================================
-- COMENTÁRIOS E DOCUMENTAÇÃO
-- =====================================================

COMMENT ON INDEX public.idx_equipes_nome_cidade IS 'Índice para otimizar consultas por cidade das equipes';

-- Esta migration:
-- 1. Adiciona a coluna nome_cidade (VARCHAR(100)) na tabela equipes
-- 2. Popula automaticamente os dados baseado na seção:
--    - SBGO → 'Goiânia'
--    - SBCF → 'Confins'
-- 3. Cria índice para performance em consultas por cidade
-- 4. Adiciona comentários para documentação
-- 5. Para futuras seções, a coluna ficará NULL até ser atualizada manualmente
-- 6. Segue o mesmo padrão implementado na tabela funcionarios