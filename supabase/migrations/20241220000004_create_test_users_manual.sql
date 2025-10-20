-- Script para criar usuários de teste manualmente no Supabase
-- Este script deve ser executado no SQL Editor do Supabase Dashboard

-- Desabilitar temporariamente o trigger que cria perfil automaticamente
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Função para criar usuário com senha hash
CREATE OR REPLACE FUNCTION create_user_with_password(
  user_email TEXT,
  user_password TEXT,
  user_perfil TEXT,
  user_role TEXT DEFAULT 'authenticated'
)
RETURNS UUID AS $$
DECLARE
  user_id UUID;
  encrypted_pw TEXT;
BEGIN
  -- Gerar ID único para o usuário
  user_id := gen_random_uuid();
  
  -- Criptografar a senha usando crypt do Supabase
  encrypted_pw := crypt(user_password, gen_salt('bf'));
  
  -- Inserir usuário na tabela auth.users
  INSERT INTO auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    recovery_sent_at,
    last_sign_in_at,
    raw_app_meta_data,
    raw_user_meta_data,
    created_at,
    updated_at,
    confirmation_token,
    email_change,
    email_change_token_new,
    recovery_token
  ) VALUES (
    '00000000-0000-0000-0000-000000000000',
    user_id,
    'authenticated',
    user_role,
    user_email,
    encrypted_pw,
    NOW(),
    NOW(),
    NOW(),
    '{"provider":"email","providers":["email"]}',
    format('{"perfil":"%s"}', user_perfil)::jsonb,
    NOW(),
    NOW(),
    '',
    '',
    '',
    ''
  );
  
  -- Inserir identidade na tabela auth.identities
  INSERT INTO auth.identities (
    provider_id,
    id,
    user_id,
    identity_data,
    provider,
    last_sign_in_at,
    created_at,
    updated_at
  ) VALUES (
    user_id::text,
    gen_random_uuid(),
    user_id,
    format('{"sub":"%s","email":"%s"}', user_id::text, user_email)::jsonb,
    'email',
    NOW(),
    NOW(),
    NOW()
  );
  
  RETURN user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Criar usuários de teste
DO $$
DECLARE
  gestor_id UUID;
  gerente_id UUID;
  bace_id UUID;
  secao_goiania_id UUID;
  equipe_alfa_id UUID;
BEGIN
  -- Buscar IDs das seções e equipes existentes
  SELECT id INTO secao_goiania_id FROM public.secoes WHERE codigo = 'SBGO' LIMIT 1;
  SELECT id INTO equipe_alfa_id FROM public.equipes WHERE codigo = 'ALFA' AND secao_id = secao_goiania_id LIMIT 1;
  
  -- Criar usuário gestor
  gestor_id := create_user_with_password('gestor@medmais.com', 'gestor123', 'gestor_pop');
  
  -- Criar perfil para gestor
  INSERT INTO public.profiles (id, email, nome_completo, perfil, created_at, updated_at, last_login)
  VALUES (gestor_id, 'gestor@medmais.com', 'Gestor Populacional', 'gestor_pop', NOW(), NOW(), NOW())
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    nome_completo = EXCLUDED.nome_completo,
    perfil = EXCLUDED.perfil,
    updated_at = NOW();
  
  -- Criar usuário gerente
  gerente_id := create_user_with_password('gerente.goiania@medmais.com', 'gerente123', 'gerente_secao');
  
  -- Criar perfil para gerente
  INSERT INTO public.profiles (id, email, nome_completo, perfil, secao_id, created_at, updated_at, last_login)
  VALUES (gerente_id, 'gerente.goiania@medmais.com', 'Gerente Seção Goiânia', 'gerente_secao', secao_goiania_id, NOW(), NOW(), NOW())
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    nome_completo = EXCLUDED.nome_completo,
    perfil = EXCLUDED.perfil,
    secao_id = EXCLUDED.secao_id,
    updated_at = NOW();
  
  -- Criar usuário bace
  bace_id := create_user_with_password('bace.alfa.goiania@medmais.com', 'bace123', 'ba_ce');
  
  -- Criar perfil para bace
  INSERT INTO public.profiles (id, email, nome_completo, perfil, secao_id, equipe_id, created_at, updated_at, last_login)
  VALUES (bace_id, 'bace.alfa.goiania@medmais.com', 'BACE Alfa Goiânia', 'ba_ce', secao_goiania_id, equipe_alfa_id, NOW(), NOW(), NOW())
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    nome_completo = EXCLUDED.nome_completo,
    perfil = EXCLUDED.perfil,
    secao_id = EXCLUDED.secao_id,
    equipe_id = EXCLUDED.equipe_id,
    updated_at = NOW();
  
  RAISE NOTICE 'Usuários criados com sucesso:';
  RAISE NOTICE 'Gestor ID: %', gestor_id;
  RAISE NOTICE 'Gerente ID: %', gerente_id;
  RAISE NOTICE 'BACE ID: %', bace_id;
  RAISE NOTICE 'Seção Goiânia ID: %', secao_goiania_id;
  RAISE NOTICE 'Equipe Alfa ID: %', equipe_alfa_id;
END $$;

-- Recriar o trigger que cria perfil automaticamente
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Limpar função temporária
DROP FUNCTION IF EXISTS create_user_with_password(TEXT, TEXT, TEXT, TEXT);

-- Verificar usuários criados
SELECT 
  u.id,
  u.email,
  p.perfil,
  p.secao_id,
  p.equipe_id,
  u.created_at
FROM auth.users u
LEFT JOIN public.profiles p ON u.id = p.id
WHERE u.email IN ('gestor@medmais.com', 'gerente.goiania@medmais.com', 'bace.alfa.goiania@medmais.com')
ORDER BY u.email;