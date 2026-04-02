/**
 * SERVICIO DE ACTUALIZACIÓN AUTOMÁTICA DE FEED PARA META
 * Genera y actualiza el feed de productos automáticamente
 * Autor: Sistema MeLlevoEsto
 * Versión: 1.0.0
 */

import { createClient } from '@supabase/supabase-js';
import { generarFeedXML } from './feed-productos.js';
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
 * CONFIGURACIÓN DEL SERVICIO
 */
const CONFIG = {
  // Frecuencia de actualización (en minutos)
  frecuenciaActualizacion: 60, // 1 hora
  
  // Horarios de actualización (opcional)
  horariosActualizacion: [
    '02:00', // 2 AM
    '08:00', // 8 AM
    '14:00', // 2 PM
    '20:00'  // 8 PM
  ],
  
  // Almacenamiento del feed
  bucketStorage: 'feeds-meta',
  nombreArchivo: 'feed-productos.xml',
  
  // URLs
  urlFeedPublico: null,
  urlWebhookStatus: process.env.WEBHOOK_META_FEED_STATUS_URL || null
};

/**
 * INICIAR SERVICIO DE ACTUALIZACIÓN AUTOMÁTICA
 */
export function iniciarServicioActualizacion() {
  console.log('🔄 Iniciando servicio de actualización automática de feed para Meta...');
  if (!supabase) {
    console.log('⚠️ Variables de entorno de Supabase no configuradas. Servicio en espera.');
    return;
  }
  
  // Actualización por intervalo
  setInterval(async () => {
    await actualizarFeed();
  }, CONFIG.frecuenciaActualizacion * 60 * 1000);
  
  // Actualización por horario (si está configurada)
  if (CONFIG.horariosActualizacion.length > 0) {
    iniciarActualizacionPorHorario();
  }
  
  // Actualización inicial
  actualizarFeed();
  
  console.log('✅ Servicio de actualización iniciado');
  console.log(`📊 Frecuencia: cada ${CONFIG.frecuenciaActualizacion} minutos`);
  console.log(`🕐 Horarios: ${CONFIG.horariosActualizacion.join(', ')}`);
}

/**
 * ACTUALIZAR FEED MANUALMENTE
 */
export async function actualizarFeed() {
  const inicio = Date.now();
  
  try {
    console.log('🔄 Iniciando actualización de feed...');
    if (!supabase) {
      throw new Error('Variables de entorno de Supabase no configuradas');
    }
    
    // Generar nuevo feed
    const xml = await generarFeedXML();
    
    // Subir a Supabase Storage
    const { data, error } = await supabase
      .storage
      .from(CONFIG.bucketStorage)
      .upload(CONFIG.nombreArchivo, xml, {
        contentType: 'application/rss+xml',
        upsert: true // Sobrescribir si existe
      });
    
    if (error) {
      throw new Error(`Error al subir feed: ${error.message}`);
    }
    
    // Obtener URL pública
    const { data: { publicUrl } } = supabase
      .storage
      .from(CONFIG.bucketStorage)
      .getPublicUrl(CONFIG.nombreArchivo);
    
    const duracion = Date.now() - inicio;
    
    console.log('✅ Feed actualizado exitosamente');
    console.log(`📁 URL pública: ${publicUrl}`);
    console.log(`⏱️ Duración: ${duracion}ms`);
    
    // Notificar éxito
    await notificarEstado('exito', {
      url: publicUrl,
      duracion,
      timestamp: new Date().toISOString()
    });
    
    return {
      exito: true,
      url: publicUrl,
      duracion,
      mensaje: 'Feed actualizado correctamente'
    };
    
  } catch (error) {
    console.error('❌ Error al actualizar feed:', error);
    
    // Notificar error
    await notificarEstado('error', {
      error: error.message,
      timestamp: new Date().toISOString()
    });
    
    return {
      exito: false,
      error: error.message,
      mensaje: 'Error al actualizar feed'
    };
  }
}

/**
 * ACTUALIZACIÓN POR HORARIO
 */
function iniciarActualizacionPorHorario() {
  console.log('⏰ Configurando actualización por horario...');
  if (!supabase) return;
  
  // Verificar cada minuto si es hora de actualizar
  setInterval(() => {
    const ahora = new Date();
    const horaActual = ahora.toTimeString().substring(0, 5); // HH:MM
    
    if (CONFIG.horariosActualizacion.includes(horaActual)) {
      console.log(`⏰ Es hora de actualizar: ${horaActual}`);
      actualizarFeed();
    }
  }, 60000); // Verificar cada minuto
}

/**
 * MONITOREAR CAMBIOS EN PRODUCTOS (WEBHOOK)
 */
