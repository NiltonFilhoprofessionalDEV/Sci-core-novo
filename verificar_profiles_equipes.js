const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://ekhuhyervzndsatdngyl.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVraHVoeWVydnpuZHNhdGRuZ3lsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MDk3MTg5MCwiZXhwIjoyMDc2NTQ3ODkwfQ.tf0slltTxrcCO3UEur4w4yN4r_-Oy63_dEFhcqLROa0';

const supabase = createClient(supabaseUrl, supabaseKey);

async function verificarProfilesEquipes() {
  try {
    console.log('=== VERIFICAÇÃO DE PROFILES COM EQUIPES DUPLICADAS ===');
    
    // Buscar profiles que referenciam equipes com prefixo "Equipe "
    const { data: profiles, error } = await supabase
      .from('profiles')
      .select(`
        id, 
        email, 
        nome_completo, 
        equipe_id,
        equipes!profiles_equipe_id_fkey(id, nome, secao_id)
      `)
      .not('equipe_id', 'is', null);

    if (error) {
      console.error('Erro ao buscar profiles:', error);
      return;
    }

    console.log(`Total de profiles com equipe: ${profiles.length}`);

    // Filtrar profiles que referenciam equipes com prefixo "Equipe "
    const profilesComEquipeDuplicada = profiles.filter(profile => 
      profile.equipes && profile.equipes.nome && profile.equipes.nome.startsWith('Equipe ')
    );

    console.log(`Profiles referenciando equipes duplicadas: ${profilesComEquipeDuplicada.length}`);

    if (profilesComEquipeDuplicada.length > 0) {
      console.log('\nProfiles que precisam ser atualizados:');
      
      for (const profile of profilesComEquipeDuplicada) {
        const nomeEquipeAtual = profile.equipes.nome;
        const nomeEquipeCorreto = nomeEquipeAtual.replace('Equipe ', '');
        
        console.log(`- ${profile.email}: "${nomeEquipeAtual}" → "${nomeEquipeCorreto}"`);
        
        // Buscar a equipe correta (sem prefixo)
        const { data: equipeCorreta, error: errorEquipe } = await supabase
          .from('equipes')
          .select('id')
          .eq('nome', nomeEquipeCorreto)
          .eq('secao_id', profile.equipes.secao_id)
          .single();

        if (errorEquipe) {
          console.error(`  Erro ao buscar equipe correta "${nomeEquipeCorreto}":`, errorEquipe);
          continue;
        }

        if (equipeCorreta) {
          console.log(`  Equipe correta encontrada: ${equipeCorreta.id}`);
        }
      }
    }

    // Verificar se existem equipes sem prefixo para todas as duplicadas
    console.log('\n=== VERIFICAÇÃO DE EQUIPES CORRESPONDENTES ===');
    
    const { data: equipesComPrefixo, error: errorPrefixo } = await supabase
      .from('equipes')
      .select('id, nome, secao_id')
      .like('nome', 'Equipe %');

    if (errorPrefixo) {
      console.error('Erro ao buscar equipes com prefixo:', errorPrefixo);
      return;
    }

    console.log(`Equipes com prefixo "Equipe ": ${equipesComPrefixo.length}`);

    let equipesCorrespondentesEncontradas = 0;
    for (const equipe of equipesComPrefixo) {
      const nomeCorreto = equipe.nome.replace('Equipe ', '');
      
      const { data: equipeCorreta, error } = await supabase
        .from('equipes')
        .select('id')
        .eq('nome', nomeCorreto)
        .eq('secao_id', equipe.secao_id)
        .single();

      if (!error && equipeCorreta) {
        equipesCorrespondentesEncontradas++;
      }
    }

    console.log(`Equipes correspondentes encontradas: ${equipesCorrespondentesEncontradas}`);
    console.log(`Todas as equipes duplicadas têm correspondente: ${equipesCorrespondentesEncontradas === equipesComPrefixo.length ? 'SIM' : 'NÃO'}`);

  } catch (err) {
    console.error('Erro:', err);
  }
}

verificarProfilesEquipes();