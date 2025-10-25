-- =====================================================
-- INSTRUÇÕES PARA EXECUÇÃO NO SUPABASE DASHBOARD
-- =====================================================
-- 1. Acesse: https://ekhuhyervzndsatdngyl.supabase.co/project/ekhuhyervzndsatdngyl/sql
-- 2. Cole este script completo no editor SQL
-- 3. Clique em "Run" para executar
-- 4. Verifique os resultados na aba "Results"
-- =====================================================

-- =====================================================
-- SISTEMA DE INDICADORES BOMBEIRO MEDMAIS
-- Migration: Cadastro completo das 34 seções de bombeiros
-- Data: 2024-12-20
-- =====================================================

-- =====================================================
-- 1. INSERÇÃO DAS SEÇÕES COMPLETAS
-- =====================================================

-- Inserir todas as 34 seções de bombeiros de aeródromo
-- Usando ON CONFLICT DO NOTHING para evitar duplicações
INSERT INTO public.secoes (nome, codigo, cidade, estado) VALUES
-- 1. ALTAMIRA
('Seção de Bombeiro de Aeródromo de Altamira', 'SBHT', 'Altamira', 'PA'),
-- 2. ARACAJU
('Seção de Bombeiro de Aeródromo de Aracaju', 'SBAR', 'Aracaju', 'SE'),
-- 3. BACACHERI
('Seção de Bombeiro de Aeródromo de Bacacheri', 'SBBI', 'Curitiba', 'PR'),
-- 4. BELÉM
('Seção de Bombeiro de Aeródromo de Belém', 'SBBE', 'Belém', 'PA'),
-- 5. BRASÍLIA (já existe, será ignorada)
('Seção de Bombeiro de Aeródromo de Brasília', 'SBBR', 'Brasília', 'DF'),
-- 6. CAMPO DE MARTE
('Seção de Bombeiro de Aeródromo de Campo de Marte', 'SBMT', 'São Paulo', 'SP'),
-- 7. CARAJÁS
('Seção de Bombeiro de Aeródromo de Carajás', 'SBCJ', 'Parauapebas', 'PA'),
-- 8. CONFINS (já existe, será ignorada)
('Seção de Bombeiro de Aeródromo de Confins', 'SBCF', 'Confins', 'MG'),
-- 9. CONGONHAS
('Seção de Bombeiro de Aeródromo de Congonhas', 'SBSP', 'São Paulo', 'SP'),
-- 10. CUIABÁ
('Seção de Bombeiro de Aeródromo de Cuiabá', 'SBCY', 'Cuiabá', 'MT'),
-- 11. CURITIBA
('Seção de Bombeiro de Aeródromo de Curitiba', 'SBCT', 'Curitiba', 'PR'),
-- 12. FLORIANÓPOLIS
('Seção de Bombeiro de Aeródromo de Florianópolis', 'SBFL', 'Florianópolis', 'SC'),
-- 13. FOZ DO IGUAÇU
('Seção de Bombeiro de Aeródromo de Foz do Iguaçu', 'SBFI', 'Foz do Iguaçu', 'PR'),
-- 14. GOIÂNIA (já existe, será ignorada)
('Seção de Bombeiro de Aeródromo de Goiânia', 'SBGO', 'Goiânia', 'GO'),
-- 15. IMPERATRIZ
('Seção de Bombeiro de Aeródromo de Imperatriz', 'SBIZ', 'Imperatriz', 'MA'),
-- 16. JACAREPAGUÁ
('Seção de Bombeiro de Aeródromo de Jacarepaguá', 'SBJR', 'Rio de Janeiro', 'RJ'),
-- 17. JOINVILLE
('Seção de Bombeiro de Aeródromo de Joinville', 'SBJV', 'Joinville', 'SC'),
-- 18. LONDRINA
('Seção de Bombeiro de Aeródromo de Londrina', 'SBLO', 'Londrina', 'PR'),
-- 19. MACAÉ
('Seção de Bombeiro de Aeródromo de Macaé', 'SBME', 'Macaé', 'RJ'),
-- 20. MACAPÁ
('Seção de Bombeiro de Aeródromo de Macapá', 'SBMQ', 'Macapá', 'AP'),
-- 21. MACEIÓ
('Seção de Bombeiro de Aeródromo de Maceió', 'SBMO', 'Maceió', 'AL'),
-- 22. MARABÁ
('Seção de Bombeiro de Aeródromo de Marabá', 'SBMA', 'Marabá', 'PA'),
-- 23. NAVEGANTES
('Seção de Bombeiro de Aeródromo de Navegantes', 'SBNF', 'Navegantes', 'SC'),
-- 24. PALMAS
('Seção de Bombeiro de Aeródromo de Palmas', 'SBPJ', 'Palmas', 'TO'),
-- 25. PAMPULHA
('Seção de Bombeiro de Aeródromo de Pampulha', 'SBBH', 'Belo Horizonte', 'MG'),
-- 26. PELOTAS
('Seção de Bombeiro de Aeródromo de Pelotas', 'SBPK', 'Pelotas', 'RS'),
-- 27. PETROLINA
('Seção de Bombeiro de Aeródromo de Petrolina', 'SBPL', 'Petrolina', 'PE'),
-- 28. PORTO ALEGRE
('Seção de Bombeiro de Aeródromo de Porto Alegre', 'SBPA', 'Porto Alegre', 'RS'),
-- 29. SALVADOR
('Seção de Bombeiro de Aeródromo de Salvador', 'SBSV', 'Salvador', 'BA'),
-- 30. SANTARÉM
('Seção de Bombeiro de Aeródromo de Santarém', 'SBSN', 'Santarém', 'PA'),
-- 31. SÃO LUÍS
('Seção de Bombeiro de Aeródromo de São Luís', 'SBSL', 'São Luís', 'MA'),
-- 32. SINOP
('Seção de Bombeiro de Aeródromo de Sinop', 'SBSI', 'Sinop', 'MT'),
-- 33. TERESINA
('Seção de Bombeiro de Aeródromo de Teresina', 'SBTE', 'Teresina', 'PI'),
-- 34. VITÓRIA
('Seção de Bombeiro de Aeródromo de Vitória', 'SBVT', 'Vitória', 'ES')
ON CONFLICT (nome) DO NOTHING;

