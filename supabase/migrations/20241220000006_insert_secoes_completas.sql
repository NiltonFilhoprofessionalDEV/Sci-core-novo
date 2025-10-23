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
-- 5. BRASÍLIA
('Seção de Bombeiro de Aeródromo de Brasília', 'SBBR', 'Brasília', 'DF'),
-- 6. CAMPO DE MARTE
('Seção de Bombeiro de Aeródromo de Campo de Marte', 'SBMT', 'São Paulo', 'SP'),
-- 7. CARAJÁS
('Seção de Bombeiro de Aeródromo de Carajás', 'SBCJ', 'Parauapebas', 'PA'),
-- 8. CONFINS
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
-- 14. GOIÂNIA
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
DO $$
DECLARE
    total_secoes INTEGER;
    total_equipes INTEGER;
BEGIN
    SELECT COUNT(*) INTO total_secoes FROM public.secoes;
    SELECT COUNT(*) INTO total_equipes FROM public.equipes;
    
    RAISE NOTICE '=== RELATÓRIO DE INSERÇÃO ===';
    RAISE NOTICE 'Total de seções cadastradas: %', total_secoes;
    RAISE NOTICE 'Total de equipes cadastradas: %', total_equipes;
    RAISE NOTICE 'Migração executada com sucesso!';
END $$;

-- =====================================================
-- 4. COMENTÁRIOS E DOCUMENTAÇÃO
-- =====================================================

COMMENT ON TABLE public.secoes IS 'Seções de Bombeiro de Aeródromo - Total de 34 seções principais do Brasil';
COMMENT ON COLUMN public.secoes.codigo IS 'Código ICAO do aeroporto correspondente à seção';
COMMENT ON COLUMN public.secoes.nome IS 'Nome completo da seção de bombeiro de aeródromo';
COMMENT ON COLUMN public.secoes.cidade IS 'Cidade onde está localizada a seção';
COMMENT ON COLUMN public.secoes.estado IS 'Estado (UF) onde está localizada a seção';

-- =====================================================
-- 5. ÍNDICES ADICIONAIS PARA PERFORMANCE
-- =====================================================

-- Criar índices compostos para consultas frequentes
CREATE INDEX IF NOT EXISTS idx_secoes_estado_cidade ON public.secoes(estado, cidade);
CREATE INDEX IF NOT EXISTS idx_secoes_ativa_nome ON public.secoes(ativa, nome);

-- =====================================================
-- OBSERVAÇÕES IMPORTANTES:
-- =====================================================
-- 1. Esta migração adiciona 34 novas seções ao sistema
-- 2. Cada seção recebe 3 equipes padrão (Alfa, Bravo, Charlie)
-- 3. Os códigos ICAO são baseados nos aeroportos reais do Brasil
-- 4. A migração é idempotente - pode ser executada múltiplas vezes
-- 5. Conflitos são tratados com ON CONFLICT DO NOTHING
-- 6. Todas as seções são criadas como ativas por padrão
-- =====================================================