-- =====================================================
-- SISTEMA DE INDICADORES BOMBEIRO MEDMAIS
-- Migration: Estrutura completa do banco de dados
-- =====================================================

-- Extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- 1. TABELA DE SEÇÕES
-- =====================================================
CREATE TABLE public.secoes (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    nome VARCHAR(100) NOT NULL UNIQUE,
    codigo VARCHAR(10) NOT NULL UNIQUE,
    cidade VARCHAR(100) NOT NULL,
    estado VARCHAR(2) NOT NULL,
    ativa BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX idx_secoes_codigo ON public.secoes(codigo);
CREATE INDEX idx_secoes_ativa ON public.secoes(ativa);

-- =====================================================
-- 2. TABELA DE EQUIPES
-- =====================================================
CREATE TABLE public.equipes (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    secao_id UUID NOT NULL REFERENCES public.secoes(id) ON DELETE CASCADE,
    nome VARCHAR(50) NOT NULL,
    codigo VARCHAR(10) NOT NULL,
    ativa BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(secao_id, codigo)
);

-- Índices para performance
CREATE INDEX idx_equipes_secao_id ON public.equipes(secao_id);
CREATE INDEX idx_equipes_ativa ON public.equipes(ativa);

-- =====================================================
-- 3. TABELA DE PERFIS DE USUÁRIO (EXPANDIDA)
-- =====================================================
CREATE TABLE public.profiles (
    id UUID REFERENCES auth.users(id) PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    nome_completo VARCHAR(255) NOT NULL,
    perfil VARCHAR(20) NOT NULL CHECK (perfil IN ('gestor_pop', 'gerente_secao', 'ba_ce')),
    secao_id UUID REFERENCES public.secoes(id),
    equipe_id UUID REFERENCES public.equipes(id),
    ativo BOOLEAN DEFAULT true,
    last_login TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Constraints de integridade
    CONSTRAINT check_gerente_tem_secao CHECK (
        (perfil = 'gerente_secao' AND secao_id IS NOT NULL) OR 
        (perfil != 'gerente_secao')
    ),
    CONSTRAINT check_bace_tem_equipe_e_secao CHECK (
        (perfil = 'ba_ce' AND secao_id IS NOT NULL AND equipe_id IS NOT NULL) OR 
        (perfil != 'ba_ce')
    ),
    CONSTRAINT check_gestor_pop_sem_restricoes CHECK (
        (perfil = 'gestor_pop' AND secao_id IS NULL AND equipe_id IS NULL) OR 
        (perfil != 'gestor_pop')
    )
);

-- Índices para performance
CREATE INDEX idx_profiles_perfil ON public.profiles(perfil);
CREATE INDEX idx_profiles_secao_id ON public.profiles(secao_id);
CREATE INDEX idx_profiles_equipe_id ON public.profiles(equipe_id);
CREATE INDEX idx_profiles_ativo ON public.profiles(ativo);

-- =====================================================
-- 4. TABELA DE INDICADORES
-- =====================================================
CREATE TABLE public.indicadores (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    nome VARCHAR(200) NOT NULL,
    descricao TEXT,
    categoria VARCHAR(100) NOT NULL,
    frequencia VARCHAR(20) NOT NULL CHECK (frequencia IN ('evento', 'diario', 'mensal')),
    tipo_dados VARCHAR(20) NOT NULL CHECK (tipo_dados IN ('tempo', 'data', 'texto', 'numero', 'boolean')),
    unidade_medida VARCHAR(50),
    obrigatorio BOOLEAN DEFAULT false,
    ativo BOOLEAN DEFAULT true,
    ordem_exibicao INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX idx_indicadores_categoria ON public.indicadores(categoria);
CREATE INDEX idx_indicadores_frequencia ON public.indicadores(frequencia);
CREATE INDEX idx_indicadores_ativo ON public.indicadores(ativo);
CREATE INDEX idx_indicadores_ordem ON public.indicadores(ordem_exibicao);

-- =====================================================
-- 5. TABELA DE PREENCHIMENTOS
-- =====================================================
CREATE TABLE public.preenchimentos (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    indicador_id UUID NOT NULL REFERENCES public.indicadores(id) ON DELETE CASCADE,
    usuario_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    secao_id UUID NOT NULL REFERENCES public.secoes(id) ON DELETE CASCADE,
    equipe_id UUID REFERENCES public.equipes(id) ON DELETE CASCADE,
    
    -- Dados do preenchimento
    valor_texto TEXT,
    valor_numero DECIMAL(15,4),
    valor_data DATE,
    valor_tempo TIME,
    valor_boolean BOOLEAN,
    
    -- Metadados
    data_referencia DATE NOT NULL,
    observacoes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Constraint para garantir que pelo menos um valor seja preenchido
    CONSTRAINT check_pelo_menos_um_valor CHECK (
        valor_texto IS NOT NULL OR 
        valor_numero IS NOT NULL OR 
        valor_data IS NOT NULL OR 
        valor_tempo IS NOT NULL OR 
        valor_boolean IS NOT NULL
    )
);

-- Índices para performance
CREATE INDEX idx_preenchimentos_indicador_id ON public.preenchimentos(indicador_id);
CREATE INDEX idx_preenchimentos_usuario_id ON public.preenchimentos(usuario_id);
CREATE INDEX idx_preenchimentos_secao_id ON public.preenchimentos(secao_id);
CREATE INDEX idx_preenchimentos_equipe_id ON public.preenchimentos(equipe_id);
CREATE INDEX idx_preenchimentos_data_referencia ON public.preenchimentos(data_referencia);
CREATE INDEX idx_preenchimentos_created_at ON public.preenchimentos(created_at DESC);

-- Índice composto para consultas frequentes
CREATE INDEX idx_preenchimentos_secao_data ON public.preenchimentos(secao_id, data_referencia DESC);
CREATE INDEX idx_preenchimentos_equipe_data ON public.preenchimentos(equipe_id, data_referencia DESC);

-- =====================================================
-- 6. FUNÇÕES E TRIGGERS
-- =====================================================

-- Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para updated_at
CREATE TRIGGER update_secoes_updated_at 
    BEFORE UPDATE ON public.secoes 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_equipes_updated_at 
    BEFORE UPDATE ON public.equipes 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_profiles_updated_at 
    BEFORE UPDATE ON public.profiles 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_indicadores_updated_at 
    BEFORE UPDATE ON public.indicadores 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_preenchimentos_updated_at 
    BEFORE UPDATE ON public.preenchimentos 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- 7. FUNÇÃO PARA CRIAR PERFIL AUTOMATICAMENTE
-- =====================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, nome_completo, perfil)
    VALUES (
        NEW.id, 
        NEW.email, 
        COALESCE(NEW.raw_user_meta_data->>'nome_completo', NEW.email),
        COALESCE(NEW.raw_user_meta_data->>'perfil', 'ba_ce')
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para criar perfil automaticamente
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =====================================================
-- 8. DADOS INICIAIS - SEÇÕES
-- =====================================================
INSERT INTO public.secoes (nome, codigo, cidade, estado) VALUES
('Seção de Bombeiro de Aeródromo de Goiânia', 'SBGO', 'Goiânia', 'GO'),
('Seção de Bombeiro de Aeródromo de São Paulo', 'SBSP', 'São Paulo', 'SP'),
('Seção de Bombeiro de Aeródromo do Rio de Janeiro', 'SBRJ', 'Rio de Janeiro', 'RJ'),
('Seção de Bombeiro de Aeródromo de Brasília', 'SBBR', 'Brasília', 'DF'),
('Seção de Bombeiro de Aeródromo de Belo Horizonte', 'SBCF', 'Belo Horizonte', 'MG');

-- =====================================================
-- 9. DADOS INICIAIS - EQUIPES
-- =====================================================
INSERT INTO public.equipes (secao_id, nome, codigo) 
SELECT s.id, 'Equipe Alfa', 'ALFA' FROM public.secoes s WHERE s.codigo = 'SBGO'
UNION ALL
SELECT s.id, 'Equipe Bravo', 'BRAVO' FROM public.secoes s WHERE s.codigo = 'SBGO'
UNION ALL
SELECT s.id, 'Equipe Charlie', 'CHARLIE' FROM public.secoes s WHERE s.codigo = 'SBGO'
UNION ALL
SELECT s.id, 'Equipe Alfa', 'ALFA' FROM public.secoes s WHERE s.codigo = 'SBSP'
UNION ALL
SELECT s.id, 'Equipe Bravo', 'BRAVO' FROM public.secoes s WHERE s.codigo = 'SBSP';

-- =====================================================
-- 10. DADOS INICIAIS - INDICADORES EXEMPLO
-- =====================================================
INSERT INTO public.indicadores (nome, descricao, categoria, frequencia, tipo_dados, unidade_medida, ordem_exibicao) VALUES
('Ocorrências Aeronáuticas', 'Registro de ocorrências relacionadas a aeronaves', 'Segurança', 'evento', 'numero', 'quantidade', 1),
('Ocorrências Não Aeronáuticas', 'Registro de ocorrências não relacionadas a aeronaves', 'Segurança', 'evento', 'numero', 'quantidade', 2),
('Horas de Treinamento PTR-BA', 'Horas de treinamento diário por bombeiro', 'Treinamento', 'diario', 'tempo', 'horas', 3),
('Inspeções de Equipamentos', 'Número de inspeções realizadas mensalmente', 'Manutenção', 'mensal', 'numero', 'quantidade', 4),
('Relatório de Plantão', 'Relatório detalhado do plantão', 'Operacional', 'diario', 'texto', null, 5);

-- =====================================================
-- 11. COMENTÁRIOS PARA DOCUMENTAÇÃO
-- =====================================================
COMMENT ON TABLE public.secoes IS 'Seções de Bombeiro de Aeródromo (aproximadamente 35 no total)';
COMMENT ON TABLE public.equipes IS 'Equipes dentro de cada seção (Alfa, Bravo, Charlie, etc.)';
COMMENT ON TABLE public.profiles IS 'Perfis de usuário com hierarquia: Gestor POP > Gerente de Seção > BA-CE';
COMMENT ON TABLE public.indicadores IS 'Definição dos indicadores a serem preenchidos (baseados em planilhas Excel)';
COMMENT ON TABLE public.preenchimentos IS 'Dados preenchidos pelos usuários para cada indicador';

COMMENT ON COLUMN public.profiles.perfil IS 'Tipos: gestor_pop (vê tudo), gerente_secao (vê sua seção), ba_ce (preenche e vê sua equipe+seção)';
COMMENT ON COLUMN public.indicadores.frequencia IS 'Frequência de preenchimento: evento (quando ocorre), diario (todo plantão), mensal (uma vez por mês)';
COMMENT ON COLUMN public.indicadores.tipo_dados IS 'Tipo de dado esperado: tempo, data, texto, numero, boolean';