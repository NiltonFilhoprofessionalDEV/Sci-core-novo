-- Remover coluna codigo da tabela equipes
-- Esta migration remove a coluna codigo que não é mais necessária

-- Verificar se existem índices na coluna codigo antes de remover
DO $$
DECLARE
    index_count INTEGER;
BEGIN
    -- Contar índices que usam a coluna codigo
    SELECT COUNT(*)
    INTO index_count
    FROM pg_indexes 
    WHERE tablename = 'equipes' 
        AND indexdef LIKE '%codigo%';
    
    -- Se existirem índices, removê-los primeiro
    IF index_count > 0 THEN
        RAISE NOTICE 'Encontrados % índices relacionados à coluna codigo. Removendo...', index_count;
        
        -- Remover índices específicos se existirem
        DROP INDEX IF EXISTS idx_equipes_codigo;
        DROP INDEX IF EXISTS equipes_codigo_idx;
        DROP INDEX IF EXISTS idx_equipes_secao_codigo;
        
        RAISE NOTICE 'Índices relacionados à coluna codigo removidos.';
    ELSE
        RAISE NOTICE 'Nenhum índice encontrado na coluna codigo.';
    END IF;
END $$;

-- Remover a coluna codigo da tabela equipes
ALTER TABLE public.equipes 
DROP COLUMN IF EXISTS codigo;

-- Verificar se a coluna foi removida com sucesso
DO $$
DECLARE
    column_exists BOOLEAN;
BEGIN
    SELECT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
            AND table_name = 'equipes' 
            AND column_name = 'codigo'
    ) INTO column_exists;
    
    IF column_exists THEN
        RAISE EXCEPTION 'Erro: A coluna codigo ainda existe na tabela equipes';
    ELSE
        RAISE NOTICE 'Sucesso: A coluna codigo foi removida da tabela equipes';
    END IF;
END $$;