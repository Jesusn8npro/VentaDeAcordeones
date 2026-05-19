'use client'

import React, { useRef } from 'react'
import Link from 'next/link'
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  LayoutGrid,
  Store,
  Phone,
  Users,
  Info,
  Briefcase
} from 'lucide-react'
import TarjetaProductoLujo from '../producto/TarjetaProductoLujo'

interface Categoria {
  id: string
  nombre: string
  slug: string
  cantidad: number
}

interface Props {
  departamentosAbierto: boolean
  setDepartamentosAbierto: (v: boolean) => void
  homeLayoutAbierto: boolean
  setHomeLayoutAbierto: (v: boolean) => void
  productAbierto: boolean
  setProductAbierto: (v: boolean) => void
  categorias: Categoria[]
  cargandoCategorias: boolean
  obtenerIconoCategoria: (c: Categoria) => React.ReactNode
  paginasMenu: any[]
  productosMenu: any[]
  manejarNavegacion: (ruta: string) => void
  hoverTimersRef: React.MutableRefObject<{ productos: any; departamentos: any; paginas: any }>
}

const nosotrosLinks = [
  { ruta: '/quienes-somos', titulo: 'Quiénes somos', Icono: Users },
  { ruta: '/sobre-la-tienda', titulo: 'Sobre la tienda', Icono: Info },
  { ruta: '/trabaja-con-nosotros', titulo: 'Trabaja con nosotros', Icono: Briefcase },
]

const normalizarProductoMenu = (p: any) => {
  let imagenPrincipal = null
  let imagenSecundaria = null
  const rel = p?.producto_imagenes
  if (rel) {
    if (Array.isArray(rel)) {
      imagenPrincipal = rel[0]?.imagen_principal || null
      imagenSecundaria = rel[0]?.imagen_secundaria_1 || null
    } else {
      imagenPrincipal = rel.imagen_principal || null
      imagenSecundaria = rel.imagen_secundaria_1 || null
    }
  }
  const fotos = Array.isArray(p?.fotos_principales) && p.fotos_principales.length > 0
    ? p.fotos_principales
    : [imagenPrincipal, imagenSecundaria].filter(Boolean)
  return { ...p, precio: typeof p?.precio === 'number' ? p.precio : 0, fotos_principales: fotos }
}

