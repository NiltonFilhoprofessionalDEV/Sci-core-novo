-- =====================================================
-- ADICIONAR COLUNAS PARA PTR-BA PROVA TEÓRICA
-- Sistema de Indicadores Bombeiro MedMais
-- =====================================================

-- Adicionar as colunas necessárias para o modal PTR-BA
ALTER TABLE ptr_ba_provas_teoricas 
ADD COLUMN IF NOT EXISTS nome_cidade VARCHAR(100),
ADD COLUMN IF NOT EXISTS data_prova DATE,
ADD COLUMN IF NOT EXISTS nome_completo VARCHAR(255),
ADD COLUMN IF NOT EXISTS nota_prova DECIMAL(3,1),
ADD COLUMN IF NOT EXISTS status VARCHAR(20),
ADD COLUMN IF NOT EXISTS observacoes TEXT;

-- Comentários nas colunas
COMMENT ON COLUMN ptr_ba_provas_teoricas.nome_cidade IS 'Nome da cidade/base onde foi realizada a prova';
COMMENT ON COLUMN ptr_ba_provas_teoricas.data_prova IS 'Data em que a prova teórica foi realizada';
COMMENT ON COLUMN ptr_ba_provas_teoricas.nome_completo IS 'Nome completo do funcionário que realizou a prova';
COMMENT ON COLUMN ptr_ba_provas_teoricas.nota_prova IS 'Nota obtida na prova (0,0 a 10,0)';
COMMENT ON COLUMN ptr_ba_provas_teoricas.status IS 'Status da prova: Aprovado (≥8,0) ou Reprovado (≤7,9)';
COMMENT ON COLUMN ptr_ba_provas_teoricas.observacoes IS 'Observações sobre a prova teórica';

-- Adicionar constraints para validação
ALTER TABLE ptr_ba_provas_teoricas 
ADD CONSTRAINT check_nota_prova_range 
CHECK (nota_prova IS NULL OR (nota_prova >= 0.0 AND nota_prova <= 10.0));

ALTER TABLE ptr_ba_provas_teoricas 
ADD CONSTRAINT check_status_values 
CHECK (status IS NULL OR status IN ('Aprovado', 'Reprovado'));

-- Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_ptr_ba_provas_teoricas_nome_cidade ON ptr_ba_provas_teoricas(nome_cidade);
CREATE INDEX IF NOT EXISTS idx_ptr_ba_provas_teoricas_data_prova ON ptr_ba_provas_teoricas(data_prova);
CREATE INDEX IF NOT EXISTS idx_ptr_ba_provas_teoricas_status ON ptr_ba_provas_teoricas(status);
CREATE INDEX IF NOT EXISTS idx_ptr_ba_provas_teoricas_nome_completo ON ptr_ba_provas_teoricas(nome_completo);

-- Atualizar função de trigger para updated_at (se não existir)
CREATE OR REPLACE FUNCTION update_ptr_ba_provas_teoricas_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Criar trigger para atualizar updated_at automaticamente
DROP TRIGGER IF EXISTS trigger_update_ptr_ba_provas_teoricas_updated_at ON ptr_ba_provas_teoricas;
CREATE TRIGGER trigger_update_ptr_ba_provas_teoricas_updated_at
    BEFORE UPDATE ON ptr_ba_provas_teoricas
    FOR EACH ROW
    EXECUTE FUNCTION update_ptr_ba_provas_teoricas_updated_at();

-- Inserir dados de exemplo (opcional)
INSERT INTO ptr_ba_provas_teoricas (
    secao_id,
    equipe_id,
    usuario_id,
    nome_cidade,
    data_prova,
    nome_completo,
    nota_prova,
    status,
    observacoes
) VALUES 
(
    (SELECT id FROM secoes LIMIT 1),
    (SELECT id FROM equipes LIMIT 1),
    (SELECT id FROM profiles LIMIT 1),
    'Confins',
    '2025-01-20',
    'João Silva Santos',
    8.5,
    'Aprovado',
    'Excelente desempenho na prova teórica'
),
(
    (SELECT id FROM secoes LIMIT 1),
    (SELECT id FROM equipes LIMIT 1),
    (SELECT id FROM profiles LIMIT 1),
    'Confins',
    '2025-01-20',
    'Maria Oliveira Costa',
    7.2,
    'Reprovado',
    'Necessita reforço em procedimentos de emergência'
)
ON CONFLICT DO NOTHING;

-- Verificar se as colunas foram criadas corretamente
DO $$
BEGIN
    -- Verificar se todas as colunas existem
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'ptr_ba_provas_teoricas' 
        AND column_name IN ('nome_cidade', 'data_prova', 'nome_completo', 'nota_prova', 'status', 'observacoes')
        GROUP BY table_name
        HAVING COUNT(*) = 6
    ) THEN
        RAISE EXCEPTION 'Erro: Nem todas as colunas foram criadas corretamente';
    END IF;
    
    RAISE NOTICE 'Sucesso: Todas as colunas PTR-BA foram criadas corretamente';
END $$;