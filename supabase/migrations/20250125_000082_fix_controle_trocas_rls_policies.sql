-- Corrigir políticas RLS da tabela controle_trocas
-- Problema: O hook está tentando inserir campos que não existem na estrutura da tabela

-- Primeiro, vamos adicionar os campos que estão sendo usados pelo hook
ALTER TABLE controle_trocas 
ADD COLUMN IF NOT EXISTS secao_id UUID REFERENCES secoes(id),
ADD COLUMN IF NOT EXISTS equipe_id UUID REFERENCES equipes(id),
ADD COLUMN IF NOT EXISTS usuario_id UUID REFERENCES auth.users(id);

-- Remover as políticas RLS existentes que podem estar causando conflito
DROP POLICY IF EXISTS "Usuários autenticados podem inserir controle_trocas" ON controle_trocas;
DROP POLICY IF EXISTS "Usuários autenticados podem visualizar controle_trocas" ON controle_trocas;

-- Criar novas políticas RLS mais específicas
CREATE POLICY "Usuários autenticados podem inserir controle_trocas" ON controle_trocas
    FOR INSERT TO authenticated
    WITH CHECK (
        -- Permitir inserção se o usuário está autenticado
        auth.uid() IS NOT NULL
    );

CREATE POLICY "Usuários autenticados podem visualizar controle_trocas" ON controle_trocas
    FOR SELECT TO authenticated
    USING (
        -- Permitir visualização se o usuário está autenticado
        auth.uid() IS NOT NULL
    );

CREATE POLICY "Usuários autenticados podem atualizar controle_trocas" ON controle_trocas
    FOR UPDATE TO authenticated
    USING (
        -- Permitir atualização se o usuário está autenticado
        auth.uid() IS NOT NULL
    )
    WITH CHECK (
        -- Permitir atualização se o usuário está autenticado
        auth.uid() IS NOT NULL
    );

CREATE POLICY "Usuários autenticados podem deletar controle_trocas" ON controle_trocas
    FOR DELETE TO authenticated
    USING (
        -- Permitir deleção se o usuário está autenticado
        auth.uid() IS NOT NULL
    );

-- Criar índices para os novos campos
CREATE INDEX IF NOT EXISTS idx_controle_trocas_secao_id ON controle_trocas(secao_id);
CREATE INDEX IF NOT EXISTS idx_controle_trocas_equipe_id ON controle_trocas(equipe_id);
CREATE INDEX IF NOT EXISTS idx_controle_trocas_usuario_id ON controle_trocas(usuario_id);

-- Comentários para os novos campos
COMMENT ON COLUMN controle_trocas.secao_id IS 'ID da seção/base (referência para secoes)';
COMMENT ON COLUMN controle_trocas.equipe_id IS 'ID da equipe (referência para equipes)';
COMMENT ON COLUMN controle_trocas.usuario_id IS 'ID do usuário que criou o registro (referência para auth.users)';

-- Garantir que as permissões estão corretas
GRANT SELECT ON controle_trocas TO anon;
GRANT ALL PRIVILEGES ON controle_trocas TO authenticated;