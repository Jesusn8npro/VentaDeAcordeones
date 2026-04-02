/**
 * SERVICIO DE FEED DE PRODUCTOS PARA META/FACEBOOK
 * Genera feed XML automático para Commerce Manager
 * Autor: Sistema MeLlevoEsto
 * Versión: 1.0.0
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

// Configuración de Supabase
const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

let supabase = null;
if (supabaseUrl && supabaseServiceKey) {
  supabase = createClient(supabaseUrl, supabaseServiceKey);
}

/**
 * GENERAR FEED XML DE PRODUCTOS PARA META
 * Formato RSS 2.0 con namespace de Google
 */
export async function generarFeedXML() {
  try {
    console.log('🚀 Iniciando generación de feed XML para Meta...');

    if (!supabase) {
      throw new Error('Variables de entorno de Supabase no configuradas');
    }

    // Obtener productos activos con stock
  const { data: productos, error: errorProductos } = await supabase
    .from('productos')
    .select(`
      *,
        categorias!inner(nombre, slug),
        producto_imagenes!inner(*),
        producto_videos(*)
    `)
      .eq('activo', true)
      .gt('stock', 0)
      ;

    if (errorProductos) {
      throw new Error(`Error al obtener productos: ${errorProductos.message}`);
    }

    if (!productos || productos.length === 0) {
      console.log('⚠️ No hay productos activos para generar el feed');
      return generarXMLVacio();
    }

    console.log(`📦 Se encontraron ${productos.length} productos activos`);

    // Generar XML
    const xml = generarXMLCompleto(productos);
    
    console.log('✅ Feed XML generado exitosamente');
    return xml;

  } catch (error) {
    console.error('❌ Error al generar feed XML:', error);
    throw error;
  }
}

/**
 * GENERAR XML COMPLETO CON PRODUCTOS
 */
