-- Adicionar colunas específicas para atividades acessórias
-- Migration para adicionar campos do formulário de atividades acessórias

-- Adicionar colunas específicas do formulário
ALTER TABLE atividades_acessorias 
ADD COLUMN IF NOT EXISTS data_atividade DATE NOT NULL DEFAULT CURRENT_DATE,
ADD COLUMN IF NOT EXISTS tipo_atividade VARCHAR(255) NOT NULL DEFAULT 'Inspeção de extintores',
ADD COLUMN IF NOT EXISTS qtd_equipamentos INTEGER NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS qtd_bombeiros INTEGER NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS tempo_gasto TIME NOT NULL DEFAULT '00:00:00',
ADD COLUMN IF NOT EXISTS cidade_aeroporto TEXT NOT NULL DEFAULT '',
ADD COLUMN IF NOT EXISTS equipe_nome TEXT NOT NULL DEFAULT '',
ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES auth.users(id);

-- Adicionar comentários para documentação
COMMENT ON COLUMN atividades_acessorias.data_atividade IS 'Data em que a atividade foi realizada';
COMMENT ON COLUMN atividades_acessorias.tipo_atividade IS 'Tipo de atividade realizada (ex: Inspeção de extintores)';
COMMENT ON COLUMN atividades_acessorias.qtd_equipamentos IS 'Quantidade de equipamentos inspecionados';
COMMENT ON COLUMN atividades_acessorias.qtd_bombeiros IS 'Quantidade de bombeiros que participaram da atividade';
COMMENT ON COLUMN atividades_acessorias.tempo_gasto IS 'Tempo total gasto na atividade (formato HH:MM:SS)';
COMMENT ON COLUMN atividades_acessorias.cidade_aeroporto IS 'Nome da cidade do aeroporto (preenchido automaticamente)';
COMMENT ON COLUMN atividades_acessorias.equipe_nome IS 'Nome da equipe (preenchido automaticamente)';
COMMENT ON COLUMN atividades_acessorias.created_by IS 'ID do usuário que criou o registro';

-- Adicionar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_atividades_acessorias_data_atividade ON atividades_acessorias(data_atividade);
CREATE INDEX IF NOT EXISTS idx_atividades_acessorias_tipo_atividade ON atividades_acessorias(tipo_atividade);
CREATE INDEX IF NOT EXISTS idx_atividades_acessorias_created_by ON atividades_acessorias(created_by);

-- Adicionar constraint para validar data da atividade (não pode ser futura)
ALTER TABLE atividades_acessorias 
ADD CONSTRAINT check_data_atividade_not_future 
CHECK (data_atividade <= CURRENT_DATE);

-- Adicionar constraint para validar quantidades (não podem ser negativas)
ALTER TABLE atividades_acessorias 
ADD CONSTRAINT check_qtd_equipamentos_positive 
CHECK (qtd_equipamentos >= 0);

ALTER TABLE atividades_acessorias 
ADD CONSTRAINT check_qtd_bombeiros_positive 
CHECK (qtd_bombeiros >= 0);