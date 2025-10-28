-- Migração SIMPLES para atualizar nomes das seções para o formato "SCI - [Cidade]"
-- Data: 2025-01-25
-- Descrição: Atualiza o campo 'nome' de todas as seções para seguir o padrão "SCI - [Cidade]"

-- Verificação inicial
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
    codigo
FROM secoes
ORDER BY cidade, nome;

-- Verificar possíveis duplicatas
SELECT 
    'POSSÍVEIS DUPLICATAS' as status,
    cidade,
    COUNT(*) as quantidade_secoes
FROM secoes
WHERE cidade IS NOT NULL AND cidade != ''
GROUP BY cidade
HAVING COUNT(*) > 1
ORDER BY cidade;

-- Remover constraint unique temporariamente
ALTER TABLE secoes DROP CONSTRAINT IF EXISTS secoes_nome_key;

-- Fazer a atualização básica
UPDATE secoes 
SET 
    nome = 'SCI - ' || cidade,
    updated_at = NOW()
WHERE 
    cidade IS NOT NULL 
    AND cidade != '';

-- Verificar duplicatas após update
SELECT 
    'DUPLICATAS APÓS UPDATE' as status,
    nome,
    COUNT(*) as quantidade,
    STRING_AGG(codigo, ', ') as codigos
FROM secoes 
GROUP BY nome 
HAVING COUNT(*) > 1
ORDER BY nome;

-- Corrigir duplicatas manualmente usando ROW_NUMBER
WITH secoes_numeradas AS (
    SELECT 
        id,
        nome,
        cidade,
        codigo,
        ROW_NUMBER() OVER (PARTITION BY nome ORDER BY codigo, id) as rn
    FROM secoes
    WHERE nome LIKE 'SCI - %'
)
UPDATE secoes 
SET 
    nome = CASE 
        WHEN sn.rn = 1 THEN sn.nome
        ELSE sn.nome || ' (' || sn.rn || ')'
    END,
    updated_at = NOW()
FROM secoes_numeradas sn
WHERE secoes.id = sn.id
AND sn.rn > 1;

-- Verificar se ainda há duplicatas
SELECT 
    'VERIFICAÇÃO FINAL DUPLICATAS' as status,
    nome,
    COUNT(*) as quantidade
FROM secoes 
GROUP BY nome 
HAVING COUNT(*) > 1
ORDER BY nome;

-- Recriar constraint unique
ALTER TABLE secoes ADD CONSTRAINT secoes_nome_key UNIQUE (nome);

-- Mostrar resultado final
SELECT 
    'RESULTADO FINAL' as status,
    nome,
    cidade,
    codigo
FROM secoes
ORDER BY cidade, nome;

-- Estatísticas finais
SELECT 
    'ESTATÍSTICAS FINAIS' as status,
    COUNT(*) as total_secoes,
    COUNT(CASE WHEN nome LIKE 'SCI - %' THEN 1 END) as secoes_formato_correto,
    COUNT(CASE WHEN nome NOT LIKE 'SCI - %' THEN 1 END) as secoes_formato_incorreto
FROM secoes;