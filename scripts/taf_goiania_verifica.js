const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://ekhuhyervzndsatdngyl.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVraHVoeWVydnpuZHNhdGRuZ3lsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA5NzE4OTAsImV4cCI6MjA3NjU0Nzg5MH0.DQgnQYEBHjCGUVAxQY6l1OWwqqZcSNUIUviTjDrrI8M'

const supabase = createClient(supabaseUrl, supabaseAnonKey)

const nomesEsperados = {
  ALFA: [
    'RONAN MARTINS DA COSTA',
    'MAXWELL ALVES LOPES',
    'RONILDO TEODORO DA SILVA JÚNIOR',
    'WDSON JUNIOR PINHEIRO DA SILVA',
    'BRENO AUGUSTO MARANHÃO',
    'SÍLVIO PASSOS DA SILVA',
    'RICARDO RODRIGUES GONÇALVES',
    'LAURA MARIA CARVALHAIS DE SOUZA',
    'NILTON DE SOUZA CABRAL FILHO',
    'IGOR ALMEIDA DOS SANTOS',
  ],
  BRAVO: [
    'GEDIAEL SANTOS FERREIRA',
    'ZACARIAS KEVIN VIEIRA NUNES',
    'LUIS FERNANDO ABDON NUNES JÚNIOR',
    'GABRIEL ARAÚJO LOPES',
    'GABRIEL MARTINS DE ABREU',
    'THAÍS CRISTINA DE FREITAS GONTIJO',
    'PAULO AUGUSTO CARDOSO NORONHA',
    'GUSTAVO ALVES DE SOUZA',
    'VICTOR ANTUNES BRETAS',
    'MARCOS VINÍCIUS SILVA OLIVEIRA',
  ],
  CHARLIE: [
    'MATHEUS GOMES DOS SANTOS',
    'KAIQUE CHARLES RATKEIVISZ',
    'VINÍCIUS LOPES DOS SANTOS',
    'RAFAEL BATISTA JUNQUEIRA',
    'CARMEN LÍDIA MASCARENHAS',
    'HELI DE ALMEIDA NERES',
    'JEFFERSON PEREIRA LOYOLA DOS SANTOS',
    'LEANDRO LUIS DE CARVALHO',
  ],
  DELTA: [
    'DIEGO DE JESUS RODRIGUES',
    'GABRIEL FERREIRA GONÇALVES',
    'LEANDRO SOARES GARCIA',
    'PEDRO HENRIQUE NUNES RAMOS',
    'ARIDELCIO ARAUJO DO NASCIMENTO',
    'CAMILA GODOY SILVA',
    'JOSÉ ANTÔNIO DE MORAES LEAL',
    'NÁRIA SANTANA DA SILVA',
    'PAULO CÉSAR DA SILVA OLIVEIRA',
    'SÍLVIO CÉSAR FERNANDES FILHO',
    'HENRIQUE ELER ASSUNÇÃO PINTO',
  ],
}

function normalizar(s) {
  return (s || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toUpperCase()
    .trim()
}

;(async () => {
  try {
    const { count: totalGoiania, error: countError } = await supabase
      .from('taf_resultados')
      .select('*', { count: 'exact', head: true })
      .eq('nome_cidade', 'Goiânia')
    if (countError) throw countError

    const { data: registros, error: listError } = await supabase
      .from('taf_resultados')
      .select('nome_equipe, nome_completo, data_taf, idade, tempo_total, desempenho')
      .eq('nome_cidade', 'Goiânia')
      .order('data_taf')
      .order('nome_equipe')
      .order('nome_completo')
    if (listError) throw listError

    const porEquipe = (registros || []).reduce((acc, r) => {
      const k = r.nome_equipe || 'DESCONHECIDA'
      acc[k] = (acc[k] || 0) + 1
      return acc
    }, {})

    console.log(JSON.stringify({ total_goiania: totalGoiania || 0, registros: registros || [], por_equipe: porEquipe }, null, 2))
  } catch (err) {
    console.error('Erro ao consultar TAFs de Goiânia:', err)
    process.exit(1)
  }
})()