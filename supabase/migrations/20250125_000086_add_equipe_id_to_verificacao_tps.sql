-- Migração para adicionar coluna equipe_id na tabela verificacao_tps
-- Data: 2025-01-25
-- Descrição: Adicionar referência à tabela equipes para melhor integridade dos dados

-- Adicionar coluna equipe_id com referência à tabela equipes
ALTER TABLE verificacao_tps 
ADD COLUMN IF NOT EXISTS equipe_id UUID REFERENCES equipes(id) ON DELETE SET NULL;

-- Criar índice para performance
CREATE INDEX IF NOT EXISTS idx_verificacao_tps_equipe_id ON verificacao_tps(equipe_id);

-- Atualizar a função de preenchimento automático para incluir equipe_id
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
    
    -- Se equipe_id não foi fornecido mas temos o nome da equipe, tentar buscar o ID
    IF NEW.equipe_id IS NULL AND NEW.equipe IS NOT NULL THEN
        SELECT e.id INTO NEW.equipe_id
        FROM equipes e
        JOIN profiles p ON p.secao_id = e.secao_id
        WHERE e.nome = NEW.equipe 
        AND p.id = NEW.usuario_id
        LIMIT 1;
    END IF;
    
    -- Se equipe_id foi fornecido mas não temos o nome da equipe, buscar o nome
    IF NEW.equipe_id IS NOT NULL AND (NEW.equipe IS NULL OR NEW.equipe = '') THEN
        SELECT e.nome INTO NEW.equipe
        FROM equipes e
        WHERE e.id = NEW.equipe_id;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Comentário para documentação
COMMENT ON COLUMN verificacao_tps.equipe_id IS 'ID da equipe responsável pela verificação (referência à tabela equipes)';