-- Verificar dados atuais da tabela Secoes
-- Consultar todas as seções para entender a estrutura atual
SELECT 
    id,
    nome,
    codigo,
    cidade,
    estado,
    ativa,
    created_at,
    updated_at
FROM secoes
ORDER BY cidade, nome;

-- Verificar se há registros com cidade vazia ou nula
SELECT 
    COUNT(*) as total_registros,
    COUNT(CASE WHEN cidade IS NULL OR cidade = '' THEN 1 END) as registros_sem_cidade,
    COUNT(CASE WHEN cidade IS NOT NULL AND cidade != '' THEN 1 END) as registros_com_cidade
FROM secoes;

-- Verificar valores únicos de cidade
SELECT 
    cidade,
    COUNT(*) as quantidade_secoes
FROM secoes
WHERE cidade IS NOT NULL AND cidade != ''
GROUP BY cidade
ORDER BY cidade;

-- Verificar se já existem nomes no formato "SCI - [Cidade]"
SELECT 
    nome,
    cidade,
    CASE 
        WHEN nome LIKE 'SCI - %' THEN 'Já no formato correto'
        ELSE 'Precisa ser atualizado'
    END as status_formato
FROM secoes
ORDER BY cidade, nome;