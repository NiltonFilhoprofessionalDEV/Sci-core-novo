const { createClient } = require('@supabase/supabase-js');

// Configuração do Supabase
const supabaseUrl = 'https://ixqjqhqjqhqjqhqjqhqj.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml4cWpxaHFqcWhxanFocWpxaHFqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzY5NjI4NzQsImV4cCI6MjA1MjUzODg3NH0.abc123';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testarFuncionarios() {
  console.log('=== Testando busca direta de funcionários ===\n');

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

  } catch (error) {
    console.error('Erro geral:', error);
  }
}

testarFuncionarios();