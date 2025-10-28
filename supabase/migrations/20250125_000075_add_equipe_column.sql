-- Adicionar coluna 'equipe' nas tabelas tempo_epr, ptr_ba_horas_treinamento e ptr_ba_provas_teoricas
-- Esta coluna armazenará o nome da equipe referenciada

-- Adicionar coluna 'equipe' na tabela tempo_epr
ALTER TABLE tempo_epr 
ADD COLUMN equipe VARCHAR(255);

-- Adicionar coluna 'equipe' na tabela ptr_ba_horas_treinamento
ALTER TABLE ptr_ba_horas_treinamento 
ADD COLUMN equipe VARCHAR(255);

-- Adicionar coluna 'equipe' na tabela ptr_ba_provas_teoricas
ALTER TABLE ptr_ba_provas_teoricas 
ADD COLUMN equipe VARCHAR(255);

-- Comentários para documentação
COMMENT ON COLUMN tempo_epr.equipe IS 'Nome da equipe referenciada';
COMMENT ON COLUMN ptr_ba_horas_treinamento.equipe IS 'Nome da equipe referenciada';
COMMENT ON COLUMN ptr_ba_provas_teoricas.equipe IS 'Nome da equipe referenciada';