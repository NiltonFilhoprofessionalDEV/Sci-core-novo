const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '../.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing Supabase environment variables!')
  console.error('Make sure .env.local exists in the project root with:')
  console.error('  NEXT_PUBLIC_SUPABASE_URL')
  console.error('  NEXT_PUBLIC_SUPABASE_ANON_KEY')
  process.exit(1)
}

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