export function configurarWebhookProductos() {
  console.log('👂 Configurando webhook para cambios en productos...');
  if (!supabase) {
    console.log('⚠️ Webhook no configurado: Supabase no disponible');
    return null;
  }
  
  // Configurar webhook de Supabase
  const canal = supabase
    .channel('cambios-productos-meta')
    .on('postgres_changes', 
      { event: '*', schema: 'public', table: 'productos' },
      async (payload) => {
        console.log('🔄 Cambio detectado en productos:', payload.eventType);
        
        // Esperar 5 segundos para evitar múltiples actualizaciones rápidas
        setTimeout(async () => {
          await actualizarFeed();
        }, 5000);
      }
    )
    .subscribe();
  
  console.log('✅ Webhook configurado');
  return canal;
}

/**
 * OBTENER ESTADÍSTICAS DEL FEED
 */
export async function obtenerEstadisticasFeed() {
  try {
    if (!supabase) {
      return {
        error: 'Supabase no configurado',
        mensaje: 'Variables de entorno faltantes',
      };
    }
    // Obtener información del archivo
    const { data: infoArchivo, error: errorInfo } = await supabase
      .storage
      .from(CONFIG.bucketStorage)
      .list('', {
        search: CONFIG.nombreArchivo
      });
    
    if (errorInfo) {
      throw new Error(`Error al obtener info del archivo: ${errorInfo.message}`);
    }
    
    const archivo = infoArchivo?.[0];
    
    if (!archivo) {
      return {
        existe: false,
        mensaje: 'El feed aún no ha sido generado'
      };
    }
    
    // Obtener URL pública
    const { data: publicUrlData } = supabase
      .storage
      .from(CONFIG.bucketStorage)
      .getPublicUrl(CONFIG.nombreArchivo);

    // Obtener productos activos
    const { count: totalProductos } = await supabase
      .from('productos')
      .select('*', { count: 'exact', head: true })
      .eq('activo', true)
      .gt('stock', 0);
    
    return {
      existe: true,
      ultimaActualizacion: archivo.updated_at,
      tamaño: archivo.metadata?.size || 0,
      url: publicUrlData?.publicUrl || CONFIG.urlFeedPublico,
      totalProductos: totalProductos || 0,
      proximaActualizacion: calcularProximaActualizacion()
    };
    
  } catch (error) {
    console.error('Error al obtener estadísticas:', error);
    return {
      error: error.message,
      mensaje: 'Error al obtener estadísticas del feed'
    };
  }
}

/**
 * NOTIFICAR ESTADO (WEBHOOK OPCIONAL)
 */
async function notificarEstado(tipo, datos) {
  try {
    console.log(`📢 Notificación ${tipo}:`, datos);
    const url = CONFIG.urlWebhookStatus;
    if (!url) {
      console.log('ℹ️ Notificación deshabilitada: URL de webhook no configurada');
      return;
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 3000);
    try {
      await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tipo, datos, timestamp: new Date().toISOString() }),
        signal: controller.signal,
      });
    } finally {
      clearTimeout(timeout);
    }
  } catch (error) {
    console.warn('⚠️ Notificación omitida (webhook no accesible):', error?.message || error);
  }
}

/**
 * CALCULAR PRÓXIMA ACTUALIZACIÓN
 */
function calcularProximaActualizacion() {
  const ahora = new Date();
  const proxima = new Date(ahora.getTime() + (CONFIG.frecuenciaActualizacion * 60 * 1000));
  return proxima.toISOString();
}

/**
 * HANDLER PARA VERIFICAR ESTADO DEL SERVICIO
 */
export async function handlerEstadoServicio(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ 
      error: 'Método no permitido. Usa GET.' 
    });
  }
  
  try {
    const estadisticas = await obtenerEstadisticasFeed();
    
    res.status(200).json({
      servicio: 'Feed Meta - Actualización Automática',
      estado: 'activo',
      configuracion: {
        frecuencia: `${CONFIG.frecuenciaActualizacion} minutos`,
        horarios: CONFIG.horariosActualizacion,
        bucket: CONFIG.bucketStorage
      },
      estadisticas,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    res.status(500).json({
      error: 'Error al obtener estado del servicio',
      mensaje: error.message
    });
  }
}

/**
 * ASEGURAR QUE EL BUCKET DE STORAGE EXISTA
 */
export async function asegurarBucketFeedsMeta() {
  try {
    const bucketName = CONFIG.bucketStorage;
    const { data: buckets, error } = await supabase.storage.listBuckets();
    if (error) {
      throw new Error(`Error listando buckets: ${error.message}`);
    }

    const existe = Array.isArray(buckets) && buckets.some(b => b.name === bucketName);
    if (!existe) {
      const { data: creado, error: errorCrear } = await supabase.storage.createBucket(bucketName, {
        public: true,
        fileSizeLimit: 52428800,
      });
      if (errorCrear) {
        throw new Error(`Error creando bucket '${bucketName}': ${errorCrear.message}`);
      }
      return { creado: true, bucket: creado };
    }
    return { creado: false };
  } catch (e) {
    console.error('Error asegurando bucket feeds-meta:', e);
    return { error: e.message };
  }
}

// Auto-iniciar si se ejecuta directamente
if (import.meta.url === `file://${process.argv[1]}`) {
  iniciarServicioActualizacion();
  configurarWebhookProductos();
}