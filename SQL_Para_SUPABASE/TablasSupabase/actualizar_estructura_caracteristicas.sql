-- =============================================
-- SCRIPT PARA ACTUALIZAR LA ESTRUCTURA DE CARACTERÍSTICAS
-- A JSONB CON FORMATO CORRECTO (MÁXIMO 4 ITEMS)
-- =============================================

-- 1. AGREGAMOS NUEVA COLUMNA JSONB PARA CARACTERÍSTICAS
ALTER TABLE productos 
ADD COLUMN caracteristicas_jsonb JSONB;

-- 2. FUNCION PARA CONVERTIR ARRAY DE CARACTERÍSTICAS A JSONB CON ESTRUCTURA CORRECTA
CREATE OR REPLACE FUNCTION convertir_caracteristicas_array_a_jsonb(
    array_data TEXT[]
) RETURNS JSONB AS $$
DECLARE
    resultado JSONB;
    items_jsonb JSONB := '[]'::JSONB;
    item JSONB;
    i INTEGER;
    titulo_default TEXT;
    subtitulo_default TEXT;
BEGIN
    -- Valores por defecto
    titulo_default := 'Características Destacadas';
    subtitulo_default := 'Descubre por qué este producto es tu mejor elección';

    -- Si el array está vacío o es nulo, devolver estructura vacía
    IF array_data IS NULL OR array_length(array_data, 1) IS NULL THEN
        resultado := jsonb_build_object(
            'titulo', titulo_default,
            'subtitulo', subtitulo_default,
            'detalles', '[]'::JSONB
        );
        RETURN resultado;
    END IF;

    -- Convertir cada elemento del array a JSONB con estructura completa (máximo 4)
    FOR i IN 1..LEAST(array_length(array_data, 1), 4) LOOP
        item := jsonb_build_object(
            'id', i,
            'icono', CASE 
                WHEN i = 1 THEN '⭐'
                WHEN i = 2 THEN '✅'
                WHEN i = 3 THEN '💎'
                WHEN i = 4 THEN '🚀'
                ELSE '🔥'
            END,
            'titulo', array_data[i],
            'descripcion', 'Característica destacada de este producto de alta calidad'
        );
        items_jsonb := items_jsonb || item;
    END LOOP;

    -- Construir el objeto JSONB final con la estructura completa
    resultado := jsonb_build_object(
        'titulo', titulo_default,
        'subtitulo', subtitulo_default,
        'detalles', items_jsonb
    );

    RETURN resultado;
END;
$$ LANGUAGE plpgsql;

-- 3. FUNCION PARA MIGRAR PRODUCTOS CON ESTRUCTURA DETALLADA DE CARACTERÍSTICAS
CREATE OR REPLACE FUNCTION migrar_caracteristicas_con_estructura_detallada(
    producto_id UUID,
    titulo_caracteristicas TEXT DEFAULT NULL,
    subtitulo_caracteristicas TEXT DEFAULT NULL,
    array_caracteristicas TEXT[]
) RETURNS VOID AS $$
DECLARE
    caracteristicas_estructura JSONB;
    items_jsonb JSONB := '[]'::JSONB;
    item JSONB;
    i INTEGER;
    titulo_final TEXT;
    subtitulo_final TEXT;
BEGIN
    -- Establecer títulos (usar valores por defecto si no se proporcionan)
    titulo_final := COALESCE(titulo_caracteristicas, 'Características Destacadas');
    subtitulo_final := COALESCE(subtitulo_caracteristicas, 'Descubre por qué este producto es tu mejor elección');

    -- Procesar características (máximo 4)
    IF array_caracteristicas IS NOT NULL AND array_length(array_caracteristicas, 1) > 0 THEN
        FOR i IN 1..LEAST(array_length(array_caracteristicas, 1), 4) LOOP
            item := jsonb_build_object(
                'id', i,
                'icono', CASE 
                    WHEN i = 1 THEN '⭐'
                    WHEN i = 2 THEN '✅'
                    WHEN i = 3 THEN '💎'
                    WHEN i = 4 THEN '🚀'
                    ELSE '🔥'
                END,
                'titulo', array_caracteristicas[i],
                'descripcion', 'Característica destacada que hace este producto especial y único en el mercado'
            );
            items_jsonb := items_jsonb || item;
        END LOOP;
    END IF;

    -- Construir estructura completa de características
    caracteristicas_estructura := jsonb_build_object(
        'titulo', titulo_final,
        'subtitulo', subtitulo_final,
        'detalles', items_jsonb
    );

    -- Actualizar el producto
    UPDATE productos 
    SET caracteristicas_jsonb = caracteristicas_estructura
    WHERE id = producto_id;
END;
$$ LANGUAGE plpgsql;

