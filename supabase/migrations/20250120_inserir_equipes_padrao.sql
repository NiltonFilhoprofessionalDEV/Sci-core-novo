-- Migração para inserir as 5 equipes padrão para cada seção
-- Equipes: Alfa, Bravo, Charlie, Delta, Foxtrot

-- Inserir as 5 equipes padrão para cada seção existente
INSERT INTO equipes (secao_id, nome, codigo, ativa, created_at, updated_at)
SELECT 
    s.id as secao_id,
    equipe_info.nome,
    equipe_info.codigo,
    true as ativa,
    NOW() as created_at,
    NOW() as updated_at
FROM secoes s
CROSS JOIN (
    VALUES 
        ('Alfa', 'ALF'),
        ('Bravo', 'BRV'),
        ('Charlie', 'CHA'),
        ('Delta', 'DLT'),
        ('Foxtrot', 'FOX')
) AS equipe_info(nome, codigo)
WHERE s.ativa = true
ON CONFLICT (secao_id, nome) DO NOTHING;

-- Criar índices para melhorar performance
CREATE INDEX IF NOT EXISTS idx_equipes_secao_nome ON equipes(secao_id, nome);
CREATE INDEX IF NOT EXISTS idx_equipes_ativa ON equipes(ativa) WHERE ativa = true;