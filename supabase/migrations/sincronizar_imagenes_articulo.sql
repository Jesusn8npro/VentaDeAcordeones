CREATE OR REPLACE FUNCTION sincronizar_imagenes_articulo(p_articulo_id UUID, p_imagenes JSONB[])
RETURNS VOID AS $$
DECLARE
    imagen_data JSONB;
    v_id UUID;
    v_url_imagen TEXT;
    v_alt_text TEXT;
    v_tipo_imagen TEXT;
    v_nombre_archivo TEXT;
BEGIN
    -- Marcar todas las imágenes existentes para este artículo como candidatas a eliminación
    UPDATE articulo_imagenes
    SET temporal_delete_flag = TRUE
    WHERE articulo_id = p_articulo_id;

    -- Iterar sobre el array de imágenes JSON y hacer un "upsert" manual
    FOREACH imagen_data IN ARRAY p_imagenes
    LOOP
        v_id := (imagen_data->>'id')::UUID;
        v_url_imagen := imagen_data->>'url_imagen';
        v_alt_text := imagen_data->>'alt_text';
        v_tipo_imagen := imagen_data->>'tipo_imagen';
        v_nombre_archivo := imagen_data->>'nombre_archivo';

        INSERT INTO articulo_imagenes (id, articulo_id, url_imagen, alt_text, tipo_imagen, nombre_archivo, temporal_delete_flag)
        VALUES (v_id, p_articulo_id, v_url_imagen, v_alt_text, v_tipo_imagen, v_nombre_archivo, FALSE)
        ON CONFLICT (id)
        DO UPDATE SET
            url_imagen = EXCLUDED.url_imagen,
            alt_text = EXCLUDED.alt_text,
            tipo_imagen = EXCLUDED.tipo_imagen,
            nombre_archivo = EXCLUDED.nombre_archivo,
            temporal_delete_flag = FALSE;
    END LOOP;

    -- Eliminar las imágenes que no se actualizaron (las que todavía tienen el flag)
    DELETE FROM articulo_imagenes
    WHERE articulo_id = p_articulo_id AND temporal_delete_flag = TRUE;

    -- Asegurarse de que la columna temporal no persista con valores TRUE
    UPDATE articulo_imagenes
    SET temporal_delete_flag = FALSE
    WHERE articulo_id = p_articulo_id AND temporal_delete_flag IS NULL;

END;
$$ LANGUAGE plpgsql;

-- Adicionalmente, necesitas añadir la columna `temporal_delete_flag` a tu tabla `articulo_imagenes`.
-- Ejecuta este comando si aún no lo has hecho:

ALTER TABLE articulo_imagenes
ADD COLUMN IF NOT EXISTS temporal_delete_flag BOOLEAN DEFAULT FALSE;