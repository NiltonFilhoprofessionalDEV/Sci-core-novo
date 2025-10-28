-- =====================================================
-- DEBUG: Verificar usuário Anderson no sistema
-- Data: 2025-01-25
-- Descrição: Investigar por que o login não funciona
-- =====================================================

-- 1. Verificar se o usuário existe na tabela auth.users
SELECT 
    'VERIFICAÇÃO AUTH.USERS' as tipo,
    id,
    email,
    encrypted_password,
    email_confirmed_at,
    created_at,
    updated_at,
    aud,
    role,
    raw_app_meta_data,
    raw_user_meta_data
FROM auth.users 
WHERE email = 'andersonferreiragd94@gmail.com';

-- 2. Verificar se o perfil existe na tabela profiles
SELECT 
    'VERIFICAÇÃO PROFILES' as tipo,
    p.id,
    p.email,
    p.nome_completo,
    p.perfil,
    p.secao_id,
    p.equipe_id,
    p.ativo,
    s.nome as secao_nome,
    e.nome as equipe_nome
FROM public.profiles p
LEFT JOIN public.secoes s ON p.secao_id = s.id
LEFT JOIN public.equipes e ON p.equipe_id = e.id
WHERE p.email = 'andersonferreiragd94@gmail.com';

-- 3. Verificar se há outros usuários com emails similares
SELECT 
    'USUÁRIOS SIMILARES' as tipo,
    email,
    created_at
FROM auth.users 
WHERE email ILIKE '%anderson%' OR email ILIKE '%ferreira%';

-- 4. Testar hash da senha (apenas para debug)
SELECT 
    'TESTE HASH SENHA' as tipo,
    email,
    crypt('Anderson@2025', encrypted_password) = encrypted_password as senha_correta,
    length(encrypted_password) as tamanho_hash
FROM auth.users 
WHERE email = 'andersonferreiragd94@gmail.com';

-- 5. Verificar configurações de autenticação
SELECT 
    'CONFIGURAÇÕES AUTH' as tipo,
    COUNT(*) as total_usuarios,
    COUNT(CASE WHEN email_confirmed_at IS NOT NULL THEN 1 END) as usuarios_confirmados,
    COUNT(CASE WHEN aud = 'authenticated' THEN 1 END) as usuarios_autenticados
FROM auth.users;

-- 6. Verificar se há problemas com RLS
SELECT 
    'VERIFICAÇÃO RLS' as tipo,
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables 
WHERE schemaname IN ('auth', 'public') 
AND tablename IN ('users', 'profiles');