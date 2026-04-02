-- =============================================
-- SCRIPT PARA ACTUALIZAR LA ESTRUCTURA DE VENTAJAS Y BENEFICIOS
-- DE ARRAY A JSONB CON FORMATO CORRECTO
-- =============================================

-- 1. PRIMERO, HACEMOS UN BACKUP DE LOS DATOS EXISTENTES (opcional pero recomendado)
CREATE TABLE productos_backup AS 
SELECT id, nombre, ventajas, beneficios 
FROM productos;

-- 2. AGREGAMOS LAS NUEVAS COLUMNAS JSONB
ALTER TABLE productos 
ADD COLUMN ventajas_jsonb JSONB,
ADD COLUMN beneficios_jsonb JSONB;

-- 3. FUNCION PARA CONVERTIR ARRAY A JSONB CON ESTRUCTURA CORRECTA
CREATE OR REPLACE FUNCTION convertir_array_a_jsonb_estructura(
    array_data TEXT[],
    tipo VARCHAR
) RETURNS JSONB AS $$
DECLARE
    resultado JSONB;
    items_jsonb JSONB := '[]'::JSONB;
    item JSONB;
    i INTEGER;
    titulo_default TEXT;
    subtitulo_default TEXT;
    cta_texto TEXT;
    cta_subtexto TEXT;
BEGIN
    -- Valores por defecto según el tipo
    IF tipo = 'ventajas' THEN
        titulo_default := '¿Por qué elegir este producto?';
        subtitulo_default := 'Descubre las ventajas que lo hacen único';
        cta_texto := '¡QUIERO APROVECHAR ESTA OFERTA!';
        cta_subtexto := '🔥 Oferta por tiempo limitado';
    ELSE
        titulo_default := 'Beneficios Exclusivos';
        subtitulo_default := 'Todo lo que obtienes al elegirnos';
        cta_texto := '¡QUIERO APROVECHAR ESTA OFERTA!';
        cta_subtexto := '🔥 Oferta por tiempo limitado';
    END IF;

    -- Si el array está vacío o es nulo, devolver estructura vacía
    IF array_data IS NULL OR array_length(array_data, 1) IS NULL THEN
        resultado := jsonb_build_object(
            'titulo', titulo_default,
            'subtitulo', subtitulo_default,
            'items', '[]'::JSONB,
            'cta', jsonb_build_object(
                'texto', cta_texto,
                'subtexto', cta_subtexto
            )
        );
        RETURN resultado;
    END IF;

    -- Convertir cada elemento del array a JSONB con estructura completa
    FOR i IN 1..array_length(array_data, 1) LOOP
        item := jsonb_build_object(
            'id', i,
            'icono', CASE 
                WHEN i = 1 THEN '🚀'
                WHEN i = 2 THEN '⚡'
                WHEN i = 3 THEN '💎'
                WHEN i = 4 THEN '🛡️'
                WHEN i = 5 THEN '🔒'
                WHEN i = 6 THEN '🚚'
                ELSE '⭐'
            END,
            'titulo', array_data[i],
            'descripcion', CASE
                WHEN tipo = 'ventajas' AND i <= 2 THEN 'Problema que muchos clientes enfrentan'
                WHEN tipo = 'ventajas' AND i >= 3 THEN 'Solución que nuestro producto ofrece'
                ELSE 'Beneficio exclusivo de nuestro producto'
            END
        );
        items_jsonb := items_jsonb || item;
    END LOOP;

    -- Construir el objeto JSONB final con la estructura completa
    resultado := jsonb_build_object(
        'titulo', titulo_default,
        'subtitulo', subtitulo_default,
        'items', items_jsonb,
        'cta', jsonb_build_object(
            'texto', cta_texto,
            'subtexto', cta_subtexto
        )
    );

    RETURN resultado;
END;
$$ LANGUAGE plpgsql;

-- 4. ACTUALIZAMOS LOS DATOS EXISTENTES A LA NUEVA ESTRUCTURA
UPDATE productos 
SET ventajas_jsonb = convertir_array_a_jsonb_estructura(ventajas, 'ventajas'),
    beneficios_jsonb = convertir_array_a_jsonb_estructura(beneficios, 'beneficios');

-- 5. CREAMOS FUNCION PARA MIGRAR PRODUCTOS ESPECÍFICOS CON ESTRUCTURA DETALLADA
CREATE OR REPLACE FUNCTION migrar_producto_con_estructura_completa(
    producto_id UUID,
    ventajas_array TEXT[],
    beneficios_array TEXT[]
) RETURNS VOID AS $$
DECLARE
    ventajas_estructura JSONB;
    beneficios_estructura JSONB;
    items_ventajas JSONB := '[]'::JSONB;
    items_beneficios JSONB := '[]'::JSONB;
    item JSONB;
    i INTEGER;
