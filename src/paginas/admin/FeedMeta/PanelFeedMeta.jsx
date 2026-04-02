import React, { useState, useEffect } from 'react';
import './PanelFeedMeta.css'
const Card = ({ children, className = '' }) => (
  <div className={`bg-white rounded-lg shadow ${className}`}>{children}</div>
)
const CardHeader = ({ children, className = '' }) => (
  <div className={`border-b p-4 ${className}`}>{children}</div>
)
const CardTitle = ({ children, className = '' }) => (
  <h3 className={`text-lg font-semibold ${className}`}>{children}</h3>
)
const CardDescription = ({ children, className = '' }) => (
  <p className={`text-sm text-gray-600 ${className}`}>{children}</p>
)
const CardContent = ({ children, className = '' }) => (
  <div className={`p-4 ${className}`}>{children}</div>
)
const Badge = ({ children, variant = 'secondary', className = '' }) => {
  const base = 'inline-flex items-center rounded px-2 py-1 text-xs font-medium'
  const styles = variant === 'outline'
    ? 'border border-gray-300 text-gray-700'
    : 'bg-gray-100 text-gray-700'
  return <span className={`${base} ${styles} ${className}`}>{children}</span>
}
const Alert = ({ children, className = '' }) => (
  <div className={`flex items-start gap-3 p-3 border rounded-lg bg-gray-50 ${className}`}>{children}</div>
)
const AlertDescription = ({ children, className = '' }) => (
  <div className={`text-sm text-gray-700 ${className}`}>{children}</div>
)
import { 
  Play, 
  RefreshCw, 
  Download, 
  ExternalLink, 
  CheckCircle, 
  XCircle, 
  Clock,
  BarChart3,
  Settings,
  Info
} from 'lucide-react';

/**
 * PANEL DE ADMINISTRACIÓN DE FEED PARA META/FACEBOOK
 * Interfaz completa en español para gestionar el catálogo de productos
 */
