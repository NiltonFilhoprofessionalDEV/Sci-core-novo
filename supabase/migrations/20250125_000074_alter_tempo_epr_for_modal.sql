-- Alterar tabela tempo_epr para atender aos requisitos do modal
-- Adicionar colunas necessárias para o modal Tempo EPR

-- Adicionar colunas se não existirem
DO $$ 
BEGIN
    -- Adicionar nome_cidade se não existir
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tempo_epr' AND column_name = 'nome_cidade') THEN
        ALTER TABLE tempo_epr ADD COLUMN nome_cidade VARCHAR(255);
    END IF;
    
    -- Adicionar data_exercicio_epr se não existir
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tempo_epr' AND column_name = 'data_exercicio_epr') THEN
        ALTER TABLE tempo_epr ADD COLUMN data_exercicio_epr DATE;
    END IF;
    
    -- Adicionar nome_completo se não existir
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tempo_epr' AND column_name = 'nome_completo') THEN
        ALTER TABLE tempo_epr ADD COLUMN nome_completo VARCHAR(255);
    END IF;
    
    -- Adicionar tempo_epr se não existir
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tempo_epr' AND column_name = 'tempo_epr') THEN
        ALTER TABLE tempo_epr ADD COLUMN tempo_epr VARCHAR(10);
    END IF;
    
    -- Adicionar status se não existir
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tempo_epr' AND column_name = 'status') THEN
        ALTER TABLE tempo_epr ADD COLUMN status VARCHAR(20);
    END IF;
END $$;

-- Adicionar constraints para as novas colunas
DO $$
BEGIN
    -- Constraint para formato do tempo_epr
    IF NOT EXISTS (SELECT 1 FROM information_schema.check_constraints WHERE constraint_name = 'tempo_epr_formato_check') THEN
        ALTER TABLE tempo_epr ADD CONSTRAINT tempo_epr_formato_check CHECK (tempo_epr ~ '^[0-5][0-9]:[0-5][0-9]$');
    END IF;
    
    -- Constraint para valores válidos de status
    IF NOT EXISTS (SELECT 1 FROM information_schema.check_constraints WHERE constraint_name = 'tempo_epr_status_check') THEN
        ALTER TABLE tempo_epr ADD CONSTRAINT tempo_epr_status_check CHECK (status IN ('Ideal', 'Tolerável', 'Reprovado'));
    END IF;
END $$;

-- Criar índices se não existirem
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_tempo_epr_data_exercicio') THEN
        CREATE INDEX idx_tempo_epr_data_exercicio ON tempo_epr(data_exercicio_epr DESC);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_tempo_epr_nome_cidade') THEN
        CREATE INDEX idx_tempo_epr_nome_cidade ON tempo_epr(nome_cidade);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_tempo_epr_status') THEN
        CREATE INDEX idx_tempo_epr_status ON tempo_epr(status);
    END IF;
END $$;

-- Função para calcular status baseado no tempo (substituir se existir)
CREATE OR REPLACE FUNCTION calcular_status_epr(tempo_input TEXT)
RETURNS TEXT AS $$
DECLARE
    minutos INTEGER;
    segundos INTEGER;
    total_segundos INTEGER;
BEGIN
    -- Extrair minutos e segundos do formato MM:SS
    minutos := CAST(SPLIT_PART(tempo_input, ':', 1) AS INTEGER);
    segundos := CAST(SPLIT_PART(tempo_input, ':', 2) AS INTEGER);
    
    -- Converter para total de segundos
    total_segundos := (minutos * 60) + segundos;
    
    -- Aplicar regras de status
    IF total_segundos <= 50 THEN
        RETURN 'Ideal';
    ELSIF total_segundos <= 60 THEN
        RETURN 'Tolerável';
    ELSE
        RETURN 'Reprovado';
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Verificar se RLS está habilitado, se não, habilitar
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_tables 
        WHERE tablename = 'tempo_epr' 
        AND rowsecurity = true
    ) THEN
        ALTER TABLE tempo_epr ENABLE ROW LEVEL SECURITY;
    END IF;
END $$;

-- Remover políticas existentes se houver conflito e recriar
DROP POLICY IF EXISTS "Allow read access for anon users" ON tempo_epr;
DROP POLICY IF EXISTS "Allow all operations for authenticated users" ON tempo_epr;

-- Política para permitir leitura para usuários anônimos
CREATE POLICY "Allow read access for anon users" ON tempo_epr
    FOR SELECT USING (true);

-- Política para permitir todas as operações para usuários autenticados
CREATE POLICY "Allow all operations for authenticated users" ON tempo_epr
    FOR ALL USING (auth.role() = 'authenticated');

-- Conceder permissões
GRANT SELECT ON tempo_epr TO anon;
GRANT ALL PRIVILEGES ON tempo_epr TO authenticated;