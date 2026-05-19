'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { useCarrito } from '@/contextos/CarritoContext'
import { useAuth } from '@/contextos/ContextoAutenticacion'
import { useFavoritos } from '@/contextos/FavoritosContext'
import Icono from '@/componentes/ui/Icono'
import './Encabezado.css'

/* ── Datos de navegación ─────────────────────────── */

const ENLACES_NAV = [
  { id: 'acordeones',      etiqueta: 'Acordeones',     insignia: 'PRINCIPAL' },
  { id: 'personalizados',  etiqueta: 'Personalizados', insignia: 'HOT' },
  { id: 'accesorios',      etiqueta: 'Accesorios',     insignia: null },
  { id: 'repuestos',       etiqueta: 'Repuestos',       insignia: null },
  { id: 'taller',          etiqueta: 'Taller',          insignia: null },
  { id: 'otros',           etiqueta: 'Otros',            insignia: null },
  { id: 'cursos',          etiqueta: 'Cursos',           insignia: 'NEW' },
]

const CATEGORIAS_DD = [
  { id: 'todos',           etiqueta: 'Todas las categorías', conteo: '500+', grupo: 'todos' },
  { id: 'acordeones',      etiqueta: 'Acordeones Nuevos',     conteo: '34',   grupo: 'acc' },
  { id: 'personalizados',  etiqueta: 'Personalizados',        conteo: '12',   grupo: 'acc' },
  { id: 'parrillas',       etiqueta: 'Parrillas',             conteo: '24',   grupo: 'accesorio' },
  { id: 'correas',         etiqueta: 'Correas',               conteo: '38',   grupo: 'accesorio' },
  { id: 'fuelles',         etiqueta: 'Fuelles',               conteo: '12',   grupo: 'accesorio' },
  { id: 'estuches',        etiqueta: 'Estuches',              conteo: '18',   grupo: 'accesorio' },
  { id: 'broches',         etiqueta: 'Broches',               conteo: '15',   grupo: 'accesorio' },
  { id: 'lenguetas',       etiqueta: 'Lengüetas',             conteo: '48',   grupo: 'tecnico' },
  { id: 'resortes',        etiqueta: 'Resortes',              conteo: '32',   grupo: 'tecnico' },
  { id: 'celuloide',       etiqueta: 'Celuloide',             conteo: '22',   grupo: 'tecnico' },
  { id: 'herramientas',    etiqueta: 'Herramientas',          conteo: '28',   grupo: 'tecnico' },
  { id: 'pianos',          etiqueta: 'Pianos y Teclados',     conteo: '32',   grupo: 'otros' },
  { id: 'guitarras',       etiqueta: 'Guitarras',             conteo: '48',   grupo: 'otros' },
  { id: 'bajos',           etiqueta: 'Bajos Eléctricos',      conteo: '24',   grupo: 'otros' },
  { id: 'baterias',        etiqueta: 'Baterías',              conteo: '18',   grupo: 'otros' },
  { id: 'electronica',     etiqueta: 'Sonido y Electrónica',  conteo: '120+', grupo: 'otros' },
  { id: 'cursos',          etiqueta: 'Cursos Online',         conteo: '12',   grupo: 'extra' },
]

const TENDENCIAS_BUSQUEDA = [
  { texto: 'Hohner Rey Vallenato',     meta: '2.3k búsquedas', ruta: '/tienda' },
  { texto: 'Acordeón nácar personalizado', meta: 'En tendencia', ruta: '/acordeones-personalizados' },
  { texto: 'Guitarra eléctrica',       meta: 'Más vendido',    ruta: '/tienda' },
  { texto: 'Correa de cuero vallenato', meta: 'Recomendado',   ruta: '/tienda' },
  { texto: 'Estuche rígido acordeón',  meta: 'Disponible',     ruta: '/tienda' },
]

const ENLACES_UTIL = [
  { id: 'mayoristas', etiqueta: 'Mayoristas',     ruta: '/contacto' },
  { id: 'sobre',      etiqueta: 'Sobre Nosotros', ruta: '/quienes-somos' },
  { id: 'soporte',    etiqueta: 'Soporte 24/7',   ruta: '/preguntas-frecuentes' },
  { id: 'promos',     etiqueta: 'Promociones',    ruta: '/tienda' },
]

