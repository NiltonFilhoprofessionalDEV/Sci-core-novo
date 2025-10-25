-- Inserir seções de teste
INSERT INTO secoes (nome, codigo, cidade, estado, ativa) VALUES
('Seção de Operações', 'OPS', 'São Paulo', 'SP', true),
('Seção de Manutenção', 'MNT', 'Rio de Janeiro', 'RJ', true),
('Seção de Segurança', 'SEG', 'Brasília', 'DF', true),
('Seção de Treinamento', 'TRN', 'Belo Horizonte', 'MG', true);

-- Inserir equipes de teste para cada seção
INSERT INTO equipes (secao_id, nome, codigo, ativa) VALUES
-- Equipes da Seção de Operações
((SELECT id FROM secoes WHERE codigo = 'OPS'), 'Equipe Alpha', 'OPS-A', true),
((SELECT id FROM secoes WHERE codigo = 'OPS'), 'Equipe Bravo', 'OPS-B', true),
((SELECT id FROM secoes WHERE codigo = 'OPS'), 'Equipe Charlie', 'OPS-C', true),

-- Equipes da Seção de Manutenção
((SELECT id FROM secoes WHERE codigo = 'MNT'), 'Equipe Delta', 'MNT-D', true),
((SELECT id FROM secoes WHERE codigo = 'MNT'), 'Equipe Echo', 'MNT-E', true),

-- Equipes da Seção de Segurança
((SELECT id FROM secoes WHERE codigo = 'SEG'), 'Equipe Foxtrot', 'SEG-F', true),
((SELECT id FROM secoes WHERE codigo = 'SEG'), 'Equipe Golf', 'SEG-G', true),

-- Equipes da Seção de Treinamento
((SELECT id FROM secoes WHERE codigo = 'TRN'), 'Equipe Hotel', 'TRN-H', true),
((SELECT id FROM secoes WHERE codigo = 'TRN'), 'Equipe India', 'TRN-I', true),
((SELECT id FROM secoes WHERE codigo = 'TRN'), 'Equipe Juliet', 'TRN-J', true);