import React, { useMemo, useState, useEffect, useRef } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../../contextos/ContextoAutenticacion'
import {
  User, MapPin, CreditCard, Lock, Bell, ListOrdered, Home, ShieldCheck, Settings, Heart, ChevronLeft, ChevronRight
} from 'lucide-react'
import './PaginaPerfil.css'
import { usePaginaPerfil, extraerNombreReal } from './usePaginaPerfil'
import TabResumen from './TabResumen'
import TabMisPedidos from './TabMisPedidos'
import TabDatosPersonales from './TabDatosPersonales'
import TabDireccionEnvio from './TabDireccionEnvio'
import TabSeguridad from './TabSeguridad'
import TabNotificaciones from './TabNotificaciones'
import TabMetodosPago from './TabMetodosPago'

const RUTA_A_TAB: Record<string, string> = {
  '': 'resumen', 'resumen': 'resumen', 'pedidos': 'pedidos',
  'direcciones': 'direcciones', 'metodos-pago': 'pago',
  'datos': 'datos', 'seguridad': 'seguridad', 'notificaciones': 'notificaciones'
}

const TAB_A_RUTA: Record<string, string> = {
  'resumen': '', 'pedidos': 'pedidos', 'direcciones': 'direcciones',
  'pago': 'metodos-pago', 'datos': 'datos', 'seguridad': 'seguridad', 'notificaciones': 'notificaciones'
}

const MENU_ITEMS = [
  { id: 'resumen', label: 'Mi cuenta', icon: Home, path: '/perfil' },
  { id: 'pedidos', label: 'Mis pedidos', icon: ListOrdered, path: '/perfil/pedidos' },
  { id: 'favoritos', label: 'Lista de deseos', icon: Heart, path: '/favoritos', externo: true },
  { id: 'direcciones', label: 'Libreta de direcciones', icon: MapPin, path: '/perfil/direcciones' },
  { id: 'datos', label: 'Información de cuenta', icon: User, path: '/perfil/datos' },
  { id: 'pago', label: 'Métodos de pago', icon: CreditCard, path: '/perfil/metodos-pago' },
  { id: 'seguridad', label: 'Seguridad', icon: Lock, path: '/perfil/seguridad' },
  { id: 'notificaciones', label: 'Suscripciones y newsletters', icon: Bell, path: '/perfil/notificaciones' }
]

