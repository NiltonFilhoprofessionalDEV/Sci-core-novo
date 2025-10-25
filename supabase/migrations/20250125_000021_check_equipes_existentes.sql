-- Verificar quais equipes existem para as seções SBGO e SBCF
SELECT 
    s.codigo as secao_codigo,
    s.nome as secao_nome,
    e.nome as equipe_nome,
    e.id as equipe_id,
    e.ativa
FROM secoes s
LEFT JOIN equipes e ON s.id = e.secao_id
WHERE s.codigo IN ('SBGO', 'SBCF')
ORDER BY s.codigo, e.nome;