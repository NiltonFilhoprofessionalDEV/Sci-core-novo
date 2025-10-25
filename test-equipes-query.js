// Script para testar a query de equipes no Supabase
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = 'https://ekhuhyervzndsatdngyl.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVraHVoeWVydnpuZHNhdGRuZ3lsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA5NzE4OTAsImV4cCI6MjA3NjU0Nzg5MH0.DQgnQYEBHjCGUVAxQY6l1OWwqqZcSNUIUviTjDrrI8M'

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function testEquipesQuery() {
  console.log('🔍 Testando conexão com Supabase...')
  
  try {
    // 1. Testar conexão básica
    const { data: healthCheck, error: healthError } = await supabase
      .from('equipes')
      .select('count')
      .limit(1)
    
    if (healthError) {
      console.error('❌ Erro na conexão:', healthError)
      return
    }
    
    console.log('✅ Conexão com Supabase estabelecida')
    
    // 2. Verificar estrutura da tabela equipes
    console.log('\n📋 Verificando estrutura da tabela equipes...')
    const { data: allEquipes, error: allError } = await supabase
      .from('equipes')
      .select('*')
      .limit(5)
    
    if (allError) {
      console.error('❌ Erro ao buscar equipes:', allError)
      return
    }
    
    console.log(`✅ Encontradas ${allEquipes?.length || 0} equipes (primeiras 5):`)
    console.log(JSON.stringify(allEquipes, null, 2))
    
    // 3. Verificar seções disponíveis
    console.log('\n🏢 Verificando seções disponíveis...')
    const { data: secoes, error: secoesError } = await supabase
      .from('secoes')
      .select('id, nome, cidade, estado')
      .limit(5)
    
    if (secoesError) {
      console.error('❌ Erro ao buscar seções:', secoesError)
    } else {
      console.log(`✅ Encontradas ${secoes?.length || 0} seções (primeiras 5):`)
      console.log(JSON.stringify(secoes, null, 2))
      
      // 4. Testar query específica por seção (se houver seções)
      if (secoes && secoes.length > 0) {
        const primeiraSecao = secoes[0]
        console.log(`\n🔍 Testando busca de equipes para seção: ${primeiraSecao.nome} (ID: ${primeiraSecao.id})`)
        
        const { data: equipesPorSecao, error: equipesPorSecaoError } = await supabase
          .from('equipes')
          .select('*')
          .eq('secao_id', primeiraSecao.id)
          .eq('ativa', true)
          .order('nome')
        
        if (equipesPorSecaoError) {
          console.error('❌ Erro ao buscar equipes por seção:', equipesPorSecaoError)
        } else {
          console.log(`✅ Encontradas ${equipesPorSecao?.length || 0} equipes ativas para a seção ${primeiraSecao.nome}:`)
          console.log(JSON.stringify(equipesPorSecao, null, 2))
        }
      }
    }
    
    // 5. Verificar políticas RLS
    console.log('\n🔒 Testando políticas RLS...')
    const { data: rlsTest, error: rlsError } = await supabase
      .from('equipes')
      .select('id, nome, codigo, secao_id, ativa')
      .limit(1)
    
    if (rlsError) {
      console.error('❌ Possível problema com RLS:', rlsError)
    } else {
      console.log('✅ Políticas RLS parecem estar funcionando')
    }
    
  } catch (error) {
    console.error('❌ Erro geral:', error)
  }
}

testEquipesQuery()