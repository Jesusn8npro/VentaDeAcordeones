-- =============================================
-- VERIFICAR LA ESTRUCTURA ACTUAL REAL DE LA TABLA PRODUCTOS
-- =============================================

-- 1. VER TODAS LAS COLUMNAS DE LA TABLA PRODUCTOS
SELECT 
    column_name,
    data_type,
    udt_name,
    is_nullable,
    column_default,
    character_maximum_length,
    numeric_precision,
    numeric_scale
FROM information_schema.columns 
WHERE table_name = 'productos' 
ORDER BY ordinal_position;

-- 2. VERIFICAR SI EXISTEN LAS COLUMNAS JSONB
SELECT 
    COUNT(*) as total_columnas,
    COUNT(CASE WHEN column_name = 'caracteristicas_jsonb' THEN 1 END) as tiene_caracteristicas_jsonb,
    COUNT(CASE WHEN column_name = 'ventajas_jsonb' THEN 1 END) as tiene_ventajas_jsonb,
    COUNT(CASE WHEN column_name = 'beneficios_jsonb' THEN 1 END) as tiene_beneficios_jsonb,
    COUNT(CASE WHEN column_name = 'caracteristicas' THEN 1 END) as tiene_caracteristicas_original,
    COUNT(CASE WHEN column_name = 'ventajas' THEN 1 END) as tiene_ventajas_original,
    COUNT(CASE WHEN column_name = 'beneficios' THEN 1 END) as tiene_beneficios_original
FROM information_schema.columns 
WHERE table_name = 'productos';

-- 3. VER EL TIPO DE DATO ACTUAL DE LAS COLUMNAS EXISTENTES
SELECT 
    column_name,
    data_type,
    udt_name,
    CASE 
        WHEN data_type = 'ARRAY' THEN 'ARRAY'
        WHEN data_type = 'jsonb' THEN 'JSONB'
        WHEN data_type = 'text' THEN 'TEXT'
        WHEN data_type = 'USER-DEFINED' THEN udt_name
        ELSE data_type
    END as tipo_real
FROM information_schema.columns 
WHERE table_name = 'productos' 
AND column_name IN ('caracteristicas', 'ventajas', 'beneficios');

-- 4. VERIFICAR SI HAY ÍNDICES O RESTRICCIONES
SELECT 
    constraint_name,
    constraint_type,
    table_name,
    column_name
FROM information_schema.constraint_column_usage 
WHERE table_name = 'productos' 
AND column_name IN ('caracteristicas', 'ventajas', 'beneficios', 'caracteristicas_jsonb', 'ventajas_jsonb', 'beneficios_jsonb');