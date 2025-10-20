-- Verificar usuários existentes na tabela auth.users
SELECT 
  id,
  email,
  email_confirmed_at,
  created_at,
  deleted_at
FROM auth.users 
WHERE email IN (
  'gestor@medmais.com',
  'gerente.goiania@medmais.com', 
  'bace.alfa.goiania@medmais.com'
)
ORDER BY email;

-- Verificar profiles correspondentes
SELECT 
  p.id,
  p.email,
  p.nome_completo,
  p.perfil,
  s.nome as secao_nome,
  e.nome as equipe_nome,
  p.ativo
FROM public.profiles p
LEFT JOIN public.secoes s ON p.secao_id = s.id
LEFT JOIN public.equipes e ON p.equipe_id = e.id
WHERE p.email IN (
  'gestor@medmais.com',
  'gerente.goiania@medmais.com', 
  'bace.alfa.goiania@medmais.com'
)
ORDER BY p.email;