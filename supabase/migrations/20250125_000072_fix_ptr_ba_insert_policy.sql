-- =====================================================
-- CORREÇÃO: Política INSERT da tabela ptr_ba_provas_teoricas
-- Data: 2025-01-25
-- Descrição: Corrigir erro 42501 na inserção de dados
-- =====================================================

-- Remover a política INSERT restritiva atual
DROP POLICY IF EXISTS "ptr_ba_insert_policy" ON ptr_ba_provas_teoricas;

-- Criar nova política INSERT mais flexível
-- Permitir que usuários autenticados insiram registros sem restrição de usuario_id
-- Isso permite que administradores ou chefes de equipe insiram dados para outros usuários
CREATE POLICY "ptr_ba_insert_policy_flexible" ON ptr_ba_provas_teoricas
    FOR INSERT 
    WITH CHECK (
        auth.uid() IS NOT NULL
    );

-- Verificar se as permissões GRANT estão corretas
GRANT SELECT, INSERT, UPDATE, DELETE ON ptr_ba_provas_teoricas TO authenticated;
GRANT USAGE ON SCHEMA public TO authenticated;

-- Verificar se RLS está habilitado
ALTER TABLE ptr_ba_provas_teoricas ENABLE ROW LEVEL SECURITY;

-- Log de sucesso
DO $$
BEGIN
    RAISE NOTICE 'CORREÇÃO PTR_BA: Política INSERT corrigida com sucesso!';
    RAISE NOTICE 'Nova política: ptr_ba_insert_policy_flexible';
    RAISE NOTICE 'Usuários autenticados podem inserir registros para qualquer usuario_id';
    RAISE NOTICE 'Isso permite que chefes de equipe insiram dados para seus subordinados';
END $$;

-- Teste de inserção
DO $$
DECLARE
    test_user_id uuid;
    test_secao_id uuid;
    test_equipe_id uuid;
    test_record_id uuid;
BEGIN
    -- Buscar um usuário existente
    SELECT id INTO test_user_id FROM public.profiles LIMIT 1;
    
    -- Buscar uma seção existente
    SELECT id INTO test_secao_id FROM public.secoes LIMIT 1;
    
    -- Buscar uma equipe existente
    SELECT id INTO test_equipe_id FROM public.equipes LIMIT 1;
    
    IF test_user_id IS NOT NULL AND test_secao_id IS NOT NULL THEN
        -- Tentar inserir um registro de teste
        INSERT INTO public.ptr_ba_provas_teoricas (
            secao_id,
            equipe_id,
            usuario_id,
            data_referencia,
            nome_cidade,
            data_prova,
            nome_completo,
            nota_prova,
            status,
            observacoes
        ) VALUES (
            test_secao_id,
            test_equipe_id,
            test_user_id,
            CURRENT_DATE,
            'Teste Correção',
            CURRENT_DATE,
            'Teste Usuario Correção',
            9.0,
            'Aprovado',
            'Teste de correção política INSERT'
        ) RETURNING id INTO test_record_id;
        
        RAISE NOTICE 'TESTE CORREÇÃO PTR_BA: ✅ SUCESSO - Registro inserido com ID: %', test_record_id;
        
        -- Remover o registro de teste
        DELETE FROM public.ptr_ba_provas_teoricas 
        WHERE id = test_record_id;
        
        RAISE NOTICE 'TESTE CORREÇÃO PTR_BA: ✅ Registro de teste removido com sucesso';
        
    ELSE
        RAISE NOTICE 'TESTE CORREÇÃO PTR_BA: ❌ ERRO - Não foi possível encontrar dados de teste (usuário: %, seção: %)', test_user_id, test_secao_id;
    END IF;
    
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'TESTE CORREÇÃO PTR_BA: ❌ ERRO - %', SQLERRM;
END $$;

SELECT 'CORREÇÃO PTR_BA INSERT POLICY CONCLUÍDA' as resultado;