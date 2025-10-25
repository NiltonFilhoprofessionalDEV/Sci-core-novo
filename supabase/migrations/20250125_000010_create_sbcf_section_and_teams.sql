-- =====================================================
-- MIGRATION: Criar seção SBCF e suas equipes se não existirem
-- Data: 2025-01-25
-- Descrição: Garantir que a seção SBCF (Confins) e suas equipes
--           ALFA, BRAVO, CHARLIE e DELTA existam antes de inserir funcionários
-- =====================================================

-- Inserir seção SBCF se não existir
INSERT INTO public.secoes (nome, codigo, cidade, estado, ativa)
SELECT 'Seção de Bombeiro de Aeródromo de Confins', 'SBCF', 'Confins', 'MG', true
WHERE NOT EXISTS (
    SELECT 1 FROM public.secoes WHERE codigo = 'SBCF'
);

-- Inserir equipes da seção SBCF se não existirem
DO $$
DECLARE
    sbcf_secao_id uuid;
BEGIN
    -- Buscar ID da seção SBCF
    SELECT id INTO sbcf_secao_id FROM public.secoes WHERE codigo = 'SBCF';
    
    IF sbcf_secao_id IS NULL THEN
        RAISE EXCEPTION 'Seção SBCF não encontrada após inserção';
    END IF;
    
    -- Inserir equipe ALFA se não existir
    INSERT INTO public.equipes (secao_id, nome, ativa, nome_cidade)
    SELECT sbcf_secao_id, 'ALFA', true, 'Confins'
    WHERE NOT EXISTS (
        SELECT 1 FROM public.equipes WHERE secao_id = sbcf_secao_id AND nome = 'ALFA'
    );
    
    -- Inserir equipe BRAVO se não existir
    INSERT INTO public.equipes (secao_id, nome, ativa, nome_cidade)
    SELECT sbcf_secao_id, 'BRAVO', true, 'Confins'
    WHERE NOT EXISTS (
        SELECT 1 FROM public.equipes WHERE secao_id = sbcf_secao_id AND nome = 'BRAVO'
    );
    
    -- Inserir equipe CHARLIE se não existir
    INSERT INTO public.equipes (secao_id, nome, ativa, nome_cidade)
    SELECT sbcf_secao_id, 'CHARLIE', true, 'Confins'
    WHERE NOT EXISTS (
        SELECT 1 FROM public.equipes WHERE secao_id = sbcf_secao_id AND nome = 'CHARLIE'
    );
    
    -- Inserir equipe DELTA se não existir
    INSERT INTO public.equipes (secao_id, nome, ativa, nome_cidade)
    SELECT sbcf_secao_id, 'DELTA', true, 'Confins'
    WHERE NOT EXISTS (
        SELECT 1 FROM public.equipes WHERE secao_id = sbcf_secao_id AND nome = 'DELTA'
    );
    
    -- Log de sucesso
    RAISE NOTICE 'Seção SBCF e suas equipes verificadas/criadas com sucesso!';
    
END $$;

-- =====================================================
-- COMENTÁRIOS E DOCUMENTAÇÃO
-- =====================================================

COMMENT ON TABLE public.secoes IS 'Seções de Bombeiro de Aeródromo - incluindo SBCF Confins/MG';
COMMENT ON TABLE public.equipes IS 'Equipes dentro de cada seção - SBCF possui ALFA, BRAVO, CHARLIE e DELTA';

-- Esta migration garante que:
-- 1. A seção SBCF (Confins/MG) existe no sistema
-- 2. As 4 equipes padrão (ALFA, BRAVO, CHARLIE, DELTA) existem para SBCF
-- 3. Não há duplicação de dados se já existirem
-- 4. Prepara o ambiente para inserção dos funcionários