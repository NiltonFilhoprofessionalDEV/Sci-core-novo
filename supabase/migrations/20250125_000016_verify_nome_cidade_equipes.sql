-- Verificação da coluna nome_cidade na tabela equipes
-- Esta migration verifica se a coluna foi adicionada corretamente e se os dados foram populados

-- Verificar se a coluna nome_cidade existe na tabela equipes
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_schema = 'public' 
    AND table_name = 'equipes' 
    AND column_name = 'nome_cidade';

-- Verificar a distribuição dos dados na coluna nome_cidade
SELECT 
    nome_cidade,
    COUNT(*) as total_equipes
FROM public.equipes 
GROUP BY nome_cidade
ORDER BY nome_cidade;

-- Verificar se todas as equipes têm nome_cidade preenchido
SELECT 
    COUNT(*) as total_equipes,
    COUNT(nome_cidade) as equipes_com_cidade,
    COUNT(*) - COUNT(nome_cidade) as equipes_sem_cidade
FROM public.equipes;

-- Verificar a relação entre seção e nome_cidade
SELECT 
    s.nome as secao_nome,
    s.codigo as secao_codigo,
    e.nome_cidade,
    COUNT(e.id) as total_equipes
FROM public.equipes e
JOIN public.secoes s ON e.secao_id = s.id
GROUP BY s.nome, s.codigo, e.nome_cidade
ORDER BY s.codigo, e.nome_cidade;

-- Verificar se existe o índice na coluna nome_cidade
SELECT 
    indexname,
    indexdef
FROM pg_indexes 
WHERE tablename = 'equipes' 
    AND indexdef LIKE '%nome_cidade%';