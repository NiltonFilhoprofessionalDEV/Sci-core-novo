-- Cria a seção/base GYN (Goiânia)
begin;

-- Cria registro na tabela public.secoes se não existir
insert into public.secoes (nome, cidade, codigo, estado, ativa)
select 'SCI - Goiânia', 'Goiânia', 'GYN', 'GO', true
where not exists (
  select 1 from public.secoes s where s.codigo = 'GYN'
);

commit;


