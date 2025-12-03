const fs = require('fs');

// Ler o arquivo JSON
const jsonData = JSON.parse(fs.readFileSync('../tempo_epr.json', 'utf8'));

console.log(`-- MIGRAÇÃO: Cadastrar Tempos EPR - Goiânia 2025 (Completo)`);
console.log(`-- ========================================================`);
console.log(`-- Script para inserir todos os tempos de EPR dos funcionários de Goiânia`);
console.log(`-- Total de registros: ${jsonData.length} funcionários em diferentes datas e equipes`);
console.log(`-- Gerado automaticamente a partir do JSON`);
console.log();
console.log(`-- Função para converter tempo HH:MM:SS para MM:SS e calcular status`);
console.log(`-- Regras de avaliação:`);
console.log(`-- Ideal: ≤ 50 segundos (00:50)`);
console.log(`-- Tolerável: 51-60 segundos (00:51-01:00)`);
console.log(`-- Reprovado: > 60 segundos (> 01:00)`);
console.log();

// Criar tabela temporária
console.log(`-- Criar tabela temporária para processar os dados`);
console.log(`CREATE TEMP TABLE temp_epr_data (`);
console.log(`  cidade VARCHAR(50),`);
console.log(`  data_exercicio VARCHAR(10),`);
console.log(`  equipe VARCHAR(10),`);
console.log(`  nome_completo VARCHAR(100),`);
console.log(`  tempo_original VARCHAR(10)`);
console.log(`);`);
console.log();

// Processar dados em lotes de 50 para não exceder limites
const batchSize = 50;
let currentBatch = 0;

while (currentBatch * batchSize < jsonData.length) {
  const startIdx = currentBatch * batchSize;
  const endIdx = Math.min((currentBatch + 1) * batchSize, jsonData.length);
  const batch = jsonData.slice(startIdx, endIdx);
  
  console.log(`-- Lote ${currentBatch + 1}: registros ${startIdx + 1} a ${endIdx}`);
  console.log(`INSERT INTO temp_epr_data (cidade, data_exercicio, equipe, nome_completo, tempo_original) VALUES`);
  
  const values = batch.map((item, index) => {
    const tempo = item.tempo === null || item.tempo === undefined ? 'NULL' : `'${item.tempo}'`;
    return `  ('${item.cidade}', '${item.data}', '${item.equipe}', '${item.nome}', ${tempo})`;
  }).join(',\n');
  
  console.log(values + ';');
  console.log();
  
  currentBatch++;
}

// SQL para inserir os dados processados
console.log(`-- Processar e inserir os dados`);
console.log(`WITH dados_processados AS (`);
console.log(`  SELECT `);
console.log(`    cidade as nome_cidade,`);
console.log(`    TO_DATE(data_exercicio, 'DD/MM/YYYY') as data_exercicio_epr,`);
console.log(`    nome_completo,`);
console.log(`    -- Converter tempo HH:MM:SS para MM:SS`);
console.log(`    CASE `);
console.log(`      WHEN tempo_original IS NULL THEN NULL`);
console.log(`      WHEN tempo_original LIKE '00:__:__' THEN SUBSTRING(tempo_original, 4, 5)`);
console.log(`      WHEN tempo_original LIKE '00:__' THEN tempo_original`);
console.log(`      ELSE tempo_original`);
console.log(`    END as tempo_epr,`);
console.log(`    -- Calcular status baseado no tempo em segundos`);
console.log(`    CASE `);
console.log(`      WHEN tempo_original IS NULL THEN 'Atestado Médico'`);
console.log(`      WHEN EXTRACT(EPOCH FROM TO_TIMESTAMP(tempo_original, 'HH24:MI:SS')) - EXTRACT(EPOCH FROM TO_TIMESTAMP('00:00:00', 'HH24:MI:SS')) <= 50 THEN 'Ideal'`);
console.log(`      WHEN EXTRACT(EPOCH FROM TO_TIMESTAMP(tempo_original, 'HH24:MI:SS')) - EXTRACT(EPOCH FROM TO_TIMESTAMP('00:00:00', 'HH24:MI:SS')) <= 60 THEN 'Tolerável'`);
console.log(`      ELSE 'Reprovado'`);
console.log(`    END as status`);
console.log(`  FROM temp_epr_data`);
console.log(`)`);
console.log(`INSERT INTO tempo_epr (`);
console.log(`  nome_cidade,`);
console.log(`  data_exercicio_epr,`);
console.log(`  nome_completo,`);
console.log(`  tempo_epr,`);
console.log(`  status,`);
console.log(`  created_at,`);
console.log(`  updated_at`);
console.log(`)`);
console.log(`SELECT `);
console.log(`  nome_cidade,`);
console.log(`  data_exercicio_epr,`);
console.log(`  nome_completo,`);
console.log(`  tempo_epr,`);
console.log(`  status,`);
console.log(`  NOW(),`);
console.log(`  NOW()`);
console.log(`FROM dados_processados`);
console.log(`ON CONFLICT (nome_completo, data_exercicio_epr) `);
console.log(`DO UPDATE SET`);
console.log(`  tempo_epr = EXCLUDED.tempo_epr,`);
console.log(`  status = EXCLUDED.status,`);
console.log(`  updated_at = NOW();`);
console.log();
console.log(`-- Limpar tabela temporária`);
console.log(`DROP TABLE temp_epr_data;`);
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
console.log(`-- Estatísticas por status`);
console.log(`SELECT `);
console.log(`  status,`);
console.log(`  COUNT(*) as quantidade`);
console.log(`FROM tempo_epr `);
console.log(`WHERE nome_cidade = 'GOIANIA'`);
console.log(`  AND data_exercicio_epr BETWEEN '2025-01-11' AND '2025-01-21'`);
console.log(`GROUP BY status`);
console.log(`ORDER BY status;`);