const NavDesktop = ({
  departamentosAbierto,
  setDepartamentosAbierto,
  homeLayoutAbierto,
  setHomeLayoutAbierto,
  productAbierto,
  setProductAbierto,
  categorias,
  cargandoCategorias,
  obtenerIconoCategoria,
  paginasMenu,
  productosMenu,
  manejarNavegacion,
  hoverTimersRef
}: Props) => {
  const sliderProductosRef = useRef(null)

  const desplazarSlider = (direccion: 'izq' | 'der') => {
    const cont = sliderProductosRef.current as HTMLElement | null
    if (!cont) return
    const paso = Math.min(360, cont.clientWidth * 0.4)
    cont.scrollBy({ left: direccion === 'izq' ? -paso : paso, behavior: 'smooth' })
  }

  return (
    <nav className="menu-navegacion">
      <div className="contenedor-menu">
        <div
          className="menu-departamentos"
          onMouseEnter={() => {
            clearTimeout(hoverTimersRef.current.departamentos)
            hoverTimersRef.current.departamentos = null
            setDepartamentosAbierto(true)
          }}
          onMouseLeave={() => {
            clearTimeout(hoverTimersRef.current.departamentos)
            hoverTimersRef.current.departamentos = setTimeout(() => setDepartamentosAbierto(false), 500)
          }}
        >
          <button
            className="boton-departamentos"
            aria-haspopup="true"
            aria-expanded={departamentosAbierto}
            onFocus={() => setDepartamentosAbierto(true)}
            onBlur={() => setDepartamentosAbierto(false)}
          >
            <LayoutGrid size={18} />
            <span>Comprar por categorías</span>
            <ChevronDown size={16} className={departamentosAbierto ? 'rotado' : ''} />
          </button>
          {departamentosAbierto && (
            <div className="dropdown-departamentos">
              {cargandoCategorias ? (
                <div className="dropdown-item">Cargando...</div>
              ) : (
                categorias.map(categoria => (
                  <Link
                    key={categoria.id}
                    href={`/tienda/categoria/${categoria.slug}`}
                    className="dropdown-item"
                    onClick={() => setDepartamentosAbierto(false)}
                  >
                    {obtenerIconoCategoria(categoria)}
                    <span>{categoria.nombre}</span>
                    <span className="cantidad-productos">{categoria.cantidad}</span>
                  </Link>
                ))
              )}
              <Link
                href="/tienda"
                className="dropdown-item ver-todas"
                onClick={() => setDepartamentosAbierto(false)}
              >
                <Store size={20} />
                <span>Ver todas las categorías</span>
              </Link>
            </div>
          )}
        </div>

        <div className="menu-principal">
          <div
            className="menu-item dropdown"
            onMouseEnter={() => {
              clearTimeout(hoverTimersRef.current.paginas)
              hoverTimersRef.current.paginas = null
              setHomeLayoutAbierto(true)
            }}
            onMouseLeave={() => {
              clearTimeout(hoverTimersRef.current.paginas)
              hoverTimersRef.current.paginas = setTimeout(() => setHomeLayoutAbierto(false), 500)
            }}
          >
            <button
              className="menu-enlace"
              aria-haspopup="true"
              aria-expanded={homeLayoutAbierto}
              onFocus={() => setHomeLayoutAbierto(true)}
              onBlur={() => setHomeLayoutAbierto(false)}
            >
              Nosotros
              <ChevronDown size={14} className={homeLayoutAbierto ? 'rotado' : ''} />
            </button>
            {homeLayoutAbierto && (
              <div className="dropdown-menu dropdown-nosotros">
                {nosotrosLinks.map(({ ruta, titulo, Icono }) => (
                  <Link
                    key={ruta}
                    href={ruta}
                    className="dropdown-item"
                    onClick={() => manejarNavegacion(ruta)}
                  >
                    <Icono size={18} />
                    <span>{titulo}</span>
                  </Link>
                ))}
              </div>
            )}
          </div>

          <div
            className="menu-item dropdown"
            onMouseEnter={() => {
              clearTimeout(hoverTimersRef.current.productos)
              hoverTimersRef.current.productos = null
              setProductAbierto(true)
            }}
            onMouseLeave={() => {
              clearTimeout(hoverTimersRef.current.productos)
              hoverTimersRef.current.productos = setTimeout(() => setProductAbierto(false), 500)
            }}
          >
            <button
              className="menu-enlace"
              aria-haspopup="true"
              aria-expanded={productAbierto}
              onFocus={() => setProductAbierto(true)}
              onBlur={() => setProductAbierto(false)}
            >
              Productos
              <ChevronDown size={14} className={productAbierto ? 'rotado' : ''} />
            </button>
            {productAbierto && (
              <div className="dropdown-menu dropdown-productos">
                {productosMenu.length > 0 ? (
                  <div className="productos-slider-wrapper">
                    <button className="slider-btn izquierda" aria-label="Anterior" onClick={() => desplazarSlider('izq')}>
                      <ChevronLeft size={18} />
                    </button>
                    <div className="productos-slider" ref={sliderProductosRef}>
                      {productosMenu.map((producto) => {
                        const p = normalizarProductoMenu(producto)
                        return (
                          <div key={producto.id} className="producto-slide" onClick={() => setProductAbierto(false)}>
                            <TarjetaProductoLujo producto={p} />
                          </div>
                        )
                      })}
                    </div>
                    <button className="slider-btn derecha" aria-label="Siguiente" onClick={() => desplazarSlider('der')}>
                      <ChevronRight size={18} />
                    </button>
                  </div>
                ) : (
                  <div className="dropdown-item">Cargando productos...</div>
                )}
                <div className="dropdown-divider"></div>
                <Link href="/tienda" className="dropdown-item ver-todos-productos" onClick={() => setProductAbierto(false)}>
                  Ver todos los productos
                </Link>
              </div>
            )}
          </div>

          <Link href="/blog" className="menu-enlace">Blog</Link>
          <Link href="/contacto" className="menu-enlace">Contacto</Link>
        </div>

        <div className="info-contacto">
          <a href="https://wa.me/573208492093" target="_blank" rel="noopener noreferrer" className="whatsapp-enlace">
            <Phone size={16} />
            <span>Línea Directa: +57 320 849 2093</span>
          </a>
        </div>
      </div>
    </nav>
  )
}

export default NavDesktop
