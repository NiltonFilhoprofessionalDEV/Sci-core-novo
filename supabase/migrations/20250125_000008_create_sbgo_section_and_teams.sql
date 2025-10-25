-- =====================================================
-- MIGRATION: Criar seção SBGO e suas equipes se não existirem
-- Data: 2025-01-25
-- Descrição: Garantir que a seção SBGO (Goiânia) e suas equipes
--           ALFA, BRAVO, CHARLIE e DELTA existam antes de inserir funcionários
-- =====================================================

-- Inserir seção SBGO se não existir
INSERT INTO public.secoes (nome, codigo, cidade, estado, ativa)
SELECT 'Seção de Bombeiro de Aeródromo de Goiânia', 'SBGO', 'Goiânia', 'GO', true
WHERE NOT EXISTS (
    SELECT 1 FROM public.secoes WHERE codigo = 'SBGO'
);

-- Inserir equipes da seção SBGO se não existirem
DO $$
DECLARE
    sbgo_secao_id uuid;
BEGIN
    -- Buscar ID da seção SBGO
    SELECT id INTO sbgo_secao_id FROM public.secoes WHERE codigo = 'SBGO';
    
    IF sbgo_secao_id IS NULL THEN
        RAISE EXCEPTION 'Seção SBGO não encontrada após inserção';
    END IF;
    
    -- Inserir equipe ALFA se não existir
    INSERT INTO public.equipes (secao_id, nome, codigo, ativa)
    SELECT sbgo_secao_id, 'ALFA', 'ALFA', true
    WHERE NOT EXISTS (
        SELECT 1 FROM public.equipes WHERE secao_id = sbgo_secao_id AND nome = 'ALFA'
    );
    
    -- Inserir equipe BRAVO se não existir
    INSERT INTO public.equipes (secao_id, nome, codigo, ativa)
    SELECT sbgo_secao_id, 'BRAVO', 'BRAVO', true
    WHERE NOT EXISTS (
        SELECT 1 FROM public.equipes WHERE secao_id = sbgo_secao_id AND nome = 'BRAVO'
    );
    
    -- Inserir equipe CHARLIE se não existir
    INSERT INTO public.equipes (secao_id, nome, codigo, ativa)
    SELECT sbgo_secao_id, 'CHARLIE', 'CHARLIE', true
    WHERE NOT EXISTS (
        SELECT 1 FROM public.equipes WHERE secao_id = sbgo_secao_id AND nome = 'CHARLIE'
    );
    
    -- Inserir equipe DELTA se não existir
    INSERT INTO public.equipes (secao_id, nome, codigo, ativa)
    SELECT sbgo_secao_id, 'DELTA', 'DELTA', true
    WHERE NOT EXISTS (
        SELECT 1 FROM public.equipes WHERE secao_id = sbgo_secao_id AND nome = 'DELTA'
    );
    
    -- Log de sucesso
    RAISE NOTICE 'Seção SBGO e suas equipes verificadas/criadas com sucesso!';
    
END $$;

-- =====================================================
-- COMENTÁRIOS E DOCUMENTAÇÃO
-- =====================================================

COMMENT ON TABLE public.secoes IS 'Seções de Bombeiro de Aeródromo - incluindo SBGO Goiânia/GO';
COMMENT ON TABLE public.equipes IS 'Equipes dentro de cada seção - SBGO possui ALFA, BRAVO, CHARLIE e DELTA';

-- Esta migration garante que:
-- 1. A seção SBGO (Goiânia/GO) existe no sistema
-- 2. As 4 equipes padrão (ALFA, BRAVO, CHARLIE, DELTA) existem para SBGO
-- 3. Não há duplicação de dados se já existirem
-- 4. Prepara o ambiente para inserção dos funcionários