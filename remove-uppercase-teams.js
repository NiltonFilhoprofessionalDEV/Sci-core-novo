const { createClient } = require('@supabase/supabase-js');

// Configuração do Supabase usando a integração do Trae
const supabaseUrl = 'https://ekhuhyervzndsatdngyl.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVraHVoeWVydnpuZHNhdGRuZ3lsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MDk3MTg5MCwiZXhwIjoyMDc2NTQ3ODkwfQ.tf0slltTxrcCO3UEur4w4yN4r_-Oy63_dEFhcqLROa0';

// Usando service_role_key para operações administrativas
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function removeUppercaseTeams() {
  console.log('=== Removendo equipes com nomes em maiúsculo ===\n');

  try {
    // 1. Buscar seção SBCF
    const { data: secaoSBCF, error: errorSecao } = await supabase
      .from('secoes')
      .select('*')
      .eq('codigo', 'SBCF');

    if (errorSecao) {
      console.error('Erro ao buscar seção SBCF:', errorSecao);
      return;
    }

    if (!secaoSBCF || secaoSBCF.length === 0) {
      console.log('Seção SBCF não encontrada');
      return;
    }

    const secaoId = secaoSBCF[0].id;
    console.log(`Seção SBCF encontrada: ${secaoSBCF[0].nome} (ID: ${secaoId})`);

    // 2. Buscar todas as equipes da seção SBCF
    const { data: todasEquipes, error: errorEquipes } = await supabase
      .from('equipes')
      .select('*')
      .eq('secao_id', secaoId);

    if (errorEquipes) {
      console.error('Erro ao buscar equipes:', errorEquipes);
      return;
    }

    console.log('\n=== EQUIPES ENCONTRADAS ===');
    todasEquipes.forEach((equipe) => {
      console.log(`ID: ${equipe.id} - Nome: ${equipe.nome} - Ativa: ${equipe.ativa}`);
    });

    // 3. Identificar equipes em maiúsculo e minúsculo
    const equipesMinusculo = todasEquipes.filter(equipe => 
      ['Alfa', 'Bravo', 'Charlie', 'Delta', 'Foxtrot'].includes(equipe.nome)
    );
    
    const equipesMaiusculo = todasEquipes.filter(equipe => 
      ['ALFA', 'BRAVO', 'CHARLIE', 'DELTA'].includes(equipe.nome)
    );

    console.log('\n=== EQUIPES EM MINÚSCULO (MANTER) ===');
    equipesMinusculo.forEach((equipe) => {
      console.log(`${equipe.nome} (ID: ${equipe.id})`);
    });

    console.log('\n=== EQUIPES EM MAIÚSCULO (REMOVER) ===');
    equipesMaiusculo.forEach((equipe) => {
      console.log(`${equipe.nome} (ID: ${equipe.id})`);
    });

    if (equipesMaiusculo.length === 0) {
      console.log('\nNenhuma equipe em maiúsculo encontrada para remover.');
      return;
    }

    // 4. Verificar funcionários nas equipes em maiúsculo
    console.log('\n=== VERIFICANDO FUNCIONÁRIOS NAS EQUIPES EM MAIÚSCULO ===');
    
    for (const equipe of equipesMaiusculo) {
      const { data: funcionarios, error: errorFunc } = await supabase
        .from('funcionarios')
        .select('*')
        .eq('equipe_id', equipe.id);

      if (errorFunc) {
        console.error(`Erro ao buscar funcionários da equipe ${equipe.nome}:`, errorFunc);
        continue;
      }

      console.log(`Equipe ${equipe.nome}: ${funcionarios?.length || 0} funcionários`);
      
      if (funcionarios && funcionarios.length > 0) {
        // 5. Reatribuir funcionários para equipes em minúsculo correspondentes
        const nomeMinusculo = equipe.nome.charAt(0) + equipe.nome.slice(1).toLowerCase();
        const equipeCorrespondente = equipesMinusculo.find(eq => eq.nome === nomeMinusculo);
        
        if (equipeCorrespondente) {
          console.log(`Reatribuindo ${funcionarios.length} funcionários de ${equipe.nome} para ${equipeCorrespondente.nome}`);
          
          const { error: errorUpdate } = await supabase
            .from('funcionarios')
            .update({ equipe_id: equipeCorrespondente.id })
            .eq('equipe_id', equipe.id);

          if (errorUpdate) {
            console.error(`Erro ao reatribuir funcionários:`, errorUpdate);
            continue;
          }
          
          console.log(`✓ Funcionários reatribuídos com sucesso`);
        } else {
          console.warn(`⚠️ Equipe correspondente não encontrada para ${equipe.nome}`);
        }
      }
    }

    // 6. Remover as equipes em maiúsculo
    console.log('\n=== REMOVENDO EQUIPES EM MAIÚSCULO ===');
    
    for (const equipe of equipesMaiusculo) {
      const { error: errorDelete } = await supabase
        .from('equipes')
        .delete()
        .eq('id', equipe.id);

      if (errorDelete) {
        console.error(`Erro ao remover equipe ${equipe.nome}:`, errorDelete);
      } else {
        console.log(`✓ Equipe ${equipe.nome} removida com sucesso`);
      }
    }

    // 7. Verificar resultado final
    console.log('\n=== VERIFICAÇÃO FINAL ===');
    const { data: equipesFinais, error: errorFinal } = await supabase
      .from('equipes')
      .select('*')
      .eq('secao_id', secaoId);

    if (errorFinal) {
      console.error('Erro na verificação final:', errorFinal);
    } else {
      console.log('Equipes restantes:');
      equipesFinais.forEach((equipe) => {
        console.log(`- ${equipe.nome} (ID: ${equipe.id})`);
      });
    }

    console.log('\n✅ Processo concluído com sucesso!');

  } catch (error) {
    console.error('Erro geral:', error);
  }
}

// Executar o script
removeUppercaseTeams();