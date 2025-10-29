-- Migração para atualizar nomes das seções para o formato "SCI - [Cidade]"
-- Data: 2025-01-25
-- Descrição: Atualiza o campo 'nome' de todas as seções para seguir o padrão "SCI - [Cidade]"

-- Primeiro, vamos verificar os dados atuais
DO $$
DECLARE
    total_secoes INTEGER;
    secoes_sem_cidade INTEGER;
    secoes_com_cidade INTEGER;
BEGIN
    -- Contar registros
    SELECT COUNT(*) INTO total_secoes FROM secoes;
    SELECT COUNT(*) INTO secoes_sem_cidade FROM secoes WHERE cidade IS NULL OR cidade = '';
    SELECT COUNT(*) INTO secoes_com_cidade FROM secoes WHERE cidade IS NOT NULL AND cidade != '';
    
    RAISE NOTICE 'VERIFICAÇÃO INICIAL:';
    RAISE NOTICE 'Total de seções: %', total_secoes;
    RAISE NOTICE 'Seções sem cidade: %', secoes_sem_cidade;
    RAISE NOTICE 'Seções com cidade: %', secoes_com_cidade;
    
    -- Se houver seções sem cidade, interromper o processo
    IF secoes_sem_cidade > 0 THEN
        RAISE EXCEPTION 'ERRO: Existem % seções com campo cidade vazio ou nulo. Corrija estes dados antes de prosseguir.', secoes_sem_cidade;
    END IF;
    
    RAISE NOTICE 'Validação inicial passou. Prosseguindo com a atualização...';
END $$;

-- Mostrar dados antes da atualização
SELECT 
    'ANTES DA ATUALIZAÇÃO' as status,
    nome,
    cidade,
    codigo
FROM secoes
ORDER BY cidade, nome;

-- Realizar a atualização dos nomes
UPDATE secoes 
SET 
    nome = 'SCI - ' || cidade,
    updated_at = NOW()
WHERE 
    cidade IS NOT NULL 
    AND cidade != ''
    AND nome != 'SCI - ' || cidade;  -- Evitar atualizações desnecessárias

-- Verificar quantos registros foram atualizados
DO $$
DECLARE
    registros_atualizados INTEGER;
BEGIN
    GET DIAGNOSTICS registros_atualizados = ROW_COUNT;
    RAISE NOTICE 'Registros atualizados: %', registros_atualizados;
END $$;

-- Mostrar dados após a atualização
SELECT 
    'APÓS A ATUALIZAÇÃO' as status,
    nome,
    cidade,
    codigo
FROM secoes
ORDER BY cidade, nome;

-- Verificação final - garantir que todos os nomes estão no formato correto
DO $$
DECLARE
    nomes_incorretos INTEGER;
BEGIN
    SELECT COUNT(*) INTO nomes_incorretos 
    FROM secoes 
    WHERE nome != 'SCI - ' || cidade;
    
    IF nomes_incorretos > 0 THEN
        RAISE WARNING 'ATENÇÃO: Ainda existem % seções com nomes que não seguem o padrão "SCI - [Cidade]"', nomes_incorretos;
        
        -- Mostrar quais são
        RAISE NOTICE 'Seções com nomes incorretos:';
        FOR rec IN 
            SELECT nome, cidade 
            FROM secoes 
            WHERE nome != 'SCI - ' || cidade
        LOOP
            RAISE NOTICE 'Nome: %, Cidade: %', rec.nome, rec.cidade;
        END LOOP;
    ELSE
        RAISE NOTICE 'SUCESSO: Todas as seções agora seguem o padrão "SCI - [Cidade]"';
    END IF;
END $$;

-- Verificação de integridade - garantir que não há nomes duplicados
DO $$
DECLARE
    nomes_duplicados INTEGER;
BEGIN
    SELECT COUNT(*) INTO nomes_duplicados 
    FROM (
        SELECT nome, COUNT(*) 
        FROM secoes 
        GROUP BY nome 
        HAVING COUNT(*) > 1
    ) duplicados;
    
    IF nomes_duplicados > 0 THEN
        RAISE WARNING 'ATENÇÃO: Existem % nomes duplicados após a atualização', nomes_duplicados;
        
        -- Mostrar os duplicados
        FOR rec IN 
            SELECT nome, COUNT(*) as quantidade
            FROM secoes 
            GROUP BY nome 
            HAVING COUNT(*) > 1
        LOOP
            RAISE NOTICE 'Nome duplicado: % (% ocorrências)', rec.nome, rec.quantidade;
        END LOOP;
    ELSE
        RAISE NOTICE 'VERIFICAÇÃO: Não há nomes duplicados';
    END IF;
END $$;