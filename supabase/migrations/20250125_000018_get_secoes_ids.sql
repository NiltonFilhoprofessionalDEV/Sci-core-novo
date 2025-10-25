-- Buscar IDs das seções SBGO e SBCF
SELECT id, nome, codigo, cidade, estado 
FROM secoes 
WHERE codigo IN ('SBGO', 'SBCF') 
AND ativa = true
ORDER BY codigo;