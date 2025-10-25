-- Migração para ajustar tabela de ocorrências não aeronáuticas (versão 2)
-- Data: 2025-01-21 17:20:00

-- Adicionar colunas necessárias para o modal de ocorrências não aeronáuticas
DO $$
BEGIN
    -- Adicionar coluna base se não existir
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'ocorrencias_nao_aeronauticas' AND column_name = 'base') THEN
        ALTER TABLE ocorrencias_nao_aeronauticas ADD COLUMN base TEXT;
    END IF;
    
    -- Adicionar coluna data_ocorrencia se não existir
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'ocorrencias_nao_aeronauticas' AND column_name = 'data_ocorrencia') THEN
        ALTER TABLE ocorrencias_nao_aeronauticas ADD COLUMN data_ocorrencia DATE;
    END IF;
    
    -- Adicionar coluna equipe se não existir
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'ocorrencias_nao_aeronauticas' AND column_name = 'equipe') THEN
        ALTER TABLE ocorrencias_nao_aeronauticas ADD COLUMN equipe TEXT;
    END IF;
    
    -- Adicionar coluna tipo_ocorrencia se não existir
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'ocorrencias_nao_aeronauticas' AND column_name = 'tipo_ocorrencia') THEN
        ALTER TABLE ocorrencias_nao_aeronauticas ADD COLUMN tipo_ocorrencia TEXT;
    END IF;
    
    -- Adicionar coluna local_ocorrencia se não existir
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'ocorrencias_nao_aeronauticas' AND column_name = 'local_ocorrencia') THEN
        ALTER TABLE ocorrencias_nao_aeronauticas ADD COLUMN local_ocorrencia TEXT;
    END IF;
    
    -- Adicionar coluna hora_acionamento se não existir
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'ocorrencias_nao_aeronauticas' AND column_name = 'hora_acionamento') THEN
        ALTER TABLE ocorrencias_nao_aeronauticas ADD COLUMN hora_acionamento TIME;
    END IF;
    
    -- Adicionar coluna hora_chegada se não existir
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'ocorrencias_nao_aeronauticas' AND column_name = 'hora_chegada') THEN
        ALTER TABLE ocorrencias_nao_aeronauticas ADD COLUMN hora_chegada TIME;
    END IF;
    
    -- Adicionar coluna hora_termino se não existir
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'ocorrencias_nao_aeronauticas' AND column_name = 'hora_termino') THEN
        ALTER TABLE ocorrencias_nao_aeronauticas ADD COLUMN hora_termino TIME;
    END IF;
END
$$;

-- Adicionar constraints
DO $$
BEGIN
    -- Constraint para validar tipos de ocorrência
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'check_tipo_ocorrencia') THEN
        ALTER TABLE ocorrencias_nao_aeronauticas 
        ADD CONSTRAINT check_tipo_ocorrencia CHECK (
            tipo_ocorrencia IS NULL OR tipo_ocorrencia IN (
                'Incêndios ou Vazamentos de Combustíveis no PAA',
                'Condições de Baixa Visibilidade',
                'Atendimento a Aeronave Presidencial',
                'Incêndio em Instalações Aeroportuárias',
                'Ocorrências com Artigos Perigosos',
                'Remoção de Animais e Dispersão de Avifauna',
                'Incêndios Florestais ou em Áreas de Cobertura Vegetal Próximas ao Aeródromo',
                'Emergências Médicas em Geral',
                'Iluminação de Emergência em Pista de Pouso e Decolagem'
            )
        );
    END IF;

    -- Constraint para validar sequência de horários
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'check_valid_time_sequence') THEN
        ALTER TABLE ocorrencias_nao_aeronauticas 
        ADD CONSTRAINT check_valid_time_sequence CHECK (
            (hora_acionamento IS NULL OR hora_chegada IS NULL OR hora_termino IS NULL) OR
            (hora_acionamento <= hora_chegada AND hora_chegada <= hora_termino)
        );
    END IF;

    -- Constraint para validar data não futura
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'check_valid_date') THEN
        ALTER TABLE ocorrencias_nao_aeronauticas 
        ADD CONSTRAINT check_valid_date CHECK (
            data_ocorrencia IS NULL OR data_ocorrencia <= CURRENT_DATE
        );
    END IF;
