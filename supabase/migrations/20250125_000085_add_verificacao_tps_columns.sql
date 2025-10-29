-- Migração para adicionar colunas ausentes na tabela verificacao_tps
-- Data: 2025-01-25

-- Adicionar colunas ausentes
ALTER TABLE verificacao_tps 
ADD COLUMN IF NOT EXISTS tp_conforme INTEGER NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS tp_verificado INTEGER NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS tp_total INTEGER NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS nome_cidade VARCHAR(255),
ADD COLUMN IF NOT EXISTS nome_usuario VARCHAR(255),
ADD COLUMN IF NOT EXISTS equipe VARCHAR(100),
ADD COLUMN IF NOT EXISTS data DATE;

-- Migrar dados da coluna data_referencia para data (se necessário)
UPDATE verificacao_tps SET data = data_referencia WHERE data IS NULL;

-- Adicionar constraints de consistência
DO $$ 
BEGIN 
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'check_tp_consistency' 
        AND table_name = 'verificacao_tps'
    ) THEN
        ALTER TABLE verificacao_tps 
        ADD CONSTRAINT check_tp_consistency 
        CHECK (tp_conforme <= tp_verificado AND tp_verificado <= tp_total AND tp_total > 0);
    END IF;
END $$;

-- Adicionar constraint de unicidade
DO $$ 
BEGIN 
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'unique_verificacao_tps' 
        AND table_name = 'verificacao_tps'
    ) THEN
        ALTER TABLE verificacao_tps 
        ADD CONSTRAINT unique_verificacao_tps 
        UNIQUE (secao_id, data, equipe);
    END IF;
END $$;

-- Criar função para preenchimento automático
CREATE OR REPLACE FUNCTION fill_verificacao_tps_info()
RETURNS TRIGGER AS $$
BEGIN
    -- Preencher nome_cidade baseado na seção do usuário
    SELECT s.cidade INTO NEW.nome_cidade
    FROM profiles p
    JOIN secoes s ON p.secao_id = s.id
    WHERE p.id = NEW.usuario_id;
    
    -- Preencher nome_usuario
    SELECT p.nome_completo INTO NEW.nome_usuario
    FROM profiles p
    WHERE p.id = NEW.usuario_id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Criar trigger para preenchimento automático
DROP TRIGGER IF EXISTS trigger_fill_verificacao_tps_info ON verificacao_tps;
CREATE TRIGGER trigger_fill_verificacao_tps_info
    BEFORE INSERT OR UPDATE ON verificacao_tps
    FOR EACH ROW
    EXECUTE FUNCTION fill_verificacao_tps_info();

-- Atualizar políticas RLS
DROP POLICY IF EXISTS "Users can view their own verificacao_tps" ON verificacao_tps;
DROP POLICY IF EXISTS "Users can insert their own verificacao_tps" ON verificacao_tps;
DROP POLICY IF EXISTS "Users can update their own verificacao_tps" ON verificacao_tps;

CREATE POLICY "Users can view their own verificacao_tps" ON verificacao_tps
    FOR SELECT USING (
        usuario_id = auth.uid() OR
        secao_id IN (
            SELECT p.secao_id FROM profiles p WHERE p.id = auth.uid()
        )
    );

CREATE POLICY "Users can insert their own verificacao_tps" ON verificacao_tps
    FOR INSERT WITH CHECK (
        usuario_id = auth.uid() AND
        secao_id IN (
            SELECT p.secao_id FROM profiles p WHERE p.id = auth.uid()
        )
    );

CREATE POLICY "Users can update their own verificacao_tps" ON verificacao_tps
    FOR UPDATE USING (
        usuario_id = auth.uid() AND
        secao_id IN (
            SELECT p.secao_id FROM profiles p WHERE p.id = auth.uid()
        )
    );

-- Comentários para documentação das novas colunas
COMMENT ON COLUMN verificacao_tps.tp_conforme IS 'Quantidade de TPs conformes (deve ser <= tp_verificado)';
COMMENT ON COLUMN verificacao_tps.tp_verificado IS 'Quantidade de TPs verificados (deve ser <= tp_total)';
COMMENT ON COLUMN verificacao_tps.tp_total IS 'Quantidade total de TPs (deve ser > 0)';
COMMENT ON COLUMN verificacao_tps.nome_cidade IS 'Nome da cidade preenchido automaticamente baseado na base';
COMMENT ON COLUMN verificacao_tps.nome_usuario IS 'Nome do usuário preenchido automaticamente baseado no perfil';
COMMENT ON COLUMN verificacao_tps.equipe IS 'Nome da equipe responsável pela verificação';