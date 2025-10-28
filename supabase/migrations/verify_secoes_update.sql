-- Verificação final dos resultados da atualização das seções
-- Data: 2025-01-25

-- Mostrar todas as seções após a atualização
SELECT 
    'RESULTADO FINAL' as status,
    id,
    nome,
    cidade,
    codigo,
    estado,
    ativa,
    updated_at
FROM secoes
ORDER BY cidade, nome;

-- Estatísticas da atualização
SELECT 
    'ESTATÍSTICAS' as status,
    COUNT(*) as total_secoes,
    COUNT(CASE WHEN nome LIKE 'SCI - %' THEN 1 END) as secoes_formato_correto,
    COUNT(CASE WHEN nome NOT LIKE 'SCI - %' THEN 1 END) as secoes_formato_incorreto,
    COUNT(CASE WHEN nome LIKE 'SCI - % (%)' THEN 1 END) as secoes_numeradas
FROM secoes;

-- Verificar se há nomes duplicados
SELECT 
    'VERIFICAÇÃO DUPLICATAS' as status,
    nome,
    COUNT(*) as quantidade
FROM secoes 
GROUP BY nome 
HAVING COUNT(*) > 1
ORDER BY nome;

-- Mostrar seções por cidade
SELECT 
    'SEÇÕES POR CIDADE' as status,
    cidade,
    COUNT(*) as quantidade_secoes,
    STRING_AGG(nome, '; ' ORDER BY nome) as nomes_secoes
FROM secoes
GROUP BY cidade
ORDER BY cidade;