import React, { useCallback, useEffect, useRef, useState, useMemo } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useBarraLateral } from '../../../contextos/ContextoBarraLateral'
import {
  GridIcon,
  CalendarIcon,
  UserCircleIcon,
  ListIcon,
  TableIcon,
  PageIcon,
  PieChartIcon,
  BoxCubeIcon,
  PlugInIcon,
  ChevronDownIcon,
  HorizontalDotsIcon,
  ChatIcon
} from '../iconos/IconosAdmin'
import WidgetBarraLateral from './WidgetBarraLateral'
import './BarraLateralAdmin.css'

const elementosNavegacion = [
  {
    icono: <GridIcon />,
    nombre: 'Dashboard',
    subItems: [{ nombre: 'Ecommerce', ruta: '/admin', pro: false }],
  },
  {
    icono: <BoxCubeIcon />,
    nombre: 'Tienda',
    subItems: [
      { nombre: 'Productos', ruta: '/admin/productos', pro: false },
      { nombre: 'Gestión de Productos', ruta: '/admin/gestion-productos', pro: false },
      { nombre: 'Crear productos', ruta: '/admin/productos/creador-pr', pro: false },
      { nombre: 'Categorías', ruta: '/admin/categorias', pro: false },
      { nombre: 'Cupones de Descuento', ruta: '/admin/cupones', pro: false },
      { nombre: 'Pedidos', ruta: '/admin/pedidos', pro: false },
      { nombre: 'Inventario', ruta: '/admin/inventario', pro: false },
      { nombre: 'Feed Meta', ruta: '/admin/feed-meta', pro: false },
    ],
  },
  {
    icono: <CalendarIcon />,
    nombre: 'Calendario',
    subItems: [
      { nombre: 'Calendario de Tareas', ruta: '/admin/calendario-tareas', pro: false },
      { nombre: 'Tablero de Tareas', ruta: '/admin/tablero-tareas', pro: false },
    ],
  },
  {
    icono: <UserCircleIcon />,
    nombre: 'Usuarios',
    ruta: '/admin/usuarios',
  },
  {
    icono: <ChatIcon />,
    nombre: 'Manejo de Leads',
    ruta: '/admin/chats',
  },
  {
    icono: <BoxCubeIcon />,
    nombre: 'Imágenes',
    subItems: [
      { nombre: 'Imágenes IA', ruta: '/admin/imagenes-ia', pro: false },
      { nombre: 'Videos Productos', ruta: '/admin/videos', pro: false },
    ],
  },
  {
    nombre: 'Formularios',
    icono: <ListIcon />,
    subItems: [{ nombre: 'Elementos de Formulario', ruta: '/admin/elementos-formulario', pro: false }],
  },
  {
    // Eliminado menú Tablas según solicitud
  },
  {
    nombre: 'Blog',
    icono: <PageIcon />,
    subItems: [
      { nombre: 'Admin Blog', ruta: '/admin/blog', pro: false },
      { nombre: 'Creador de Artículos', ruta: '/admin/blog/crear', pro: false }
    ],
  },
]

const otrosElementos = [
  {
    icono: <PieChartIcon />,
    nombre: 'Gráficos',
    subItems: [
      { nombre: 'Gráfico de Líneas', ruta: '/admin/grafico-lineas', pro: false },
      { nombre: 'Gráfico de Barras', ruta: '/admin/grafico-barras', pro: false },
    ],
  },
]

