'use client'

import Link from 'next/link'
import Icono from '@/componentes/ui/Icono'
import { ENLACES_NAV, ENLACES_UTIL, mapearRuta } from './encabezadoDatos'

interface Props {
  menuAbierto: boolean
  setMenuAbierto: (v: boolean) => void
  usuario: unknown
  esAdmin: () => boolean
  cerrarSesion: () => void
  alternarTema: () => void
  tema: 'dark' | 'light'
  ejecutarBusqueda: () => void
}

export default function MenuMovil({
  menuAbierto,
  setMenuAbierto,
  usuario,
  esAdmin,
  cerrarSesion,
  alternarTema,
  tema,
  ejecutarBusqueda,
}: Props) {
  return (
    <>
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