function generarXMLCompleto(productos) {
  const fechaActual = new Date().toISOString();
  
  let xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>MeLlevoEsto - Catálogo de Productos</title>
    <link>https://mellevoesto.com</link>
    <description>Catálogo completo de productos de MeLlevoEsto para Facebook Commerce</description>
    <language>es-ES</language>
    <lastBuildDate>${fechaActual}</lastBuildDate>
    <atom:link href="https://api.mellevoesto.com/meta/feed-productos" rel="self" type="application/rss+xml" />
`;

  // Agregar cada producto
  productos.forEach(producto => {
    const itemXML = generarItemXML(producto);
    xml += itemXML;
  });

  xml += `  </channel>
</rss>`;

  return xml;
}

/**
 * GENERAR XML PARA PRODUCTO INDIVIDUAL
 */
function generarItemXML(producto) {
  const {
    id,
    nombre,
    slug,
    descripcion,
    precio,
    precio_original,
    descuento,
    stock,
    marca,
    modelo,
    color,
    talla,
    material,
    peso,
    dimensiones,
    garantia_meses,
    categorias,
    producto_imagenes,
    producto_videos
  } = producto;

  // Procesar descripción
  const descripcionLimpia = procesarDescripcion(descripcion);
  
  // Calcular precios
  const { precioFinal, precioOferta } = calcularPrecios(precio, precio_original, descuento);
  
  // Determinar disponibilidad
  const disponibilidad = stock > 0 ? 'in stock' : 'out of stock';
  
  // Generar URL del producto
  const linkProducto = slug ? `https://mellevoesto.com/landing/${slug}` : 'https://mellevoesto.com';
  
  // Obtener imágenes
  const imagenes = obtenerImagenes(producto_imagenes);
  
  // Obtener video si existe
  const videoUrl = obtenerVideo(producto_videos);
  
  // Procesar dimensiones y peso
  const dimensionesProcesadas = procesarDimensiones(dimensiones);
  const pesoGramos = procesarPeso(peso);

  let itemXML = `    <item>
      <g:id>${id}</g:id>
      <g:title>${sanitizarXML(nombre)}</g:title>
      <g:description>${sanitizarXML(descripcionLimpia)}</g:description>
      <g:link>${linkProducto}</g:link>
      <g:image_link>${imagenes.principal}</g:image_link>
`;

  // Imágenes adicionales
  if (imagenes.adicionales.length > 0) {
    imagenes.adicionales.forEach(img => {
      itemXML += `      <g:additional_image_link>${img}</g:additional_image_link>
`;
    });
  }

  // Precio y oferta (COP)
  itemXML += `      <g:price>${precioFinal} COP</g:price>
`;
  
  if (precioOferta && precioOferta < precioFinal) {
    itemXML += `      <g:sale_price>${precioOferta} COP</g:sale_price>
`;
  }

  // Disponibilidad y condición
  itemXML += `      <g:availability>${disponibilidad}</g:availability>
      <g:condition>new</g:condition>
`;

  // Marca y modelo
  if (marca) {
    itemXML += `      <g:brand>${sanitizarXML(marca)}</g:brand>
`;
  }
  
  if (modelo) {
    itemXML += `      <g:mpn>${sanitizarXML(modelo)}</g:mpn>
`;
  }

  // Categoría
  const categoriaNombre = obtenerCategoriaNombre(categorias);
  if (categoriaNombre) {
    itemXML += `      <g:product_type>${sanitizarXML(categoriaNombre)}<\/g:product_type>\n`;
  }

  // Atributos físicos
  if (color) {
    itemXML += `      <g:color>${sanitizarXML(color)}</g:color>
`;
  }
  
  if (talla) {
    itemXML += `      <g:size>${sanitizarXML(talla)}</g:size>
`;
  }
  
  if (material) {
    itemXML += `      <g:material>${sanitizarXML(material)}</g:material>
`;
  }

  // Peso y dimensiones
  if (pesoGramos) {
    itemXML += `      <g:shipping_weight>${pesoGramos} g</g:shipping_weight>
`;
  }

  if (dimensionesProcesadas) {
    itemXML += `      <g:shipping_length>${dimensionesProcesadas.largo} cm</g:shipping_length>
    <g:shipping_width>${dimensionesProcesadas.ancho} cm</g:shipping_width>
    <g:shipping_height>${dimensionesProcesadas.alto} cm</g:shipping_height>
`;
  }

  // Video si existe
  if (videoUrl) {
    itemXML += `      <g:video_link>${videoUrl}</g:video_link>
`;
  }

  // Garantía
  if (garantia_meses) {
    itemXML += `      <g:warranty>${garantia_meses} meses</g:warranty>
`;
  }

  itemXML += `    </item>
`;

  return itemXML;
}

/**
 * PROCESAR DESCRIPCIÓN
 */
function procesarDescripcion(descripcion) {
  if (!descripcion) return 'Producto sin descripción';
  
  // Si es objeto JSONB con contenido
  if (typeof descripcion === 'object' && descripcion.contenido) {
    return descripcion.contenido.substring(0, 5000); // Máximo 5000 caracteres
  }
  
  // Si es string directo
  if (typeof descripcion === 'string') {
    return descripcion.substring(0, 5000);
  }
  
  return 'Producto sin descripción';
}

/**
 * CALCULAR PRECIOS
 */
function calcularPrecios(precio, precio_original, descuento) {
  let precioFinal = parseFloat(precio) || 0;
  let precioOferta = null;
  
  // Si hay descuento
  if (descuento && descuento > 0) {
    const descuentoPorcentaje = parseFloat(descuento) / 100;
    precioOferta = precioFinal;
    precioFinal = precioFinal / (1 - descuentoPorcentaje);
  }
  
  // Si hay precio original y es mayor que el precio actual
  if (precio_original && parseFloat(precio_original) > precioFinal) {
    precioOferta = precioFinal;
    precioFinal = parseFloat(precio_original);
  }
  
  return {
    // En COP manejamos valores enteros
    precioFinal: Math.round(precioFinal).toString(),
    precioOferta: precioOferta ? Math.round(precioOferta).toString() : null
  };
}

/**
 * OBTENER IMÁGENES
 */
