-- Migração para remover equipes duplicadas com prefixo "Equipe "
-- Mantém apenas as equipes com nomes simples: Alfa, Bravo, Charlie, Delta, Foxtrot

-- PASSO 1: Atualizar referências na tabela profiles
-- Atualizar profiles que referenciam equipes com prefixo "Equipe " para as equipes corretas
UPDATE profiles 
SET equipe_id = (
  SELECT e_correta.id 
  FROM equipes e_correta 
  JOIN equipes e_duplicada ON e_duplicada.id = profiles.equipe_id
  WHERE e_correta.nome = REPLACE(e_duplicada.nome, 'Equipe ', '')
    AND e_correta.secao_id = e_duplicada.secao_id
    AND e_duplicada.nome LIKE 'Equipe %'
)
WHERE equipe_id IN (
  SELECT id FROM equipes WHERE nome LIKE 'Equipe %'
);

-- PASSO 2: Atualizar referências na tabela preenchimentos (se existir)
UPDATE preenchimentos 
SET equipe_id = (
  SELECT e_correta.id 
  FROM equipes e_correta 
  JOIN equipes e_duplicada ON e_duplicada.id = preenchimentos.equipe_id
  WHERE e_correta.nome = REPLACE(e_duplicada.nome, 'Equipe ', '')
    AND e_correta.secao_id = e_duplicada.secao_id
    AND e_duplicada.nome LIKE 'Equipe %'
)
WHERE equipe_id IN (
  SELECT id FROM equipes WHERE nome LIKE 'Equipe %'
);

-- PASSO 3: Deletar equipes com prefixo "Equipe " que são duplicatas
DELETE FROM equipes 
WHERE nome IN ('Equipe Alfa', 'Equipe Bravo', 'Equipe Charlie', 'Equipe Delta', 'Equipe Foxtrot');

-- Verificar se restaram apenas as 5 equipes padrão por seção
-- Esta query deve retornar 175 (35 seções × 5 equipes)
-- SELECT COUNT(*) FROM equipes WHERE ativa = true;

-- Criar índice para otimizar consultas por seção e nome
CREATE INDEX IF NOT EXISTS idx_equipes_secao_nome ON equipes(secao_id, nome);

-- Comentário: Esta migração remove as equipes duplicadas com prefixo "Equipe "
-- mantendo apenas as versões simples dos nomes (Alfa, Bravo, Charlie, Delta, Foxtrot)