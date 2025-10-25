-- =====================================================
-- SISTEMA DE INDICADORES BOMBEIRO MEDMAIS
-- Migration: Tabela de Funcionários
-- Data: 2025-01-25
-- =====================================================

-- =====================================================
-- TABELA DE FUNCIONÁRIOS
-- =====================================================
CREATE TABLE public.funcionarios (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    nome_completo VARCHAR(255) NOT NULL,
    cpf VARCHAR(14) NOT NULL UNIQUE,
    email VARCHAR(255) UNIQUE,
    telefone VARCHAR(20),
    cargo VARCHAR(100) NOT NULL,
    matricula VARCHAR(50) NOT NULL,
    data_admissao DATE NOT NULL,
    data_demissao DATE,
    ativo BOOLEAN DEFAULT true,
    secao_id UUID NOT NULL REFERENCES public.secoes(id) ON DELETE CASCADE,
    equipe_id UUID NOT NULL REFERENCES public.equipes(id) ON DELETE CASCADE,
    observacoes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Constraint para garantir que a matrícula seja única por seção
    CONSTRAINT unique_matricula_por_secao UNIQUE(secao_id, matricula)
);

-- =====================================================
-- ÍNDICES PARA PERFORMANCE
-- =====================================================

-- Índices individuais
CREATE INDEX idx_funcionarios_secao_id ON public.funcionarios(secao_id);
CREATE INDEX idx_funcionarios_equipe_id ON public.funcionarios(equipe_id);
CREATE INDEX idx_funcionarios_cpf ON public.funcionarios(cpf);
CREATE INDEX idx_funcionarios_matricula ON public.funcionarios(matricula);
CREATE INDEX idx_funcionarios_ativo ON public.funcionarios(ativo);
CREATE INDEX idx_funcionarios_email ON public.funcionarios(email) WHERE email IS NOT NULL;

-- Índices compostos para consultas frequentes
CREATE INDEX idx_funcionarios_secao_equipe ON public.funcionarios(secao_id, equipe_id);
CREATE INDEX idx_funcionarios_secao_ativo ON public.funcionarios(secao_id, ativo);
CREATE INDEX idx_funcionarios_equipe_ativo ON public.funcionarios(equipe_id, ativo);

-- =====================================================
-- TRIGGER PARA UPDATED_AT AUTOMÁTICO
-- =====================================================
CREATE TRIGGER update_funcionarios_updated_at 
    BEFORE UPDATE ON public.funcionarios 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- COMENTÁRIOS PARA DOCUMENTAÇÃO
-- =====================================================
COMMENT ON TABLE public.funcionarios IS 'Cadastro de funcionários (bombeiros) de cada seção, vinculados às suas respectivas equipes';
COMMENT ON COLUMN public.funcionarios.nome_completo IS 'Nome completo do funcionário';
COMMENT ON COLUMN public.funcionarios.cpf IS 'CPF do funcionário (formato: 000.000.000-00)';
COMMENT ON COLUMN public.funcionarios.email IS 'Email do funcionário (opcional)';
COMMENT ON COLUMN public.funcionarios.telefone IS 'Telefone de contato (opcional)';
COMMENT ON COLUMN public.funcionarios.cargo IS 'Cargo/função do funcionário (ex: Bombeiro Aeronáutico, Sargento, etc.)';
COMMENT ON COLUMN public.funcionarios.matricula IS 'Matrícula funcional única por seção';
COMMENT ON COLUMN public.funcionarios.data_admissao IS 'Data de admissão/início na função';
COMMENT ON COLUMN public.funcionarios.data_demissao IS 'Data de demissão/saída (opcional)';
COMMENT ON COLUMN public.funcionarios.ativo IS 'Status ativo/inativo do funcionário';
COMMENT ON COLUMN public.funcionarios.secao_id IS 'Referência à seção (base) do funcionário';
COMMENT ON COLUMN public.funcionarios.equipe_id IS 'Referência à equipe do funcionário dentro da seção';
COMMENT ON COLUMN public.funcionarios.observacoes IS 'Observações adicionais sobre o funcionário';

-- =====================================================
-- DADOS INICIAIS DE EXEMPLO
-- =====================================================
-- Inserindo alguns funcionários de exemplo para a seção SBGO
INSERT INTO public.funcionarios (nome_completo, cpf, email, telefone, cargo, matricula, data_admissao, secao_id, equipe_id, observacoes)
SELECT 
    'João Silva Santos',
    '123.456.789-01',
    'joao.silva@bombeiros.gov.br',
    '(62) 99999-0001',
    'Bombeiro Aeronáutico',
    'BA001',
    DATE '2020-01-15',
    s.id,
    e.id,
    'Funcionário experiente com certificação ARFF'
FROM public.secoes s
JOIN public.equipes e ON e.secao_id = s.id
WHERE s.codigo = 'SBGO' AND e.codigo = 'ALFA'

UNION ALL

SELECT 
    'Maria Oliveira Costa',
    '987.654.321-02',
    'maria.oliveira@bombeiros.gov.br',
    '(62) 99999-0002',
    'Sargento Bombeiro',
    'SG001',
    DATE '2018-03-20',
    s.id,
    e.id,
    'Líder de equipe com especialização em emergências médicas'
FROM public.secoes s
JOIN public.equipes e ON e.secao_id = s.id
WHERE s.codigo = 'SBGO' AND e.codigo = 'ALFA'

UNION ALL

SELECT 
    'Carlos Eduardo Lima',
    '456.789.123-03',
    'carlos.lima@bombeiros.gov.br',
    '(62) 99999-0003',
    'Bombeiro Aeronáutico',
    'BA002',
    DATE '2021-06-10',
    s.id,
    e.id,
    'Especialista em equipamentos de combate a incêndio'
FROM public.secoes s
JOIN public.equipes e ON e.secao_id = s.id
WHERE s.codigo = 'SBGO' AND e.codigo = 'BRAVO';