export default function PanelFeedMeta() {
  const devHost = (typeof window !== 'undefined' && window.location.hostname === 'localhost')
  const API_BASE = (import.meta.env && import.meta.env.VITE_META_API_URL)
    || (devHost ? 'http://localhost:4173' : window.location.origin)
  const uniqueId = () => (typeof crypto !== 'undefined' && crypto.randomUUID)
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2,8)}`
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

  // Cargar estado inicial
  useEffect(() => {
    cargarEstadoServicio();
    // Actualizar cada 30 segundos
    const intervalo = setInterval(cargarEstadoServicio, 30000);
    return () => clearInterval(intervalo);
  }, []);

  /**
   * CARGAR ESTADO DEL SERVICIO
   */
  const cargarEstadoServicio = async () => {
    try {
      const response = await fetch(`${API_BASE}/api/meta/estado-servicio`);
      const ct = response.headers.get('content-type') || ''
      if (!ct.includes('application/json')) {
        const raw = await response.text()
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

  /**
   * GENERAR FEED MANUALMENTE
   */
  const generarFeedManual = async () => {
    setEstado(prev => ({ ...prev, cargando: true, error: null }));
    setProgreso(0);
    agregarLog('info', 'Iniciando generación manual de feed...');

    try {
      // Simular progreso
      const intervaloProgreso = setInterval(() => {
        setProgreso(prev => Math.min(prev + 10, 90));
      }, 200);

      const response = await fetch(`${API_BASE}/api/meta/actualizar-feed`, {
        method: 'POST'
      });
      const ct = response.headers.get('content-type') || ''
      if (!ct.includes('application/json')) {
        const raw = await response.text()
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
        
        // Recargar estadísticas
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

  /**
   * DESCARGAR FEED
   */
  const descargarFeed = async () => {
    if (!estadisticas.url) return;
    
    try {
      const response = await fetch(estadisticas.url);
      const xml = await response.text();
      
      // Crear blob y descargar
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

  /**
   * ABRIR FEED EN NUEVA PESTAÑA
   */
  const abrirFeed = () => {
    if (estadisticas.url) {
      window.open(estadisticas.url, '_blank');
    }
  };

  /**
   * AGREGAR LOG
   */
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

  /**
   * FORMATEAR FECHA
   */
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

  /**
   * FORMATEAR TAMAÑO
   */
  const formatearTamaño = (bytes) => {
    const val = Number(bytes)
    if (!val || Number.isNaN(val) || val <= 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.min(sizes.length - 1, Math.floor(Math.log(val) / Math.log(k)))
    return parseFloat((val / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  return (
    <div className="feed-meta">
      <div className="fm-contenido">
        <div className="fm-header">
          <div>
            <h1 className="fm-titulo">📦 Feed de Productos para Meta</h1>
            <p className="fm-subtitulo">Gestiona automáticamente tu catálogo de productos para Facebook Commerce</p>
          </div>
          <div>
            <span className="fm-badge">{estado.servicioActivo ? '✅ Servicio Activo' : '❌ Servicio Inactivo'}</span>
          </div>
        </div>

        {/* ESTADÍSTICAS */}
        <div className="fm-grid-estadisticas">
          <Card>
            <CardContent>
              <div className="fm-estadistica-item">
                <div>
                  <p className="fm-txt-pequeno">Total Productos</p>
                  <p className="fm-txt-grande">{estado.totalProductos}</p>
                </div>
                <BarChart3 size={32} color="#2563eb" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <div className="fm-estadistica-item">
                <div>
                  <p className="fm-txt-pequeno">Estado del Feed</p>
                  <p className="fm-txt-grande">{estado.feedGenerado ? '✅ Generado' : '⚠️ Pendiente'}</p>
                </div>
                {estado.feedGenerado ? <CheckCircle size={32} color="#16a34a" /> : <Clock size={32} color="#ca8a04" />}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <div className="fm-estadistica-item">
                <div>
                  <p className="fm-txt-pequeno">Última Actualización</p>
                  <p className="fm-txt-pequeno" style={{fontWeight:700}}>{formatearFecha(estado.ultimaActualizacion)}</p>
                </div>
                <RefreshCw size={32} color="#2563eb" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <div className="fm-estadistica-item">
                <div>
                  <p className="fm-txt-pequeno">Tamaño del Feed</p>
                  <p className="fm-txt-grande">{formatearTamaño(estadisticas.tamaño)}</p>
                </div>
                <Settings size={32} color="#7c3aed" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* ACCIONES PRINCIPALES */}
        <div className="fm-grid-acciones">
          {/* CONTROLES */}
          <Card>
            <CardHeader>
              <div className="fm-card-title"><Play size={18} /> Controles del Feed</div>
              <div className="fm-card-description">Gestiona la generación y actualización de tu feed de productos</div>
            </CardHeader>
            <CardContent>
              {/* Barra de progreso */}
              {estado.cargando && (
                <div>
                  <div className="fm-estadistica-item fm-txt-pequeno"><span>Generando feed...</span><span>{progreso}%</span></div>
                  <div className="fm-progress"><div className="fm-progress-bar" style={{ width: `${progreso}%` }} /></div>
                </div>
              )}

              {/* Botones de acción */}
              <div className="fm-acciones">
                <button 
                  onClick={generarFeedManual}
                  disabled={estado.cargando}
                  className={`fm-btn fm-btn-primario ${estado.cargando ? '' : ''}`}
                >
                  <RefreshCw className={`h-4 w-4 mr-2 ${estado.cargando ? 'animate-spin' : ''}`} />
                  {estado.cargando ? 'Generando...' : 'Generar Feed'}
                </button>

                <button 
                  onClick={descargarFeed}
                  disabled={!estado.feedGenerado || estado.cargando}
                  className={`fm-btn fm-btn-outlined`}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Descargar
                </button>
              </div>

              <button 
                onClick={abrirFeed}
                disabled={!estado.feedGenerado}
                className={`fm-btn fm-btn-outlined`}
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                Ver Feed en Navegador
              </button>

              {/* URL del feed */}
              {estadisticas.url && (
                <div className="fm-url-box">
                  <p className="fm-url-label">URL del Feed:</p>
                  <p className="fm-url-text">{estadisticas.url}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* INFORMACIÓN */}
          <Card>
            <CardHeader>
              <div className="fm-card-title"><Info size={18} /> Información de Configuración</div>
              <div className="fm-card-description">Configuración actual del servicio de feed</div>
            </CardHeader>
            <CardContent>
              <div style={{display:'grid',gap:'10px'}}>
                <div className="fm-estadistica-item"><span className="fm-txt-pequeno">Frecuencia de Actualización:</span><span className="fm-badge" style={{borderColor:'#e5e7eb', color:'#374151'}}>Cada 1 hora</span></div>
                <div className="fm-estadistica-item"><span className="fm-txt-pequeno">Horarios Programados:</span><span className="fm-badge" style={{borderColor:'#e5e7eb', color:'#374151'}}>2AM, 8AM, 2PM, 8PM</span></div>
                <div className="fm-estadistica-item"><span className="fm-txt-pequeno">Formato del Feed:</span><span className="fm-badge" style={{borderColor:'#e5e7eb', color:'#374151'}}>XML (RSS 2.0)</span></div>
                <div className="fm-estadistica-item"><span className="fm-txt-pequeno">Moneda:</span><span className="fm-badge" style={{borderColor:'#e5e7eb', color:'#374151'}}>COP</span></div>
              </div>

              <div className="fm-alert" style={{marginTop:'12px'}}>
                <Info size={16} />
                <div className="fm-alert-text">El feed se actualiza automáticamente cuando detecta cambios en tus productos. También puedes generarlo manualmente cuando lo necesites.</div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* PASOS PARA CONFIGURAR EN META */}
        {!estado.feedGenerado && (
        <Card>
          <CardHeader>
            <div className="fm-card-title">📋 Pasos para Configurar en Facebook Commerce Manager</div>
            <div className="fm-card-description">Sigue estos pasos para conectar tu feed con Meta/Facebook</div>
          </CardHeader>
          <CardContent>
            <div className="fm-pasos fm-pasos-container">
              <div className="fm-pasos-grid">
                <div className="fm-pasos-col">
                  <div className="fm-paso">
                    <div className="fm-paso-num">1</div>
                    <div>
                      <div className="fm-paso-titulo">Accede a Commerce Manager</div>
                      <div className="fm-paso-desc">Ve a business.facebook.com y selecciona tu catálogo</div>
                    </div>
                  </div>
                  <div className="fm-paso">
                    <div className="fm-paso-num">2</div>
                    <div>
                      <div className="fm-paso-titulo">Añade Productos</div>
                      <div className="fm-paso-desc">Haz clic en "Añadir productos" y selecciona "Lista de datos"</div>
                    </div>
                  </div>
                  <div className="fm-paso">
                    <div className="fm-paso-num">3</div>
                    <div>
                      <div className="fm-paso-titulo">Configura el Feed</div>
                      <div className="fm-paso-desc">Selecciona "Commerce Manager" como formato</div>
                    </div>
                  </div>
                </div>
                <div className="fm-pasos-col">
                  <div className="fm-paso">
                    <div className="fm-paso-num">4</div>
                    <div>
                      <div className="fm-paso-titulo">Usa URL del Feed</div>
                      <div className="fm-paso-desc">Pega la URL de tu feed y selecciona actualización automática</div>
                    </div>
                  </div>
                  <div className="fm-paso">
                    <div className="fm-paso-num">5</div>
                    <div>
                      <div className="fm-paso-titulo">Programa Actualizaciones</div>
                      <div className="fm-paso-desc">Configura actualización cada hora o diariamente</div>
                    </div>
                  </div>
                  <div className="fm-paso">
                    <div className="fm-paso-num" style={{background:'#16a34a'}}>✓</div>
                    <div>
                      <div className="fm-paso-titulo">¡Listo!</div>
                      <div className="fm-paso-desc">Tus productos aparecerán automáticamente en Facebook</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        )}

        {/* LOGS DE ACTIVIDAD */}
        <Card>
          <CardHeader>
            <div className="fm-card-title">📋 Registro de Actividad</div>
            <div className="fm-card-description">Últimas acciones realizadas en el servicio de feed</div>
          </CardHeader>
          <CardContent>
            <div className="fm-logs">
              {logs.length === 0 ? (
                <p className="fm-txt-pequeno" style={{textAlign:'center',padding:'16px'}}>No hay actividad reciente</p>
              ) : (
                logs.map((log) => (
                  <div
                    key={log.id}
                    className={`fm-log ${
                      log.tipo === 'exito' ? 'fm-log-exito' :
                      log.tipo === 'error' ? 'fm-log-error' :
                      'fm-log-info'
                    }`}
                  >
                    {log.tipo === 'exito' ? <CheckCircle size={16} /> : log.tipo === 'error' ? <XCircle size={16} /> : <Info size={16} />}
                    <div style={{flex:1}}>
                      <div className="fm-log-texto">{log.mensaje}</div>
                      <div className="fm-log-time">{log.timestamp}</div>
                    </div>
                    {log.count > 1 && <span className="fm-badge" style={{marginLeft:'8px'}}>x{log.count}</span>}
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}