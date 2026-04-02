-- Agregar nuevas columnas a la tabla public."ARTICULO"

ALTER TABLE public."ARTICULO"
ADD COLUMN meta_titulo TEXT, 
ADD COLUMN meta_descripcion TEXT, 
ADD COLUMN meta_keywords TEXT, 
ADD COLUMN canonical_url TEXT, 
ADD COLUMN og_titulo TEXT, 
ADD COLUMN og_descripcion TEXT, 
ADD COLUMN og_imagen_url TEXT, 
ADD COLUMN twitter_card TEXT;