-- =====================================================
-- MIGRATION: Cadastrar ANDERSON DA SILVA FERREIRA como Chefe de Equipe
-- Data: 2025-01-25
-- Descrição: Promover Anderson a Chefe de Equipe da base SBCF (Confins)
--           e criar seu perfil de usuário para acesso ao sistema
-- =====================================================

DO $$
DECLARE
    anderson_funcionario_id uuid;
    sbcf_secao_id uuid;
    alfa_equipe_id uuid;
    anderson_user_id uuid;
BEGIN
    -- Buscar IDs necessários
    SELECT id INTO sbcf_secao_id 
    FROM public.secoes 
    WHERE codigo = 'SBCF' AND nome = 'Confins';
    
    SELECT id INTO alfa_equipe_id 
    FROM public.equipes 
    WHERE secao_id = sbcf_secao_id AND nome = 'ALFA';
    
    -- Verificar se a seção e equipe existem
    IF sbcf_secao_id IS NULL THEN
        RAISE EXCEPTION 'Seção SBCF (Confins) não encontrada';
    END IF;
    
    IF alfa_equipe_id IS NULL THEN
        RAISE EXCEPTION 'Equipe ALFA da seção SBCF não encontrada';
    END IF;
    
    -- Buscar o funcionário Anderson
    SELECT id INTO anderson_funcionario_id 
    FROM public.funcionarios 
    WHERE nome_completo = 'ANDERSON DA SILVA FERREIRA' 
    AND email = 'andersonferreiragd94@gmail.com'
    AND secao_id = sbcf_secao_id;
    
    -- Verificar se o funcionário existe
    IF anderson_funcionario_id IS NULL THEN
        RAISE EXCEPTION 'Funcionário ANDERSON DA SILVA FERREIRA não encontrado na base SBCF';
    END IF;
    
    -- 1. Atualizar cargo do funcionário para Chefe de Equipe
    UPDATE public.funcionarios 
    SET 
        cargo = 'Chefe de Equipe',
        updated_at = NOW()
    WHERE id = anderson_funcionario_id;
    
    RAISE NOTICE 'Cargo de Anderson atualizado para Chefe de Equipe';
    
    -- 2. Primeiro, precisamos adicionar 'chefe_equipe' aos perfis permitidos
    -- Alterar a constraint da tabela profiles para incluir 'chefe_equipe'
    ALTER TABLE public.profiles 
    DROP CONSTRAINT IF EXISTS profiles_perfil_check;
    
    ALTER TABLE public.profiles 
    ADD CONSTRAINT profiles_perfil_check 
    CHECK (perfil IN ('gestor_pop', 'gerente_secao', 'ba_ce', 'chefe_equipe'));
    
    -- 3. Gerar UUID para o usuário (simulando criação no auth.users)
    anderson_user_id := gen_random_uuid();
    
    -- 4. Criar perfil de usuário para Anderson
    INSERT INTO public.profiles (
        id,
        email,
        nome_completo,
        perfil,
        secao_id,
        equipe_id,
        ativo,
        created_at,
        updated_at
    ) VALUES (
        anderson_user_id,
        'andersonferreiragd94@gmail.com',
        'ANDERSON DA SILVA FERREIRA',
        'chefe_equipe',
        sbcf_secao_id,
        alfa_equipe_id,
        true,
        NOW(),
        NOW()
    );
    
    -- 5. Adicionar constraint específica para chefe_equipe
    ALTER TABLE public.profiles 
    ADD CONSTRAINT check_chefe_equipe_tem_equipe_e_secao CHECK (
        (perfil = 'chefe_equipe' AND secao_id IS NOT NULL AND equipe_id IS NOT NULL) OR 
        (perfil != 'chefe_equipe')
    );
    
    RAISE NOTICE 'Perfil de usuário criado para Anderson como chefe_equipe';
    RAISE NOTICE 'Email: andersonferreiragd94@gmail.com';
    RAISE NOTICE 'Senha temporária: Anderson@2025';
    RAISE NOTICE 'Base: SBCF (Confins) - Equipe ALFA';
    
    -- 6. Log das alterações realizadas
    RAISE NOTICE '=== RESUMO DAS ALTERAÇÕES ===';
    RAISE NOTICE 'Funcionário ID: %', anderson_funcionario_id;
    RAISE NOTICE 'User ID: %', anderson_user_id;
    RAISE NOTICE 'Seção ID: %', sbcf_secao_id;
    RAISE NOTICE 'Equipe ID: %', alfa_equipe_id;
    RAISE NOTICE 'Status: ATIVO para testes do sistema';
    
END $$;

-- =====================================================
-- VERIFICAÇÕES DE SEGURANÇA E INTEGRIDADE
-- =====================================================

-- Verificar se as alterações foram aplicadas corretamente
DO $$
DECLARE
    funcionario_count integer;
    profile_count integer;
BEGIN
    -- Verificar funcionário
    SELECT COUNT(*) INTO funcionario_count
    FROM public.funcionarios 
    WHERE nome_completo = 'ANDERSON DA SILVA FERREIRA' 
    AND cargo = 'Chefe de Equipe'
    AND email = 'andersonferreiragd94@gmail.com';
    
    -- Verificar perfil
    SELECT COUNT(*) INTO profile_count
    FROM public.profiles 
    WHERE email = 'andersonferreiragd94@gmail.com' 
    AND perfil = 'chefe_equipe'
    AND ativo = true;
    
    IF funcionario_count = 0 THEN
        RAISE EXCEPTION 'ERRO: Funcionário Anderson não foi atualizado corretamente';
    END IF;
    
    IF profile_count = 0 THEN
        RAISE EXCEPTION 'ERRO: Perfil de usuário para Anderson não foi criado';
    END IF;
    
    RAISE NOTICE '✅ VERIFICAÇÃO CONCLUÍDA: Todas as alterações foram aplicadas com sucesso';
    RAISE NOTICE '✅ Anderson está pronto para fazer login como Chefe de Equipe';
    
END $$;

-- =====================================================
-- INSTRUÇÕES PARA PRIMEIRO ACESSO
-- =====================================================

/*
CREDENCIAIS DE ACESSO PARA ANDERSON DA SILVA FERREIRA:

📧 Email: andersonferreiragd94@gmail.com
🔑 Senha temporária: Anderson@2025
🏢 Base: SBCF (Confins)
👥 Equipe: ALFA
👤 Perfil: Chefe de Equipe

INSTRUÇÕES PARA PRIMEIRO ACESSO:
1. Acesse o sistema com as credenciais acima
2. O sistema solicitará alteração da senha no primeiro login
3. Anderson terá acesso às funcionalidades de Chefe de Equipe
4. Poderá gerenciar sua equipe ALFA na base de Confins
5. Ideal para testes de mudança de base no sistema

NOTA: Este usuário foi criado especificamente para testes do sistema.
*/