-- 4. FUNCION PARA CONVERTIR JSON EXISTENTE A LA NUEVA ESTRUCTURA (para productos que ya tienen caracteristicas en JSON)
CREATE OR REPLACE FUNCTION convertir_caracteristicas_json_existente(
    producto_id UUID
) RETURNS VOID AS $$
DECLARE
    caracteristicas_data JSONB;
    detalles_array JSONB;
    item JSONB;
    i INTEGER := 1;
    nuevos_detalles JSONB := '[]'::JSONB;
BEGIN
    -- Obtener las características actuales del producto
    SELECT caracteristicas INTO caracteristicas_data FROM productos WHERE id = producto_id;
    
    -- Si no hay características o no es JSON válido, usar estructura vacía
    IF caracteristicas_data IS NULL THEN
        UPDATE productos 
        SET caracteristicas_jsonb = jsonb_build_object(
            'titulo', 'Características Destacadas',
            'subtitulo', 'Descubre por qué este producto es tu mejor elección',
            'detalles', '[]'::JSONB
        )
        WHERE id = producto_id;
        RETURN;
    END IF;

    -- Limitar a máximo 4 detalles
    detalles_array := caracteristicas_data->'detalles';
    
    IF detalles_array IS NOT NULL AND jsonb_array_length(detalles_array) > 0 THEN
        FOR item IN SELECT * FROM jsonb_array_elements(detalles_array) LIMIT 4 LOOP
            -- Asegurar que cada item tenga la estructura correcta
            item := jsonb_build_object(
                'id', i,
                'icono', COALESCE(item->>'icono', CASE 
                    WHEN i = 1 THEN '⭐'
                    WHEN i = 2 THEN '✅'
                    WHEN i = 3 THEN '💎'
                    WHEN i = 4 THEN '🚀'
                    ELSE '🔥'
                END),
                'titulo', COALESCE(item->>'titulo', item->>'titulo', 'Característica ' || i),
                'descripcion', COALESCE(item->>'descripcion', 'Característica destacada del producto')
            );
            nuevos_detalles := nuevos_detalles || item;
            i := i + 1;
        END LOOP;
    END IF;

    -- Construir la nueva estructura
    UPDATE productos 
    SET caracteristicas_jsonb = jsonb_build_object(
        'titulo', COALESCE(caracteristicas_data->>'titulo', 'Características Destacadas'),
        'subtitulo', COALESCE(caracteristicas_data->>'subtitulo', 'Descubre por qué este producto es tu mejor elección'),
        'detalles', nuevos_detalles
    )
    WHERE id = producto_id;
END;
$$ LANGUAGE plpgsql;

-- 5. ACTUALIZAMOS TODOS LOS PRODUCTOS EXISTENTES
-- Para productos que tienen características en formato JSON
UPDATE productos 
SET caracteristicas_jsonb = convertir_caracteristicas_json_existente(id)
WHERE caracteristicas IS NOT NULL;

-- Para productos que tienen características en formato ARRAY
UPDATE productos 
SET caracteristicas_jsonb = convertir_caracteristicas_array_a_jsonb(caracteristicas)
WHERE caracteristicas IS NOT NULL AND pg_typeof(caracteristicas) = 'text[]'::regtype;

-- 6. PARA PRODUCTOS ESPECÍFICOS QUE CONOZCAMOS, PODEMOS USAR LA FUNCIÓN DETALLADA
-- Ejemplo (descomenta y ajusta el UUID cuando conozcas los productos específicos):
/*
SELECT migrar_caracteristicas_con_estructura_detallada(
    'uuid-del-producto-aqui',
    'Características del Chevrolet Sail 2016',
    'Descubre por qué este auto es tu mejor opción',
    ARRAY['Estado: Excelente', 'Kilometraje: Bajo', 'Transmisión Manual', 'Color: Rojo vibrante']
);
*/

-- 7. VERIFICACIÓN DE LA MIGRACIÓN
-- Consulta para verificar que la migración fue exitosa
SELECT 
    id,
    nombre,
    caracteristicas_jsonb->>'titulo' as caracteristicas_titulo,
    jsonb_array_length(caracteristicas_jsonb->'detalles') as cantidad_caracteristicas,
    jsonb_pretty(caracteristicas_jsonb->'detalles') as detalles
FROM productos 
WHERE caracteristicas_jsonb IS NOT NULL
LIMIT 5;

-- 8. ELIMINAMOS LA COLUMNA ANTIGUA Y RENOMBRAMOS LA NUEVA
-- NOTA: Descomenta estas líneas solo cuando estés seguro de que la migración fue exitosa
/*
ALTER TABLE productos 
DROP COLUMN caracteristicas;

ALTER TABLE productos 
RENAME COLUMN caracteristicas_jsonb TO caracteristicas;
*/

-- =============================================
-- INSTRUCCIONES DE USO:
-- 1. Ejecuta este script completo en Supabase
-- 2. Verifica que los datos se migraron correctamente
-- 3. Si todo está bien, descomenta y ejecuta el paso 8
-- 4. Actualiza tu aplicación para usar las nuevas estructuras JSONB
-- =============================================