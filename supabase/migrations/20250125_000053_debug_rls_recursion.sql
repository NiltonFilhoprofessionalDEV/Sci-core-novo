-- =====================================================
-- DEBUG: Identificar políticas RLS que causam recursão infinita
-- Data: 2025-01-25
-- Descrição: Investigar recursão infinita na tabela profiles
-- =====================================================

-- 1. Verificar todas as políticas RLS atuais na tabela profiles
SELECT 
    'POLÍTICAS RLS ATUAIS' as info,
    policyname as nome_politica,
    cmd as comando,
    permissive as permissiva,
    qual as condicao_where,
    with_check as condicao_with_check
FROM pg_policies 
WHERE schemaname = 'public' AND tablename = 'profiles'
ORDER BY policyname;

-- 2. Verificar se RLS está habilitado
SELECT 
    'STATUS RLS' as info,
    schemaname,
    tablename,
    rowsecurity as rls_habilitado
FROM pg_tables 
WHERE schemaname = 'public' AND tablename = 'profiles';

-- 3. Verificar triggers na tabela profiles
SELECT 
    'TRIGGERS PROFILES' as info,
    tgname as nome_trigger,
    tgenabled as habilitado,
    tgtype as tipo
FROM pg_trigger t
JOIN pg_class c ON t.tgrelid = c.oid
JOIN pg_namespace n ON c.relnamespace = n.oid
WHERE n.nspname = 'public' AND c.relname = 'profiles';

-- Mensagem final
SELECT 'DEBUG RLS RECURSION CONCLUÍDO' as resultado;