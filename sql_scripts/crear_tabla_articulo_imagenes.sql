-- Tabla para almacenar las imágenes asociadas a cada artículo del blog.
-- Esta tabla permite una gestión centralizada y optimizada de las imágenes,
-- separándolas del contenido JSON del artículo.

CREATE TABLE public.articulo_imagenes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    articulo_id UUID NOT NULL REFERENCES public.articulo(id) ON DELETE CASCADE,
    url_imagen TEXT NOT NULL,
    alt_text TEXT,
    tipo_imagen TEXT NOT NULL, -- Ej: 'portada', 'contenido', 'meta'
    nombre_archivo TEXT,
    tamaño_original INT,
    tamaño_comprimido INT,
    formato_original TEXT,
    formato_nuevo TEXT,
    dimensiones TEXT,
    orden INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para optimizar las consultas
CREATE INDEX idx_articulo_imagenes_articulo_id ON public.articulo_imagenes(articulo_id);
CREATE INDEX idx_articulo_imagenes_tipo_imagen ON public.articulo_imagenes(tipo_imagen);

-- Comentarios en las columnas para mayor claridad
COMMENT ON COLUMN public.articulo_imagenes.id IS 'Identificador único para cada imagen.';
COMMENT ON COLUMN public.articulo_imagenes.articulo_id IS 'Referencia al artículo al que pertenece la imagen.';
COMMENT ON COLUMN public.articulo_imagenes.url_imagen IS 'Ruta de la imagen en el bucket de almacenamiento (ej: /articulos/nombre-archivo.webp).';
COMMENT ON COLUMN public.articulo_imagenes.alt_text IS 'Texto alternativo para la imagen (importante para SEO y accesibilidad).';
COMMENT ON COLUMN public.articulo_imagenes.tipo_imagen IS 'Clasifica la imagen según su propósito en el artículo (portada, contenido, meta).';
COMMENT ON COLUMN public.articulo_imagenes.nombre_archivo IS 'Nombre original del archivo subido.';
COMMENT ON COLUMN public.articulo_imagenes.tamaño_original IS 'Tamaño del archivo original en bytes.';
COMMENT ON COLUMN public.articulo_imagenes.tamaño_comprimido IS 'Tamaño del archivo comprimido en bytes.';
COMMENT ON COLUMN public.articulo_imagenes.formato_original IS 'Formato original de la imagen (ej: jpeg, png).';
COMMENT ON COLUMN public.articulo_imagenes.formato_nuevo IS 'Formato de la imagen después de la compresión (ej: webp).';
COMMENT ON COLUMN public.articulo_imagenes.dimensiones IS 'Dimensiones de la imagen (ej: 1920x1080).';
COMMENT ON COLUMN public.articulo_imagenes.orden IS 'Orden de aparición de la imagen si hay varias del mismo tipo.';
COMMENT ON COLUMN public.articulo_imagenes.created_at IS 'Fecha y hora de creación del registro.';

-- Habilitar Row Level Security (RLS)
ALTER TABLE public.articulo_imagenes ENABLE ROW LEVEL SECURITY;

-- Políticas de acceso
-- Los usuarios autenticados pueden ver todas las imágenes.
CREATE POLICY "Permitir lectura a usuarios autenticados"
ON public.articulo_imagenes
FOR SELECT
TO authenticated
USING (true);

-- Los administradores (o el rol que corresponda) pueden insertar, actualizar y eliminar imágenes.
-- Asumimos que existe un rol 'admin'. Si no, ajústalo a tu sistema de roles.
CREATE POLICY "Permitir todas las operaciones a administradores"
ON public.articulo_imagenes
FOR ALL
TO service_role -- O el rol de administrador que uses
USING (true);

-- Ejemplo de cómo un usuario con un rol específico podría gestionar sus propias imágenes si fuera necesario
-- CREATE POLICY "Permitir a los autores gestionar imágenes de sus artículos"
-- ON public.articulo_imagenes
-- FOR ALL
-- USING (
--   (SELECT autor_id FROM public.articulo WHERE id = articulo_id) = auth.uid()
-- );