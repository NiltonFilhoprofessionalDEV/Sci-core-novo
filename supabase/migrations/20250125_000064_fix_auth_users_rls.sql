-- =====================================================
-- Fix RLS policies for auth.users table
-- Resolve "permission denied for table users" error
-- =====================================================

-- First, check if there are any existing policies on auth.users
-- and drop them if they exist
DO $$
BEGIN
    -- Drop existing policies if they exist
    DROP POLICY IF EXISTS "Users can view own profile" ON auth.users;
    DROP POLICY IF EXISTS "Users can update own profile" ON auth.users;
    DROP POLICY IF EXISTS "Enable read access for authenticated users" ON auth.users;
    DROP POLICY IF EXISTS "Enable select for users based on user_id" ON auth.users;
EXCEPTION
    WHEN OTHERS THEN
        -- Ignore errors if policies don't exist
        NULL;
END $$;

-- Create a simple policy to allow authenticated users to read their own data
CREATE POLICY "Users can view own profile" ON auth.users
    FOR SELECT
    USING (auth.uid() = id);

-- Grant necessary permissions to authenticated role
GRANT USAGE ON SCHEMA auth TO authenticated;
GRANT SELECT ON auth.users TO authenticated;

-- Also ensure public schema permissions are correct
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- Verify RLS is enabled (it should already be enabled)
ALTER TABLE auth.users ENABLE ROW LEVEL SECURITY;

-- Add a comment for documentation
COMMENT ON POLICY "Users can view own profile" ON auth.users IS 
'Allow authenticated users to read their own user data from auth.users table';