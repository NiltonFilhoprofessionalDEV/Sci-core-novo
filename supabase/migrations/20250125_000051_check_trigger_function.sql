-- =====================================================
-- Verificar se existe função handle_new_user e trigger
-- Data: 2025-01-25
-- =====================================================

-- Verificar se a função handle_new_user existe
SELECT 
    'FUNÇÃO HANDLE_NEW_USER' as tipo,
    CASE 
        WHEN EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'handle_new_user') 
        THEN 'EXISTE' 
        ELSE 'NÃO EXISTE' 
    END as status;

-- Verificar se o trigger on_auth_user_created existe
SELECT 
    'TRIGGER ON_AUTH_USER_CREATED' as tipo,
    CASE 
        WHEN EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'on_auth_user_created') 
        THEN 'EXISTE' 
        ELSE 'NÃO EXISTE' 
    END as status;

-- Se não existir, criar a função handle_new_user
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, nome_completo, perfil, ativo, created_at, updated_at)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'nome_completo', ''),
    COALESCE(NEW.raw_user_meta_data->>'perfil', 'ba_ce'),
    true,
    NOW(),
    NOW()
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Criar o trigger se não existir
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Verificar novamente após criação
SELECT 'VERIFICAÇÃO FINAL' as resultado, 'Função e trigger criados/verificados' as status;