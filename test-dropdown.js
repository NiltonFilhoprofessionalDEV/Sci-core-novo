// Script para testar o dropdown de equipes
console.log('🧪 Iniciando teste do dropdown de equipes...')

// Simular navegação para a página de ocorrências aeronáuticas
setTimeout(() => {
  console.log('🔍 Verificando se a página está carregada...')
  
  // Verificar se o formulário existe
  const form = document.querySelector('form')
  if (form) {
    console.log('✅ Formulário encontrado')
    
    // Verificar se o select de seção existe
    const secaoSelect = document.querySelector('#secao_id')
    if (secaoSelect) {
      console.log('✅ Select de seção encontrado')
      console.log('📊 Opções de seção:', secaoSelect.options.length)
      
      // Verificar se o select de equipe existe
      const equipeSelect = document.querySelector('#equipe_id')
      if (equipeSelect) {
        console.log('✅ Select de equipe encontrado')
        console.log('📊 Opções de equipe:', equipeSelect.options.length)
        console.log('🔒 Disabled:', equipeSelect.disabled)
        
        // Se há seções disponíveis, testar seleção
        if (secaoSelect.options.length > 1) {
          console.log('🎯 Testando seleção de seção...')
          
          // Selecionar a primeira seção disponível
          const primeiraSecao = secaoSelect.options[1]
          console.log('🎯 Selecionando seção:', primeiraSecao.text)
          
          secaoSelect.value = primeiraSecao.value
          secaoSelect.dispatchEvent(new Event('change', { bubbles: true }))
          
          // Aguardar um pouco para o carregamento das equipes
          setTimeout(() => {
            console.log('📊 Opções de equipe após seleção:', equipeSelect.options.length)
            console.log('🔒 Disabled após seleção:', equipeSelect.disabled)
            
            // Listar todas as opções de equipe
            for (let i = 0; i < equipeSelect.options.length; i++) {
              const option = equipeSelect.options[i]
              console.log(`  ${i}. ${option.text} (value: ${option.value})`)
            }
          }, 2000)
        } else {
          console.log('❌ Nenhuma seção disponível para teste')
        }
      } else {
        console.log('❌ Select de equipe não encontrado')
      }
    } else {
      console.log('❌ Select de seção não encontrado')
    }
  } else {
    console.log('❌ Formulário não encontrado')
  }
}, 1000)