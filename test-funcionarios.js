const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://ekhuhyervzndsatdngyl.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVraHVoeWVydnpuZHNhdGRuZ3lsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA5NzE4OTAsImV4cCI6MjA3NjU0Nzg5MH0.DQgnQYEBHjCGUVAxQY6l1OWwqqZcSNUIUviTjDrrI8M'
);

async function testFuncionarios() {
  console.log('=== Testando busca de funcionários ===');
  
  // Primeiro, verificar todos os funcionários cadastrados
  const { data: todosFuncionarios, error: todosError } = await supabase
    .from('funcionarios')
    .select('id, nome_completo, equipe_id, secao_id, nome_cidade')
    .order('nome_completo');
    
  if (todosError) {
    console.error('Erro ao buscar todos os funcionários:', todosError);
  } else {
    console.log(`\n=== TODOS OS FUNCIONÁRIOS CADASTRADOS (${todosFuncionarios?.length || 0}) ===`);
    todosFuncionarios?.forEach(f => console.log(`- ${f.nome_completo} (Equipe: ${f.equipe_id}, Cidade: ${f.nome_cidade})`));
  }
  
  // Buscar seções de Goiânia
  const { data: secoes, error: secoesError } = await supabase
    .from('secoes')
    .select('id, nome, cidade')
    .eq('cidade', 'Goiânia');
    
  if (secoesError) {
    console.error('Erro ao buscar seções:', secoesError);
    return;
  }
  
  console.log('\n=== Seções de Goiânia encontradas ===', secoes);
  
  if (secoes && secoes.length > 0) {
    const secaoId = secoes[0].id;
    
    // Buscar equipes da seção
    const { data: equipes, error: equipesError } = await supabase
      .from('equipes')
      .select('id, nome, secao_id')
      .eq('secao_id', secaoId);
      
    if (equipesError) {
      console.error('Erro ao buscar equipes:', equipesError);
      return;
    }
    
    console.log('\n=== Equipes encontradas ===', equipes);
    
    // Verificar funcionários por cidade
    const { data: funcionariosPorCidade, error: cidadeError } = await supabase
      .from('funcionarios')
      .select('id, nome_completo, equipe_id, nome_cidade')
      .eq('nome_cidade', 'Goiânia')
      .order('nome_completo');
      
    if (cidadeError) {
      console.error('Erro ao buscar funcionários por cidade:', cidadeError);
    } else {
      console.log(`\n=== FUNCIONÁRIOS DE GOIÂNIA POR CIDADE (${funcionariosPorCidade?.length || 0}) ===`);
      funcionariosPorCidade?.forEach(f => console.log(`- ${f.nome_completo} (Equipe ID: ${f.equipe_id})`));
    }
    
    if (equipes && equipes.length > 0) {
      // Testar busca de funcionários para cada equipe
      for (const equipe of equipes) {
        console.log(`\n--- Funcionários da equipe ${equipe.nome} (ID: ${equipe.id}) ---`);
        
        const { data: funcionarios, error: funcionariosError } = await supabase
          .from('funcionarios')
          .select('id, nome_completo, equipe_id')
          .eq('equipe_id', equipe.id)
          .order('nome_completo');
          
        if (funcionariosError) {
          console.error('Erro ao buscar funcionários:', funcionariosError);
        } else {
          console.log(`Funcionários encontrados (${funcionarios?.length || 0}):`);
          funcionarios?.forEach(f => console.log(`- ${f.nome_completo}`));
        }
      }
    }
  }
}

testFuncionarios().catch(console.error);