/* Mapea IDs de categoría a rutas reales de Next.js */
function mapearRuta(id: string): string {
  const mapa: Record<string, string> = {
    acordeones:     '/tienda',
    personalizados: '/acordeones-personalizados',
    accesorios:     '/tienda',
    repuestos:      '/tienda',
    taller:         '/quienes-somos',
    otros:          '/tienda',
    cursos:         '/tienda',
    todos:          '/tienda',
    parrillas:      '/tienda',
    correas:        '/tienda',
    fuelles:        '/tienda',
    estuches:       '/tienda',
    broches:        '/tienda',
    lenguetas:      '/tienda',
    resortes:       '/tienda',
    celuloide:      '/tienda',
    herramientas:   '/tienda',
    pianos:         '/tienda',
    guitarras:      '/tienda',
    bajos:          '/tienda',
    baterias:       '/tienda',
    electronica:    '/tienda',
  }
  return mapa[id] ?? '/tienda'
}

/* ── Componente principal ───────────────────────── */

export default function Encabezado() {
  const router = useRouter()
  const ruta = usePathname()

  const { totalItems } = useCarrito()
  const { usuario, cerrarSesion, esAdmin } = useAuth()
  const { contadorFavoritos } = useFavoritos()

  const [desplazado, setDesplazado] = useState(false)
  const [ddAbierto, setDdAbierto] = useState(false)
  const [busquedaFoco, setBusquedaFoco] = useState(false)
  const [valorBusqueda, setValorBusqueda] = useState('')
  const [catSeleccionada, setCatSeleccionada] = useState('todos')
  const [menuAbierto, setMenuAbierto] = useState(false)
  const [busquedaMovilAbierta, setBusquedaMovilAbierta] = useState(false)
  const [tema, setTema] = useState<'dark' | 'light'>('dark')

  const refDD = useRef<HTMLDivElement>(null)
  const refBusqueda = useRef<HTMLDivElement>(null)
  const refProgreso = useRef<HTMLDivElement>(null)
  const rafRef = useRef<number | null>(null)

  const cantidadCarrito = totalItems || 0
  const cantidadFavoritos = contadorFavoritos || 0

  /* Scroll detector + progress bar
     — rAF throttle: máximo un update por frame de pintura
     — histéresis: activa enc--desplazado a 60px, desactiva a 20px (evita flapping en iOS)
     — progreso: actualización directa al DOM, sin re-render de React */
  useEffect(() => {
    const alDesplazar = () => {
      if (rafRef.current !== null) return
      rafRef.current = requestAnimationFrame(() => {
        rafRef.current = null
        const sy = window.scrollY
        setDesplazado(v => (sy > 60 ? true : sy < 20 ? false : v))
        if (refProgreso.current) {
          const total = document.documentElement.scrollHeight - window.innerHeight
          refProgreso.current.style.width = total > 0
            ? `${Math.min(100, (sy / total) * 100)}%`
            : '0%'
        }
      })
    }
    window.addEventListener('scroll', alDesplazar, { passive: true })
    alDesplazar()
    return () => {
      window.removeEventListener('scroll', alDesplazar)
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current)
    }
  }, [])

  /* Click fuera de dropdowns */
  useEffect(() => {
    const alClick = (e: MouseEvent) => {
      if (refDD.current && !refDD.current.contains(e.target as Node)) setDdAbierto(false)
      if (refBusqueda.current && !refBusqueda.current.contains(e.target as Node)) setBusquedaFoco(false)
    }
    document.addEventListener('mousedown', alClick)
    return () => document.removeEventListener('mousedown', alClick)
  }, [])

  /* Bloquear scroll cuando el menú móvil está abierto */
  useEffect(() => {
    document.body.style.overflow = menuAbierto ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [menuAbierto])

  /* Cerrar menú móvil al cambiar de ruta */
  useEffect(() => { setMenuAbierto(false) }, [ruta])

  /* Tema: leer de localStorage y aplicar data-theme */
  useEffect(() => {
    try {
      const guardado = (localStorage.getItem('vda-tema') as 'dark' | 'light') || 'dark'
      setTema(guardado)
      document.documentElement.setAttribute('data-theme', guardado)
    } catch { /* sin acceso a localStorage */ }
  }, [])

  const alternarTema = useCallback(() => {
    const nuevo = tema === 'dark' ? 'light' : 'dark'
    setTema(nuevo)
    document.documentElement.setAttribute('data-theme', nuevo)
    try { localStorage.setItem('vda-tema', nuevo) } catch { /* */ }
  }, [tema])

  /* Navegar y cerrar menú */
  const ir = useCallback((destino: string) => {
    router.push(destino)
    setMenuAbierto(false)
    setDdAbierto(false)
    setBusquedaMovilAbierta(false)
  }, [router])

  /* Buscar */
  const ejecutarBusqueda = useCallback(() => {
    if (!valorBusqueda.trim()) return
    ir(`/buscar?q=${encodeURIComponent(valorBusqueda.trim())}`)
    setBusquedaFoco(false)
  }, [valorBusqueda, ir])

  const alPresionarTecla = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') ejecutarBusqueda()
  }

  const etiquetaCatSeleccionada =
    CATEGORIAS_DD.find((c) => c.id === catSeleccionada)?.etiqueta.replace('Todas las categorías', 'Todas') ?? 'Todas'

  return (
    <>
      <header className={`enc${desplazado ? ' enc--desplazado' : ''}`}>
        <div className="enc-progreso" ref={refProgreso} />

        {/* ── Barra utilidad (top) ── */}
        <div className="enc-util">
          <div className="enc-util-interior">
            <Link href="/tienda" className="enc-util-izq">
              <span className="enc-util-icono"><Icono nombre="telefono" tamaño={12} /></span>
              <span className="enc-util-pulso">Envío gratis en compras +$2.000.000</span>
            </Link>
            {/* Nav completa — visible en desktop */}
            <nav className="enc-util-der">
              {ENLACES_UTIL.map((l) => (
                <Link key={l.id} href={l.ruta}>{l.etiqueta}</Link>
              ))}
              <button className="enc-tema" onClick={alternarTema} aria-label="Cambiar tema">
                <Icono nombre={tema === 'dark' ? 'sol' : 'luna'} tamaño={14} />
              </button>
              {usuario ? (
                <>
                  {esAdmin() && (
                    <Link href="/admin" className="enc-util-auth">Admin</Link>
                  )}
                  <button className="enc-util-auth enc-util-auth--primario" onClick={cerrarSesion}>
                    Salir
                  </button>
                </>
              ) : (
                <>
                  <Link href="/registro" className="enc-util-auth">Crear Cuenta</Link>
                  <Link href="/login" className="enc-util-auth enc-util-auth--primario">Ingresar</Link>
                </>
              )}
            </nav>

            {/* Nav compacta — visible en tablet/móvil (solo tema + ingresar) */}
            <nav className="enc-util-der enc-util-compact">
              <button className="enc-tema" onClick={alternarTema} aria-label="Cambiar tema">
                <Icono nombre={tema === 'dark' ? 'sol' : 'luna'} tamaño={14} />
              </button>
              {usuario ? (
                <button className="enc-util-auth enc-util-auth--primario" onClick={cerrarSesion}>
                  Salir
                </button>
              ) : (
                <Link href="/login" className="enc-util-auth enc-util-auth--primario">Ingresar</Link>
              )}
            </nav>
          </div>
        </div>

        {/* ── Barra principal ── */}
        <div className="enc-barra">
          <button
            className="enc-burger"
            onClick={() => setMenuAbierto(true)}
            aria-label="Abrir menú"
          >
            <Icono nombre="menu" tamaño={18} />
          </button>

          <Link href="/" className="enc-logo" aria-label="Inicio">
            <div className="enc-logo-marca"><span>V</span></div>
            <div className="enc-logo-texto">
              VENTA<span className="enc-logo-punto">·</span>ACORDEONES
              <small>VENTADEACORDEONES.COM</small>
            </div>
            <span className="enc-logo-abrev">VDA</span>
          </Link>

          {/* Buscador con dropdown de categoría */}
          <div
            ref={refBusqueda}
            className={`enc-busqueda-wrap${busquedaFoco && !valorBusqueda ? ' enc-busqueda-wrap--sugerencias' : ''}${busquedaMovilAbierta ? ' enc-busqueda-wrap--expandido' : ''}`}
          >
            <div className={`enc-busqueda${busquedaFoco ? ' enc-busqueda--foco' : ''}`}>
              {/* Dropdown categoría */}
              <div ref={refDD} className={`enc-cat-dd${ddAbierto ? ' enc-cat-dd--abierto' : ''}`}>
                <button className="enc-cat-dd-btn" onClick={() => setDdAbierto((v) => !v)}>
                  <span>{etiquetaCatSeleccionada}</span>
                  <span className="enc-cat-dd-chev"><Icono nombre="chevron-abajo" tamaño={14} /></span>
                </button>
                <div className="enc-cat-dd-panel" role="menu">
                  <div className="enc-cat-dd-grupo">— Acordeones (especialidad)</div>
                  {CATEGORIAS_DD.filter((c) => c.grupo === 'acc' || c.grupo === 'todos').map((c) => (
                    <button
                      key={c.id}
                      className={catSeleccionada === c.id ? 'enc-cat-dd-item--sel' : ''}
                      onClick={() => { setCatSeleccionada(c.id); setDdAbierto(false); ir(mapearRuta(c.id)) }}
                    >
                      <span>{c.etiqueta}</span>
                      <span className="enc-cat-dd-conteo">{c.conteo}</span>
                    </button>
                  ))}
                  <div className="enc-cat-dd-grupo">— Accesorios</div>
                  {CATEGORIAS_DD.filter((c) => c.grupo === 'accesorio').map((c) => (
                    <button
                      key={c.id}
                      className={catSeleccionada === c.id ? 'enc-cat-dd-item--sel' : ''}
                      onClick={() => { setCatSeleccionada(c.id); setDdAbierto(false); ir(mapearRuta(c.id)) }}
                    >
                      <span>{c.etiqueta}</span>
                      <span className="enc-cat-dd-conteo">{c.conteo}</span>
                    </button>
                  ))}
                  <div className="enc-cat-dd-grupo">— Repuestos Técnicos</div>
                  {CATEGORIAS_DD.filter((c) => c.grupo === 'tecnico').map((c) => (
                    <button
                      key={c.id}
                      className={catSeleccionada === c.id ? 'enc-cat-dd-item--sel' : ''}
                      onClick={() => { setCatSeleccionada(c.id); setDdAbierto(false); ir(mapearRuta(c.id)) }}
                    >
                      <span>{c.etiqueta}</span>
                      <span className="enc-cat-dd-conteo">{c.conteo}</span>
                    </button>
                  ))}
                  <div className="enc-cat-dd-grupo">— Otros instrumentos</div>
                  {CATEGORIAS_DD.filter((c) => c.grupo === 'otros').map((c) => (
                    <button
                      key={c.id}
                      className={catSeleccionada === c.id ? 'enc-cat-dd-item--sel' : ''}
                      onClick={() => { setCatSeleccionada(c.id); setDdAbierto(false); ir(mapearRuta(c.id)) }}
                    >
                      <span>{c.etiqueta}</span>
                      <span className="enc-cat-dd-conteo">{c.conteo}</span>
                    </button>
                  ))}
                  <div className="enc-cat-dd-grupo">— Aprende</div>
                  {CATEGORIAS_DD.filter((c) => c.grupo === 'extra').map((c) => (
                    <button
                      key={c.id}
                      className={catSeleccionada === c.id ? 'enc-cat-dd-item--sel' : ''}
                      onClick={() => { setCatSeleccionada(c.id); setDdAbierto(false); ir(mapearRuta(c.id)) }}
                    >
                      <span>{c.etiqueta}</span>
                      <span className="enc-cat-dd-conteo">{c.conteo}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Campo de búsqueda */}
              <div className="enc-campo-busqueda">
                <Icono nombre="buscar" tamaño={16} />
                <input
                  type="text"
                  placeholder="Buscar acordeón, marca, accesorio o referencia…"
                  value={valorBusqueda}
                  onChange={(e) => setValorBusqueda(e.target.value)}
                  onFocus={() => setBusquedaFoco(true)}
                  onKeyDown={alPresionarTecla}
                  aria-label="Buscar productos"
                />
                <span className="enc-kbd">⌘ K</span>
                <button className="enc-btn-buscar" onClick={ejecutarBusqueda}>
                  <span>Buscar</span>
                  <Icono nombre="flecha" tamaño={12} />
                </button>
              </div>
            </div>

            {/* Panel de tendencias */}
            <div className="enc-sugerencias">
              <h5>Tendencias hoy</h5>
              {TENDENCIAS_BUSQUEDA.map((t) => (
                <div
                  key={t.texto}
                  className="enc-sugerencia-fila"
                  onClick={() => { setValorBusqueda(t.texto); setBusquedaFoco(false); ir(t.ruta) }}
                >
                  <Icono nombre="buscar" tamaño={14} />
                  <span>{t.texto}</span>
                  <span className="enc-sugerencia-meta">{t.meta}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Botón buscar en móvil */}
          <button
            className="enc-buscar-movil"
            onClick={() => setBusquedaMovilAbierta((v) => !v)}
            aria-label="Buscar"
          >
            <Icono nombre="buscar" tamaño={18} />
          </button>

          {/* Acciones */}
          <div className="enc-acciones">
            {usuario ? (
              <Link href="/perfil" className="enc-icono-btn" aria-label="Mi cuenta">
                <Icono nombre="usuario" tamaño={18} />
              </Link>
            ) : (
              <Link href="/login" className="enc-icono-btn" aria-label="Iniciar sesión">
                <Icono nombre="usuario" tamaño={18} />
              </Link>
            )}
            <Link href="/favoritos" className="enc-icono-btn" aria-label="Favoritos">
              <Icono nombre="corazon" tamaño={18} />
              {cantidadFavoritos > 0 && (
                <span className="enc-contador">{cantidadFavoritos}</span>
              )}
            </Link>
            <Link href="/carrito" className="enc-icono-btn" aria-label="Carrito">
              <Icono nombre="carrito" tamaño={18} />
              {cantidadCarrito > 0 && (
                <span className="enc-contador">{cantidadCarrito}</span>
              )}
            </Link>
          </div>
        </div>

        {/* ── Subnavegación con categorías ── */}
        <div className="enc-subnav">
          <div className="enc-subnav-interior">
            <ul className="enc-nav-menu">
              {ENLACES_NAV.map((l) => (
                <li key={l.id}>
                  <Link
                    href={mapearRuta(l.id)}
                    className={ruta === mapearRuta(l.id) ? 'enc-nav-activo' : ''}
                  >
                    {l.etiqueta}
                    {l.insignia && <span className="enc-insignia">{l.insignia}</span>}
                  </Link>
                </li>
              ))}
            </ul>
            <div className="enc-subnav-cola">
              <span>Flash Sale Hoy · 30% OFF</span>
              <span className="enc-subnav-sep" />
              <Link href="/tienda">
                <Icono nombre="rayo" tamaño={12} /> Ver oferta
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* ── Menú móvil ── */}
      <div
        className={`enc-menu-overlay${menuAbierto ? ' enc-menu-overlay--abierto' : ''}`}
        onClick={() => setMenuAbierto(false)}
      />
      <aside className={`enc-menu-movil${menuAbierto ? ' enc-menu-movil--abierto' : ''}`} aria-hidden={!menuAbierto}>
        <div className="enc-menu-cabeza">
          <Link href="/" className="enc-logo" onClick={() => setMenuAbierto(false)}>
            <div className="enc-logo-marca"><span>V</span></div>
            <div className="enc-logo-texto enc-logo-texto--corto" style={{ display: 'block' }}>VENTA<small>ACORDEONES</small></div>
          </Link>
          <button className="enc-icono-btn" onClick={() => setMenuAbierto(false)} aria-label="Cerrar menú">
            <Icono nombre="cerrar" tamaño={16} />
          </button>
        </div>

        <div className="enc-menu-buscador">
          <div className="enc-busqueda">
            <div className="enc-campo-busqueda">
              <Icono nombre="buscar" tamaño={16} />
              <input
                type="text"
                placeholder="Buscar…"
                onKeyDown={(e) => { if (e.key === 'Enter') { ejecutarBusqueda(); setMenuAbierto(false) } }}
              />
            </div>
          </div>
        </div>

        <div className="enc-menu-seccion">
          <h4>Catálogo</h4>
          {ENLACES_NAV.map((l) => (
            <Link key={l.id} href={mapearRuta(l.id)} onClick={() => setMenuAbierto(false)}>
              <span>{l.etiqueta}{l.insignia && <span className="enc-insignia" style={{ marginLeft: 8 }}>{l.insignia}</span>}</span>
              <span className="enc-menu-arr"><Icono nombre="flecha" tamaño={14} /></span>
            </Link>
          ))}
        </div>

        <div className="enc-menu-seccion">
          <h4>Empresa</h4>
          {ENLACES_UTIL.map((l) => (
            <Link key={l.id} href={l.ruta} onClick={() => setMenuAbierto(false)}>
              <span>{l.etiqueta}</span>
              <span className="enc-menu-arr"><Icono nombre="flecha" tamaño={14} /></span>
            </Link>
          ))}
          <Link href="/contacto" onClick={() => setMenuAbierto(false)}>
            <span>Contacto</span>
            <span className="enc-menu-arr"><Icono nombre="flecha" tamaño={14} /></span>
          </Link>
        </div>

        <div className="enc-menu-seccion">
          <h4>Cuenta</h4>
          {usuario ? (
            <>
              <Link href="/perfil" onClick={() => setMenuAbierto(false)}>
                <span>Mi perfil</span>
                <span className="enc-menu-arr"><Icono nombre="flecha" tamaño={14} /></span>
              </Link>
              <Link href="/favoritos" onClick={() => setMenuAbierto(false)}>
                <span>Favoritos</span>
                <span className="enc-menu-arr"><Icono nombre="flecha" tamaño={14} /></span>
              </Link>
              {esAdmin() && (
                <Link href="/admin" onClick={() => setMenuAbierto(false)}>
                  <span>Panel Admin</span>
                  <span className="enc-menu-arr"><Icono nombre="flecha" tamaño={14} /></span>
                </Link>
              )}
              <button onClick={() => { cerrarSesion(); setMenuAbierto(false) }}>
                <span>Cerrar sesión</span>
                <span className="enc-menu-arr"><Icono nombre="flecha" tamaño={14} /></span>
              </button>
            </>
          ) : (
            <>
              <Link href="/registro" onClick={() => setMenuAbierto(false)}>
                <span>Crear Cuenta</span>
                <span className="enc-menu-arr"><Icono nombre="flecha" tamaño={14} /></span>
              </Link>
              <Link href="/login" onClick={() => setMenuAbierto(false)}>
                <span>Ingresar</span>
                <span className="enc-menu-arr"><Icono nombre="flecha" tamaño={14} /></span>
              </Link>
            </>
          )}
          <button onClick={alternarTema}>
            <span>Tema: {tema === 'dark' ? 'Oscuro' : 'Claro'}</span>
            <span className="enc-menu-arr"><Icono nombre={tema === 'dark' ? 'sol' : 'luna'} tamaño={14} /></span>
          </button>
        </div>

        <div className="enc-menu-pie">
          <Link href="/tienda" className="vda-btn vda-btn-primario enc-menu-btn" onClick={() => setMenuAbierto(false)}>
            Ver Catálogo
            <span className="vda-flecha"><Icono nombre="flecha" tamaño={14} /></span>
          </Link>
          <a
            href="https://wa.me/573208492093"
            target="_blank"
            rel="noopener noreferrer"
            className="vda-btn vda-btn-fantasma enc-menu-btn"
          >
            <Icono nombre="whatsapp" tamaño={14} /> WhatsApp
          </a>
        </div>
      </aside>
    </>
  )
}
