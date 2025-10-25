-- Verificar se a seção SBGO existe
SELECT 'SECOES' as tabela, codigo, nome, id FROM public.secoes WHERE codigo = 'SBGO';

-- Verificar equipes da seção SBGO
SELECT 'EQUIPES' as tabela, e.nome, e.id, s.codigo as secao_codigo 
FROM public.equipes e 
JOIN public.secoes s ON e.secao_id = s.id 
WHERE s.codigo = 'SBGO' 
ORDER BY e.nome;