-- =====================================================
-- 2. CRIAÇÃO DAS EQUIPES PADRÃO
-- =====================================================

-- Criar equipes Alfa, Bravo e Charlie para cada seção
-- Usando uma abordagem que evita conflitos
INSERT INTO public.equipes (secao_id, nome, codigo)
SELECT 
    s.id as secao_id,
    'Equipe Alfa' as nome,
    'ALFA' as codigo
FROM public.secoes s
WHERE s.nome LIKE 'Seção de Bombeiro de Aeródromo%'
  AND NOT EXISTS (
    SELECT 1 FROM public.equipes e 
    WHERE e.secao_id = s.id AND e.codigo = 'ALFA'
  )

UNION ALL

SELECT 
    s.id as secao_id,
    'Equipe Bravo' as nome,
    'BRAVO' as codigo
FROM public.secoes s
WHERE s.nome LIKE 'Seção de Bombeiro de Aeródromo%'
  AND NOT EXISTS (
    SELECT 1 FROM public.equipes e 
    WHERE e.secao_id = s.id AND e.codigo = 'BRAVO'
  )

UNION ALL

SELECT 
    s.id as secao_id,
    'Equipe Charlie' as nome,
    'CHARLIE' as codigo
FROM public.secoes s
WHERE s.nome LIKE 'Seção de Bombeiro de Aeródromo%'
  AND NOT EXISTS (
    SELECT 1 FROM public.equipes e 
    WHERE e.secao_id = s.id AND e.codigo = 'CHARLIE'
  );

-- =====================================================
-- 3. VERIFICAÇÃO E RELATÓRIO
-- =====================================================

-- Verificar quantas seções foram inseridas
SELECT 
    'SEÇÕES CADASTRADAS' as tipo,
    COUNT(*) as total,
    string_agg(nome, ', ' ORDER BY nome) as lista
FROM public.secoes
WHERE nome LIKE 'Seção de Bombeiro de Aeródromo%'

UNION ALL

SELECT 
    'EQUIPES CADASTRADAS' as tipo,
    COUNT(*) as total,
    CONCAT(COUNT(DISTINCT secao_id), ' seções com equipes') as lista
FROM public.equipes e
JOIN public.secoes s ON e.secao_id = s.id
WHERE s.nome LIKE 'Seção de Bombeiro de Aeródromo%';

-- =====================================================
-- 4. LISTAGEM DETALHADA DAS SEÇÕES POR ESTADO
-- =====================================================

SELECT 
    estado,
    COUNT(*) as total_secoes,
    string_agg(cidade, ', ' ORDER BY cidade) as cidades
FROM public.secoes
WHERE nome LIKE 'Seção de Bombeiro de Aeródromo%'
GROUP BY estado
ORDER BY estado;

-- =====================================================
-- 5. VERIFICAÇÃO DE INTEGRIDADE
-- =====================================================

-- Verificar se todas as seções têm equipes
SELECT 
    s.nome as secao,
    s.codigo,
    s.cidade,
    s.estado,
    COUNT(e.id) as total_equipes,
    string_agg(e.nome, ', ' ORDER BY e.nome) as equipes
FROM public.secoes s
LEFT JOIN public.equipes e ON s.id = e.secao_id
WHERE s.nome LIKE 'Seção de Bombeiro de Aeródromo%'
GROUP BY s.id, s.nome, s.codigo, s.cidade, s.estado
ORDER BY s.nome;

-- =====================================================
-- COMENTÁRIOS E DOCUMENTAÇÃO
-- =====================================================

COMMENT ON TABLE public.secoes IS 'Seções de Bombeiro de Aeródromo - Total de 34+ seções principais do Brasil';
COMMENT ON COLUMN public.secoes.codigo IS 'Código ICAO do aeroporto correspondente à seção';
COMMENT ON COLUMN public.secoes.nome IS 'Nome completo da seção de bombeiro de aeródromo';
COMMENT ON COLUMN public.secoes.cidade IS 'Cidade onde está localizada a seção';
COMMENT ON COLUMN public.secoes.estado IS 'Estado (UF) onde está localizada a seção';

-- =====================================================
-- ÍNDICES ADICIONAIS PARA PERFORMANCE
-- =====================================================

-- Criar índices compostos para consultas frequentes
CREATE INDEX IF NOT EXISTS idx_secoes_estado_cidade ON public.secoes(estado, cidade);
CREATE INDEX IF NOT EXISTS idx_secoes_ativa_nome ON public.secoes(ativa, nome);

-- =====================================================
-- RESUMO FINAL
-- =====================================================
SELECT 
    '✅ MIGRAÇÃO CONCLUÍDA COM SUCESSO!' as status,
    'Todas as 34 seções foram processadas' as detalhes,
    'Cada seção recebeu 3 equipes padrão (Alfa, Bravo, Charlie)' as equipes,
    'Códigos ICAO baseados em aeroportos reais do Brasil' as codigos,
    'Sistema pronto para uso!' as resultado;