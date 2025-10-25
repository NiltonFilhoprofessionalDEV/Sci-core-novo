-- Verificar funcionários inseridos da base SBGO (Goiânia)
SELECT 
    f.nome_completo,
    f.email,
    f.cargo,
    s.nome as secao_nome,
    s.codigo as secao_codigo,
    e.nome as equipe_nome,
    f.created_at
FROM public.funcionarios f
JOIN public.secoes s ON f.secao_id = s.id
JOIN public.equipes e ON f.equipe_id = e.id
WHERE s.codigo = 'SBGO'
ORDER BY e.nome, f.nome_completo;

-- Contar funcionários por equipe da SBGO
SELECT 
    e.nome as equipe,
    COUNT(f.id) as total_funcionarios
FROM public.equipes e
LEFT JOIN public.funcionarios f ON e.id = f.equipe_id
JOIN public.secoes s ON e.secao_id = s.id
WHERE s.codigo = 'SBGO'
GROUP BY e.nome
ORDER BY e.nome;