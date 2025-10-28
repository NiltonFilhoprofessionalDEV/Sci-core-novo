-- =====================================================
-- Migration: Create PTR-BA Horas de Treinamento Table
-- Description: Tabela para registro de horas de treinamento PTR-BA
-- =====================================================

-- Criar função para gerar mês de referência
CREATE OR REPLACE FUNCTION get_mes_referencia(data_input DATE)
RETURNS TEXT AS $$
BEGIN
    RETURN CASE EXTRACT(MONTH FROM data_input)
        WHEN 1 THEN 'Janeiro'
        WHEN 2 THEN 'Fevereiro'
        WHEN 3 THEN 'Março'
        WHEN 4 THEN 'Abril'
        WHEN 5 THEN 'Maio'
        WHEN 6 THEN 'Junho'
        WHEN 7 THEN 'Julho'
        WHEN 8 THEN 'Agosto'
        WHEN 9 THEN 'Setembro'
        WHEN 10 THEN 'Outubro'
        WHEN 11 THEN 'Novembro'
        WHEN 12 THEN 'Dezembro'
    END;
END;
$$ LANGUAGE plpgsql;

-- Criar tabela ptr_ba_horas_treinamento
CREATE TABLE ptr_ba_horas_treinamento (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nome_cidade VARCHAR(100) NOT NULL,
    data_ptr_ba DATE NOT NULL,
    nome_completo VARCHAR(255) NOT NULL,
    hora_ptr_diaria NUMERIC(5,2) NOT NULL CHECK (hora_ptr_diaria > 0),
    mes_referencia VARCHAR(20) NOT NULL,
    secao_id UUID NOT NULL REFERENCES secoes(id),
    equipe_id UUID NOT NULL REFERENCES equipes(id),
    usuario_id UUID NOT NULL REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar índices para performance
CREATE INDEX idx_ptr_ba_horas_data ON ptr_ba_horas_treinamento(data_ptr_ba);
CREATE INDEX idx_ptr_ba_horas_equipe ON ptr_ba_horas_treinamento(equipe_id);
CREATE INDEX idx_ptr_ba_horas_usuario ON ptr_ba_horas_treinamento(usuario_id);
CREATE INDEX idx_ptr_ba_horas_mes ON ptr_ba_horas_treinamento(mes_referencia);

-- Constraint única para evitar duplicatas
CREATE UNIQUE INDEX idx_ptr_ba_horas_unique ON ptr_ba_horas_treinamento(data_ptr_ba, equipe_id, nome_completo);

-- Habilitar Row Level Security
ALTER TABLE ptr_ba_horas_treinamento ENABLE ROW LEVEL SECURITY;

-- Políticas RLS
CREATE POLICY "ptr_ba_horas_select_policy" ON ptr_ba_horas_treinamento
    FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "ptr_ba_horas_insert_policy" ON ptr_ba_horas_treinamento
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "ptr_ba_horas_update_policy" ON ptr_ba_horas_treinamento
    FOR UPDATE USING (usuario_id = auth.uid());

CREATE POLICY "ptr_ba_horas_delete_policy" ON ptr_ba_horas_treinamento
    FOR DELETE USING (usuario_id = auth.uid());

-- Conceder permissões
GRANT ALL ON ptr_ba_horas_treinamento TO authenticated;

-- Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para updated_at
CREATE TRIGGER update_ptr_ba_horas_updated_at 
    BEFORE UPDATE ON ptr_ba_horas_treinamento 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Trigger para preencher mes_referencia automaticamente
CREATE OR REPLACE FUNCTION set_mes_referencia()
RETURNS TRIGGER AS $$
BEGIN
    NEW.mes_referencia = get_mes_referencia(NEW.data_ptr_ba);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_ptr_ba_horas_mes_referencia
    BEFORE INSERT OR UPDATE ON ptr_ba_horas_treinamento
    FOR EACH ROW EXECUTE FUNCTION set_mes_referencia();