// Script para testar o dropdown de equipes diretamente no navegador
// Execute este código no console do navegador na página de indicadores

console.log('🔍 Iniciando debug do dropdown de equipes...');

// Verificar se o select de equipes existe
const selectEquipe = document.querySelector('#equipe_id');
console.log('📋 Select de equipes encontrado:', selectEquipe);

if (selectEquipe) {
  console.log('📊 Opções no select:', selectEquipe.options.length);
  console.log('📝 Valor atual:', selectEquipe.value);
  console.log('🔒 Desabilitado:', selectEquipe.disabled);
  
  // Listar todas as opções
  Array.from(selectEquipe.options).forEach((option, index) => {
    console.log(`Opção ${index}:`, {
      value: option.value,
      text: option.textContent,
      selected: option.selected
    });
  });
}

// Verificar se o select de seção existe
const selectSecao = document.querySelector('#secao_id');
console.log('🏢 Select de seção encontrado:', selectSecao);

if (selectSecao) {
  console.log('📊 Seção selecionada:', selectSecao.value);
  console.log('📝 Texto da seção:', selectSecao.selectedOptions[0]?.textContent);
}

// Verificar se há mensagens de carregamento
const loadingMessages = document.querySelectorAll('*');
Array.from(loadingMessages).forEach(el => {
  if (el.textContent && el.textContent.includes('Carregando')) {
    console.log('⏳ Mensagem de carregamento encontrada:', el.textContent);
  }
});

console.log('✅ Debug concluído. Verifique os logs acima.');