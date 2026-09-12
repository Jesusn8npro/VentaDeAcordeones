'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useCarrito } from '@/contextos/CarritoContext'
import { useFavoritos } from '@/contextos/FavoritosContext'
import { useAuth } from '@/contextos/ContextoAutenticacion'
import { CATS } from './encabezadoDatos'
import { I } from '../navIconos'
import './Encabezado.css'

function Badge({ kind }: { kind: string | null }) {
  if (!kind) return null
  const tone = ({ HOT: 'bg-gold text-black', NEW: 'bg-white text-black dark:bg-gold dark:text-black', SEO: 'bg-transparent text-gold border border-gold/70' } as Record<string,string>)[kind] ?? 'bg-gold text-black'
  return <span className={`cond ${tone} text-[10px] leading-none font-bold tracking-[0.12em] px-1.5 py-[3px] rounded-sm ml-1.5 align-middle`}>{kind}</span>
}

function Logo({ light }: { light: boolean }) {
  return (
    <Link href="/" className="flex items-center gap-2 shrink-0 group" aria-label="Inicio">
      <span className="relative flex h-9 w-9 items-center justify-center rounded-md bg-gold text-black shadow-[0_8px_24px_-12px_rgba(255,195,0,.8)] transition-transform group-hover:scale-[1.03]">
        <I.Accordion className="h-5 w-5" />
        <span className="absolute -bottom-0.5 -right-0.5 h-2 w-2 rounded-full bg-white border-2 border-black/80" />
      </span>
      <span className="flex flex-col leading-none">
        <span className={`cond text-[9px] tracking-[0.28em] font-semibold ${light ? 'text-ink-400' : 'text-gold/80'}`}>VENTA DE</span>
        <span className={`cond text-[17px] font-extrabold tracking-[0.04em] whitespace-nowrap ${light ? 'text-ink-900' : 'text-white'}`}>
          ACORDEONES<span className="text-gold">.</span>
        </span>
      </span>
    </Link>
  )
}

interface Props {
  open: boolean
  onClose: () => void
  light: boolean
  onOpenCart?: () => void
  onOpenFavoritos?: () => void
  onOpenNotif?: () => void
}

