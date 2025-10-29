-- =====================================================
-- MIGRATION: Criar usuário de autenticação para Anderson
-- Data: 2025-01-25
-- Descrição: Criar usuário Anderson na tabela auth.users
--           para permitir login no sistema
-- =====================================================

-- Inserir usuário Anderson na tabela auth.users
INSERT INTO auth.users (
    id,
    instance_id,
    email,
    encrypted_password,
    email_confirmed_at,
    created_at,
    updated_at,
    confirmed_at,
    aud,
    role,
    raw_app_meta_data,
    raw_user_meta_data,
    is_super_admin
) VALUES (
    gen_random_uuid(),
    '00000000-0000-0000-0000-000000000000',
    'andersonferreiragd94@gmail.com',
    crypt('Anderson@2025', gen_salt('bf')),
    NOW(),
    NOW(),
    NOW(),
    NOW(),
    'authenticated',
    'authenticated',
    '{"provider": "email", "providers": ["email"]}',
    '{"nome_completo": "ANDERSON DA SILVA FERREIRA", "perfil": "chefe_equipe"}',
    false
) ON CONFLICT (email) DO UPDATE SET
    encrypted_password = crypt('Anderson@2025', gen_salt('bf')),
    updated_at = NOW(),
    confirmed_at = NOW(),
    email_confirmed_at = NOW();

-- Atualizar ou criar perfil na tabela profiles vinculado ao usuário
DO $$
DECLARE
    anderson_user_id uuid;
    sbcf_secao_id uuid;
    alfa_equipe_id uuid;
BEGIN
    -- Buscar o ID do usuário Anderson
    SELECT id INTO anderson_user_id 
    FROM auth.users 
    WHERE email = 'andersonferreiragd94@gmail.com';
    
    -- Buscar IDs da seção e equipe
    SELECT id INTO sbcf_secao_id 
    FROM public.secoes 
    WHERE codigo = 'SBCF' 
    LIMIT 1;
    
    SELECT id INTO alfa_equipe_id 
    FROM public.equipes 
    WHERE secao_id = sbcf_secao_id AND UPPER(nome) = 'ALFA'
    LIMIT 1;
    
    -- Inserir ou atualizar perfil
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
    ) ON CONFLICT (id) DO UPDATE SET
        perfil = 'chefe_equipe',
        secao_id = sbcf_secao_id,
        equipe_id = alfa_equipe_id,
        ativo = true,
        updated_at = NOW();
        
    RAISE NOTICE 'Usuário Anderson criado/atualizado com ID: %', anderson_user_id;
    RAISE NOTICE 'Perfil vinculado com sucesso';
END $$;

-- Verificar se o usuário foi criado corretamente
SELECT 
    'Usuário criado com sucesso' as status,
    u.id as user_id,
    u.email,
    u.created_at,
    u.email_confirmed_at,
    p.perfil,
    s.nome as secao,
    e.nome as equipe
FROM auth.users u
LEFT JOIN public.profiles p ON u.id = p.id
LEFT JOIN public.secoes s ON p.secao_id = s.id
LEFT JOIN public.equipes e ON p.equipe_id = e.id
WHERE u.email = 'andersonferreiragd94@gmail.com';

-- Mensagem final
SELECT 'USUÁRIO CRIADO: Anderson pode agora fazer login com andersonferreiragd94@gmail.com / Anderson@2025' as resultado;