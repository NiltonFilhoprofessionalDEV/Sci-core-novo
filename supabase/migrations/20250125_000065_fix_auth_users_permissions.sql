-- =====================================================
-- Fix permissions for auth.users table access
-- Resolve "permission denied for table users" error
-- =====================================================

-- The issue is that the application is trying to access auth.users table
-- but doesn't have proper permissions. We need to create a secure view
-- or function to access user data instead of direct table access.

-- Create a secure function to get user profile data
CREATE OR REPLACE FUNCTION get_user_profile_data(user_id UUID)
RETURNS TABLE (
    id UUID,
    email TEXT,
    created_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ,
    raw_user_meta_data JSONB
)
SECURITY DEFINER
SET search_path = auth, public
LANGUAGE plpgsql
AS $$
BEGIN
    -- Only allow users to get their own data
    IF auth.uid() != user_id THEN
        RAISE EXCEPTION 'Access denied: You can only access your own profile data';
    END IF;
    
    RETURN QUERY
    SELECT 
        u.id,
        u.email::TEXT,
        u.created_at,
        u.updated_at,
        u.raw_user_meta_data
    FROM auth.users u
    WHERE u.id = user_id;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION get_user_profile_data(UUID) TO authenticated;

-- Create a view for safe access to user data (alternative approach)
CREATE OR REPLACE VIEW public.user_profiles_view AS
SELECT 
    u.id,
    u.email,
    u.created_at,
    u.updated_at,
    u.raw_user_meta_data,
    p.nome_completo,
    p.perfil,
    p.secao_id,
    p.equipe_id,
    p.ativo
FROM auth.users u
LEFT JOIN public.profiles p ON u.id = p.id
WHERE u.id = auth.uid(); -- Only show current user's data

-- Grant permissions on the view
GRANT SELECT ON public.user_profiles_view TO authenticated;

-- Enable RLS on the view (even though it's already filtered)
ALTER VIEW public.user_profiles_view SET (security_barrier = true);

-- Log success
DO $$
BEGIN
    RAISE NOTICE 'Permissões de acesso à tabela auth.users corrigidas!';
    RAISE NOTICE 'Função get_user_profile_data criada para acesso seguro';
    RAISE NOTICE 'View user_profiles_view criada para consultas seguras';
    RAISE NOTICE 'Aplicação deve usar estas interfaces em vez de acesso direto à auth.users';
END $$;