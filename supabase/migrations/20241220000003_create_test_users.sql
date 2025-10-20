-- =====================================================
-- CRIAÇÃO DE USUÁRIOS DE TESTE
-- Sistema de Indicadores Bombeiro MedMais
-- =====================================================

-- IMPORTANTE: Para usar estes usuários de teste, você deve:
-- 1. Registrar os usuários através da interface de login do Supabase
-- 2. Ou usar o Supabase Dashboard para criar os usuários
-- 3. Depois executar este script para atualizar os perfis

-- Função para criar perfil de teste se o usuário existir
CREATE OR REPLACE FUNCTION create_test_profile(
  user_email TEXT,
  user_name TEXT,
  user_profile TEXT,
  section_code TEXT DEFAULT NULL,
  team_code TEXT DEFAULT NULL
) RETURNS VOID AS $$
DECLARE
  user_id UUID;
  section_id UUID;
  team_id UUID;
BEGIN
  -- Buscar ID do usuário pelo email
  SELECT id INTO user_id FROM auth.users WHERE email = user_email;
  
  IF user_id IS NULL THEN
    RAISE NOTICE 'Usuário % não encontrado. Registre primeiro através do sistema de login.', user_email;
    RETURN;
  END IF;

  -- Buscar seção se especificada
  IF section_code IS NOT NULL THEN
    SELECT id INTO section_id FROM secoes WHERE codigo = section_code;
  END IF;

  -- Buscar equipe se especificada
  IF team_code IS NOT NULL THEN
    SELECT id INTO team_id FROM equipes WHERE codigo = team_code;
  END IF;

  -- Inserir ou atualizar perfil
  INSERT INTO profiles (
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
    user_id,
    user_email,
    user_name,
    user_profile::perfil_usuario,
    section_id,
    team_id,
    true,
    NOW(),
    NOW()
  ) ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    nome_completo = EXCLUDED.nome_completo,
    perfil = EXCLUDED.perfil,
    secao_id = EXCLUDED.secao_id,
    equipe_id = EXCLUDED.equipe_id,
    ativo = EXCLUDED.ativo,
    updated_at = NOW();

  RAISE NOTICE 'Perfil criado/atualizado para %: % (%)', user_email, user_name, user_profile;
END;
$$ LANGUAGE plpgsql;

-- Tentar criar perfis de teste (só funcionará se os usuários já existirem)
SELECT create_test_profile('gestor@medmais.com', 'João Silva Santos', 'gestor_pop');

SELECT create_test_profile('gerente.goiania@medmais.com', 'Maria Oliveira Costa', 'gerente_secao', 'SBGO');
SELECT create_test_profile('bace.alfa.goiania@medmais.com', 'Carlos Eduardo Lima', 'ba_ce', 'SBGO', 'ALFA-SBGO');
SELECT create_test_profile('gerente.rio@medmais.com', 'Ana Paula Ferreira', 'gerente_secao', 'SBRJ');
SELECT create_test_profile('bace.bravo.rio@medmais.com', 'Roberto Almeida Souza', 'ba_ce', 'SBRJ', 'BRAVO-SBRJ');

-- Comentários para documentação
COMMENT ON FUNCTION create_test_profile IS 'Função para criar perfis de teste baseados em usuários existentes';

-- Verificar se os dados foram inseridos corretamente
DO $$
BEGIN
  RAISE NOTICE 'Script de usuários de teste executado!';
  RAISE NOTICE 'Total de perfis: %', (SELECT COUNT(*) FROM profiles);
  RAISE NOTICE 'Para usar os usuários de teste, registre-os primeiro através da interface de login:';
  RAISE NOTICE '- gestor@medmais.com (Gestor POP)';
  RAISE NOTICE '- gerente.goiania@medmais.com (Gerente Seção Goiânia)';
  RAISE NOTICE '- bace.alfa.goiania@medmais.com (BA-CE Equipe Alfa)';
  RAISE NOTICE '- gerente.rio@medmais.com (Gerente Seção Rio)';
  RAISE NOTICE '- bace.bravo.rio@medmais.com (BA-CE Equipe Bravo)';
  RAISE NOTICE 'Depois execute novamente esta migration para criar os perfis.';
END $$;