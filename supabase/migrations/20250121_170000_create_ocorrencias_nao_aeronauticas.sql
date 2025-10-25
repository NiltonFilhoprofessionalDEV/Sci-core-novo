-- Migração para criar tabela de ocorrências não aeronáuticas
-- Data: 2025-01-21 17:00:00

-- Criar tabela principal
CREATE TABLE ocorrencias_nao_aeronauticas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    base TEXT NOT NULL,
    data_ocorrencia DATE NOT NULL,
    equipe TEXT NOT NULL,
    tipo_ocorrencia TEXT NOT NULL CHECK (
        tipo_ocorrencia IN (
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
    ),
    local_ocorrencia TEXT NOT NULL,
    hora_acionamento TIME NOT NULL,
    hora_chegada TIME NOT NULL,
    hora_termino TIME NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Constraint para validar sequência de horários
    CONSTRAINT valid_time_sequence CHECK (
        hora_acionamento <= hora_chegada AND 
        hora_chegada <= hora_termino
    ),
    
    -- Constraint para validar data não futura
    CONSTRAINT valid_date CHECK (data_ocorrencia <= CURRENT_DATE)
);

-- Criar índices para performance
CREATE INDEX idx_ocorrencias_nao_aeronauticas_data ON ocorrencias_nao_aeronauticas(data_ocorrencia DESC);
CREATE INDEX idx_ocorrencias_nao_aeronauticas_base ON ocorrencias_nao_aeronauticas(base);
CREATE INDEX idx_ocorrencias_nao_aeronauticas_tipo ON ocorrencias_nao_aeronauticas(tipo_ocorrencia);
CREATE INDEX idx_ocorrencias_nao_aeronauticas_created_at ON ocorrencias_nao_aeronauticas(created_at DESC);

-- Trigger para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_ocorrencias_nao_aeronauticas_updated_at
    BEFORE UPDATE ON ocorrencias_nao_aeronauticas
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Políticas de segurança RLS (Row Level Security)
ALTER TABLE ocorrencias_nao_aeronauticas ENABLE ROW LEVEL SECURITY;

-- Política para usuários autenticados poderem inserir
CREATE POLICY "Usuários autenticados podem inserir ocorrências" ON ocorrencias_nao_aeronauticas
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Política para usuários autenticados poderem visualizar
CREATE POLICY "Usuários autenticados podem visualizar ocorrências" ON ocorrencias_nao_aeronauticas
    FOR SELECT USING (auth.role() = 'authenticated');

-- Política para usuários autenticados poderem atualizar suas próprias ocorrências
CREATE POLICY "Usuários podem atualizar suas ocorrências" ON ocorrencias_nao_aeronauticas
    FOR UPDATE USING (auth.role() = 'authenticated');

-- Conceder permissões básicas
GRANT SELECT ON ocorrencias_nao_aeronauticas TO anon;
GRANT ALL PRIVILEGES ON ocorrencias_nao_aeronauticas TO authenticated;

-- Dados iniciais para teste (opcional)
INSERT INTO ocorrencias_nao_aeronauticas (
    base, data_ocorrencia, equipe, tipo_ocorrencia, 
    local_ocorrencia, hora_acionamento, hora_chegada, hora_termino
) VALUES 
(
    'BA-CE', 
    '2024-01-15', 
    'Equipe Alpha', 
    'Emergências Médicas em Geral',
    'Terminal de Passageiros - Portão 5',
    '14:30:00',
    '14:35:00', 
    '15:15:00'
),
(
    'BA-CE', 
    '2024-01-20', 
    'Equipe Bravo', 
    'Incêndio em Instalações Aeroportuárias',
    'Hangar de Manutenção - Setor Norte',
    '09:15:00',
    '09:20:00', 
    '10:45:00'
);

-- Comentários para documentação
COMMENT ON TABLE ocorrencias_nao_aeronauticas IS 'Tabela para registro de ocorrências não aeronáuticas do sistema de indicadores bombeiro';
COMMENT ON COLUMN ocorrencias_nao_aeronauticas.base IS 'Base onde ocorreu o evento (ex: BA-CE)';
COMMENT ON COLUMN ocorrencias_nao_aeronauticas.data_ocorrencia IS 'Data em que a ocorrência aconteceu';
COMMENT ON COLUMN ocorrencias_nao_aeronauticas.equipe IS 'Equipe que atendeu a ocorrência';
COMMENT ON COLUMN ocorrencias_nao_aeronauticas.tipo_ocorrencia IS 'Tipo/categoria da ocorrência não aeronáutica';
COMMENT ON COLUMN ocorrencias_nao_aeronauticas.local_ocorrencia IS 'Local específico onde aconteceu a ocorrência';
COMMENT ON COLUMN ocorrencias_nao_aeronauticas.hora_acionamento IS 'Horário em que a equipe foi acionada';
COMMENT ON COLUMN ocorrencias_nao_aeronauticas.hora_chegada IS 'Horário em que a equipe chegou ao local';
COMMENT ON COLUMN ocorrencias_nao_aeronauticas.hora_termino IS 'Horário em que a ocorrência foi finalizada';