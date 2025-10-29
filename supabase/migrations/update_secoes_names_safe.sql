-- Migração SEGURA para atualizar nomes das seções para o formato "SCI - [Cidade]"
-- Data: 2025-01-25
-- Descrição: Atualiza o campo 'nome' de todas as seções para seguir o padrão "SCI - [Cidade]"
-- Versão segura que lida com possíveis duplicatas

-- Primeiro, vamos verificar os dados atuais e identificar possíveis problemas
DO $$
DECLARE
    total_secoes INTEGER;
    secoes_sem_cidade INTEGER;
    secoes_com_cidade INTEGER;
    possivel_duplicatas INTEGER;
BEGIN
    -- Contar registros
    SELECT COUNT(*) INTO total_secoes FROM secoes;
    SELECT COUNT(*) INTO secoes_sem_cidade FROM secoes WHERE cidade IS NULL OR cidade = '';
    SELECT COUNT(*) INTO secoes_com_cidade FROM secoes WHERE cidade IS NOT NULL AND cidade != '';
    
    -- Verificar possíveis duplicatas após a conversão
    SELECT COUNT(*) INTO possivel_duplicatas 
    FROM (
        SELECT 'SCI - ' || cidade as novo_nome, COUNT(*) 
        FROM secoes 
        WHERE cidade IS NOT NULL AND cidade != ''
        GROUP BY cidade 
        HAVING COUNT(*) > 1
    ) duplicados;
    
    RAISE NOTICE 'VERIFICAÇÃO INICIAL:';
    RAISE NOTICE 'Total de seções: %', total_secoes;
    RAISE NOTICE 'Seções sem cidade: %', secoes_sem_cidade;
    RAISE NOTICE 'Seções com cidade: %', secoes_com_cidade;
    RAISE NOTICE 'Cidades com múltiplas seções (possíveis duplicatas): %', possivel_duplicatas;
    
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
    codigo,
    id
FROM secoes
ORDER BY cidade, nome;

-- Verificar se há cidades com múltiplas seções
SELECT 
    cidade,
    COUNT(*) as quantidade_secoes,
    STRING_AGG(nome, ', ') as nomes_atuais
FROM secoes
WHERE cidade IS NOT NULL AND cidade != ''
GROUP BY cidade
HAVING COUNT(*) > 1
ORDER BY cidade;

-- Estratégia segura: atualizar apenas seções que não causarão conflito
-- Para cidades com múltiplas seções, vamos numerá-las
DO $$
DECLARE
    rec RECORD;
    contador INTEGER;
    novo_nome TEXT;
BEGIN
    -- Para cada cidade, processar suas seções
    FOR rec IN 
        SELECT cidade, COUNT(*) as total_secoes
        FROM secoes 
        WHERE cidade IS NOT NULL AND cidade != ''
        GROUP BY cidade
        ORDER BY cidade
    LOOP
        contador := 0;
        
        -- Se há apenas uma seção para esta cidade
        IF rec.total_secoes = 1 THEN
            UPDATE secoes 
            SET 
                nome = 'SCI - ' || rec.cidade,
                updated_at = NOW()
            WHERE 
                cidade = rec.cidade
                AND nome != 'SCI - ' || rec.cidade;
            
            RAISE NOTICE 'Atualizada seção única para cidade: %', rec.cidade;
        ELSE
            -- Se há múltiplas seções para esta cidade, numerá-las
            FOR secao_rec IN 
                SELECT id, nome, codigo
                FROM secoes 
                WHERE cidade = rec.cidade
                ORDER BY codigo, nome
            LOOP
                contador := contador + 1;
                novo_nome := 'SCI - ' || rec.cidade || ' (' || contador || ')';
                
                UPDATE secoes 
                SET 
                    nome = novo_nome,
                    updated_at = NOW()
                WHERE id = secao_rec.id;
                
                RAISE NOTICE 'Atualizada seção % para cidade %: % -> %', contador, rec.cidade, secao_rec.nome, novo_nome;
            END LOOP;
        END IF;
    END LOOP;
END $$;

-- Mostrar dados após a atualização
SELECT 
    'APÓS A ATUALIZAÇÃO' as status,
    nome,
    cidade,
    codigo,
    id
FROM secoes
ORDER BY cidade, nome;

-- Verificação final - garantir que não há nomes duplicados
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
        RAISE WARNING 'ERRO: Ainda existem % nomes duplicados após a atualização', nomes_duplicados;
        
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
        RAISE NOTICE 'SUCESSO: Não há nomes duplicados';
    END IF;
END $$;

-- Verificação final - mostrar estatísticas
DO $$
DECLARE
    total_atualizadas INTEGER;
    formato_correto INTEGER;
BEGIN
    SELECT COUNT(*) INTO total_atualizadas FROM secoes;
    SELECT COUNT(*) INTO formato_correto FROM secoes WHERE nome LIKE 'SCI - %';
    
    RAISE NOTICE 'ESTATÍSTICAS FINAIS:';
    RAISE NOTICE 'Total de seções: %', total_atualizadas;
    RAISE NOTICE 'Seções no formato "SCI - ...": %', formato_correto;
    RAISE NOTICE 'Migração concluída com sucesso!';
END $$;