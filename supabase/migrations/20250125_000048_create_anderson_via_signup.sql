-- =====================================================
-- MIGRATION: Deletar Anderson e permitir criação via signup
-- Data: 2025-01-25
-- Descrição: Limpar dados do Anderson para permitir 
--           criação via sistema de registro
-- =====================================================

-- 1. Deletar completamente o usuário Anderson
DELETE FROM public.profiles WHERE email = 'andersonferreiragd94@gmail.com';
DELETE FROM auth.users WHERE email = 'andersonferreiragd94@gmail.com';

-- 2. Verificar se foi deletado
SELECT 
    'VERIFICAÇÃO APÓS DELEÇÃO' as status,
    COUNT(*) as usuarios_anderson_auth
FROM auth.users 
WHERE email = 'andersonferreiragd94@gmail.com';

SELECT 
    'VERIFICAÇÃO PROFILES APÓS DELEÇÃO' as status,
    COUNT(*) as profiles_anderson
FROM public.profiles 
WHERE email = 'andersonferreiragd94@gmail.com';

-- 3. Verificar se as seções e equipes existem para o registro
SELECT 
    'VERIFICAÇÃO SEÇÃO SBCF' as status,
    id,
    nome,
    codigo
FROM public.secoes 
WHERE codigo = 'SBCF';

SELECT 
    'VERIFICAÇÃO EQUIPE ALFA' as status,
    e.id,
    e.nome,
    s.nome as secao_nome
FROM public.equipes e
JOIN public.secoes s ON e.secao_id = s.id
WHERE s.codigo = 'SBCF' AND UPPER(e.nome) = 'ALFA';

-- Mensagem final
SELECT 'ANDERSON DELETADO: Agora pode ser criado via sistema de registro em /register' as resultado;