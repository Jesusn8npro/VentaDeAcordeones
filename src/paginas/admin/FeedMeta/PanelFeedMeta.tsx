import React, { useState, useEffect } from 'react';
import './PanelFeedMeta.css'
import LogsActividad from './LogsActividad'
import PasosConfiguracionMeta from './PasosConfiguracionMeta'
import {
  Play,
  RefreshCw,
  Download,
  ExternalLink,
  CheckCircle,
  Clock,
  BarChart3,
  Settings,
  Info,
  Zap,
  Globe,
  Package
} from 'lucide-react';

/**
 * PANEL DE ADMINISTRACIÓN DE FEED PARA META/FACEBOOK
 * Interfaz completa en español para gestionar el catálogo de productos
 */
export default function PanelFeedMeta() {
  const devHost = (typeof window !== 'undefined' && window.location.hostname === 'localhost')
  const API_BASE = process.env.NEXT_PUBLIC_META_API_URL
    || (devHost ? 'http://localhost:4173' : window.location.origin)
  const uniqueId = () => (typeof crypto !== 'undefined' && crypto.randomUUID)
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`

  const [estado, setEstado] = useState({
    cargando: false,
    servicioActivo: false,
    feedGenerado: false,
    ultimaActualizacion: null,
    proximaActualizacion: null,
    totalProductos: 0,
    error: null
  });

  const [estadisticas, setEstadisticas] = useState({
    url: '',
    tamaño: 0,
    existe: false,
    ultimaActualizacion: null
  });

  const [progreso, setProgreso] = useState(0);
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    cargarEstadoServicio();
    const intervalo = setInterval(cargarEstadoServicio, 30000);
    return () => clearInterval(intervalo);
  }, []);

  const cargarEstadoServicio = async () => {
    try {
      const response = await fetch(`${API_BASE}/api/meta/estado-servicio`);
      const ct = response.headers.get('content-type') || ''
      if (!ct.includes('application/json')) {
        throw new Error('Respuesta del servidor no válida')
      }
      const data = await response.json();

      if (data && data.servicio && data.estadisticas) {
        setEstado(prev => ({
          ...prev,
          servicioActivo: true,
          feedGenerado: data.estadisticas.existe,
          ultimaActualizacion: data.estadisticas.ultimaActualizacion,
          proximaActualizacion: data.estadisticas.proximaActualizacion,
          totalProductos: data.estadisticas.totalProductos
        }));
        setEstadisticas(data.estadisticas);
      }
    } catch (error) {
      agregarLog('error', 'Error al cargar estado del servicio: ' + (error?.message || 'desconocido'));
      setEstado(prev => ({ ...prev, servicioActivo: false }))
    }
  };

  const generarFeedManual = async () => {
    setEstado(prev => ({ ...prev, cargando: true, error: null }));
    setProgreso(0);
    agregarLog('info', 'Iniciando generación manual de feed...');

    try {
      const intervaloProgreso = setInterval(() => {
        setProgreso(prev => Math.min(prev + 10, 90));
      }, 200);

      const response = await fetch(`${API_BASE}/api/meta/actualizar-feed`, {
        method: 'POST'
      });
      const ct = response.headers.get('content-type') || ''
      if (!ct.includes('application/json')) {
        throw new Error('Respuesta del servidor no válida')
      }
      const resultado = await response.json();

      clearInterval(intervaloProgreso);
      setProgreso(100);

      if (resultado.exito) {
        agregarLog('exito', '¡Feed generado exitosamente!');
        agregarLog('info', `URL del feed: ${resultado.url}`);
        agregarLog('info', `Duración: ${resultado.duracion}ms`);
        setEstado(prev => ({
          ...prev,
          feedGenerado: true,
          ultimaActualizacion: new Date().toISOString(),
          cargando: false
        }));
        await cargarEstadoServicio();
      } else {
        throw new Error(resultado.error || 'Error desconocido');
      }
    } catch (error) {
      agregarLog('error', 'Error al generar feed: ' + error.message);
      setEstado(prev => ({
        ...prev,
        error: error.message,
        cargando: false
      }));
    }

    setTimeout(() => setProgreso(0), 2000);
  };

  const descargarFeed = async () => {
    if (!estadisticas.url) return;
    try {
      const response = await fetch(estadisticas.url);
      const xml = await response.text();
      const blob = new Blob([xml], { type: 'application/rss+xml' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'feed-productos-meta.xml';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      agregarLog('info', 'Feed descargado correctamente');
    } catch (error) {
      agregarLog('error', 'Error al descargar feed: ' + error.message);
    }
  };

  const abrirFeed = () => {
    if (estadisticas.url) {
      window.open(estadisticas.url, '_blank');
    }
  };

  const agregarLog = (tipo, mensaje) => {
    setLogs(prev => {
      const ultimo = prev[0]
      if (ultimo && ultimo.mensaje === mensaje && ultimo.tipo === tipo) {
        const actualizado = { ...ultimo, count: (ultimo.count || 1) + 1, timestamp: new Date().toLocaleTimeString('es-ES') }
        return [actualizado, ...prev.slice(1)].slice(0, 200)
      }
      const nuevoLog = {
        id: uniqueId(),
        tipo,
        mensaje,
        timestamp: new Date().toLocaleTimeString('es-ES'),
        count: 1,
      }
      return [nuevoLog, ...prev].slice(0, 200)
    })
  }

  const formatearFecha = (fecha) => {
    if (!fecha) return 'Nunca';
    return new Date(fecha).toLocaleString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatearTamaño = (bytes) => {
    const val = Number(bytes)
    if (!val || Number.isNaN(val) || val <= 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.min(sizes.length - 1, Math.floor(Math.log(val) / Math.log(k)))
    return parseFloat((val / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const servicioActivo = estado.servicioActivo;

  return (
    <div className="feed-meta">
      <div className="fm-contenido">

        {/* HEADER */}
        <div className="fm-header">
          <div className="fm-header-info">
            <h1 className="fm-titulo">Feed de Productos Meta</h1>
            <p className="fm-subtitulo">Sincroniza tu catálogo de acordeones con Facebook Commerce e Instagram Shopping</p>
            <p className="fm-header-meta">
              El feed XML se genera automáticamente y se actualiza cada hora. Meta lo consume para mostrar tus productos en anuncios dinámicos.
            </p>
          </div>
          <div
            className={`fm-badge ${servicioActivo ? 'fm-badge--activo' : 'fm-badge--inactivo'}`}
          >
            <span className={`fm-badge-dot ${servicioActivo ? 'fm-badge-dot--activo' : 'fm-badge-dot--inactivo'}`} />
            {servicioActivo ? 'Servicio Activo' : 'Servicio Inactivo'}
          </div>
        </div>

        {/* ESTADÍSTICAS */}
        <div className="fm-grid-estadisticas">
          <div className="fm-card">
            <div className="fm-card-content">
              <div className="fm-estadistica-item">
                <div>
                  <p className="fm-txt-label">Total Productos</p>
                  <p className="fm-txt-valor">{estado.totalProductos}</p>
                </div>
                <Package size={32} className="fm-estadistica-icono" />
              </div>
            </div>
          </div>

          <div className="fm-card">
            <div className="fm-card-content">
              <div className="fm-estadistica-item">
                <div>
                  <p className="fm-txt-label">Estado del Feed</p>
                  <p className="fm-txt-valor fm-txt-valor--sm">
                    {estado.feedGenerado ? 'Generado' : 'Pendiente'}
                  </p>
                </div>
                {estado.feedGenerado
                  ? <CheckCircle size={32} style={{ color: 'var(--color-exito)' }} />
                  : <Clock size={32} style={{ color: 'var(--color-advertencia)' }} />
                }
              </div>
            </div>
          </div>

          <div className="fm-card">
            <div className="fm-card-content">
              <div className="fm-estadistica-item">
                <div>
                  <p className="fm-txt-label">Última Actualización</p>
                  <p className="fm-txt-valor fm-txt-valor--sm">{formatearFecha(estado.ultimaActualizacion)}</p>
                </div>
                <RefreshCw size={32} className="fm-estadistica-icono" />
              </div>
            </div>
          </div>

          <div className="fm-card">
            <div className="fm-card-content">
              <div className="fm-estadistica-item">
                <div>
                  <p className="fm-txt-label">Tamaño del Feed</p>
                  <p className="fm-txt-valor fm-txt-valor--sm">{formatearTamaño(estadisticas.tamaño)}</p>
                </div>
                <Globe size={32} style={{ color: 'var(--color-acento)' }} />
              </div>
            </div>
          </div>
        </div>

        {/* ACCIONES PRINCIPALES */}
        <div className="fm-grid-acciones">

          {/* CONTROLES */}
          <div className="fm-card">
            <div className="fm-card-header">
              <div className="fm-card-title"><Play size={18} /> Controles del Feed</div>
              <p className="fm-card-description">Genera o actualiza manualmente el catálogo de productos</p>
            </div>
            <div className="fm-card-content">
              {estado.cargando && (
                <div className="fm-progress-wrap">
                  <div className="fm-progress-top">
                    <span>Generando feed...</span>
                    <span>{progreso}%</span>
                  </div>
                  <div className="fm-progress">
                    <div className="fm-progress-bar" style={{ width: `${progreso}%` }} />
                  </div>
                </div>
              )}

              <div className="fm-acciones-grid">
                <button
                  onClick={generarFeedManual}
                  disabled={estado.cargando}
                  className="fm-btn fm-btn-primario"
                >
                  <RefreshCw size={16} style={estado.cargando ? { animation: 'spin 1s linear infinite' } : {}} />
                  {estado.cargando ? 'Generando...' : 'Generar Feed'}
                </button>

                <button
                  onClick={descargarFeed}
                  disabled={!estado.feedGenerado || estado.cargando}
                  className="fm-btn fm-btn-outlined"
                >
                  <Download size={16} />
                  Descargar XML
                </button>
              </div>

              <button
                onClick={abrirFeed}
                disabled={!estado.feedGenerado}
                className="fm-btn fm-btn-outlined fm-btn-full"
              >
                <ExternalLink size={16} />
                Ver Feed en Navegador
              </button>

              {estadisticas.url && (
                <div className="fm-url-box">
                  <p className="fm-url-label">URL del Feed</p>
                  <p className="fm-url-text">{estadisticas.url}</p>
                </div>
              )}
            </div>
          </div>

          {/* CONFIGURACIÓN */}
          <div className="fm-card">
            <div className="fm-card-header">
              <div className="fm-card-title"><Info size={18} /> Configuración Actual</div>
              <p className="fm-card-description">Parámetros del servicio de sincronización con Meta</p>
            </div>
            <div className="fm-card-content">
              <div className="fm-config-lista">
                <div className="fm-config-item">
                  <span className="fm-config-label">Frecuencia de actualización</span>
                  <span className="fm-config-valor">Cada 1 hora</span>
                </div>
                <div className="fm-config-item">
                  <span className="fm-config-label">Horarios programados</span>
                  <span className="fm-config-valor">2AM · 8AM · 2PM · 8PM</span>
                </div>
                <div className="fm-config-item">
                  <span className="fm-config-label">Formato del feed</span>
                  <span className="fm-config-valor">XML / RSS 2.0</span>
                </div>
                <div className="fm-config-item">
                  <span className="fm-config-label">Moneda de productos</span>
                  <span className="fm-config-valor">COP</span>
                </div>
              </div>

              <div className="fm-alert">
                <Zap size={16} style={{ flexShrink: 0, marginTop: 2 }} />
                <p className="fm-alert-text">
                  El feed se actualiza automáticamente cuando detecta cambios en tus productos.
                  También puedes generarlo manualmente cuando lo necesites.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* PASOS PARA CONFIGURAR EN META */}
        {!estado.feedGenerado && <PasosConfiguracionMeta />}

        {/* LOGS DE ACTIVIDAD */}
        <LogsActividad logs={logs} />
      </div>
    </div>
  );
}
