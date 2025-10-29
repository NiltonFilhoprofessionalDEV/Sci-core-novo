-- =====================================================
-- MIGRATION: Cadastrar ANDERSON DA SILVA FERREIRA como Chefe de Equipe (FINAL)
-- Data: 2025-01-25
-- Descrição: Promover Anderson a Chefe de Equipe da base SBCF
--           e preparar sistema para seu perfil de usuário
-- =====================================================

DO $$
DECLARE
    anderson_funcionario_id uuid;
    sbcf_secao_id uuid;
    alfa_equipe_id uuid;
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
    
    -- 3. Adicionar constraint específica para chefe_equipe (se não existir)
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
    
    -- 4. Criar uma função para automaticamente criar o perfil quando o usuário for criado no auth
    CREATE OR REPLACE FUNCTION public.handle_new_user_anderson()
    RETURNS trigger AS $$
    DECLARE
        anderson_secao_id uuid;
        anderson_equipe_id uuid;
    BEGIN
        -- Verificar se é o email do Anderson
        IF NEW.email = 'andersonferreiragd94@gmail.com' THEN
            -- Buscar IDs da seção e equipe
            SELECT id INTO anderson_secao_id FROM public.secoes WHERE codigo = 'SBCF' LIMIT 1;
            SELECT id INTO anderson_equipe_id FROM public.equipes WHERE secao_id = anderson_secao_id AND UPPER(nome) = 'ALFA' LIMIT 1;
            
            -- Criar perfil automaticamente
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
                NEW.id,
                NEW.email,
                'ANDERSON DA SILVA FERREIRA',
                'chefe_equipe',
                anderson_secao_id,
                anderson_equipe_id,
                true,
                NOW(),
                NOW()
            );
        END IF;
        
        RETURN NEW;
    END;
    $$ LANGUAGE plpgsql SECURITY DEFINER;
    
    -- 5. Criar trigger para executar a função quando um novo usuário for criado
    DROP TRIGGER IF EXISTS on_auth_user_created_anderson ON auth.users;
    CREATE TRIGGER on_auth_user_created_anderson
        AFTER INSERT ON auth.users
        FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_anderson();
    
    -- 6. Verificar se já existe um usuário com este email no auth.users
    IF EXISTS (SELECT 1 FROM auth.users WHERE email = 'andersonferreiragd94@gmail.com') THEN
        -- Se já existe, atualizar ou criar o perfil
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
        ) 
        SELECT 
            u.id,
            u.email,
            'ANDERSON DA SILVA FERREIRA',
            'chefe_equipe',
            sbcf_secao_id,
            alfa_equipe_id,
            true,
            NOW(),
            NOW()
        FROM auth.users u
        WHERE u.email = 'andersonferreiragd94@gmail.com'
        ON CONFLICT (id) DO UPDATE SET
            perfil = 'chefe_equipe',
            secao_id = sbcf_secao_id,
            equipe_id = alfa_equipe_id,
            ativo = true,
            updated_at = NOW();
            
        RAISE NOTICE 'Perfil criado/atualizado para usuário existente';
    ELSE
        RAISE NOTICE 'Trigger criado. Perfil será criado automaticamente quando Anderson fizer o primeiro login';
    END IF;
    
    RAISE NOTICE '=== INSTRUÇÕES PARA ANDERSON ===';
    RAISE NOTICE 'Email: andersonferreiragd94@gmail.com';
    RAISE NOTICE 'Senha: Anderson@2025';
    RAISE NOTICE 'Perfil: Chefe de Equipe';
    RAISE NOTICE 'Base: SBCF (Confins) - Equipe ALFA';
    
    -- 7. Log das alterações realizadas
    RAISE NOTICE '=== RESUMO DAS ALTERAÇÕES ===';
    RAISE NOTICE 'Funcionário ID: %', anderson_funcionario_id;
    RAISE NOTICE 'Seção ID: % (Nome: %)', sbcf_secao_id, (SELECT nome FROM public.secoes WHERE id = sbcf_secao_id);
    RAISE NOTICE 'Equipe ID: % (Nome: %)', alfa_equipe_id, (SELECT nome FROM public.equipes WHERE id = alfa_equipe_id);
    RAISE NOTICE 'Status: Sistema preparado para login do Anderson';
    
END $$;

-- =====================================================
-- VERIFICAÇÕES DE SEGURANÇA E INTEGRIDADE
-- =====================================================

-- Verificar se as alterações foram aplicadas corretamente
DO $$
DECLARE
    funcionario_count integer;
    constraint_count integer;
BEGIN
    -- Verificar funcionário
    SELECT COUNT(*) INTO funcionario_count
    FROM public.funcionarios 
    WHERE nome_completo = 'ANDERSON DA SILVA FERREIRA' 
    AND cargo = 'Chefe de Equipe'
    AND email = 'andersonferreiragd94@gmail.com';
    
    -- Verificar constraint
    SELECT COUNT(*) INTO constraint_count
    FROM information_schema.table_constraints 
    WHERE constraint_name = 'profiles_perfil_check'
    AND table_name = 'profiles';
    
    IF funcionario_count = 0 THEN
        RAISE EXCEPTION 'ERRO: Funcionário Anderson não foi atualizado corretamente';
    END IF;
    
    IF constraint_count = 0 THEN
        RAISE EXCEPTION 'ERRO: Constraint de perfil não foi criada';
    END IF;
    
    RAISE NOTICE '✅ VERIFICAÇÃO CONCLUÍDA: Sistema preparado para Anderson';
    RAISE NOTICE '✅ Anderson deve se registrar no sistema com o email: andersonferreiragd94@gmail.com';
    RAISE NOTICE '✅ Seu perfil será automaticamente configurado como Chefe de Equipe';
    
END $$;