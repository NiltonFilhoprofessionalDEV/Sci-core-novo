-- =====================================================
-- Criar perfil para o usuário Ronan Martins se não existir
-- =====================================================

-- Primeiro, verificar se o usuário já existe na tabela profiles
DO $$
DECLARE
    user_exists BOOLEAN := FALSE;
    auth_user_id UUID;
    secao_sbgo_id UUID;
    equipe_alfa_id UUID;
BEGIN
    -- Verificar se já existe o perfil
    SELECT EXISTS(
        SELECT 1 FROM public.profiles 
        WHERE email = 'bace.alfa.goiania@medmais.com'
    ) INTO user_exists;
    
    IF NOT user_exists THEN
        -- Buscar o ID do usuário na tabela auth.users
        SELECT id INTO auth_user_id 
        FROM auth.users 
        WHERE email = 'bace.alfa.goiania@medmais.com';
        
        -- Buscar ID da seção SBGO (Goiânia)
        SELECT id INTO secao_sbgo_id 
        FROM public.secoes 
        WHERE codigo = 'SBGO' OR nome ILIKE '%goiânia%' OR cidade ILIKE '%goiânia%'
        LIMIT 1;
        
        -- Buscar ID da equipe Alfa
        SELECT id INTO equipe_alfa_id 
        FROM public.equipes 
        WHERE nome ILIKE '%alfa%' AND secao_id = secao_sbgo_id
        LIMIT 1;
        
        -- Se encontrou o usuário auth, criar o perfil
        IF auth_user_id IS NOT NULL THEN
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
                auth_user_id,
                'bace.alfa.goiania@medmais.com',
                'Ronan Martins',
                'ba_ce',
                secao_sbgo_id,
                equipe_alfa_id,
                true,
                NOW(),
                NOW()
            );
            
            RAISE NOTICE 'Perfil criado para Ronan Martins com sucesso!';
            RAISE NOTICE 'ID: %', auth_user_id;
            RAISE NOTICE 'Seção ID: %', secao_sbgo_id;
            RAISE NOTICE 'Equipe ID: %', equipe_alfa_id;
        ELSE
            RAISE NOTICE 'Usuário não encontrado na tabela auth.users';
        END IF;
    ELSE
        -- Se já existe, garantir que está ativo
        UPDATE public.profiles 
        SET 
            ativo = true,
            nome_completo = 'Ronan Martins',
            perfil = 'ba_ce',
            updated_at = NOW()
        WHERE email = 'bace.alfa.goiania@medmais.com';
        
        RAISE NOTICE 'Perfil já existe para Ronan Martins - atualizado para ativo';
    END IF;
END $$;

-- Verificar o resultado final
SELECT 
    p.id,
    p.email,
    p.nome_completo,
    p.perfil,
    p.ativo,
    s.nome as secao_nome,
    s.cidade as secao_cidade,
    e.nome as equipe_nome
FROM public.profiles p
LEFT JOIN public.secoes s ON p.secao_id = s.id
LEFT JOIN public.equipes e ON p.equipe_id = e.id
WHERE p.email = 'bace.alfa.goiania@medmais.com';