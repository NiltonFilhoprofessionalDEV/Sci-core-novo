-- Buscar IDs das equipes das seções SBGO e SBCF
SELECT 
    e.id as equipe_id,
    e.nome as equipe_nome,
    s.codigo as secao_codigo,
    s.nome as secao_nome,
    s.id as secao_id
FROM equipes e
JOIN secoes s ON e.secao_id = s.id
WHERE s.codigo IN ('SBGO', 'SBCF')
AND e.ativa = true
ORDER BY s.codigo, e.nome;