const BarraLateralAdmin = () => {
  const { estaExpandida, movilAbierto, estaEnHover, setEstaEnHover, alternarSubmenu, submenuAbierto, setSubmenuAbierto } = useBarraLateral()
  const ubicacion = useLocation()

  const [alturaSubmenu, setAlturaSubmenu] = useState({})
  const refsSubmenu = useRef({})

  // Memoizar la función estaActivo para evitar re-renders innecesarios
  const estaActivo = useCallback(
    (ruta) => ubicacion.pathname === ruta,
    [ubicacion.pathname]
  )

  // Optimizar la detección de submenu activo con useMemo
  const submenuActivoDetectado = useMemo(() => {
    if (submenuAbierto !== null) return null

    const tipos = ['principal', 'otros']
    for (const tipoMenu of tipos) {
      const items = tipoMenu === 'principal' ? elementosNavegacion : otrosElementos
      for (let index = 0; index < items.length; index++) {
        const nav = items[index]
        if (nav.subItems) {
          for (const subItem of nav.subItems) {
            if (estaActivo(subItem.ruta)) {
              return { index, tipoMenu }
            }
          }
        }
      }
    }
    return null
  }, [ubicacion.pathname, estaActivo, submenuAbierto])

  // Efecto optimizado para abrir submenu solo cuando sea necesario
  useEffect(() => {
    if (submenuActivoDetectado && submenuAbierto === null) {
      alternarSubmenu(submenuActivoDetectado.index, submenuActivoDetectado.tipoMenu)
    }
  }, [submenuActivoDetectado, alternarSubmenu, submenuAbierto])

  // Efecto optimizado para calcular alturas de submenu
  useEffect(() => {
    if (submenuAbierto !== null) {
      const clave = `${submenuAbierto.tipo}-${submenuAbierto.index}`
      const elemento = refsSubmenu.current[clave]
      if (elemento) {
        // Usar requestAnimationFrame para optimizar el cálculo de altura
        requestAnimationFrame(() => {
          setAlturaSubmenu((prevAlturas) => ({
            ...prevAlturas,
            [clave]: elemento.scrollHeight || 0,
          }))
        })
      }
    }
  }, [submenuAbierto])

  const manejarAlternarSubmenu = useCallback((index, tipoMenu) => {
    alternarSubmenu(index, tipoMenu)
  }, [alternarSubmenu])

  // Memoizar la función de renderizado para evitar re-renders innecesarios
  const renderizarElementosMenu = useCallback((items, tipoMenu) => (
    <ul className="barra-lateral-menu-lista">
      {items
        .filter((nav) => nav && (nav.nombre || nav.ruta || nav.subItems))
        .map((nav, index) => (
        <li key={`${tipoMenu}-${index}-${nav.nombre || nav.ruta || 'item'}`}>
          {nav.subItems ? (
            <button
              onClick={() => manejarAlternarSubmenu(index, tipoMenu)}
              className={`barra-lateral-menu-item ${
                submenuAbierto && submenuAbierto.tipo === tipoMenu && submenuAbierto.index === index
                  ? 'barra-lateral-menu-item-activo'
                  : 'barra-lateral-menu-item-inactivo'
              } ${
                !estaExpandida && !estaEnHover
                  ? 'barra-lateral-menu-item-centrado'
                  : ''
              }`}
              data-tooltip={nav.nombre}
            >
              <span
                className={`barra-lateral-menu-icono ${
                  submenuAbierto && submenuAbierto.tipo === tipoMenu && submenuAbierto.index === index
                    ? 'barra-lateral-menu-icono-activo'
                    : 'barra-lateral-menu-icono-inactivo'
                }`}
              >
                {nav.icono}
              </span>
              {(estaExpandida || estaEnHover || movilAbierto) && (
                <span className="barra-lateral-menu-texto">{nav.nombre}</span>
              )}
              {(estaExpandida || estaEnHover || movilAbierto) && (
                <ChevronDownIcon
                  className={`barra-lateral-menu-flecha ${
                    submenuAbierto && submenuAbierto.tipo === tipoMenu && submenuAbierto.index === index
                      ? 'barra-lateral-chevron-rotado'
                      : ''
                  }`}
                />
              )}
            </button>
          ) : (
            nav.ruta && (
              <Link
                to={nav.ruta}
                className={`barra-lateral-menu-item ${
                  estaActivo(nav.ruta) ? 'barra-lateral-menu-item-activo' : 'barra-lateral-menu-item-inactivo'
                }`}
                data-tooltip={nav.nombre}
              >
                <span
                  className={`barra-lateral-menu-icono ${
                    estaActivo(nav.ruta)
                      ? 'barra-lateral-menu-icono-activo'
                      : 'barra-lateral-menu-icono-inactivo'
                  }`}
                >
                  {nav.icono}
                </span>
                {(estaExpandida || estaEnHover || movilAbierto) && (
                  <span className="barra-lateral-menu-texto">{nav.nombre}</span>
                )}
              </Link>
            )
          )}
          {nav.subItems && (estaExpandida || estaEnHover || movilAbierto) && (
            <div
              ref={(el) => {
                refsSubmenu.current[`${tipoMenu}-${index}`] = el
              }}
              className="barra-lateral-submenu-contenedor"
              style={{
                height:
                  submenuAbierto && submenuAbierto.tipo === tipoMenu && submenuAbierto.index === index
                    ? `${alturaSubmenu[`${tipoMenu}-${index}`] || 0}px`
                    : '0px',
              }}
            >
              <ul className="barra-lateral-submenu-lista">
                {nav.subItems.map((subItem) => (
                  <li key={subItem.nombre}>
                    <Link
                      to={subItem.ruta}
                      className={`barra-lateral-submenu-item ${
                        estaActivo(subItem.ruta)
                          ? 'barra-lateral-submenu-item-activo'
                          : 'barra-lateral-submenu-item-inactivo'
                      }`}
                    >
                      {subItem.nombre}
                      <span className="barra-lateral-submenu-insignias">
                        {subItem.new && (
                          <span
                            className={`barra-lateral-submenu-insignia ${
                              estaActivo(subItem.ruta)
                                ? 'barra-lateral-submenu-insignia-activa'
                                : 'barra-lateral-submenu-insignia-inactiva'
                            }`}
                          >
                            NEW
                          </span>
                        )}
                        {subItem.pro && (
                          <span
                            className={`barra-lateral-submenu-insignia ${
                              estaActivo(subItem.ruta)
                                ? 'barra-lateral-submenu-insignia-activa'
                                : 'barra-lateral-submenu-insignia-inactiva'
                            }`}
                          >
                            PRO
                          </span>
                        )}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </li>
      ))}
    </ul>
  ), [estaExpandida, estaEnHover, movilAbierto, submenuAbierto, estaActivo, manejarAlternarSubmenu, alturaSubmenu])

  // Memoizar el componente completo para evitar re-renders innecesarios
  return useMemo(() => (
    <aside
      className={`barra-lateral-admin ${
        estaExpandida || movilAbierto
          ? 'barra-lateral-expandida'
          : estaEnHover
          ? 'barra-lateral-hover'
          : 'barra-lateral-colapsada'
      } ${movilAbierto ? 'barra-lateral-movil-abierta' : 'barra-lateral-movil-cerrada'}`}
      onMouseEnter={() => !estaExpandida && setEstaEnHover(true)}
      onMouseLeave={() => setEstaEnHover(false)}
    >
      <div
        className={`barra-lateral-logo-contenedor ${
          !estaExpandida && !estaEnHover ? 'barra-lateral-logo-colapsado' : 'barra-lateral-logo-expandido'
        }`}
      >
        <Link to="/admin">
          {estaExpandida || estaEnHover || movilAbierto ? (
            <img src="/MeLlevoEsto.Com Logo.png" alt="ME LLEVO ESTO" className="barra-lateral-logo-img" onError={(e) => { e.currentTarget.src = '/images/Logo oficial me llevo esto.jpg' }} />
          ) : (
            <div className="barra-lateral-logo-icono">
              <span>🛍️</span>
            </div>
          )}
        </Link>
      </div>
      
      <div className="barra-lateral-contenido">
        <nav className="barra-lateral-nav">
          <div className="barra-lateral-nav-secciones">
            <div>
              <h3
                className={`barra-lateral-seccion-titulo ${
                  !estaExpandida && !estaEnHover ? 'barra-lateral-seccion-titulo-oculto' : ''
                }`}
              >
                MENÚ
              </h3>
              {renderizarElementosMenu(elementosNavegacion, 'principal')}
            </div>

            <div>
              <h3
                className={`barra-lateral-seccion-titulo ${
                  !estaExpandida && !estaEnHover ? 'barra-lateral-seccion-titulo-oculto' : ''
                }`}
              >
                OTROS
              </h3>
              {renderizarElementosMenu(otrosElementos, 'otros')}
            </div>
          </div>
        </nav>
        
        {/* Widget del sidebar */}
        {(estaExpandida || estaEnHover || movilAbierto) && (
          <div className="barra-lateral-widget-contenedor">
            <WidgetBarraLateral />
          </div>
        )}
      </div>
    </aside>
  ), [estaExpandida, movilAbierto, estaEnHover, setEstaEnHover, renderizarElementosMenu])
}

export default BarraLateralAdmin
