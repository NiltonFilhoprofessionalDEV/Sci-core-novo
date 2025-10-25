-- Migração para ajustar tabela de ocorrências não aeronáuticas
-- Data: 2025-01-21 17:10:00

-- Adicionar colunas necessárias para o modal de ocorrências não aeronáuticas
ALTER TABLE ocorrencias_nao_aeronauticas 
ADD COLUMN IF NOT EXISTS base TEXT,
ADD COLUMN IF NOT EXISTS data_ocorrencia DATE,
ADD COLUMN IF NOT EXISTS equipe TEXT,
ADD COLUMN IF NOT EXISTS tipo_ocorrencia TEXT,
ADD COLUMN IF NOT EXISTS local_ocorrencia TEXT,
ADD COLUMN IF NOT EXISTS hora_acionamento TIME,
ADD COLUMN IF NOT EXISTS hora_chegada TIME,
ADD COLUMN IF NOT EXISTS hora_termino TIME;

-- Adicionar constraint para validar tipos de ocorrência
ALTER TABLE ocorrencias_nao_aeronauticas 
ADD CONSTRAINT IF NOT EXISTS check_tipo_ocorrencia CHECK (
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

-- Adicionar constraint para validar sequência de horários
ALTER TABLE ocorrencias_nao_aeronauticas 
ADD CONSTRAINT IF NOT EXISTS check_valid_time_sequence CHECK (
    (hora_acionamento IS NULL OR hora_chegada IS NULL OR hora_termino IS NULL) OR
    (hora_acionamento <= hora_chegada AND hora_chegada <= hora_termino)
);

-- Adicionar constraint para validar data não futura
ALTER TABLE ocorrencias_nao_aeronauticas 
ADD CONSTRAINT IF NOT EXISTS check_valid_date CHECK (
    data_ocorrencia IS NULL OR data_ocorrencia <= CURRENT_DATE
);

-- Criar índices para performance (se não existirem)
CREATE INDEX IF NOT EXISTS idx_ocorrencias_nao_aeronauticas_data_ocorrencia ON ocorrencias_nao_aeronauticas(data_ocorrencia DESC);
CREATE INDEX IF NOT EXISTS idx_ocorrencias_nao_aeronauticas_base ON ocorrencias_nao_aeronauticas(base);
CREATE INDEX IF NOT EXISTS idx_ocorrencias_nao_aeronauticas_tipo ON ocorrencias_nao_aeronauticas(tipo_ocorrencia);

-- Verificar se o trigger de updated_at já existe, se não, criar
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

-- Verificar e ajustar políticas RLS
-- Remover políticas existentes se necessário e recriar
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

-- Dados de teste para as novas colunas
INSERT INTO ocorrencias_nao_aeronauticas (
    secao_id, usuario_id, data_referencia,
    base, data_ocorrencia, equipe, tipo_ocorrencia, 
    local_ocorrencia, hora_acionamento, hora_chegada, hora_termino
) 
SELECT 
    s.id as secao_id,
    p.id as usuario_id,
    '2024-01-15'::date as data_referencia,
    'BA-CE' as base,
    '2024-01-15'::date as data_ocorrencia,
    'Equipe Alpha' as equipe,
    'Emergências Médicas em Geral' as tipo_ocorrencia,
    'Terminal de Passageiros - Portão 5' as local_ocorrencia,
    '14:30:00'::time as hora_acionamento,
    '14:35:00'::time as hora_chegada,
    '15:15:00'::time as hora_termino
FROM secoes s
CROSS JOIN profiles p
WHERE s.codigo = 'BA-CE' 
  AND p.email LIKE '%@%'
  AND NOT EXISTS (
      SELECT 1 FROM ocorrencias_nao_aeronauticas 
      WHERE base = 'BA-CE' AND equipe = 'Equipe Alpha'
  )
LIMIT 1;

-- Comentários para documentação das novas colunas
COMMENT ON COLUMN ocorrencias_nao_aeronauticas.base IS 'Base onde ocorreu o evento (ex: BA-CE)';
COMMENT ON COLUMN ocorrencias_nao_aeronauticas.data_ocorrencia IS 'Data em que a ocorrência aconteceu';
COMMENT ON COLUMN ocorrencias_nao_aeronauticas.equipe IS 'Equipe que atendeu a ocorrência';
COMMENT ON COLUMN ocorrencias_nao_aeronauticas.tipo_ocorrencia IS 'Tipo/categoria da ocorrência não aeronáutica';
COMMENT ON COLUMN ocorrencias_nao_aeronauticas.local_ocorrencia IS 'Local específico onde aconteceu a ocorrência';
COMMENT ON COLUMN ocorrencias_nao_aeronauticas.hora_acionamento IS 'Horário em que a equipe foi acionada';
COMMENT ON COLUMN ocorrencias_nao_aeronauticas.hora_chegada IS 'Horário em que a equipe chegou ao local';
COMMENT ON COLUMN ocorrencias_nao_aeronauticas.hora_termino IS 'Horário em que a ocorrência foi finalizada';