-- Migração FINAL para atualizar nomes das seções para o formato "SCI - [Cidade]"
-- Data: 2025-01-25
-- Descrição: Atualiza o campo 'nome' de todas as seções para seguir o padrão "SCI - [Cidade]"
-- Versão corrigida que lida com possíveis duplicatas

-- Primeiro, vamos verificar os dados atuais
SELECT 
    'VERIFICAÇÃO INICIAL' as status,
    COUNT(*) as total_secoes,
    COUNT(CASE WHEN cidade IS NULL OR cidade = '' THEN 1 END) as secoes_sem_cidade,
    COUNT(CASE WHEN cidade IS NOT NULL AND cidade != '' THEN 1 END) as secoes_com_cidade
FROM secoes;

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
    'ANÁLISE DE DUPLICATAS' as status,
    cidade,
    COUNT(*) as quantidade_secoes,
    STRING_AGG(nome, ', ') as nomes_atuais
FROM secoes
WHERE cidade IS NOT NULL AND cidade != ''
GROUP BY cidade
HAVING COUNT(*) > 1
ORDER BY cidade;

-- Estratégia: Remover temporariamente a constraint unique, fazer update, depois recriar
-- Primeiro, vamos ver se a constraint existe
SELECT 
    'CONSTRAINTS ATUAIS' as status,
    conname as constraint_name,
    pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint 
WHERE conrelid = 'secoes'::regclass 
AND contype = 'u';

-- Remover a constraint unique temporariamente
ALTER TABLE secoes DROP CONSTRAINT IF EXISTS secoes_nome_key;

-- Agora fazer a atualização simples
UPDATE secoes 
SET 
    nome = 'SCI - ' || cidade,
    updated_at = NOW()
WHERE 
    cidade IS NOT NULL 
    AND cidade != ''
    AND nome != 'SCI - ' || cidade;

-- Verificar se há duplicatas após a atualização
SELECT 
    'VERIFICAÇÃO DE DUPLICATAS PÓS-UPDATE' as status,
    nome,
    COUNT(*) as quantidade
FROM secoes 
GROUP BY nome 
HAVING COUNT(*) > 1
ORDER BY nome;

-- Se houver duplicatas, vamos numerá-las
DO $$
DECLARE
    rec RECORD;
    contador INTEGER;
    novo_nome TEXT;
BEGIN
    -- Para cada nome duplicado, numerar as ocorrências
    FOR rec IN 
        SELECT nome, COUNT(*) as total
        FROM secoes 
        GROUP BY nome 
        HAVING COUNT(*) > 1
        ORDER BY nome
    LOOP
        contador := 0;
        
        -- Atualizar cada ocorrência deste nome duplicado
        FOR secao_id IN 
            SELECT id
            FROM secoes 
            WHERE nome = rec.nome
            ORDER BY codigo, id
        LOOP
            contador := contador + 1;
            
            -- Manter o primeiro sem numeração, numerar os demais
            IF contador > 1 THEN
                novo_nome := rec.nome || ' (' || contador || ')';
                
                UPDATE secoes 
                SET 
                    nome = novo_nome,
                    updated_at = NOW()
                WHERE id = secao_id;
                
                RAISE NOTICE 'Renomeada seção duplicada: % -> %', rec.nome, novo_nome;
            END IF;
        END LOOP;
    END LOOP;
END $$;

-- Verificar novamente se ainda há duplicatas
SELECT 
    'VERIFICAÇÃO FINAL DE DUPLICATAS' as status,
    nome,
    COUNT(*) as quantidade
FROM secoes 
GROUP BY nome 
HAVING COUNT(*) > 1
ORDER BY nome;

-- Recriar a constraint unique
ALTER TABLE secoes ADD CONSTRAINT secoes_nome_key UNIQUE (nome);

-- Mostrar dados após a atualização
SELECT 
    'APÓS A ATUALIZAÇÃO' as status,
    nome,
    cidade,
    codigo,
    id
FROM secoes
ORDER BY cidade, nome;

-- Estatísticas finais
SELECT 
    'ESTATÍSTICAS FINAIS' as status,
    COUNT(*) as total_secoes,
    COUNT(CASE WHEN nome LIKE 'SCI - %' THEN 1 END) as secoes_formato_correto,
    COUNT(CASE WHEN nome NOT LIKE 'SCI - %' THEN 1 END) as secoes_formato_incorreto
FROM secoes;