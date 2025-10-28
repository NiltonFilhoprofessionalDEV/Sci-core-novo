-- Adicionar colunas necessárias para o modal de Tempo Resposta
ALTER TABLE tempo_resposta 
ADD COLUMN IF NOT EXISTS nome_cidade VARCHAR(100),
ADD COLUMN IF NOT EXISTS equipe VARCHAR(100),
ADD COLUMN IF NOT EXISTS data_tempo_resposta DATE,
ADD COLUMN IF NOT EXISTS nome_completo VARCHAR(255),
ADD COLUMN IF NOT EXISTS local_posicionamento VARCHAR(255),
ADD COLUMN IF NOT EXISTS cci_utilizado VARCHAR(100),
ADD COLUMN IF NOT EXISTS tempo_exercicio VARCHAR(10), -- Formato HH:MM:SS
ADD COLUMN IF NOT EXISTS observacoes TEXT;

-- Atualizar colunas existentes para NOT NULL onde necessário
UPDATE tempo_resposta SET nome_cidade = '' WHERE nome_cidade IS NULL;
UPDATE tempo_resposta SET equipe = '' WHERE equipe IS NULL;
UPDATE tempo_resposta SET data_tempo_resposta = data_referencia WHERE data_tempo_resposta IS NULL;
UPDATE tempo_resposta SET nome_completo = '' WHERE nome_completo IS NULL;
UPDATE tempo_resposta SET local_posicionamento = '' WHERE local_posicionamento IS NULL;
UPDATE tempo_resposta SET cci_utilizado = '' WHERE cci_utilizado IS NULL;
UPDATE tempo_resposta SET tempo_exercicio = '00:00:00' WHERE tempo_exercicio IS NULL;

-- Aplicar NOT NULL constraints
ALTER TABLE tempo_resposta 
ALTER COLUMN nome_cidade SET NOT NULL,
ALTER COLUMN equipe SET NOT NULL,
ALTER COLUMN data_tempo_resposta SET NOT NULL,
ALTER COLUMN nome_completo SET NOT NULL,
ALTER COLUMN local_posicionamento SET NOT NULL,
ALTER COLUMN cci_utilizado SET NOT NULL,
ALTER COLUMN tempo_exercicio SET NOT NULL;

-- Criar índices adicionais se não existirem
CREATE INDEX IF NOT EXISTS idx_tempo_resposta_data_tempo ON tempo_resposta(data_tempo_resposta DESC);
CREATE INDEX IF NOT EXISTS idx_tempo_resposta_nome_cidade ON tempo_resposta(nome_cidade);

-- Verificar se as políticas RLS existem, se não, criar
DO $$
BEGIN
    -- Política para SELECT
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'tempo_resposta' 
        AND policyname = 'Users can view tempo_resposta from their section'
    ) THEN
        CREATE POLICY "Users can view tempo_resposta from their section" ON tempo_resposta
            FOR SELECT USING (
                secao_id IN (
                    SELECT p.secao_id FROM profiles p WHERE p.id = auth.uid()
                )
            );
    END IF;

    -- Política para INSERT
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'tempo_resposta' 
        AND policyname = 'Users can insert tempo_resposta for their section'
    ) THEN
        CREATE POLICY "Users can insert tempo_resposta for their section" ON tempo_resposta
            FOR INSERT WITH CHECK (
                secao_id IN (
                    SELECT p.secao_id FROM profiles p WHERE p.id = auth.uid()
                )
                AND usuario_id = auth.uid()
            );
    END IF;

    -- Política para UPDATE
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'tempo_resposta' 
        AND policyname = 'Users can update their own tempo_resposta'
    ) THEN
        CREATE POLICY "Users can update their own tempo_resposta" ON tempo_resposta
            FOR UPDATE USING (usuario_id = auth.uid());
    END IF;

    -- Política para DELETE
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'tempo_resposta' 
        AND policyname = 'Users can delete their own tempo_resposta'
    ) THEN
        CREATE POLICY "Users can delete their own tempo_resposta" ON tempo_resposta
            FOR DELETE USING (usuario_id = auth.uid());
    END IF;
END
$$;

-- Garantir permissões
GRANT SELECT ON tempo_resposta TO anon;
GRANT ALL PRIVILEGES ON tempo_resposta TO authenticated;