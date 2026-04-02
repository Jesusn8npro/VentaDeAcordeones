-- =============================================
-- SCRIPT PARA VERIFICAR LA ESTRUCTURA ACTUAL DE LA TABLA PRODUCTOS
-- Y VERIFICAR QUE LAS MIGRACIONES FUERON EXITOSAS
-- =============================================

-- 1. VERIFICAR LA ESTRUCTURA ACTUAL DE LAS COLUMNAS
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default,
    character_maximum_length
FROM information_schema.columns 
WHERE table_name = 'productos' 
AND column_name IN ('caracteristicas', 'ventajas', 'beneficios', 'caracteristicas_jsonb', 'ventajas_jsonb', 'beneficios_jsonb')
ORDER BY ordinal_position;

-- 2. VERIFICAR CONTENIDO DE ALGUNOS PRODUCTOS
SELECT 
    id,
    nombre,
    
    -- Verificar estructura de características
    CASE 
        WHEN caracteristicas_jsonb IS NOT NULL THEN '✅ JSONB'
        WHEN pg_typeof(caracteristicas) = 'jsonb'::regtype THEN '✅ JSONB antiguo'
        WHEN pg_typeof(caracteristicas) = 'text[]'::regtype THEN '📋 ARRAY'
        ELSE '❌ Vacío'
    END as tipo_caracteristicas,
    
    -- Verificar estructura de ventajas
    CASE 
        WHEN ventajas_jsonb IS NOT NULL THEN '✅ JSONB'
        WHEN pg_typeof(ventajas) = 'jsonb'::regtype THEN '✅ JSONB antiguo'
        WHEN pg_typeof(ventajas) = 'text[]'::regtype THEN '📋 ARRAY'
        ELSE '❌ Vacío'
    END as tipo_ventajas,
    
    -- Verificar estructura de beneficios
    CASE 
        WHEN beneficios_jsonb IS NOT NULL THEN '✅ JSONB'
        WHEN pg_typeof(beneficios) = 'jsonb'::regtype THEN '✅ JSONB antiguo'
        WHEN pg_typeof(beneficios) = 'text[]'::regtype THEN '📋 ARRAY'
        ELSE '❌ Vacío'
    END as tipo_beneficios,
    
    -- Contar elementos
    jsonb_array_length(caracteristicas_jsonb->'detalles') as num_caracteristicas,
    jsonb_array_length(ventajas_jsonb->'items') as num_ventajas,
    jsonb_array_length(beneficios_jsonb->'items') as num_beneficios

FROM productos 
ORDER BY created_at DESC 
LIMIT 10;

-- 3. VERIFICAR ESTRUCTURA COMPLETA DE UN PRODUCTO DE EJEMPLO
SELECT 
    id,
    nombre,
    jsonb_pretty(caracteristicas_jsonb) as caracteristicas_completas,
    jsonb_pretty(ventajas_jsonb) as ventajas_completas,
    jsonb_pretty(beneficios_jsonb) as beneficios_completas
FROM productos 
WHERE caracteristicas_jsonb IS NOT NULL 
   OR ventajas_jsonb IS NOT NULL 
   OR beneficios_jsonb IS NOT NULL
LIMIT 1;

-- 4. VERIFICAR SI HAY PRODUCTOS SIN MIGRAR
SELECT 
    COUNT(*) as total_productos,
    COUNT(CASE WHEN caracteristicas_jsonb IS NULL AND (caracteristicas IS NOT NULL) THEN 1 END) as sin_migrar_caracteristicas,
    COUNT(CASE WHEN ventajas_jsonb IS NULL AND (ventajas IS NOT NULL) THEN 1 END) as sin_migrar_ventajas,
    COUNT(CASE WHEN beneficios_jsonb IS NULL AND (beneficios IS NOT NULL) THEN 1 END) as sin_migrar_beneficios
FROM productos;

-- 5. EJEMPLO DE CÓMO DEBERÍA VERSE LA NUEVA ESTRUCTURA
-- Descomenta para ver un ejemplo del formato esperado
/*
SELECT jsonb_build_object(
    'caracteristicas', jsonb_build_object(
        'titulo', 'Características Destacadas',
        'subtitulo', 'Descubre por qué este producto es tu mejor elección',
        'detalles', jsonb_build_array(
            jsonb_build_object('id', 1, 'icono', '⭐', 'titulo', 'Excelente estado', 'descripcion', 'Producto en perfectas condiciones'),
            jsonb_build_object('id', 2, 'icono', '✅', 'titulo', 'Garantía incluida', 'descripcion', 'Garantía de 6 meses'),
            jsonb_build_object('id', 3, 'icono', '💎', 'titulo', 'Alta calidad', 'descripcion', 'Materiales premium'),
            jsonb_build_object('id', 4, 'icono', '🚀', 'titulo', 'Envío rápido', 'descripcion', 'Entrega inmediata')
        )
    ),
    'ventajas', jsonb_build_object(
        'titulo', 'Ventajas',
        'subtitulo', 'Por qué elegirnos',
        'items', jsonb_build_array(
            jsonb_build_object('id', 1, 'icono', '💰', 'titulo', 'Mejor precio', 'descripcion', 'Precio competitivo'),
            jsonb_build_object('id', 2, 'icono', '🛡️', 'titulo', 'Seguridad garantizada', 'descripcion', 'Compra 100% segura'),
            jsonb_build_object('id', 3, 'icono', '⚡', 'titulo', 'Atención rápida', 'descripcion', 'Respuesta inmediata')
        ),
        'cta', jsonb_build_object('texto', 'Ver más ventajas', 'url', '/ventajas')
    ),
    'beneficios', jsonb_build_object(
        'titulo', 'Beneficios',
        'subtitulo', 'Lo que obtienes al comprar',
        'items', jsonb_build_array(
            jsonb_build_object('id', 1, 'icono', '📦', 'titulo', 'Entrega gratuita', 'descripcion', 'Envío sin costo'),
            jsonb_build_object('id', 2, 'icono', '💳', 'titulo', 'Múltiples pagos', 'descripcion', 'Diferentes métodos'),
            jsonb_build_object('id', 3, 'icono', '🔄', 'titulo', 'Cambios disponibles', 'descripcion', 'Política de cambios')
        ),
        'cta', jsonb_build_object('texto', 'Descubrir beneficios', 'url', '/beneficios')
    )
) as ejemplo_estructura_completa;
*/