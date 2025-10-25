-- Desabilitar RLS temporariamente para permitir acesso aos dados de teste
-- ATENÇÃO: Isso é apenas para desenvolvimento/teste

-- Desabilitar RLS nas tabelas principais
ALTER TABLE public.secoes DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.equipes DISABLE ROW LEVEL SECURITY;

-- Ou alternativamente, criar políticas mais permissivas para desenvolvimento
-- CREATE POLICY "Allow all for development" ON public.secoes FOR ALL USING (true);
-- CREATE POLICY "Allow all for development" ON public.equipes FOR ALL USING (true);