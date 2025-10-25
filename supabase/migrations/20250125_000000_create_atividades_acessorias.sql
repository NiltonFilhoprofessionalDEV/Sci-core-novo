-- =====================================================
-- MIGRATION: Criar tabela atividades_acessorias
-- Sistema de Indicadores Bombeiro MedMais
-- Data: 25/01/2025
-- =====================================================

-- Criar tabela atividades_acessorias
CREATE TABLE IF NOT EXISTS public.atividades_acessorias (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    
    -- Campos do formulário
    base_id UUID NOT NULL REFERENCES public.secoes(id) ON DELETE CASCADE,
    data_atividade DATE NOT NULL,
    equipe_id UUID NOT NULL REFERENCES public.equipes(id) ON DELETE CASCADE,
    tipo_atividade VARCHAR(100) NOT NULL DEFAULT 'Inspeção de extintores',
    qtd_equipamentos INTEGER NOT NULL CHECK (qtd_equipamentos > 0),
    qtd_bombeiros INTEGER NOT NULL CHECK (qtd_bombeiros > 0),
    tempo_gasto TIME NOT NULL,
    
    -- Campos automáticos
    cidade_aeroporto VARCHAR(100) NOT NULL,
    equipe_nome VARCHAR(100) NOT NULL,
    
    -- Campos de auditoria
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id)
);

-- Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_atividades_acessorias_base_id ON public.atividades_acessorias(base_id);
CREATE INDEX IF NOT EXISTS idx_atividades_acessorias_equipe_id ON public.atividades_acessorias(equipe_id);
CREATE INDEX IF NOT EXISTS idx_atividades_acessorias_data ON public.atividades_acessorias(data_atividade);
CREATE INDEX IF NOT EXISTS idx_atividades_acessorias_created_at ON public.atividades_acessorias(created_at);

-- Habilitar RLS (Row Level Security)
ALTER TABLE public.atividades_acessorias ENABLE ROW LEVEL SECURITY;

-- Política para usuários autenticados poderem inserir
CREATE POLICY "Usuários autenticados podem inserir atividades acessórias" ON public.atividades_acessorias
    FOR INSERT TO authenticated
    WITH CHECK (true);

-- Política para usuários autenticados poderem visualizar
CREATE POLICY "Usuários autenticados podem visualizar atividades acessórias" ON public.atividades_acessorias
    FOR SELECT TO authenticated
    USING (true);

-- Política para usuários autenticados poderem atualizar
CREATE POLICY "Usuários autenticados podem atualizar atividades acessórias" ON public.atividades_acessorias
    FOR UPDATE TO authenticated
    USING (true)
    WITH CHECK (true);

-- Política para usuários autenticados poderem deletar
CREATE POLICY "Usuários autenticados podem deletar atividades acessórias" ON public.atividades_acessorias
    FOR DELETE TO authenticated
    USING (true);

-- Conceder permissões para os roles
GRANT ALL PRIVILEGES ON public.atividades_acessorias TO authenticated;
GRANT SELECT ON public.atividades_acessorias TO anon;

-- Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_atividades_acessorias_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para atualizar updated_at
CREATE TRIGGER trigger_update_atividades_acessorias_updated_at
    BEFORE UPDATE ON public.atividades_acessorias
    FOR EACH ROW
    EXECUTE FUNCTION update_atividades_acessorias_updated_at();

-- Comentários para documentação
COMMENT ON TABLE public.atividades_acessorias IS 'Tabela para registrar atividades acessórias realizadas pelas equipes';
COMMENT ON COLUMN public.atividades_acessorias.base_id IS 'ID da base/seção onde a atividade foi realizada';
COMMENT ON COLUMN public.atividades_acessorias.data_atividade IS 'Data em que a atividade foi realizada';
COMMENT ON COLUMN public.atividades_acessorias.equipe_id IS 'ID da equipe que realizou a atividade';
COMMENT ON COLUMN public.atividades_acessorias.tipo_atividade IS 'Tipo de atividade realizada (padrão: Inspeção de extintores)';
COMMENT ON COLUMN public.atividades_acessorias.qtd_equipamentos IS 'Quantidade de equipamentos inspecionados';
COMMENT ON COLUMN public.atividades_acessorias.qtd_bombeiros IS 'Quantidade de bombeiros que participaram da atividade';
COMMENT ON COLUMN public.atividades_acessorias.tempo_gasto IS 'Tempo gasto na atividade (formato HH:MM)';
COMMENT ON COLUMN public.atividades_acessorias.cidade_aeroporto IS 'Cidade/aeroporto da base (preenchido automaticamente)';
COMMENT ON COLUMN public.atividades_acessorias.equipe_nome IS 'Nome da equipe (preenchido automaticamente)';