export default function MenuMovil({ open, onClose, light, onOpenCart, onOpenFavoritos, onOpenNotif }: Props) {
  const { totalItems } = useCarrito()
  const { contadorFavoritos } = useFavoritos()
  const { usuario, esAdmin } = useAuth()
  const isAdmin = esAdmin?.() ?? false
  const primerNombre = usuario?.nombre?.split(' ')[0]?.toUpperCase() ?? ''
  const [exiting, setExiting] = useState(false)
  const [openId, setOpenId] = useState<string | null>(null)

  useEffect(() => {
    if (open) { setExiting(false); document.body.style.overflow = 'hidden' }
    else document.body.style.overflow = ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  const handleClose = () => {
    setExiting(true)
    setTimeout(() => { onClose(); setExiting(false) }, 260)
  }

  if (!open && !exiting) return null

  const t = light ? {
    shell: 'bg-white text-ink-900', line: 'border-ink-100',
    closeBtn: 'border-ink-200 text-ink-700 hover:border-gold hover:text-gold',
    iconBox: 'bg-ink-50 border-ink-100', title: 'text-ink-900',
    chipBorder: 'border-ink-200 text-ink-700', sectionTitle: 'text-ink-400',
    hover: 'hover:bg-ink-50',
  } : {
    shell: 'bg-black text-white', line: 'border-white/[.06]',
    closeBtn: 'border-white/15 text-white hover:border-gold hover:text-gold',
    iconBox: 'bg-white/[.05] border-white/10', title: 'text-white',
    chipBorder: 'border-white/15 text-white/75', sectionTitle: 'text-gold/70',
    hover: 'hover:bg-white/[.03]',
  }

  return (
    <div className="fixed inset-0 z-[60] lg:hidden">
      <div className={`absolute inset-0 bg-black/60 backdrop-blur-sm ${exiting ? 'fade-out' : 'fade-in'}`} onClick={handleClose} />
      <aside
        className={`relative h-full w-full sm:max-w-[440px] ${t.shell} flex flex-col ${exiting ? 'drawer-out' : 'drawer-in'}`}
        role="dialog" aria-modal="true" aria-label="Menú principal"
      >
        {/* Header */}
        <div className={`px-5 pt-5 pb-3 flex items-center justify-between border-b ${t.line}`}>
          <Logo light={light} />
          <button onClick={handleClose} className={`h-11 w-11 rounded-full border flex items-center justify-center transition-all active:scale-95 ${t.closeBtn}`} aria-label="Cerrar menú">
            <I.Close className="h-5 w-5" />
          </button>
        </div>

        {/* Search */}
        <div className={`px-5 py-4 border-b ${t.line}`}>
          <Link
            href="/tienda"
            onClick={handleClose}
            className={`w-full search-shell flex items-stretch h-12 rounded-md overflow-hidden border transition-colors ${
              light ? 'bg-ink-50 border-ink-200 hover:border-gold/50' : 'bg-ink-800 border-white/10 hover:border-gold/50'
            }`}
          >
            <div className="flex-1 relative flex items-center">
              <I.Search className={`h-4 w-4 absolute left-3 ${light ? 'text-ink-400' : 'text-white/50'}`} />
              <span className={`pl-10 pr-2 text-[14px] ${light ? 'text-ink-400' : 'text-white/45'}`}>Busca acordeones, repuestos…</span>
            </div>
            <span className="cond px-5 bg-gold text-black font-bold tracking-[0.16em] text-[12px] flex items-center">BUSCAR</span>
          </Link>
          <div className="mt-3 flex flex-wrap gap-2">
            {[
              { tag:'Rey Vallenato', href:'/tienda/categoria/acordeones-rey-vallenato' },
              { tag:'Sol Do Fa',     href:'/tienda?q=GCF' },
              { tag:'Fuelles',       href:'/accesorios/fuelles-de-acordeon' },
              { tag:'Estuches',      href:'/accesorios/estuches-de-acordeon' },
              { tag:'Taller',        href:'/taller' },
            ].map(({ tag, href }) => (
              <Link key={tag} href={href} onClick={handleClose} className={`cond text-[11px] tracking-[0.16em] font-semibold px-2.5 py-1 rounded-full border transition-colors hover:border-gold hover:text-gold ${t.chipBorder}`}>{tag.toUpperCase()}</Link>
            ))}
          </div>
        </div>

        {/* Categories */}
        <nav className="flex-1 overflow-y-auto px-2 py-2">
          <ul>
            {CATS.map((c) => {
              const Icon = I[c.icon]
              const isOpen = openId === c.id
              return (
                <li key={c.id} className={`border-b ${t.line}`}>
                  <div className={`flex items-stretch transition-colors ${t.hover}`}>
                    <Link href={c.href} onClick={handleClose} className="flex-1 min-w-0 flex items-center gap-3 py-4 pl-3 pr-1 text-left">
                      <span className={`h-10 w-10 rounded-md border flex items-center justify-center shrink-0 ${t.iconBox}`}>
                        <Icon className="h-5 w-5 text-gold" />
                      </span>
                      <span className={`cond text-[16px] font-bold tracking-[0.1em] flex-1 flex items-center ${t.title}`}>
                        {c.label.toUpperCase()} <Badge kind={c.badge} />
                      </span>
                    </Link>
                    <button
                      onClick={() => setOpenId(isOpen ? null : c.id)}
                      className="w-14 shrink-0 flex items-center justify-center"
                      aria-expanded={isOpen}
                      aria-label={`${isOpen ? 'Cerrar' : 'Abrir'} ${c.label}`}
                    >
                      <I.Chevron className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180 text-gold' : (light ? 'text-ink-400' : 'text-white/50')}`} />
                    </button>
                  </div>
                  <div className={`acc-grid ${isOpen ? 'open' : ''}`}>
                    <div>
                      <div className="pb-4 pl-16 pr-4 grid gap-y-3">
                        {c.mega.columns.flatMap((col, ci) => [
                          <div key={`t-${ci}`} className={`cond text-[10px] tracking-[0.22em] font-bold mt-2 first:mt-0 ${t.sectionTitle}`}>
                            {col.title.toUpperCase()}
                          </div>,
                          ...col.items.map((it) => (
                            <Link key={`${ci}-${it.label}`} href={it.href} onClick={handleClose} className={`text-[14px] transition-colors ${light ? 'text-ink-700 hover:text-gold' : 'text-white/80 hover:text-gold'}`}>
                              {it.label}
                            </Link>
                          )),
                        ])}
                        <Link href={c.mega.ctaHref} onClick={handleClose} className="cond mt-3 inline-flex items-center justify-center gap-2 bg-gold text-black font-bold tracking-[0.18em] text-[12px] py-2.5 rounded-sm hover:bg-gold-300 transition-colors">
                          {c.mega.ctaLabel.toUpperCase()} <I.ArrowRight className="h-3.5 w-3.5" />
                        </Link>
                      </div>
                    </div>
                  </div>
                </li>
              )
            })}
          </ul>

          {/* Mismo cambio que en BarraCategorias: no hay "flash sale". Enlaza al filtro real
              ?oferta=1 y muestra el mayor descuento vigente del catálogo (hoy -18%). */}
          <Link href="/tienda?oferta=1" onClick={handleClose} className="mt-4 mx-2 flex items-center justify-between gap-3 p-4 rounded-md border border-gold/50 bg-gold/[.08] flash-pulse">
            <span className="flex items-center gap-2">
              <I.Bolt className="h-5 w-5 text-gold flash-text" />
              <span className="cond text-[13px] font-bold tracking-[0.14em] text-gold flash-text">OFERTAS · HASTA -18%</span>
            </span>
            <span className="cond text-[11px] font-bold tracking-[0.18em] bg-gold text-black px-3 py-1.5 rounded-sm">VER OFERTAS</span>
          </Link>
        </nav>

        {/* Bottom bar */}
        <div className={`px-2 py-3 border-t ${t.line} grid grid-cols-4 gap-1`}>
          {[
            {
              icon: isAdmin ? 'Shield' : 'User',
              up: usuario ? `HOLA, ${primerNombre}` : 'HOLA,',
              down: isAdmin ? 'ADMIN' : (usuario ? 'PERFIL' : 'CUENTA'),
              href: isAdmin ? '/admin' : '/perfil',
              count: null, action: null, adminHighlight: isAdmin
            },
            { icon: 'Heart', up: 'FAVORITOS', down: contadorFavoritos > 0 ? `${contadorFavoritos}` : 'GUARDADOS', href: null, count: contadorFavoritos, action: 'favoritos', adminHighlight: false },
            { icon: 'Bell',  up: 'AVISOS',    down: 'NUEVOS',   href: null, count: null, action: 'notif', adminHighlight: false },
            { icon: 'Cart',  up: 'CARRITO',   down: totalItems > 0 ? `${totalItems}` : 'TOTAL', href: null, count: totalItems, action: 'cart', adminHighlight: false },
          ].map((b, i) => (
            <button
              key={i}
              onClick={() => {
                if (b.action === 'cart')           { handleClose(); setTimeout(() => onOpenCart?.(), 280) }
                else if (b.action === 'favoritos') { handleClose(); setTimeout(() => onOpenFavoritos?.(), 280) }
                else if (b.action === 'notif')     { handleClose(); setTimeout(() => onOpenNotif?.(), 280) }
                else if (b.href) { handleClose(); window.location.href = b.href }
              }}
              className={`flex flex-col items-center gap-1 py-2.5 rounded-md transition-colors relative ${t.hover}`}
            >
              <span className="relative">
                {(() => { const Icon = I[b.icon]; return <Icon className={`h-5 w-5 ${b.adminHighlight ? 'text-gold' : (light ? 'text-ink-800' : 'text-white')}`} /> })()}
                {b.count != null && b.count > 0 && (
                  <span className="badge-pop absolute -top-1.5 -right-2 min-w-[16px] h-[16px] px-1 rounded-full bg-gold text-black text-[9px] font-bold flex items-center justify-center tabular-nums">
                    {b.count > 99 ? '99+' : b.count}
                  </span>
                )}
              </span>
              <span className={`cond text-[9px] tracking-[0.14em] ${b.adminHighlight ? 'text-gold/80' : (light ? 'text-ink-500' : 'text-white/55')}`}>{b.up}</span>
              <span className={`cond text-[10px] tracking-[0.12em] font-semibold -mt-0.5 ${b.adminHighlight ? 'text-gold' : (light ? 'text-ink-900' : 'text-white')}`}>{b.down}</span>
            </button>
          ))}
        </div>
      </aside>
    </div>
  )
}
