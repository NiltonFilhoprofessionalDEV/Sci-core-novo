const { createClient } = require('@supabase/supabase-js');

// Configuração do Supabase com as credenciais reais
const supabaseUrl = 'https://ekhuhyervzndsatdngyl.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVraHVoeWVydnpuZHNhdGRuZ3lsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA5NzE4OTAsImV4cCI6MjA3NjU0Nzg5MH0.DQgnQYEBHjCGUVAxQY6l1OWwqqZcSNUIUviTjDrrI8M';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testarFuncionarios() {
  console.log('=== Testando busca de funcionários com credenciais reais ===\n');

  try {
    // Buscar todos os funcionários
    const { data: todosFuncionarios, error: errorTodos } = await supabase
      .from('funcionarios')
      .select('*');

    if (errorTodos) {
      console.error('Erro ao buscar todos os funcionários:', errorTodos);
    } else {
      console.log(`=== TODOS OS FUNCIONÁRIOS (${todosFuncionarios?.length || 0}) ===`);
      if (todosFuncionarios && todosFuncionarios.length > 0) {
        todosFuncionarios.forEach((func, index) => {
          console.log(`${index + 1}. ${func.nome_completo} - Equipe: ${func.equipe_id} - Seção: ${func.secao_id}`);
        });
      }
    }

    console.log('\n=== Buscar funcionários por seção SBGO ===');
    const { data: funcionariosSBGO, error: errorSBGO } = await supabase
      .from('funcionarios')
      .select('*')
      .eq('secao_id', '4d8aa88d-7540-45d4-bb5d-e821dd0c010b');

    if (errorSBGO) {
      console.error('Erro ao buscar funcionários SBGO:', errorSBGO);
    } else {
      console.log(`Funcionários SBGO encontrados: ${funcionariosSBGO?.length || 0}`);
      if (funcionariosSBGO && funcionariosSBGO.length > 0) {
        funcionariosSBGO.forEach((func, index) => {
          console.log(`${index + 1}. ${func.nome_completo} - Equipe: ${func.equipe_id}`);
        });
      }
    }

    console.log('\n=== Buscar funcionários da equipe ALFA ===');
    const { data: funcionariosAlfa, error: errorAlfa } = await supabase
      .from('funcionarios')
      .select('*')
      .eq('equipe_id', 'f7764099-5a7d-456f-97d9-4c7ed305780b');

    if (errorAlfa) {
      console.error('Erro ao buscar funcionários ALFA:', errorAlfa);
    } else {
      console.log(`Funcionários ALFA encontrados: ${funcionariosAlfa?.length || 0}`);
      if (funcionariosAlfa && funcionariosAlfa.length > 0) {
        funcionariosAlfa.forEach((func, index) => {
          console.log(`${index + 1}. ${func.nome_completo}`);
        });
      }
    }

    console.log('\n=== Buscar funcionários da equipe BRAVO ===');
    const { data: funcionariosBravo, error: errorBravo } = await supabase
      .from('funcionarios')
      .select('*')
      .eq('equipe_id', 'ad8556a6-ee52-4f5f-80d2-ce1d07b29feb');

    if (errorBravo) {
      console.error('Erro ao buscar funcionários BRAVO:', errorBravo);
    } else {
      console.log(`Funcionários BRAVO encontrados: ${funcionariosBravo?.length || 0}`);
      if (funcionariosBravo && funcionariosBravo.length > 0) {
        funcionariosBravo.forEach((func, index) => {
          console.log(`${index + 1}. ${func.nome_completo}`);
        });
      }
    }

  } catch (error) {
    console.error('Erro geral:', error);
  }
}

testarFuncionarios();