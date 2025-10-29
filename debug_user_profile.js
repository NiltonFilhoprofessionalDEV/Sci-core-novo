// Script para debug do perfil do usuário no Supabase
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = 'https://ekhuhyervzndsatdngyl.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVraHVoeWVydnpuZHNhdGRuZ3lsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA5NzE4OTAsImV4cCI6MjA3NjU0Nzg5MH0.DQgnQYEBHjCGUVAxQY6l1OWwqqZcSNUIUviTjDrrI8M'

const supabase = createClient(supabaseUrl, supabaseKey)

async function debugUserProfile() {
  try {
    console.log('🔍 Buscando perfis ativos...')
    
    // Primeiro, vamos tentar buscar apenas os profiles
    const { data: profiles, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('ativo', true)
      .limit(5)

    if (error) {
      console.error('❌ Erro ao buscar perfis:', error)
      return
    }

    console.log('✅ Perfis encontrados:', profiles.length)
    
    for (const profile of profiles) {
      console.log(`\n👤 Perfil:`)
      console.log('  ID:', profile.id)
      console.log('  Email:', profile.email)
      console.log('  Nome:', profile.nome_completo)
      console.log('  Perfil:', profile.perfil)
      console.log('  Seção ID:', profile.secao_id)
      
      // Buscar seção separadamente se existe secao_id
      if (profile.secao_id) {
        const { data: secao, error: secaoError } = await supabase
          .from('secoes')
          .select('*')
          .eq('id', profile.secao_id)
          .single()
          
        if (secaoError) {
          console.log('  ❌ Erro ao buscar seção:', secaoError)
        } else {
          console.log('  ✅ Seção encontrada:', secao.nome)
        }
      } else {
        console.log('  ⚠️ Sem seção associada')
      }
    }

  } catch (error) {
    console.error('❌ Erro geral:', error)
  }
}

debugUserProfile()