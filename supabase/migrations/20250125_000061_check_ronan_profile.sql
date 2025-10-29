-- =====================================================
-- Verificar perfil do usuário Ronan Martins
-- =====================================================

-- Verificar se o usuário existe na tabela profiles
SELECT 
    p.id,
    p.email,
    p.nome_completo,
    p.perfil,
    p.ativo,
    p.secao_id,
    p.equipe_id,
    s.nome as secao_nome,
    s.codigo as secao_codigo,
    s.cidade as secao_cidade,
    e.nome as equipe_nome
FROM profiles p
LEFT JOIN secoes s ON p.secao_id = s.id
LEFT JOIN equipes e ON p.equipe_id = e.id
WHERE p.email = 'bace.alfa.goiania@medmais.com';

-- Verificar se existe na tabela auth.users
SELECT 
    id,
    email,
    email_confirmed_at,
    created_at,
    updated_at
FROM auth.users 
WHERE email = 'bace.alfa.goiania@medmais.com';

-- Verificar se há problemas de RLS na tabela profiles
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'profiles';

-- Log de verificação
DO $$
BEGIN
    RAISE NOTICE 'Verificação do perfil do usuário Ronan Martins concluída';
    RAISE NOTICE 'Email: bace.alfa.goiania@medmais.com';
    RAISE NOTICE 'Perfil esperado: BA-CE';
END $$;