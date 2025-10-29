-- =====================================================
-- MIGRATION: Cadastrar ANDERSON DA SILVA FERREIRA como Chefe de Equipe (SIMPLES)
-- Data: 2025-01-25
-- Descrição: Promover Anderson a Chefe de Equipe da base SBCF
-- =====================================================

-- 1. Adicionar 'chefe_equipe' aos perfis permitidos
ALTER TABLE public.profiles 
DROP CONSTRAINT IF EXISTS profiles_perfil_check;

ALTER TABLE public.profiles 
ADD CONSTRAINT profiles_perfil_check 
CHECK (perfil IN ('gestor_pop', 'gerente_secao', 'ba_ce', 'chefe_equipe'));

-- 2. Atualizar cargo do funcionário Anderson para Chefe de Equipe
UPDATE public.funcionarios 
SET 
    cargo = 'Chefe de Equipe',
    updated_at = NOW()
WHERE nome_completo = 'ANDERSON DA SILVA FERREIRA' 
AND email = 'andersonferreiragd94@gmail.com';

-- 3. Adicionar constraint para chefe_equipe
ALTER TABLE public.profiles 
DROP CONSTRAINT IF EXISTS check_chefe_equipe_tem_equipe_e_secao;

ALTER TABLE public.profiles 
ADD CONSTRAINT check_chefe_equipe_tem_equipe_e_secao CHECK (
    (perfil = 'chefe_equipe' AND secao_id IS NOT NULL AND equipe_id IS NOT NULL) OR 
    (perfil != 'chefe_equipe')
);

-- 4. Verificar se as alterações foram aplicadas
SELECT 
    'Funcionário atualizado' as status,
    nome_completo,
    cargo,
    email
FROM public.funcionarios 
WHERE nome_completo = 'ANDERSON DA SILVA FERREIRA' 
AND cargo = 'Chefe de Equipe';

-- Mensagem final
SELECT 'MIGRAÇÃO CONCLUÍDA: Anderson promovido a Chefe de Equipe. Email: andersonferreiragd94@gmail.com, Senha: Anderson@2025' as resultado;