function obtenerImagenes(producto_imagenes) {
  const imagenes = {
    principal: '',
    adicionales: []
  };
  
  if (!producto_imagenes) return imagenes;

  const imgObj = Array.isArray(producto_imagenes) ? (producto_imagenes[0] || null) : producto_imagenes;
  if (!imgObj) return imagenes;
  
  // Imagen principal
  if (imgObj.imagen_principal) {
    imagenes.principal = imgObj.imagen_principal;
  }
  
  // Imágenes adicionales
  const camposImagen = [
    'imagen_secundaria_1', 'imagen_secundaria_2', 'imagen_secundaria_3', 'imagen_secundaria_4',
    'imagen_caracteristicas', 'imagen_garantias', 'imagen_cta_final'
  ];
  
  camposImagen.forEach(campo => {
    if (imgObj[campo]) {
      imagenes.adicionales.push(imgObj[campo]);
    }
  });
  
  return imagenes;
}

/**
 * OBTENER VIDEO
 */
function obtenerVideo(producto_videos) {
  if (!producto_videos) return null;
  const vidObj = Array.isArray(producto_videos) ? (producto_videos[0] || null) : producto_videos;
  if (!vidObj || !vidObj.video_producto) return null;
  return vidObj.video_producto;
}

function obtenerCategoriaNombre(categorias) {
  if (!categorias) return null;
  if (Array.isArray(categorias)) {
    const cat = categorias[0];
    return cat && cat.nombre ? cat.nombre : null;
  }
  return categorias.nombre || null;
}

/**
 * PROCESAR DIMENSIONES
 */
function procesarDimensiones(dimensiones) {
  if (!dimensiones) return null;
  
  // Si es objeto
  if (typeof dimensiones === 'object') {
    return {
      largo: dimensiones.largo || 0,
      ancho: dimensiones.ancho || 0,
      alto: dimensiones.alto || 0
    };
  }
  
  // Si es string, intentar parsear
  if (typeof dimensiones === 'string') {
    // Formato: "10x20x30 cm" o similar
    const match = dimensiones.match(/(\d+)\s*x\s*(\d+)\s*x\s*(\d+)/i);
    if (match) {
      return {
        largo: parseInt(match[1]),
        ancho: parseInt(match[2]),
        alto: parseInt(match[3])
      };
    }
  }
  
  return null;
}

/**
 * PROCESAR PESO
 */
function procesarPeso(peso) {
  if (!peso) return null;
  
  const pesoNum = parseFloat(peso);
  if (isNaN(pesoNum)) return null;
  
  // Si viene en kg, convertir a gramos
  return pesoNum < 100 ? pesoNum * 1000 : pesoNum;
}

/**
 * SANITIZAR XML
 */
function sanitizarXML(texto) {
  if (!texto) return '';
  
  return texto
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
    .trim();
}

/**
 * GENERAR XML VACÍO
 */
function generarXMLVacio() {
  const fechaActual = new Date().toISOString();
  
  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>MeLlevoEsto - Catálogo de Productos</title>
    <link>https://mellevoesto.com</link>
    <description>Catálogo completo de productos de MeLlevoEsto para Facebook Commerce</description>
    <language>es-ES</language>
    <lastBuildDate>${fechaActual}</lastBuildDate>
    <atom:link href="https://api.mellevoesto.com/meta/feed-productos" rel="self" type="application/rss+xml" />
  </channel>
</rss>`;
}

/**
 * HANDLER PRINCIPAL PARA EXPRESS
 */
export default async function handler(req, res) {
  // Configurar CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  // Manejar OPTIONS request
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  // Solo permitir GET
  if (req.method !== 'GET') {
    return res.status(405).json({ 
      error: 'Método no permitido. Usa GET para obtener el feed.' 
    });
  }

  try {
    const xml = await generarFeedXML();
    
    // Configurar headers para XML
    res.setHeader('Content-Type', 'application/rss+xml; charset=utf-8');
    res.setHeader('Cache-Control', 'public, max-age=3600'); // Cache por 1 hora
    
    res.status(200).send(xml);
    
  } catch (error) {
    console.error('Error en el handler del feed:', error);
    res.status(500).json({ 
      error: 'Error al generar el feed de productos',
      mensaje: error.message 
    });
  }
}