export default function PaginaPerfil() {
  const { usuario } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const alias = useMemo(() => {
    if (!usuario) return 'Invitado'
    const nombre = extraerNombreReal(usuario.nombre) ||
      usuario.email?.split('@')[0] ||
      usuario.user_metadata?.nombre ||
      'Usuario'
    return nombre.split(' ')[0]
  }, [usuario])

  const [tab, setTab] = useState('resumen')

  useEffect(() => {
    const segmento = location.pathname.split('/')[2] || ''
    setTab(RUTA_A_TAB[segmento] || 'resumen')
  }, [location.pathname])

  const perfil = usePaginaPerfil()

  // Navegación móvil
  const touchStartXRef = useRef<number | null>(null)
  const mobileNavListRef = useRef<HTMLDivElement>(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(false)

  const activeIndex = useMemo(() => MENU_ITEMS.findIndex(mi => mi.id === tab), [tab])

  const navegarPorIndice = (idx: number) => {
    const item = MENU_ITEMS[idx]
    if (!item) return
    if (item.externo) navigate(item.path)
    else navigate(`/perfil/${TAB_A_RUTA[item.id]}`)
  }

  const onMobileNavTouchStart = (e: React.TouchEvent) => {
    if (e.touches?.length) touchStartXRef.current = e.touches[0].clientX
  }

  const onMobileNavTouchEnd = (e: React.TouchEvent) => {
    if (!e.changedTouches?.length) return
    const dx = e.changedTouches[0].clientX - (touchStartXRef.current ?? 0)
    if (Math.abs(dx) > 50) {
      if (dx < 0 && activeIndex < MENU_ITEMS.length - 1) navegarPorIndice(activeIndex + 1)
      else if (dx > 0 && activeIndex > 0) navegarPorIndice(activeIndex - 1)
    }
  }

  const updateScrollArrows = () => {
    const el = mobileNavListRef.current
    if (!el) return
    const maxScroll = el.scrollWidth - el.clientWidth
    setCanScrollLeft(el.scrollLeft > 4)
    setCanScrollRight(el.scrollLeft < maxScroll - 4)
  }

  useEffect(() => {
    const el = mobileNavListRef.current
    if (!el) return
    updateScrollArrows()
    el.addEventListener('scroll', updateScrollArrows, { passive: true })
    window.addEventListener('resize', updateScrollArrows)
    return () => {
      el.removeEventListener('scroll', updateScrollArrows)
      window.removeEventListener('resize', updateScrollArrows)
    }
  }, [])

  useEffect(() => {
    const container = mobileNavListRef.current
    if (!container) return
    const el = container.querySelector<HTMLElement>(`button[data-id="${tab}"]`)
    if (el) {
      const target = el.offsetLeft - (container.clientWidth / 2 - el.clientWidth / 2)
      container.scrollTo({ left: target, behavior: 'smooth' })
    }
    updateScrollArrows()
  }, [tab])

  const scrollStep = (dir: number) => {
    const el = mobileNavListRef.current
    if (!el) return
    el.scrollBy({ left: Math.max(220, Math.floor(el.clientWidth * 0.8)) * dir, behavior: 'smooth' })
  }

  const irATab = (item: typeof MENU_ITEMS[0]) => {
    if (item.externo) navigate(item.path)
    else navigate(`/perfil/${TAB_A_RUTA[item.id]}`)
  }

  return (
    <div className="perfil-page">
      <div className="perfil-hero">
        <div className="perfil-hero-content">
          <div className="perfil-hero-textos">
            <h1 className="perfil-titulo">Mi cuenta</h1>
            <p className="perfil-subtitulo">Bienvenido, {alias}</p>
          </div>
          <div className="perfil-hero-badges">
            <div className="perfil-badge"><ShieldCheck size={16} /><span>Cuenta verificada</span></div>
            <div className="perfil-badge"><Settings size={16} /><span>Configura tu experiencia</span></div>
          </div>
        </div>
      </div>

      <div className="perfil-mobile-nav" onTouchStart={onMobileNavTouchStart} onTouchEnd={onMobileNavTouchEnd}>
        <div className={`mobile-nav-edge left ${canScrollLeft ? 'visible' : ''}`} />
        <button className={`mobile-nav-arrow left ${canScrollLeft ? 'visible' : ''}`} aria-label="Anterior" onClick={() => scrollStep(-1)}>
          <ChevronLeft size={18} />
        </button>
        <div className="perfil-mobile-nav-list" role="tablist" aria-label="Opciones de cuenta" ref={mobileNavListRef} onScroll={updateScrollArrows}>
          {MENU_ITEMS.map(({ id, label }) => (
            <button
              key={id} role="tab" aria-selected={tab === id}
              className={`perfil-mobile-nav-item ${tab === id ? 'activo' : ''}`}
              data-id={id}
              onClick={() => irATab(MENU_ITEMS.find(mi => mi.id === id)!)}
            >
              {label}
            </button>
          ))}
        </div>
        <div className={`mobile-nav-edge right ${canScrollRight ? 'visible' : ''}`} />
        <button className={`mobile-nav-arrow right ${canScrollRight ? 'visible' : ''}`} aria-label="Siguiente" onClick={() => scrollStep(1)}>
          <ChevronRight size={18} />
        </button>
      </div>

      <div className="perfil-layout">
        <aside className="perfil-sidebar">
          <nav className="perfil-menu">
            {MENU_ITEMS.map((item) => (
              <button
                key={item.id}
                className={`perfil-menu-item ${tab === item.id ? 'activo' : ''}`}
                onClick={() => irATab(item)}
              >
                <item.icon size={18} />
                <span>{item.label}</span>
              </button>
            ))}
          </nav>
        </aside>

        <div className="perfil-contenido" onTouchStart={onMobileNavTouchStart} onTouchEnd={onMobileNavTouchEnd}>
          {tab === 'resumen' && (
            <TabResumen
              pedidos={perfil.pedidosUsuario}
              cargando={perfil.cargandoPedidosUsuario}
              error={perfil.errorPedidos}
              formatearFecha={perfil.formatearFechaPedido}
            />
          )}

          {tab === 'pedidos' && (
            <TabMisPedidos
              pedidos={perfil.pedidosUsuario}
              cargando={perfil.cargandoPedidosUsuario}
              error={perfil.errorPedidos}
              formatearFecha={perfil.formatearFechaPedido}
            />
          )}

          {tab === 'direcciones' && (
            <TabDireccionEnvio
              direccion={perfil.direccionEnvio}
              onChange={(campo, valor) => perfil.setDireccionEnvio(v => ({ ...v, [campo]: valor }))}
              onGuardar={perfil.guardarDireccionEnvio}
              guardando={perfil.guardandoDireccion}
              cargando={perfil.cargandoPerfil}
              mensaje={perfil.mensajeDirecciones}
            />
          )}

          {tab === 'pago' && <TabMetodosPago alias={alias} />}

          {tab === 'datos' && (
            <TabDatosPersonales
              formUsuario={perfil.formUsuario}
              onChange={(campo, valor) => perfil.setFormUsuario(v => ({ ...v, [campo]: valor }))}
              onGuardar={perfil.guardarCambiosPerfil}
              guardando={perfil.guardandoPerfil}
              cargando={perfil.cargandoPerfil}
              mensaje={perfil.mensajeGuardado}
            />
          )}

          {tab === 'seguridad' && (
            <TabSeguridad
              contrasenaActual={perfil.contrasenaActual}
              nuevaContrasena={perfil.nuevaContrasena}
              confirmarContrasena={perfil.confirmarContrasena}
              onContrasenaActualChange={perfil.setContrasenaActual}
              onNuevaContrasenaChange={perfil.setNuevaContrasena}
              onConfirmarContrasenaChange={perfil.setConfirmarContrasena}
              onActualizar={perfil.actualizarContrasena}
              guardando={perfil.guardandoSeguridad}
              mensaje={perfil.mensajeSeguridad}
              emailVerificado={perfil.emailVerificado}
              enviandoVerificacion={perfil.enviandoVerificacion}
              cooldownVerificacion={perfil.cooldownVerificacion}
              mensajeVerificacion={perfil.mensajeVerificacion}
              onReenviarVerificacion={perfil.reenviarVerificacionEmail}
              enviandoRecuperacion={perfil.enviandoRecuperacion}
              mensajeRecuperacion={perfil.mensajeRecuperacion}
              onEnviarRecuperacion={perfil.enviarRecuperacionContrasena}
            />
          )}

          {tab === 'notificaciones' && (
            <TabNotificaciones
              preferencias={perfil.preferencias}
              onChange={(campo, valor) => perfil.setPreferencias(v => ({ ...v, [campo]: valor }))}
            />
          )}

          {perfil.waModalOpen && (
            <div className="wa-modal-overlay" role="dialog" aria-label="Redirección a WhatsApp">
              <div className="wa-modal">
                <h4>Te acompañamos por WhatsApp</h4>
                <p>En breve abriremos nuestro chat para finalizar tu compra o aclarar dudas.</p>
                <div className="wa-acciones">
                  <button className="btn-primary" onClick={() => { window.location.href = perfil.construirUrlWhatsapp() }}>
                    Abrir WhatsApp ahora
                  </button>
                  <button className="btn-secundario" onClick={() => perfil.setWaModalOpen(false)}>
                    Cancelar
                  </button>
                </div>
                <small>Se abrirá automáticamente en {perfil.waCountdown}s</small>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
