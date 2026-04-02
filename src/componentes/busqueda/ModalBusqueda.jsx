import { useState, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { useNavigate } from 'react-router-dom'
import { X, Search, Package, ExternalLink, Clock, TrendingUp } from 'lucide-react'
import { clienteSupabase } from '../../configuracion/supabase'

export default function ModalBusqueda({ abierto, onCerrar }) {
  const [terminoBusqueda, setTerminoBusqueda] = useState('')
  const [productos, setProductos] = useState([])
  const [paginasSugeridas, setPaginasSugeridas] = useState([])
  const [cargando, setCargando] = useState(false)
  const [busquedaReciente, setBusquedaReciente] = useState([])
  const [mostrarSugerencias, setMostrarSugerencias] = useState(false)
  const navigate = useNavigate()
  const inputRef = useRef(null)
  const shadowRef = useRef(null)
  const hostElRef = useRef(null)
  const [mountNode, setMountNode] = useState(null)

  // Páginas disponibles en la aplicación
  const paginasDisponibles = [
    { nombre: 'Inicio', ruta: '/', descripcion: 'Página principal del sitio' },
    { nombre: 'Tienda', ruta: '/tienda', descripcion: 'Explora todos nuestros productos' },
    { nombre: 'Favoritos', ruta: '/favoritos', descripcion: 'Tus productos favoritos' },
    { nombre: 'Carrito', ruta: '/carrito', descripcion: 'Revisa tu carrito de compras' },
    { nombre: 'Contacto', ruta: '/contacto', descripcion: 'Contáctanos para cualquier consulta' },
    { nombre: 'Quiénes Somos', ruta: '/quienes-somos', descripcion: 'Conoce más sobre nuestra empresa' },
    { nombre: 'Ofertas', ruta: '/ofertas', descripcion: 'Productos en oferta' },
    { nombre: 'Electrónica', ruta: '/tienda/categoria/electronica', descripcion: 'Tecnología y electrónicos' },
    { nombre: 'Ropa', ruta: '/tienda/categoria/ropa', descripcion: 'Moda y vestimenta' },
    { nombre: 'Hogar', ruta: '/tienda/categoria/hogar', descripcion: 'Artículos para el hogar' },
    { nombre: 'Deportes', ruta: '/tienda/categoria/deportes', descripcion: 'Artículos deportivos' },
    { nombre: 'Blog', ruta: '/blog', descripcion: 'Artículos y noticias' },
    { nombre: 'Términos y Condiciones', ruta: '/terminos-condiciones', descripcion: 'Condiciones de uso' },
    { nombre: 'Política de Privacidad', ruta: '/politica-privacidad', descripcion: 'Protección de datos' },
    { nombre: 'Preguntas Frecuentes', ruta: '/preguntas-frecuentes', descripcion: 'Respuestas a preguntas comunes' },
    { nombre: 'Mi Cuenta', ruta: '/perfil', descripcion: 'Gestiona tu cuenta y pedidos' },
    { nombre: 'Ayuda', ruta: '/ayuda', descripcion: 'Centro de ayuda y soporte' }
  ]

  useEffect(() => {
    if (!abierto) return
    const host = document.createElement('div')
    host.setAttribute('id', 'search-shadow-host')
    document.body.appendChild(host)
    hostElRef.current = host
    const sr = host.attachShadow({ mode: 'open' })
    shadowRef.current = sr
    const mount = document.createElement('div')
    sr.appendChild(mount)
    const style = document.createElement('style')
    style.textContent = `
      :host{all:initial}
      .modal-busqueda-overlay{position:fixed;inset:0;background:rgba(0,0,0,.65);backdrop-filter:blur(6px);display:flex;align-items:center;justify-content:center;z-index:100003;padding:20px;overflow-x:hidden}
      .modal-busqueda-contenido{width:100%;max-width:720px;max-height:92vh;background:#fff;border-radius:22px;box-shadow:0 24px 60px rgba(0,0,0,.28);overflow-y:auto;overflow-x:hidden;position:relative;font-family:Inter,system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif}
      .modal-busqueda-header{display:flex;align-items:center;justify-content:space-between;padding:16px 20px 12px;border-bottom:1px solid #eef2f7}
      .modal-busqueda-header h2{margin:0;font-size:20px;font-weight:800;color:#1e293b}
      .modal-busqueda-cerrar{position:absolute;top:12px;right:12px;width:36px;height:36px;border-radius:50%;border:1px solid #e2e8f0;background:#f8fafc;color:#64748b;display:flex;align-items:center;justify-content:center;cursor:pointer}
      .modal-busqueda-form{padding:18px 20px 10px;display:grid;grid-template-columns:1fr max-content;gap:12px;align-items:center}
      .busqueda-input-contenedor{position:relative;min-width:0;z-index:0}
      .busqueda-icono{position:absolute;left:12px;top:50%;transform:translateY(-50%);color:#94a3b8}
      .modal-busqueda-input{width:100%;box-sizing:border-box;padding:12px 14px 12px 36px;border:1.5px solid #dbe2ea;border-radius:12px;background:#f8fafc;font-size:15px;color:#1e293b;position:relative;z-index:0}
      .modal-busqueda-input:focus{outline:none;border-color:#ff6b35;background:#fff;box-shadow:0 0 0 4px rgba(255,107,53,.12)}
      .busqueda-loading{position:absolute;right:12px;top:50%;transform:translateY(-50%);font-size:12px;color:#94a3b8}
      .buscar-boton{padding:12px 16px;border:none;border-radius:12px;background:linear-gradient(135deg,#ff6b35 0%,#ff8c42 100%);color:#fff;font-size:15px;font-weight:700;box-shadow:0 8px 20px rgba(255,107,53,.28);cursor:pointer;position:relative;z-index:1000;box-sizing:border-box}
      .buscar-boton:disabled{opacity:.6;cursor:not-allowed}
      .resultados-busqueda{padding:0 20px 20px}
      .seccion-resultados{margin-top:10px}
      .seccion-resultados h4{display:flex;align-items:center;gap:8px;margin:8px 0 10px;color:#334155;font-size:14px;font-weight:800}
      .lista-productos{display:flex;flex-direction:column;gap:10px}
      .item-producto{display:flex;align-items:center;gap:12px;width:100%;text-align:left;border:1px solid #e2e8f0;border-radius:12px;padding:10px;background:#fff;cursor:pointer}
      .item-producto:hover{border-color:#ff6b35;box-shadow:0 4px 14px rgba(255,107,53,.18)}
      .producto-imagen{width:48px;height:48px;border-radius:10px;overflow:hidden;background:#f1f5f9;display:flex;align-items:center;justify-content:center}
      .producto-imagen img{width:100%;height:100%;object-fit:cover}
      .producto-info{display:flex;flex-direction:column;gap:4px;flex:1}
      .producto-nombre{font-size:14px;font-weight:700;color:#1e293b}
      .producto-categoria{font-size:12px;color:#64748b}
      .producto-precio{font-size:13px;color:#0f172a;font-weight:700}
      .producto-icono{color:#94a3b8}
      .lista-paginas{display:flex;flex-direction:column;gap:10px}
      .item-pagina{display:flex;align-items:center;justify-content:space-between;width:100%;text-align:left;border:1px solid #e2e8f0;border-radius:12px;padding:10px;background:#fff;cursor:pointer}
      .item-pagina:hover{border-color:#ff6b35;box-shadow:0 4px 14px rgba(255,107,53,.18)}
      .pagina-info{display:flex;flex-direction:column;gap:4px}
      .pagina-nombre{font-size:14px;font-weight:700;color:#1e293b}
      .pagina-descripcion{font-size:12px;color:#64748b}
      .pagina-icono{color:#94a3b8}
      .busquedas-recientes{padding:0 20px 20px}
      .busquedas-recientes h4{display:flex;align-items:center;gap:8px;margin:8px 0 10px;color:#334155;font-size:14px;font-weight:800}
      .lista-recientes{display:flex;flex-wrap:wrap;gap:8px}
      .item-reciente{display:flex;align-items:center;gap:6px;border:1px solid #e2e8f0;border-radius:999px;padding:8px 12px;background:#fff;cursor:pointer;color:#0f172a}
      .item-reciente:hover{border-color:#ff6b35;background:#fff7f3}
      .sugerencias-populares{padding:0 20px 20px}
      .sugerencias-populares h4{display:flex;align-items:center;gap:8px;margin:8px 0 10px;color:#334155;font-size:14px;font-weight:800}
      .tags-populares{display:flex;flex-wrap:wrap;gap:8px}
      .tag-popular{border:1px solid #e2e8f0;border-radius:999px;padding:8px 12px;background:#f8fafc;cursor:pointer;color:#0f172a}
      .tag-popular:hover{border-color:#ff6b35;background:#fff7f3}
      .sin-resultados{padding:20px;display:flex;flex-direction:column;align-items:center;gap:8px;color:#64748b}
      @media(max-width:640px){.modal-busqueda-contenido{max-width:420px;border-radius:20px}}
      @media(max-width:480px){.modal-busqueda-contenido{max-width:360px}}
    `
    sr.appendChild(style)
    setMountNode(mount)
    const recientes = JSON.parse(localStorage.getItem('busquedas_recientes') || '[]')
    setBusquedaReciente(recientes.slice(0, 5))
    setTerminoBusqueda('')
    setProductos([])
    setPaginasSugeridas([])
    setMostrarSugerencias(false)
    setTimeout(() => { if (inputRef.current) inputRef.current.focus() }, 100)
    return () => {
      try { if (hostElRef.current) { document.body.removeChild(hostElRef.current) } } catch {}
      shadowRef.current = null
      hostElRef.current = null
      setMountNode(null)
    }
  }, [abierto])

  useEffect(() => { if (abierto && inputRef.current) setTimeout(() => inputRef.current?.focus(), 100) }, [abierto, mostrarSugerencias])
  useEffect(() => { document.body.style.overflow = abierto ? 'hidden' : ''; return () => { document.body.style.overflow = '' } }, [abierto])

  // Buscar productos en tiempo real
  useEffect(() => {
    if (terminoBusqueda.length >= 2) {
      buscarProductos()
      buscarPaginas()
      buscarCategorias()
      setMostrarSugerencias(true)
    } else {
      setProductos([])
      setPaginasSugeridas([])
      setMostrarSugerencias(false)
    }
  }, [terminoBusqueda])

  const buscarProductos = async () => {
    setCargando(true)
    try {
      const q = terminoBusqueda.trim()
      const like = `%${q}%`
      // Búsqueda principal en campos de texto
      const { data: productosTexto, error: errorTexto } = await clienteSupabase
        .from('productos')
        .select(`
          id, 
          nombre, 
          precio, 
          slug,
          descripcion,
          marca,
          modelo,
          palabras_clave,
          categorias(id,nombre,slug),
          producto_imagenes(imagen_principal, imagen_secundaria_1)
        `)
        .or(`nombre.ilike.${like},descripcion.ilike.${like},marca.ilike.${like},modelo.ilike.${like},slug.ilike.${like}`)
        .eq('activo', true)
        .gt('stock', 0)
        .limit(6)

      // Búsqueda en palabras clave usando contains
      const { data: productosPalabrasClave, error: errorPalabrasClave } = await clienteSupabase
        .from('productos')
        .select(`
          id, 
          nombre, 
          precio, 
          slug,
          descripcion,
          marca,
          modelo,
          palabras_clave,
          categorias(id,nombre,slug),
          producto_imagenes(imagen_principal, imagen_secundaria_1)
        `)
        .contains('palabras_clave', [q])
        .eq('activo', true)
        .gt('stock', 0)
        .limit(6)

      // Fallback: si palabras_clave es texto, usar ilike
      const { data: productosPalabrasClaveLike, error: errorPalabrasClaveLike } = await clienteSupabase
        .from('productos')
        .select(`
          id, 
          nombre, 
          precio, 
          slug,
          descripcion,
          marca,
          modelo,
          palabras_clave,
          categorias(id,nombre,slug),
          producto_imagenes(imagen_principal, imagen_secundaria_1)
        `)
        .ilike('palabras_clave', like)
        .eq('activo', true)
        .gt('stock', 0)
        .limit(6)

      // Fallback adicional: búsqueda directa por nombre
      const { data: productosNombre, error: errorNombre } = await clienteSupabase
        .from('productos')
        .select(`
          id,
          nombre,
          precio,
          slug,
          descripcion,
          marca,
          modelo,
          categorias(id,nombre,slug),
          producto_imagenes(imagen_principal, imagen_secundaria_1)
        `)
        .ilike('nombre', like)
        .eq('activo', true)
        .gt('stock', 0)
        .limit(6)

      if (errorTexto || errorPalabrasClave || errorPalabrasClaveLike || errorNombre) {
        console.error('Error buscando productos en Supabase', {
          termino: q,
          errorTexto,
          errorPalabrasClave,
          errorPalabrasClaveLike,
          errorNombre
        })
      }

      // Combinar resultados y eliminar duplicados
      const todosLosProductos = [...(productosTexto || []), ...(productosPalabrasClave || []), ...(productosPalabrasClaveLike || []), ...(productosNombre || [])]
      const productosUnicos = todosLosProductos.filter((producto, index, self) => 
        index === self.findIndex(p => p.id === producto.id)
      ).slice(0, 6)
      setProductos(productosUnicos)
    } catch (error) {
      console.error('Excepción en buscarProductos:', error)
    } finally {
      setCargando(false)
    }
  }

  const buscarPaginas = () => {
    const paginasFiltradas = paginasDisponibles.filter(pagina =>
      pagina.nombre.toLowerCase().includes(terminoBusqueda.toLowerCase()) ||
      pagina.descripcion.toLowerCase().includes(terminoBusqueda.toLowerCase())
    ).slice(0, 6)
    setPaginasSugeridas(paginasFiltradas)
  }

  const buscarCategorias = async () => {
    try {
      const q = terminoBusqueda.trim()
      const like = `%${q}%`
      const { data: cats, error } = await clienteSupabase
        .from('categorias')
        .select('id,nombre,slug')
        .or(`nombre.ilike.${like},slug.ilike.${like}`)
        .limit(6)
      if (error) return
      const sugerenciasCats = (cats || []).map(c => ({ nombre: c.nombre, ruta: `/tienda/categoria/${c.slug || c.id}`, descripcion: 'Categoría' }))
      setPaginasSugeridas(prev => {
        const combinadas = [...sugerenciasCats, ...prev]
        const vistas = []
        const unicas = combinadas.filter(p => {
          if (vistas.includes(p.ruta)) return false
          vistas.push(p.ruta)
          return true
        })
        return unicas.slice(0, 6)
      })
    } catch {}
  }

  const guardarBusquedaReciente = (termino) => {
    const recientes = JSON.parse(localStorage.getItem('busquedas_recientes') || '[]')
    const nuevasRecientes = [termino, ...recientes.filter(r => r !== termino)].slice(0, 10)
    localStorage.setItem('busquedas_recientes', JSON.stringify(nuevasRecientes))
  }

  const manejarBusqueda = (e) => {
    e.preventDefault()
    if (terminoBusqueda.trim()) {
      guardarBusquedaReciente(terminoBusqueda.trim())
      navigate(`/tienda/buscar?q=${encodeURIComponent(terminoBusqueda.trim())}`)
      onCerrar()
    }
  }

  const navegarAProducto = (producto) => {
    guardarBusquedaReciente(producto.nombre)
    navigate(`/producto/${producto.slug || producto.id}`)
    onCerrar()
  }

  const navegarAPagina = (ruta) => {
    navigate(ruta)
    onCerrar()
  }

  const usarBusquedaReciente = (termino) => {
    setTerminoBusqueda(termino)
  }

  const usarTagPopular = (tag) => {
    setTerminoBusqueda(tag)
    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.focus()
      }
    }, 100)
  }

  const cerrarPorOverlay = (e) => { if (e.target === e.currentTarget) onCerrar() }
  if (!abierto || !mountNode) return null

  return createPortal(
    <div className="modal-busqueda-overlay" onClick={cerrarPorOverlay} role="dialog" aria-modal="true">
      <div className="modal-busqueda-contenido" onClick={(e) => e.stopPropagation()}>
        <div className="modal-busqueda-header">
          <h2>Buscar Productos y Páginas</h2>
          <button onClick={onCerrar} className="modal-busqueda-cerrar">
            <X />
          </button>
        </div>

        <form onSubmit={manejarBusqueda} className="modal-busqueda-form">
          <div className="busqueda-input-contenedor">
            <Search className="busqueda-icono" size={18} />
            <input
              ref={inputRef}
              type="text"
              value={terminoBusqueda}
              onChange={(e) => setTerminoBusqueda(e.target.value)}
              placeholder="Busca productos, categorías o páginas..."
              className="modal-busqueda-input"
              autoComplete="off"
            />
            {cargando && <div className="busqueda-loading">Buscando...</div>}
          </div>
          <button type="submit" className="buscar-boton" disabled={!terminoBusqueda.trim()}>
            Buscar
          </button>
        </form>

        {/* Resultados de búsqueda */}
        {mostrarSugerencias && (productos.length > 0 || paginasSugeridas.length > 0) && (
          <div className="resultados-busqueda">
            {/* Productos encontrados */}
            {productos.length > 0 && (
              <div className="seccion-resultados">
                <h4><Package size={16} /> Productos ({productos.length})</h4>
                <div className="lista-productos">
                  {productos.map((producto) => (
                    <button
                      key={producto.id}
                      onClick={() => navegarAProducto(producto)}
                      className="item-producto"
                    >
                      <div className="producto-imagen">
                        {producto.producto_imagenes?.[0]?.imagen_principal ? (
                          <img src={producto.producto_imagenes[0].imagen_principal} alt={producto.nombre} />
                        ) : producto.producto_imagenes?.[0]?.imagen_secundaria_1 ? (
                          <img src={producto.producto_imagenes[0].imagen_secundaria_1} alt={producto.nombre} />
                        ) : (
                          <Package size={24} />
                        )}
                      </div>
                      <div className="producto-info">
                        <span className="producto-nombre">{producto.nombre}</span>
                        <span className="producto-categoria">{producto.categorias?.nombre || 'Sin categoría'}</span>
                        <span className="producto-precio">${producto.precio?.toLocaleString()}</span>
                      </div>
                      <ExternalLink size={16} className="producto-icono" />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Páginas sugeridas */}
            {paginasSugeridas.length > 0 && (
              <div className="seccion-resultados">
                <h4><ExternalLink size={16} /> Páginas ({paginasSugeridas.length})</h4>
                <div className="lista-paginas">
                  {paginasSugeridas.map((pagina, index) => (
                    <button
                      key={index}
                      onClick={() => navegarAPagina(pagina.ruta)}
                      className="item-pagina"
                    >
                      <div className="pagina-info">
                        <span className="pagina-nombre">{pagina.nombre}</span>
                        <span className="pagina-descripcion">{pagina.descripcion}</span>
                      </div>
                      <ExternalLink size={16} className="pagina-icono" />
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Búsquedas recientes */}
        {!mostrarSugerencias && busquedaReciente.length > 0 && (
          <div className="busquedas-recientes">
            <h4><Clock size={16} /> Búsquedas recientes</h4>
            <div className="lista-recientes">
              {busquedaReciente.map((termino, index) => (
                <button
                  key={index}
                  onClick={() => usarBusquedaReciente(termino)}
                  className="item-reciente"
                >
                  <Clock size={14} />
                  <span>{termino}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Tags populares */}
        {!mostrarSugerencias && (
          <div className="sugerencias-populares">
            <h4><TrendingUp size={16} /> Búsquedas populares</h4>
            <div className="tags-populares">
              {['iPhone', 'Samsung', 'Ropa', 'Zapatos', 'Electrónicos', 'Toyota', 'Tecnología', 'Hogar'].map((tag, index) => (
                <button
                  key={index}
                  onClick={() => usarTagPopular(tag)}
                  className="tag-popular"
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Mensaje cuando no hay resultados */}
        {mostrarSugerencias && productos.length === 0 && paginasSugeridas.length === 0 && !cargando && (
          <div className="sin-resultados">
            <Search size={48} />
            <h4>No se encontraron resultados</h4>
            <p>Intenta con otros términos de búsqueda</p>
          </div>
        )}
      </div>
    </div>,
    mountNode
  )
}