BEGIN
    -- Procesar ventajas
    IF ventajas_array IS NOT NULL AND array_length(ventajas_array, 1) > 0 THEN
        FOR i IN 1..array_length(ventajas_array, 1) LOOP
            item := jsonb_build_object(
                'id', i,
                'icono', CASE 
                    WHEN i = 1 THEN '💔'
                    WHEN i = 2 THEN '😤'
                    WHEN i = 3 THEN '✅'
                    ELSE '⭐'
                END,
                'titulo', ventajas_array[i],
                'descripcion', CASE
                    WHEN i <= 2 THEN 'Problema que muchos clientes enfrentan con productos genéricos'
                    ELSE 'Solución que nuestro producto ofrece'
                END
            );
            items_ventajas := items_ventajas || item;
        END LOOP;
    END IF;

    -- Procesar beneficios
    IF beneficios_array IS NOT NULL AND array_length(beneficios_array, 1) > 0 THEN
        FOR i IN 1..array_length(beneficios_array, 1) LOOP
            item := jsonb_build_object(
                'id', i,
                'icono', CASE 
                    WHEN i = 1 THEN '🛡️'
                    WHEN i = 2 THEN '🚚'
                    WHEN i = 3 THEN '💰'
                    ELSE '✅'
                END,
                'titulo', beneficios_array[i],
                'descripcion', 'Beneficio exclusivo que obtienes al elegir nuestro producto'
            );
            items_beneficios := items_beneficios || item;
        END LOOP;
    END IF;

    -- Construir estructura completa de ventajas
    ventajas_estructura := jsonb_build_object(
        'titulo', '¿Por qué elegir este producto?',
        'subtitulo', 'Descubre las ventajas que lo hacen único',
        'items', items_ventajas,
        'cta', jsonb_build_object(
            'texto', '¡QUIERO APROVECHAR ESTA OFERTA!',
            'subtexto', '🔥 Oferta por tiempo limitado'
        )
    );

    -- Construir estructura completa de beneficios
    beneficios_estructura := jsonb_build_object(
        'titulo', 'Beneficios Exclusivos',
        'subtitulo', 'Todo lo que obtienes al elegirnos',
        'items', items_beneficios,
        'cta', jsonb_build_object(
            'texto', '¡QUIERO APROVECHAR ESTA OFERTA!',
            'subtexto', '🔥 Oferta por tiempo limitado'
        )
    );

    -- Actualizar el producto
    UPDATE productos 
    SET ventajas_jsonb = ventajas_estructura,
        beneficios_jsonb = beneficios_estructura
    WHERE id = producto_id;
END;
$$ LANGUAGE plpgsql;

-- 6. MIGRAMOS PRODUCTOS ESPECÍFICOS QUE CONOZCAMOS
-- Ejemplo: Podemos migrar productos específicos si conocemos sus IDs
-- SELECT migrar_producto_con_estructura_completa('uuid-aqui', ARRAY['Problema 1', 'Problema 2', 'Solución'], ARRAY['Beneficio 1', 'Beneficio 2', 'Beneficio 3']);

-- 7. ELIMINAMOS LAS COLUMNAS ANTIGUAS Y RENOMBRAMOS LAS NUEVAS
-- NOTA: Descomenta estas líneas solo cuando estés seguro de que la migración fue exitosa
/*
ALTER TABLE productos 
DROP COLUMN ventajas,
DROP COLUMN beneficios;

ALTER TABLE productos 
RENAME COLUMN ventajas_jsonb TO ventajas,
RENAME COLUMN beneficios_jsonb TO beneficios;
*/

-- 8. VERIFICACIÓN DE LA MIGRACIÓN
-- Consulta para verificar que la migración fue exitosa
SELECT 
    id,
    nombre,
    ventajas_jsonb->>'titulo' as ventajas_titulo,
    jsonb_array_length(ventajas_jsonb->'items') as cantidad_ventajas,
    beneficios_jsonb->>'titulo' as beneficios_titulo,
    jsonb_array_length(beneficios_jsonb->'items') as cantidad_beneficios
FROM productos 
WHERE ventajas_jsonb IS NOT NULL OR beneficios_jsonb IS NOT NULL
LIMIT 10;

-- =============================================
-- INSTRUCCIONES DE USO:
-- 1. Ejecuta este script completo en Supabase
-- 2. Verifica que los datos se migraron correctamente
-- 3. Si todo está bien, descomenta y ejecuta el paso 7
-- 4. Actualiza tu aplicación para usar las nuevas estructuras JSONB
-- =============================================