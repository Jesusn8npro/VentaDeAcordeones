import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { clienteSupabase as supabase } from '../../../configuracion/supabase';
import { comprimirImagen, CONFIGURACIONES_PREDEFINIDAS } from '../../../utilidades/compresionImagenes';
import './CreadorArticulos.css';
import CrearArticuloIA from './Componentes/CrearArticuloIA';
import FormularioArticulo from './FormularioArticulo';

const estadoInicialArticulo = {
  titulo: '',
  slug: '',
  resumen_breve: '',
  resumen_completo: '',
  secciones: [],
  cta: [],
  estado_publicacion: 'borrador',
  categorias: [],
  etiquetas: [],
  autor_id: null,
  meta_titulo: '',
  meta_descripcion: '',
  meta_keywords: '',
  canonical_url: '',
  og_titulo: '',
  og_descripcion: '',
  og_imagen_url: '',
  twitter_card: 'summary_large_image',
  imagenes: [],
};

const CreadorArticulos = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const modo = slug ? 'editar' : 'crear';

  const [articulo, setArticulo] = useState(estadoInicialArticulo);
  const [cargando, setCargando] = useState(false);
  const [pestanaActiva, setPestanaActiva] = useState('formulario');
  const [imagenesOriginales, setImagenesOriginales] = useState([]);

  useEffect(() => {
    const fetchArticulo = async () => {
      if (modo === 'editar' && slug) {
        setCargando(true);
        const { data, error } = await supabase
          .from('articulos_web')
          .select('*, articulo_imagenes(*)')
          .eq('slug', slug)
          .single();

        if (error) {
          console.error('Error al cargar el artículo:', error);
          alert('No se pudo cargar el artículo. Serás redirigido.');
          navigate('/admin/blog');
        } else {
          const articuloConImagenes = { ...data, imagenes: data.articulo_imagenes || [] };
          setArticulo(articuloConImagenes);
          setImagenesOriginales(data.articulo_imagenes || []);
        }
        setCargando(false);
      }
    };

    fetchArticulo();
    if (modo === 'crear') {
      setArticulo(estadoInicialArticulo);
      setImagenesOriginales([]);
    }
  }, [modo, slug, navigate]);

  const handleArticuloChange = (articuloActualizado) => {
    setArticulo(articuloActualizado);
  };

  const subirImagen = async (imagen, articuloId) => {
    const { archivo } = imagen;
    if (!archivo) return imagen; // Si no hay archivo, es una imagen existente

    const idImagen = `img_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    const { archivoComprimido, estadisticas } = await comprimirImagen(archivo, CONFIGURACIONES_PREDEFINIDAS.web);
    const extension = archivoComprimido.type.split('/')[1] || 'webp';
    const nombreArchivo = `articulos/${articuloId}/${idImagen}.${extension}`;

    const { error: errorSubida } = await supabase.storage
      .from('imagenes_tienda')
      .upload(nombreArchivo, archivoComprimido);

    if (errorSubida) throw errorSubida;

    const { data: { publicUrl } } = supabase.storage.from('imagenes_tienda').getPublicUrl(nombreArchivo);

    return {
      ...imagen,
      articulo_id: articuloId,
      url_imagen: publicUrl,
      nombre_archivo: nombreArchivo,
      estadisticas,
      archivo: null, // Limpiar el archivo local
      estado: 'subido',
    };
  };

  const handleGuardarArticulo = async () => {
    setCargando(true);
    let articuloId = articulo.id;

    try {
      // 1. Guardar o actualizar el artículo para asegurar que tenemos un ID
      if (modo === 'crear') {
        const { data, error } = await supabase.from('articulos_web').insert([{ ...articulo, imagenes: undefined }]).select().single();
        if (error) throw error;
        articuloId = data.id;
        navigate(`/admin/blog/editar/${data.slug}`, { replace: true });
      } else {
        const { error } = await supabase.from('articulos_web').update({ ...articulo, imagenes: undefined }).eq('id', articuloId);
        if (error) throw error;
      }

      // 2. Procesar imágenes
      const imagenesActuales = articulo.imagenes || [];
      const imagenesNuevasASubir = imagenesActuales.filter(img => img.archivo);
      const imagenesExistentes = imagenesActuales.filter(img => !img.archivo);

      // Subir nuevas imágenes
      const imagenesSubidas = await Promise.all(
        imagenesNuevasASubir.map(img => subirImagen(img, articuloId))
      );

      const todasLasImagenes = [...imagenesExistentes, ...imagenesSubidas];

      // 3. Sincronizar imágenes en la tabla `articulo_imagenes`
      const { error: errorSync } = await supabase.rpc('sincronizar_imagenes_articulo', { 
        p_articulo_id: articuloId,
        p_imagenes: todasLasImagenes.map(({ id, url_imagen, alt_text, tipo_imagen, nombre_archivo }) => ({ id, articulo_id: articuloId, url_imagen, alt_text, tipo_imagen, nombre_archivo }))
      });

      if (errorSync) throw errorSync;

      // 4. Eliminar imágenes del storage que ya no se usan
      const urlsImagenesActuales = todasLasImagenes.map(img => img.nombre_archivo).filter(Boolean);
      const imagenesAEliminar = imagenesOriginales.filter(
        (imgOrig) => !urlsImagenesActuales.includes(imgOrig.nombre_archivo)
      );

      if (imagenesAEliminar.length > 0) {
        const archivosAEliminar = imagenesAEliminar.map(img => img.nombre_archivo);
        await supabase.storage.from('imagenes_tienda').remove(archivosAEliminar);
      }

      setArticulo(prev => ({ ...prev, imagenes: todasLasImagenes }));
      setImagenesOriginales(todasLasImagenes);

      alert('Artículo guardado con éxito.');

    } catch (error) {
      console.error('Error al guardar el artículo:', error);
      alert(`Error al guardar: ${error.message}`);
    } finally {
      setCargando(false);
    }
  };

  const pestanas = [
    { id: 'formulario', titulo: 'Formulario' },
    { id: 'ia', titulo: 'Crear con IA' },
  ];

  const renderizarContenidoPestana = () => {
    if (cargando && modo === 'editar' && !articulo.id) {
      return <div>Cargando datos del artículo...</div>;
    }

    switch (pestanaActiva) {
      case 'formulario':
        return (
          <FormularioArticulo
            articulo={articulo}
            onArticuloChange={handleArticuloChange}
            cargando={cargando}
          />
        );
      case 'ia':
        return <CrearArticuloIA onArticuloGenerado={handleArticuloChange} />;
      default:
        return <div>Selecciona una pestaña</div>;
    }
  };

  return (
    <div className="creador-articulos-pr formulario-ancho-completo">
      <header className="creador-header">
        <h1 className="creador-titulo">
          {modo === 'crear' ? 'Crear Nuevo Artículo' : `Editando: ${articulo?.titulo || ''}`}
        </h1>
      </header>

      <div className="pestañas-bar">
        {pestanas.map((pestana) => (
          <button
            key={pestana.id}
            className={`pestaña-item ${pestanaActiva === pestana.id ? 'activa' : ''}`}
            onClick={() => setPestanaActiva(pestana.id)}
          >
            {pestana.titulo}
          </button>
        ))}
      </div>

      <main className="contenido-principal">
        <div className="columna-principal">
          {renderizarContenidoPestana()}
        </div>
        {/* La columna lateral se elimina para quitar la duplicación */}
      </main>




    </div>
  );
};

export default CreadorArticulos;