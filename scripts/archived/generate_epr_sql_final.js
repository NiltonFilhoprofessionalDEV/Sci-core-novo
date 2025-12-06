const fs = require('fs');

// Ler o arquivo JSON
const jsonData = JSON.parse(fs.readFileSync('../tempo_epr.json', 'utf8'));

console.log(`-- MIGRAÇÃO: Cadastrar Tempos EPR - Goiânia 2025 (Estrutura Correta)`);
console.log(`-- ========================================================`);
console.log(`-- Script para inserir todos os tempos de EPR dos funcionários de Goiânia`);
console.log(`-- Total de registros: ${jsonData.length} funcionários em diferentes datas e equipes`);
console.log(`-- Gerado automaticamente a partir do JSON`);
console.log();
console.log(`-- Estrutura da tabela tempo_epr:`);
console.log(`-- secao_id (obrigatório) - ID da seção Goiânia`);
console.log(`-- equipe_id (opcional) - ID da equipe`);
console.log(`-- usuario_id (obrigatório) - ID do funcionário`);
console.log(`-- data_referencia (obrigatório) - Data de referência`);
console.log(`-- nome_cidade, data_exercicio_epr, nome_completo, tempo_epr, status`);
console.log();

console.log(`-- Obter IDs necessários e inserir registros`);
console.log(`WITH info_base AS (`);
console.log(`  -- Obter ID da seção Goiânia`);
console.log(`  SELECT id as secao_id FROM secoes WHERE nome = 'Goiânia' LIMIT 1`);
console.log(`)`);
console.log(`-- Inserir registros de EPR com IDs corretos`);
console.log(`INSERT INTO tempo_epr (`);
console.log(`  secao_id, equipe_id, usuario_id, data_referencia,`);
console.log(`  nome_cidade, data_exercicio_epr, nome_completo, tempo_epr, status, equipe,`);
console.log(`  created_at, updated_at`);
console.log(`)`);
console.log(`SELECT `);
console.log(`  (SELECT secao_id FROM info_base) as secao_id,`);
console.log(`  f.equipe_id,`);
console.log(`  f.id as usuario_id,`);
console.log(`  CURRENT_DATE as data_referencia,`);
console.log(`  'GOIANIA' as nome_cidade,`);
console.log(`  TO_DATE(fd.data_exercicio, 'DD/MM/YYYY') as data_exercicio_epr,`);
console.log(`  f.nome_completo,`);
console.log(`  CASE `);
console.log(`    WHEN fd.tempo_original IS NULL THEN NULL`);
console.log(`    WHEN fd.tempo_original LIKE '00:__:__' THEN SUBSTRING(fd.tempo_original, 4, 5)`);
console.log(`    WHEN fd.tempo_original LIKE '00:__' THEN fd.tempo_original`);
console.log(`    ELSE fd.tempo_original`);
console.log(`  END as tempo_epr,`);
console.log(`  CASE `);
console.log(`    WHEN fd.tempo_original IS NULL THEN 'Atestado Médico'`);
console.log(`    WHEN EXTRACT(EPOCH FROM TO_TIMESTAMP(fd.tempo_original, 'HH24:MI:SS')) - EXTRACT(EPOCH FROM TO_TIMESTAMP('00:00:00', 'HH24:MI:SS')) <= 50 THEN 'Ideal'`);
console.log(`    WHEN EXTRACT(EPOCH FROM TO_TIMESTAMP(fd.tempo_original, 'HH24:MI:SS')) - EXTRACT(EPOCH FROM TO_TIMESTAMP('00:00:00', 'HH24:MI:SS')) <= 60 THEN 'Tolerável'`);
console.log(`    ELSE 'Reprovado'`);
console.log(`  END as status,`);
console.log(`  e.nome as equipe,`);
console.log(`  NOW(),`);
console.log(`  NOW()`);
console.log(`FROM (`);

// Criar dados temporários com todos os registros
console.log(`  -- Dados dos tempos EPR`);
console.log(`  VALUES `);

// Processar em lotes para não exceder limites
const batchSize = 50;
let currentBatch = 0;
let firstBatch = true;

while (currentBatch * batchSize < jsonData.length) {
  const startIdx = currentBatch * batchSize;
  const endIdx = Math.min((currentBatch + 1) * batchSize, jsonData.length);
  const batch = jsonData.slice(startIdx, endIdx);
  
  if (!firstBatch) {
    console.log(',');
  }
  
  const values = batch.map((item, index) => {
    const tempo = item.tempo === null || item.tempo === undefined ? 'NULL' : `'${item.tempo}'`;
    return `    ('${item.cidade}', '${item.data}', '${item.equipe}', '${item.nome}', ${tempo})`;
  }).join(',\n');
  
  console.log(values);
  
  firstBatch = false;
  currentBatch++;
}

console.log(`) AS fd(data_cidade, data_exercicio, data_equipe, data_nome, tempo_original)`);
console.log(`JOIN funcionarios f ON f.nome_completo = fd.data_nome`);
console.log(`JOIN equipes e ON e.nome = fd.data_equipe AND e.secao_id = (SELECT secao_id FROM info_base)`);
console.log(`ON CONFLICT (usuario_id, data_exercicio_epr) `);
console.log(`DO UPDATE SET`);
console.log(`  tempo_epr = EXCLUDED.tempo_epr,`);
console.log(`  status = EXCLUDED.status,`);
console.log(`  updated_at = NOW();`);
console.log();
console.log(`-- Relatório de inserção`);
console.log(`SELECT `);
console.log(`  'Resumo da Inserção de Tempos EPR - Goiânia:' as titulo`);
console.log(`UNION ALL`);
console.log(`SELECT `);
console.log(`  'Total de registros inseridos/atualizados: ' || COUNT(*) `);
console.log(`FROM tempo_epr `);
console.log(`WHERE nome_cidade = 'GOIANIA' `);
console.log(`  AND data_exercicio_epr BETWEEN '2025-01-11' AND '2025-01-21'`);
console.log(`UNION ALL`);
console.log(`SELECT `);
console.log(`  'Período: 11/01/2025 a 21/01/2025';`);
console.log();
console.log(`-- Estatísticas por equipe e status`);
console.log(`SELECT `);
console.log(`  equipe,`);
console.log(`  status,`);
console.log(`  COUNT(*) as quantidade`);
console.log(`FROM tempo_epr `);
console.log(`WHERE nome_cidade = 'GOIANIA'`);
console.log(`  AND data_exercicio_epr BETWEEN '2025-01-11' AND '2025-01-21'`);
console.log(`GROUP BY equipe, status`);
console.log(`ORDER BY equipe, status;`);