END
$$;

-- Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_ocorrencias_nao_aeronauticas_data_ocorrencia ON ocorrencias_nao_aeronauticas(data_ocorrencia DESC);
CREATE INDEX IF NOT EXISTS idx_ocorrencias_nao_aeronauticas_base ON ocorrencias_nao_aeronauticas(base);
CREATE INDEX IF NOT EXISTS idx_ocorrencias_nao_aeronauticas_tipo ON ocorrencias_nao_aeronauticas(tipo_ocorrencia);

-- Criar função e trigger para updated_at
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_trigger 
        WHERE tgname = 'update_ocorrencias_nao_aeronauticas_updated_at'
    ) THEN
        -- Criar função se não existir
        CREATE OR REPLACE FUNCTION update_updated_at_column()
        RETURNS TRIGGER AS $func$
        BEGIN
            NEW.updated_at = NOW();
            RETURN NEW;
        END;
        $func$ language 'plpgsql';

        -- Criar trigger
        CREATE TRIGGER update_ocorrencias_nao_aeronauticas_updated_at
            BEFORE UPDATE ON ocorrencias_nao_aeronauticas
            FOR EACH ROW
            EXECUTE FUNCTION update_updated_at_column();
    END IF;
END
$$;

-- Ajustar políticas RLS
DROP POLICY IF EXISTS "Usuários autenticados podem inserir ocorrências" ON ocorrencias_nao_aeronauticas;
DROP POLICY IF EXISTS "Usuários autenticados podem visualizar ocorrências" ON ocorrencias_nao_aeronauticas;
DROP POLICY IF EXISTS "Usuários podem atualizar suas ocorrências" ON ocorrencias_nao_aeronauticas;

-- Recriar políticas
CREATE POLICY "Usuários autenticados podem inserir ocorrências" ON ocorrencias_nao_aeronauticas
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Usuários autenticados podem visualizar ocorrências" ON ocorrencias_nao_aeronauticas
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Usuários podem atualizar suas ocorrências" ON ocorrencias_nao_aeronauticas
    FOR UPDATE USING (auth.role() = 'authenticated');

-- Garantir permissões
GRANT SELECT ON ocorrencias_nao_aeronauticas TO anon;
GRANT ALL PRIVILEGES ON ocorrencias_nao_aeronauticas TO authenticated;

-- Comentários para documentação das novas colunas
COMMENT ON COLUMN ocorrencias_nao_aeronauticas.base IS 'Base onde ocorreu o evento (ex: BA-CE)';
COMMENT ON COLUMN ocorrencias_nao_aeronauticas.data_ocorrencia IS 'Data em que a ocorrência aconteceu';
COMMENT ON COLUMN ocorrencias_nao_aeronauticas.equipe IS 'Equipe que atendeu a ocorrência';
COMMENT ON COLUMN ocorrencias_nao_aeronauticas.tipo_ocorrencia IS 'Tipo/categoria da ocorrência não aeronáutica';
COMMENT ON COLUMN ocorrencias_nao_aeronauticas.local_ocorrencia IS 'Local específico onde aconteceu a ocorrência';
COMMENT ON COLUMN ocorrencias_nao_aeronauticas.hora_acionamento IS 'Horário em que a equipe foi acionada';
COMMENT ON COLUMN ocorrencias_nao_aeronauticas.hora_chegada IS 'Horário em que a equipe chegou ao local';
COMMENT ON COLUMN ocorrencias_nao_aeronauticas.hora_termino IS 'Horário em que a ocorrência foi finalizada';