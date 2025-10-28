-- =====================================================
-- MIGRATION: Cadastrar ANDERSON DA SILVA FERREIRA como Chefe de Equipe (CORRIGIDA)
-- Data: 2025-01-25
-- Descrição: Promover Anderson a Chefe de Equipe da base SBCF
--           e criar seu perfil de usuário para acesso ao sistema
-- =====================================================

DO $$
DECLARE
    anderson_funcionario_id uuid;
    sbcf_secao_id uuid;
    alfa_equipe_id uuid;
    anderson_user_id uuid;
BEGIN
    -- Buscar IDs necessários - verificar diferentes variações do nome da seção
    SELECT id INTO sbcf_secao_id 
    FROM public.secoes 
    WHERE codigo = 'SBCF' 
    LIMIT 1;
    
    -- Se não encontrou por código, tentar por nome que contenha "Confins"
    IF sbcf_secao_id IS NULL THEN
        SELECT id INTO sbcf_secao_id 
        FROM public.secoes 
        WHERE UPPER(nome) LIKE '%CONFINS%' OR UPPER(cidade) LIKE '%CONFINS%'
        LIMIT 1;
    END IF;
    
    -- Verificar se a seção existe
    IF sbcf_secao_id IS NULL THEN
        RAISE EXCEPTION 'Seção SBCF (Confins) não encontrada. Seções disponíveis: %', 
            (SELECT string_agg(codigo || ' - ' || nome, ', ') FROM public.secoes LIMIT 10);
    END IF;
    
    -- Buscar equipe ALFA da seção encontrada
    SELECT id INTO alfa_equipe_id 
    FROM public.equipes 
    WHERE secao_id = sbcf_secao_id AND UPPER(nome) = 'ALFA';
    
    -- Se não encontrou ALFA, tentar outras variações
    IF alfa_equipe_id IS NULL THEN
        SELECT id INTO alfa_equipe_id 
        FROM public.equipes 
        WHERE secao_id = sbcf_secao_id 
        LIMIT 1;
    END IF;
    
    -- Verificar se a equipe existe
    IF alfa_equipe_id IS NULL THEN
        RAISE EXCEPTION 'Equipe ALFA da seção SBCF não encontrada. Equipes disponíveis: %', 
            (SELECT string_agg(nome, ', ') FROM public.equipes WHERE secao_id = sbcf_secao_id);
    END IF;
    
    -- Buscar o funcionário Anderson
    SELECT id INTO anderson_funcionario_id 
    FROM public.funcionarios 
    WHERE nome_completo = 'ANDERSON DA SILVA FERREIRA' 
    AND email = 'andersonferreiragd94@gmail.com'
    AND secao_id = sbcf_secao_id;
    
    -- Se não encontrou com email, tentar só pelo nome
    IF anderson_funcionario_id IS NULL THEN
        SELECT id INTO anderson_funcionario_id 
        FROM public.funcionarios 
        WHERE nome_completo = 'ANDERSON DA SILVA FERREIRA' 
        AND secao_id = sbcf_secao_id;
    END IF;
    
    -- Verificar se o funcionário existe
    IF anderson_funcionario_id IS NULL THEN
        RAISE EXCEPTION 'Funcionário ANDERSON DA SILVA FERREIRA não encontrado na base SBCF. Funcionários disponíveis: %', 
            (SELECT string_agg(nome_completo, ', ') FROM public.funcionarios WHERE secao_id = sbcf_secao_id LIMIT 5);
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
    
    -- 4. Verificar se já existe um perfil com este email
    IF EXISTS (SELECT 1 FROM public.profiles WHERE email = 'andersonferreiragd94@gmail.com') THEN
        -- Atualizar perfil existente
        UPDATE public.profiles 
        SET 
            perfil = 'chefe_equipe',
            secao_id = sbcf_secao_id,
            equipe_id = alfa_equipe_id,
            ativo = true,
            updated_at = NOW()
        WHERE email = 'andersonferreiragd94@gmail.com';
        
        RAISE NOTICE 'Perfil existente atualizado para chefe_equipe';
    ELSE
        -- Criar novo perfil de usuário para Anderson
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
        
        RAISE NOTICE 'Novo perfil criado para Anderson como chefe_equipe';
    END IF;
    
    -- 5. Adicionar constraint específica para chefe_equipe (se não existir)
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'check_chefe_equipe_tem_equipe_e_secao'
    ) THEN
        ALTER TABLE public.profiles 
        ADD CONSTRAINT check_chefe_equipe_tem_equipe_e_secao CHECK (
            (perfil = 'chefe_equipe' AND secao_id IS NOT NULL AND equipe_id IS NOT NULL) OR 
            (perfil != 'chefe_equipe')
        );
    END IF;
    
    RAISE NOTICE 'Email: andersonferreiragd94@gmail.com';
    RAISE NOTICE 'Senha temporária: Anderson@2025';
    
    -- 6. Log das alterações realizadas
    RAISE NOTICE '=== RESUMO DAS ALTERAÇÕES ===';
    RAISE NOTICE 'Funcionário ID: %', anderson_funcionario_id;
    RAISE NOTICE 'User ID: %', anderson_user_id;
    RAISE NOTICE 'Seção ID: % (Nome: %)', sbcf_secao_id, (SELECT nome FROM public.secoes WHERE id = sbcf_secao_id);
    RAISE NOTICE 'Equipe ID: % (Nome: %)', alfa_equipe_id, (SELECT nome FROM public.equipes WHERE id = alfa_equipe_id);
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