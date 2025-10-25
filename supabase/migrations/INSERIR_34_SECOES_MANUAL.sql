-- =====================================================
-- INSERIR 34 SEÇÕES DE BOMBEIROS - EXECUTAR NO SUPABASE DASHBOARD
-- =====================================================
-- INSTRUÇÕES:
-- 1. Copie este código SQL
-- 2. Acesse o Supabase Dashboard > SQL Editor
-- 3. Cole o código e execute
-- =====================================================

-- Inserir as 34 seções de bombeiros
INSERT INTO public.secoes (nome, codigo, cidade, estado) VALUES
('Seção de Bombeiro de Aeródromo de Altamira', 'SBHT', 'Altamira', 'PA'),
('Seção de Bombeiro de Aeródromo de Aracaju', 'SBAR', 'Aracaju', 'SE'),
('Seção de Bombeiro de Aeródromo de Bacacheri', 'SBBI', 'Curitiba', 'PR'),
('Seção de Bombeiro de Aeródromo de Belém', 'SBBE', 'Belém', 'PA'),
('Seção de Bombeiro de Aeródromo de Brasília', 'SBBR', 'Brasília', 'DF'),
('Seção de Bombeiro de Aeródromo de Campo de Marte', 'SBMT', 'São Paulo', 'SP'),
('Seção de Bombeiro de Aeródromo de Carajás', 'SBCJ', 'Parauapebas', 'PA'),
('Seção de Bombeiro de Aeródromo de Confins', 'SBCF', 'Confins', 'MG'),
('Seção de Bombeiro de Aeródromo de Congonhas', 'SBSP', 'São Paulo', 'SP'),
('Seção de Bombeiro de Aeródromo de Cuiabá', 'SBCY', 'Cuiabá', 'MT'),
('Seção de Bombeiro de Aeródromo de Curitiba', 'SBCT', 'São José dos Pinhais', 'PR'),
('Seção de Bombeiro de Aeródromo de Florianópolis', 'SBFL', 'Florianópolis', 'SC'),
('Seção de Bombeiro de Aeródromo de Foz do Iguaçu', 'SBFI', 'Foz do Iguaçu', 'PR'),
('Seção de Bombeiro de Aeródromo de Goiânia', 'SBGO', 'Goiânia', 'GO'),
('Seção de Bombeiro de Aeródromo de Imperatriz', 'SBIZ', 'Imperatriz', 'MA'),
('Seção de Bombeiro de Aeródromo de Jacarepaguá', 'SBJR', 'Rio de Janeiro', 'RJ'),
('Seção de Bombeiro de Aeródromo de Joinville', 'SBJV', 'Joinville', 'SC'),
('Seção de Bombeiro de Aeródromo de Londrina', 'SBLO', 'Londrina', 'PR'),
('Seção de Bombeiro de Aeródromo de Macaé', 'SBME', 'Macaé', 'RJ'),
('Seção de Bombeiro de Aeródromo de Macapá', 'SBMQ', 'Macapá', 'AP'),
('Seção de Bombeiro de Aeródromo de Maceió', 'SBMO', 'Maceió', 'AL'),
('Seção de Bombeiro de Aeródromo de Marabá', 'SBMA', 'Marabá', 'PA'),
('Seção de Bombeiro de Aeródromo de Navegantes', 'SBNF', 'Navegantes', 'SC'),
('Seção de Bombeiro de Aeródromo de Palmas', 'SBPJ', 'Palmas', 'TO'),
('Seção de Bombeiro de Aeródromo de Pampulha', 'SBBH', 'Belo Horizonte', 'MG'),
('Seção de Bombeiro de Aeródromo de Pelotas', 'SBPK', 'Pelotas', 'RS'),
('Seção de Bombeiro de Aeródromo de Petrolina', 'SBPL', 'Petrolina', 'PE'),
('Seção de Bombeiro de Aeródromo de Porto Alegre', 'SBPA', 'Porto Alegre', 'RS'),
('Seção de Bombeiro de Aeródromo de Salvador', 'SBSV', 'Salvador', 'BA'),
('Seção de Bombeiro de Aeródromo de Santarém', 'SBSN', 'Santarém', 'PA'),
('Seção de Bombeiro de Aeródromo de São Luís', 'SBSL', 'São Luís', 'MA'),
('Seção de Bombeiro de Aeródromo de Sinop', 'SBSI', 'Sinop', 'MT'),
('Seção de Bombeiro de Aeródromo de Teresina', 'SBTE', 'Teresina', 'PI'),
('Seção de Bombeiro de Aeródromo de Vitória', 'SBVT', 'Vitória', 'ES')
ON CONFLICT (codigo) DO NOTHING;

