-- Query para buscar IDs da seção SBGO e suas equipes
SELECT 
    s.id as secao_id, 
    s.codigo, 
    s.nome as secao_nome, 
    e.id as equipe_id, 
    e.nome as equipe_nome 
FROM secoes s 
LEFT JOIN equipes e ON s.id = e.secao_id 
WHERE s.codigo = 'SBGO' 
ORDER BY e.nome;