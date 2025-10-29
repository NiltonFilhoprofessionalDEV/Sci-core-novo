-- Criar tabela tempo_epr
CREATE TABLE tempo_epr (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nome_cidade VARCHAR(255) NOT NULL,
    data_exercicio_epr DATE NOT NULL,
    nome_completo VARCHAR(255) NOT NULL,
    tempo_epr VARCHAR(10) NOT NULL CHECK (tempo_epr ~ '^[0-5][0-9]:[0-5][0-9]$'),
    status VARCHAR(20) NOT NULL CHECK (status IN ('Ideal', 'Tolerável', 'Reprovado')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar índices para otimização
CREATE INDEX idx_tempo_epr_data ON tempo_epr(data_exercicio_epr DESC);
CREATE INDEX idx_tempo_epr_cidade ON tempo_epr(nome_cidade);
CREATE INDEX idx_tempo_epr_status ON tempo_epr(status);

-- Função para calcular status baseado no tempo
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

-- Habilitar RLS (Row Level Security)
ALTER TABLE tempo_epr ENABLE ROW LEVEL SECURITY;

-- Política para permitir leitura para usuários anônimos
CREATE POLICY "Allow read access for anon users" ON tempo_epr
    FOR SELECT USING (true);

-- Política para permitir todas as operações para usuários autenticados
CREATE POLICY "Allow all operations for authenticated users" ON tempo_epr
    FOR ALL USING (auth.role() = 'authenticated');

-- Conceder permissões
GRANT SELECT ON tempo_epr TO anon;
GRANT ALL PRIVILEGES ON tempo_epr TO authenticated;