-- Criar equipes padrão para cada seção (Alfa, Bravo, Charlie)
INSERT INTO public.equipes (secao_id, nome, codigo)
SELECT s.id, 'Equipe Alfa', 'ALFA' FROM public.secoes s WHERE s.codigo IN (
    'SBHT', 'SBAR', 'SBBI', 'SBBE', 'SBBR', 'SBMT', 'SBCJ', 'SBCF', 'SBSP', 'SBCY',
    'SBCT', 'SBFL', 'SBFI', 'SBGO', 'SBIZ', 'SBJR', 'SBJV', 'SBLO', 'SBME', 'SBMQ',
    'SBMO', 'SBMA', 'SBNF', 'SBPJ', 'SBBH', 'SBPK', 'SBPL', 'SBPA', 'SBSV', 'SBSN',
    'SBSL', 'SBSI', 'SBTE', 'SBVT'
)
UNION ALL
SELECT s.id, 'Equipe Bravo', 'BRAVO' FROM public.secoes s WHERE s.codigo IN (
    'SBHT', 'SBAR', 'SBBI', 'SBBE', 'SBBR', 'SBMT', 'SBCJ', 'SBCF', 'SBSP', 'SBCY',
    'SBCT', 'SBFL', 'SBFI', 'SBGO', 'SBIZ', 'SBJR', 'SBJV', 'SBLO', 'SBME', 'SBMQ',
    'SBMO', 'SBMA', 'SBNF', 'SBPJ', 'SBBH', 'SBPK', 'SBPL', 'SBPA', 'SBSV', 'SBSN',
    'SBSL', 'SBSI', 'SBTE', 'SBVT'
)
UNION ALL
SELECT s.id, 'Equipe Charlie', 'CHARLIE' FROM public.secoes s WHERE s.codigo IN (
    'SBHT', 'SBAR', 'SBBI', 'SBBE', 'SBBR', 'SBMT', 'SBCJ', 'SBCF', 'SBSP', 'SBCY',
    'SBCT', 'SBFL', 'SBFI', 'SBGO', 'SBIZ', 'SBJR', 'SBJV', 'SBLO', 'SBME', 'SBMQ',
    'SBMO', 'SBMA', 'SBNF', 'SBPJ', 'SBBH', 'SBPK', 'SBPL', 'SBPA', 'SBSV', 'SBSN',
    'SBSL', 'SBSI', 'SBTE', 'SBVT'
)
ON CONFLICT (secao_id, codigo) DO NOTHING;

-- Verificar quantas seções foram inseridas
SELECT 
    COUNT(*) as total_secoes,
    COUNT(CASE WHEN ativa = true THEN 1 END) as secoes_ativas
FROM public.secoes;

-- Verificar quantas equipes foram criadas
SELECT 
    COUNT(*) as total_equipes,
    COUNT(DISTINCT secao_id) as secoes_com_equipes
FROM public.equipes;

-- Listar todas as seções cadastradas
SELECT 
    s.nome,
    s.codigo,
    s.cidade,
    s.estado,
    COUNT(e.id) as total_equipes
FROM public.secoes s
LEFT JOIN public.equipes e ON s.id = e.secao_id
GROUP BY s.id, s.nome, s.codigo, s.cidade, s.estado
ORDER BY s.nome;

-- =====================================================
-- RESULTADO ESPERADO:
-- - 34+ seções cadastradas (incluindo as já existentes)
-- - 3 equipes por seção (Alfa, Bravo, Charlie)
-- - Total de 102+ equipes
-- =====================================================