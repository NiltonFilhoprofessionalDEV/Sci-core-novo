-- =====================================================
-- CRIAR APENAS A TABELA SECOES
-- Migration: Criar tabela secoes se não existir
-- =====================================================

-- Extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- CRIAR TABELA DE SEÇÕES SE NÃO EXISTIR
-- =====================================================
CREATE TABLE IF NOT EXISTS public.secoes (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    nome VARCHAR(100) NOT NULL UNIQUE,
    codigo VARCHAR(10) NOT NULL UNIQUE,
    cidade VARCHAR(100) NOT NULL,
    estado VARCHAR(2) NOT NULL,
    ativa BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para performance (criar apenas se não existirem)
CREATE INDEX IF NOT EXISTS idx_secoes_codigo ON public.secoes(codigo);
CREATE INDEX IF NOT EXISTS idx_secoes_ativa ON public.secoes(ativa);

-- Trigger para updated_at (criar apenas se não existir)
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Criar trigger se não existir
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_trigger 
        WHERE tgname = 'update_secoes_updated_at'
    ) THEN
        CREATE TRIGGER update_secoes_updated_at
        BEFORE UPDATE ON public.secoes
        FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
    END IF;
END $$;

-- =====================================================
-- DADOS INICIAIS - SEÇÕES DE TESTE
-- =====================================================
INSERT INTO public.secoes (nome, codigo, cidade, estado) VALUES
('Seção de Bombeiro de Aeródromo de Goiânia', 'SBGO', 'Goiânia', 'GO'),
('Seção de Bombeiro de Aeródromo de São Paulo', 'SBSP', 'São Paulo', 'SP'),
('Seção de Bombeiro de Aeródromo do Rio de Janeiro', 'SBRJ', 'Rio de Janeiro', 'RJ'),
('Seção de Bombeiro de Aeródromo de Brasília', 'SBBR', 'Brasília', 'DF'),
('Seção de Bombeiro de Aeródromo de Belo Horizonte', 'SBCF', 'Belo Horizonte', 'MG')
ON CONFLICT (codigo) DO NOTHING;

-- Comentários
COMMENT ON TABLE public.secoes IS 'Seções de Bombeiro de Aeródromo';
COMMENT ON COLUMN public.secoes.codigo IS 'Código ICAO do aeroporto correspondente à seção';
COMMENT ON COLUMN public.secoes.nome IS 'Nome completo da seção de bombeiro de aeródromo';
COMMENT ON COLUMN public.secoes.cidade IS 'Cidade onde está localizada a seção';
COMMENT ON COLUMN public.secoes.estado IS 'Esta