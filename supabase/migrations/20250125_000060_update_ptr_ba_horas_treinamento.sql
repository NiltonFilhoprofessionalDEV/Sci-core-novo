-- =====================================================
-- Migration: Update PTR-BA Horas de Treinamento Table
-- Description: Adicionar colunas necessárias conforme arquitetura técnica
-- =====================================================

-- Adicionar colunas necessárias
ALTER TABLE ptr_ba_horas_treinamento 
ADD COLUMN IF NOT EXISTS nome_cidade VARCHAR(100),
ADD COLUMN IF NOT EXISTS data_ptr_ba DATE,
ADD COLUMN IF NOT EXISTS nome_completo VARCHAR(255),
ADD COLUMN IF NOT EXISTS hora_ptr_diaria NUMERIC(5,2),
ADD COLUMN IF NOT EXISTS mes_referencia VARCHAR(20);

-- Atualizar colunas existentes para NOT NULL (após popular dados se necessário)
-- Por enquanto, vamos deixar como nullable para evitar erros

-- Adicionar constraint de check para hora_ptr_diaria
ALTER TABLE ptr_ba_horas_treinamento 
ADD CONSTRAINT check_hora_ptr_diaria_positive 
CHECK (hora_ptr_diaria IS NULL OR hora_ptr_diaria > 0);

-- Criar função para gerar mês de referência se não existir
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

-- Criar índices para performance se não existirem
CREATE INDEX IF NOT EXISTS idx_ptr_ba_horas_data_ptr_ba ON ptr_ba_horas_treinamento(data_ptr_ba);
CREATE INDEX IF NOT EXISTS idx_ptr_ba_horas_equipe_id ON ptr_ba_horas_treinamento(equipe_id);
CREATE INDEX IF NOT EXISTS idx_ptr_ba_horas_usuario_id ON ptr_ba_horas_treinamento(usuario_id);
CREATE INDEX IF NOT EXISTS idx_ptr_ba_horas_mes_referencia ON ptr_ba_horas_treinamento(mes_referencia);

-- Criar constraint única para evitar duplicatas
CREATE UNIQUE INDEX IF NOT EXISTS idx_ptr_ba_horas_unique 
ON ptr_ba_horas_treinamento(data_ptr_ba, equipe_id, nome_completo)
WHERE data_ptr_ba IS NOT NULL AND equipe_id IS NOT NULL AND nome_completo IS NOT NULL;

-- Verificar se RLS está habilitado
ALTER TABLE ptr_ba_horas_treinamento ENABLE ROW LEVEL SECURITY;

-- Remover políticas existentes se houver conflito
DROP POLICY IF EXISTS "ptr_ba_horas_select_policy" ON ptr_ba_horas_treinamento;
DROP POLICY IF EXISTS "ptr_ba_horas_insert_policy" ON ptr_ba_horas_treinamento;
DROP POLICY IF EXISTS "ptr_ba_horas_update_policy" ON ptr_ba_horas_treinamento;
DROP POLICY IF EXISTS "ptr_ba_horas_delete_policy" ON ptr_ba_horas_treinamento;

-- Criar políticas RLS flexíveis
CREATE POLICY "ptr_ba_horas_select_policy" ON ptr_ba_horas_treinamento
    FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "ptr_ba_horas_insert_policy" ON ptr_ba_horas_treinamento
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "ptr_ba_horas_update_policy" ON ptr_ba_horas_treinamento
    FOR UPDATE USING (auth.uid() IS NOT NULL);

CREATE POLICY "ptr_ba_horas_delete_policy" ON ptr_ba_horas_treinamento
    FOR DELETE USING (auth.uid() IS NOT NULL);

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

-- Remover trigger existente se houver
DROP TRIGGER IF EXISTS update_ptr_ba_horas_updated_at ON ptr_ba_horas_treinamento;

-- Criar trigger para updated_at
CREATE TRIGGER update_ptr_ba_horas_updated_at 
    BEFORE UPDATE ON ptr_ba_horas_treinamento 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Função para preencher mes_referencia automaticamente
CREATE OR REPLACE FUNCTION set_mes_referencia()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.data_ptr_ba IS NOT NULL THEN
        NEW.mes_referencia = get_mes_referencia(NEW.data_ptr_ba);
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Remover trigger existente se houver
DROP TRIGGER IF EXISTS set_ptr_ba_horas_mes_referencia ON ptr_ba_horas_treinamento;

-- Criar trigger para mes_referencia
CREATE TRIGGER set_ptr_ba_horas_mes_referencia
    BEFORE INSERT OR UPDATE ON ptr_ba_horas_treinamento
    FOR EACH ROW EXECUTE FUNCTION set_mes_referencia();