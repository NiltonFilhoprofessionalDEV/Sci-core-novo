const { createClient } = require('@supabase/supabase-js');

// Configuração do Supabase com as credenciais reais
const supabaseUrl = 'https://ekhuhyervzndsatdngyl.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVraHVoeWVydnpuZHNhdGRuZ3lsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA5NzE4OTAsImV4cCI6MjA3NjU0Nzg5MH0.DQgnQYEBHjCGUVAxQY6l1OWwqqZcSNUIUviTjDrrI8M';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testarSBCF() {
  console.log('=== Testando seção SBCF e suas equipes ===\n');

  try {
    // Buscar seção SBCF
    const { data: secaoSBCF, error: errorSecao } = await supabase
      .from('secoes')
      .select('*')
      .eq('codigo', 'SBCF');

    if (errorSecao) {
      console.error('Erro ao buscar seção SBCF:', errorSecao);
    } else {
      console.log('=== SEÇÃO SBCF ===');
      if (secaoSBCF && secaoSBCF.length > 0) {
        secaoSBCF.forEach((secao) => {
          console.log(`ID: ${secao.id}`);
          console.log(`Nome: ${secao.nome}`);
          console.log(`Código: ${secao.codigo}`);
          console.log(`Cidade: ${secao.cidade}`);
          console.log(`Ativa: ${secao.ativa}`);
        });
      } else {
        console.log('Nenhuma seção SBCF encontrada');
      }
    }

    // Buscar equipes da seção SBCF
    if (secaoSBCF && secaoSBCF.length > 0) {
      const secaoId = secaoSBCF[0].id;
      
      const { data: equipesSBCF, error: errorEquipes } = await supabase
        .from('equipes')
        .select('*')
        .eq('secao_id', secaoId);

      if (errorEquipes) {
        console.error('Erro ao buscar equipes SBCF:', errorEquipes);
      } else {
        console.log('\n=== EQUIPES DA SBCF ===');
        if (equipesSBCF && equipesSBCF.length > 0) {
          equipesSBCF.forEach((equipe) => {
            console.log(`ID: ${equipe.id} - Nome: ${equipe.nome} - Ativa: ${equipe.ativa}`);
          });
        } else {
          console.log('Nenhuma equipe encontrada para a seção SBCF');
        }
      }
    }

    // Buscar funcionários existentes da SBCF
    if (secaoSBCF && secaoSBCF.length > 0) {
      const secaoId = secaoSBCF[0].id;
      
      const { data: funcionariosSBCF, error: errorFuncionarios } = await supabase
        .from('funcionarios')
        .select('*')
        .eq('secao_id', secaoId);

      if (errorFuncionarios) {
        console.error('Erro ao buscar funcionários SBCF:', errorFuncionarios);
      } else {
        console.log('\n=== FUNCIONÁRIOS DA SBCF ===');
        console.log(`Total de funcionários: ${funcionariosSBCF?.length || 0}`);
        if (funcionariosSBCF && funcionariosSBCF.length > 0) {
          funcionariosSBCF.forEach((func, index) => {
            console.log(`${index + 1}. ${func.nome_completo} - Equipe: ${func.equipe_id}`);
          });
        }
      }
    }

  } catch (error) {
    console.error('Erro geral:', error);
  }
}

testarSBCF();