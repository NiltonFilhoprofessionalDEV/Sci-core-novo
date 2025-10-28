-- =====================================================
-- Migration: Criar tabela PTR-BA Provas Teóricas
-- Data: 2025-01-25
-- Descrição: Criação da tabela ptr_ba_provas_teoricas para registro de notas das provas teóricas
-- =====================================================

-- Criar tabela para provas teóricas PTR-BA
CREATE TABLE ptr_ba_provas_teoricas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nome_cidade VARCHAR(100) NOT NULL,
    data_prova DATE NOT NULL,
    nome_completo VARCHAR(255) NOT NULL,
    nota_prova DECIMAL(3,1) NOT NULL CHECK (nota_prova >= 0.0 AND nota_prova <= 10.0),
    status VARCHAR(20) NOT NULL CHECK (status IN ('Aprovado', 'Reprovado')),
    observacoes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar índices para performance
CREATE INDEX idx_ptr_ba_provas_nome_cidade ON ptr_ba_provas_teoricas(nome_cidade);
CREATE INDEX idx_ptr_ba_provas_data_prova ON ptr_ba_provas_teoricas(data_prova DESC);
CREATE INDEX idx_ptr_ba_provas_status ON ptr_ba_provas_teoricas(status);
CREATE INDEX idx_ptr_ba_provas_created_at ON ptr_ba_provas_teoricas(created_at DESC);

-- Verificar se a função update_updated_at_column já existe
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'update_updated_at_column') THEN
        -- Criar função para atualizar updated_at
        CREATE OR REPLACE FUNCTION update_updated_at_column()
        RETURNS TRIGGER AS $func$
        BEGIN
            NEW.updated_at = NOW();
            RETURN NEW;
        END;
        $func$ language 'plpgsql';
    END IF;
END
$$;

-- Criar trigger para atualizar updated_at
CREATE TRIGGER update_ptr_ba_provas_teoricas_updated_at 
    BEFORE UPDATE ON ptr_ba_provas_teoricas 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Habilitar Row Level Security
ALTER TABLE ptr_ba_provas_teoricas ENABLE ROW LEVEL SECURITY;

-- Permitir leitura para usuários autenticados
CREATE POLICY "allow_read_ptr_ba_provas" ON ptr_ba_provas_teoricas
    FOR SELECT USING (auth.role() = 'authenticated');

-- Permitir inserção para usuários autenticados
CREATE POLICY "allow_insert_ptr_ba_provas" ON ptr_ba_provas_teoricas
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Permitir atualização para usuários autenticados
CREATE POLICY "allow_update_ptr_ba_provas" ON ptr_ba_provas_teoricas
    FOR UPDATE USING (auth.role() = 'authenticated');

-- Conceder permissões para roles anon e authenticated
GRANT SELECT ON ptr_ba_provas_teoricas TO anon;
GRANT ALL PRIVILEGES ON ptr_ba_provas_teoricas TO authenticated;

-- Dados iniciais de exemplo para teste
INSERT INTO ptr_ba_provas_teoricas (nome_cidade, data_prova, nome_completo, nota_prova, status, observacoes)
VALUES 
    ('Belo Horizonte', '2025-01-20', 'João Silva Santos', 8.5, 'Aprovado', ''),
    ('Belo Horizonte', '2025-01-20', 'Maria Oliveira Costa', 7.2, 'Reprovado', ''),
    ('Confins', '2025-01-18', 'Pedro Almeida Lima', 9.0, 'Aprovado', ''),
    ('Confins', '2025-01-18', 'Ana Carolina Souza', 6.8, 'Reprovado', 'Necessita reforço em regulamentação'),
    ('Goiânia', '2025-01-15', 'Carlos Eduardo Ferreira', 0.0, 'Reprovado', 'Férias - não realizou a prova');

-- Log de sucesso
DO $$
BEGIN
    RAISE NOTICE 'Tabela ptr_ba_provas_teoricas criada com sucesso!';
    RAISE NOTICE 'Índices criados: nome_cidade, data_prova, status, created_at';
    RAISE NOTICE 'Políticas RLS configuradas para usuários autenticados';
    RAISE NOTICE 'Dados de exemplo inseridos: 5 registros';
END
$$;