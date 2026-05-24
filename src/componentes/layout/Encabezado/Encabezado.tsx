'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import Link from 'next/link'
import { useCarrito } from '@/contextos/CarritoContext'
import { useFavoritos } from '@/contextos/FavoritosContext'
import { useTema } from '@/contextos/ContextoTema'
import { useAuth } from '@/contextos/ContextoAutenticacion'
import { CATS } from './encabezadoDatos'
import { I } from '../navIconos'
import MenuMovil from './MenuMovil'
import CarritoDrawer from './CarritoDrawer'
import FavoritosDrawer from './FavoritosDrawer'
import NotificacionesDrawer from './NotificacionesDrawer'
import './Encabezado.css'

// ── Badge ─────────────────────────────────────────────────────
function Badge({ kind }: { kind: string | null }) {
  if (!kind) return null
  const tone = ({ HOT: 'bg-gold text-black', NEW: 'bg-white text-black dark:bg-gold dark:text-black', SEO: 'bg-transparent text-gold border border-gold/70' } as Record<string,string>)[kind] ?? 'bg-gold text-black'
  return <span className={`cond ${tone} text-[10px] leading-none font-bold tracking-[0.12em] px-1.5 py-[3px] rounded-sm ml-1.5 align-middle`}>{kind}</span>
}

// ── Logo ──────────────────────────────────────────────────────
function Logo({ light }: { light: boolean }) {
  return (
    <Link href="/" className="flex items-center gap-2 sm:gap-2.5 shrink-0 group" aria-label="Inicio Venta de Acordeones">
      <span className="relative flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-md bg-gold text-black shadow-[0_8px_24px_-12px_rgba(255,195,0,.8)] transition-transform group-hover:scale-[1.03]">
        <I.Accordion className="h-5 w-5 sm:h-6 sm:w-6" />
        <span className="absolute -bottom-0.5 -right-0.5 h-2 w-2 sm:h-2.5 sm:w-2.5 rounded-full bg-white border-2 border-black/80" />
      </span>
      <span className="flex flex-col leading-none">
        <span className={`cond text-[9px] sm:text-[11px] tracking-[0.28em] sm:tracking-[0.32em] font-semibold ${light ? 'text-ink-400' : 'text-gold/80'}`}>VENTA DE</span>
        <span className={`cond text-[17px] sm:text-[20px] lg:text-[22px] font-extrabold tracking-[0.04em] sm:tracking-[0.06em] whitespace-nowrap ${light ? 'text-ink-900' : 'text-white'}`}>
          ACORDEONES<span className="text-gold">.</span>
        </span>
      </span>
    </Link>
  )
}

// ── TopBar ────────────────────────────────────────────────────
const TOP_MSGS = [
  { icon: 'Truck', text: 'Envío gratis en compras +$2M COP', short: 'Envío gratis +$2M' },
  { icon: 'Phone', text: 'Soporte 24/7 · WhatsApp +57 320 849 2093', short: 'Soporte 24/7' },
  { icon: 'App',   text: 'Descarga la App · 10% off tu primer pedido', short: 'Descarga la App' },
  { icon: 'Star',  text: '+12.000 acordeones entregados en LATAM', short: '+12K entregados' },
]

function TopBar({ light, onToggle }: { light: boolean; onToggle: () => void }) {
  return (
    <div className="surface-top text-[11px] sm:text-[12px] hairline">
      <div className="max-w-[1400px] mx-auto px-3 sm:px-4 lg:px-6 h-8 sm:h-9 flex items-center justify-between gap-3 sm:gap-6">
        <ul className="hidden sm:flex items-center gap-3 md:gap-4 lg:gap-6 text-white/85 min-w-0">
          {TOP_MSGS.slice(0, 3).map((m, i) => {
            const Icon = I[m.icon]
            return (
              <li key={i} className={`flex items-center gap-2 shrink-0 ${i === 0 ? '' : 'hidden md:flex'} ${i === 2 ? 'hidden lg:flex' : ''}`}>
                <Icon className="h-3.5 w-3.5 text-gold shrink-0" />
                <span className="tracking-wide whitespace-nowrap">
                  <span className="hidden lg:inline">
                    {m.text.split(' ').map((w, k) =>
                      /\+|\$|24\/7|App/.test(w)
                        ? <span key={k} className="text-gold font-semibold"> {w}</span>
                        : <span key={k}> {w}</span>
                    )}
                  </span>
                  <span className="lg:hidden text-gold font-semibold">{m.short}</span>
                </span>
              </li>
            )
          })}
        </ul>

        <div className="sm:hidden overflow-hidden flex-1">
          <div className="marquee-track flex gap-8 whitespace-nowrap text-white/85">
            {[...TOP_MSGS, ...TOP_MSGS].map((m, i) => {
              const Icon = I[m.icon]
              return (
                <span key={i} className="flex items-center gap-1.5">
                  <Icon className="h-3 w-3 text-gold" />
                  <span>{m.short}</span>
                  <span className="text-gold">·</span>
                </span>
              )
            })}
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3 lg:gap-4 shrink-0">
          <Link href="/contacto" className="hidden xl:inline text-white/70 hover:text-gold transition-colors">Ayuda</Link>
          <Link href="/tienda" className="hidden xl:inline text-white/70 hover:text-gold transition-colors">Rastrear pedido</Link>
          <span className="hidden xl:inline text-white/20">|</span>
          <span className="hidden lg:inline text-white/70">ES · COP</span>
          <button
            onClick={onToggle}
            className="flex items-center gap-1.5 text-white/80 hover:text-gold transition-colors group shrink-0"
            aria-label="Cambiar modo claro / oscuro"
          >
            {light
              ? <I.Moon className="h-3.5 w-3.5 transition-transform group-hover:rotate-12" />
              : <I.Sun  className="h-3.5 w-3.5 transition-transform group-hover:rotate-45" />}
            <span className="cond text-[10px] sm:text-[11px] tracking-[0.16em] sm:tracking-[0.18em] font-semibold hidden md:inline">
              {light ? 'MODO OSCURO' : 'MODO CLARO'}
            </span>
          </button>
        </div>
      </div>
    </div>
  )
}

// ── SearchBar (button) ────────────────────────────────────────
function SearchBar({ light, onOpen }: { light: boolean; onOpen: () => void }) {
  return (
    <button
      type="button"
      onClick={onOpen}
      className={`search-shell w-full flex items-stretch h-11 sm:h-12 rounded-md overflow-hidden transition-all text-left ${
        light ? 'bg-white border border-ink-100 hover:border-gold' : 'bg-ink-800/80 border border-white/10 hover:border-gold/50'
      }`}
      aria-label="Abrir búsqueda"
    >
      <div className={`cond text-[12px] sm:text-[13px] font-semibold tracking-wider flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 shrink-0 border-r ${light ? 'border-ink-100 text-ink-700' : 'border-white/10 text-white/85'}`}>
        <span className="hidden md:inline">TODAS</span>
        <span className="md:hidden">CAT</span>
        <I.Chevron className="h-3.5 w-3.5 text-gold" />
      </div>
      <div className="flex-1 relative flex items-center min-w-0">
        <I.Search className={`h-4 w-4 absolute left-3 ${light ? 'text-ink-400' : 'text-white/50'}`} />
        <span className={`pl-9 sm:pl-10 pr-2 text-[13px] sm:text-[14px] truncate ${light ? 'text-ink-400' : 'text-white/45'}`}>
          Busca acordeones, repuestos…
        </span>
        <span className="hidden md:flex ml-auto mr-3 items-center">
          <kbd className={`cond text-[10px] font-bold tracking-wider px-1.5 py-0.5 rounded border ${light ? 'border-ink-200 text-ink-500' : 'border-white/15 text-white/55'}`}>⌘K</kbd>
        </span>
      </div>
      <div className="cond px-3.5 sm:px-5 lg:px-7 bg-gold text-black font-bold tracking-[0.16em] sm:tracking-[0.18em] text-[12px] sm:text-[13px] hover:bg-gold-300 transition-colors flex items-center gap-1.5 sm:gap-2 shrink-0">
        <I.Search className="h-4 w-4" />
        <span className="hidden sm:inline">BUSCAR</span>
      </div>
    </button>
  )
}

// ── IconBtn ───────────────────────────────────────────────────
interface IconBtnProps {
  icon: string
  filledIcon?: string
  label: { up: string; down: string }
  count?: number | null
  light: boolean
  onClick?: () => void
  bumpKey?: number | null
  active?: boolean
  hideOnMobile?: boolean
}

function IconBtn({ icon, filledIcon, label, count, light, onClick, bumpKey, active, hideOnMobile }: IconBtnProps) {
  const [bumped, setBumped] = useState(false)
  const vis = hideOnMobile ? 'hidden lg:flex' : 'flex'

  useEffect(() => {
    if (!bumpKey) return
    setBumped(true)
    const t = setTimeout(() => setBumped(false), 600)
    return () => clearTimeout(t)
  }, [bumpKey])

  const IconCmp = active && filledIcon ? I[filledIcon] : I[icon]
  return (
    <button
      onClick={onClick}
      className={`${vis} relative items-center gap-2 h-10 lg:h-11 px-2 lg:px-2.5 rounded-md transition-colors group ${
        light ? 'hover:bg-ink-100/80 text-ink-700' : 'hover:bg-white/[.06] text-white/90'
      }`}
      aria-label={`${label.up} ${label.down}`}
    >
      <span className={`relative ${bumped ? 'icon-bump' : ''}`}>
        <IconCmp className={`h-[22px] w-[22px] ${active ? 'text-gold' : (light ? 'text-ink-800 group-hover:text-ink-900' : 'text-white group-hover:text-gold')} transition-colors`} />
        {count != null && count > 0 && (
          <span key={count} className={`badge-pop absolute -top-1.5 -right-2 min-w-[18px] h-[18px] px-1 rounded-full bg-gold text-black text-[10px] font-bold flex items-center justify-center shadow ring-2 ${light ? 'ring-white' : 'ring-black'} tabular-nums`}>
            {count > 99 ? '99+' : count}
          </span>
        )}
      </span>
      <span className="hidden xl:flex flex-col items-start leading-tight">
        <span className={`cond text-[10px] tracking-[0.18em] ${light ? 'text-ink-400' : 'text-white/50'}`}>{label.up}</span>
        <span className={`cond text-[12px] font-semibold tracking-wider ${light ? 'text-ink-900' : 'text-white'}`}>{label.down}</span>
      </span>
    </button>
  )
}

// ── MegaMenu ──────────────────────────────────────────────────
function MegaMenu({ cat, light, pinned, onClose }: {
  cat: typeof CATS[number]; light: boolean; pinned: boolean; onClose: () => void
}) {
  const { columns, feature, ctaLabel, ctaHref } = cat.mega
  return (
    <div
      className={`mega-enter absolute left-0 right-0 top-full z-30 ${
        light ? 'mega-bg-light text-ink-900 border-t border-ink-100' : 'mega-bg text-white border-t border-white/10'
      } shadow-2xl`}
      onMouseDown={(e) => e.stopPropagation()}
    >
      {pinned && (
        <button onClick={onClose} className={`absolute right-4 top-4 z-10 h-9 w-9 rounded-full border ${light ? 'border-ink-200 hover:border-ink-900' : 'border-white/15 hover:border-gold hover:text-gold'} flex items-center justify-center transition-colors`} aria-label="Cerrar menú">
          <I.Close className="h-4 w-4" />
        </button>
      )}
      <div className="max-w-[1400px] mx-auto px-4 lg:px-6 py-6 lg:py-8 grid grid-cols-12 gap-6 lg:gap-8">
        <div className="col-span-12 xl:col-span-8 grid grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {columns.map((col, i) => (
            <div key={i}>
              <div className={`cond text-[11px] font-bold tracking-[0.22em] mb-3 flex items-center gap-2 ${light ? 'text-ink-400' : 'text-gold/80'}`}>
                <span className="h-px w-5 bg-gold inline-block" />
                {col.title.toUpperCase()}
              </div>
              <ul className="space-y-1.5">
                {col.items.map((it) => (
                  <li key={it}>
                    <Link href="/tienda" className={`group flex items-center justify-between text-[14px] py-1 transition-colors ${light ? 'text-ink-700 hover:text-ink-900' : 'text-white/85 hover:text-gold'}`}>
                      <span>{it}</span>
                      <I.ArrowRight className="h-3.5 w-3.5 opacity-0 group-hover:opacity-100 -translate-x-1 group-hover:translate-x-0 transition-all text-gold" />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="col-span-12 xl:col-span-4">
          <div className={`rounded-lg overflow-hidden ${light ? 'bg-ink-50 border border-ink-100' : 'bg-ink-800/60 border border-white/10'}`}>
            <div className={`aspect-[4/3] ${light ? 'stripe-placeholder-light' : 'stripe-placeholder'} flex items-end p-4`}>
              <span className="cond text-[10px] tracking-[0.22em] font-bold bg-gold text-black px-2 py-1 rounded-sm">{feature.tag.toUpperCase()}</span>
            </div>
            <div className="p-4">
              <div className={`cond text-[11px] tracking-[0.2em] font-semibold mb-1 ${light ? 'text-ink-400' : 'text-white/45'}`}>DESTACADO</div>
              <div className={`text-[15px] font-semibold leading-snug ${light ? 'text-ink-900' : 'text-white'}`}>{feature.title}</div>
              <div className="mt-3 flex items-center justify-between">
                <div className="cond font-bold text-gold text-[18px]">{feature.price}</div>
                <Link href={ctaHref} className="cond text-[12px] font-bold tracking-[0.18em] inline-flex items-center gap-1.5 px-4 py-2 rounded-sm bg-gold text-black hover:bg-gold-300 transition-colors">
                  {ctaLabel.toUpperCase()} <I.ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── CategoryBar ───────────────────────────────────────────────
function CategoryBar({ light, scrolled }: { light: boolean; scrolled: boolean }) {
  const [hover, setHover] = useState<string | null>(null)
  const [pinned, setPinned] = useState<string | null>(null)
  const closeT = useRef<ReturnType<typeof setTimeout> | null>(null)
  const wrapRef = useRef<HTMLDivElement>(null)
  const active = pinned || hover

  const onEnter = (id: string) => { if (closeT.current) clearTimeout(closeT.current); if (!pinned) setHover(id) }
  const onLeave = () => { closeT.current = setTimeout(() => setHover(null), 120) }

  useEffect(() => {
    if (!pinned) return
    const fn = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) { setPinned(null); setHover(null) }
    }
    document.addEventListener('mousedown', fn)
    return () => document.removeEventListener('mousedown', fn)
  }, [pinned])

  return (
    <div
      ref={wrapRef}
      className={`relative hidden lg:block ${light ? 'bg-white hairline-light' : 'bg-black hairline'} ${scrolled ? 'h-[44px]' : 'h-[52px]'} transition-all`}
      onMouseLeave={onLeave}
    >
      <div className="max-w-[1400px] mx-auto px-4 lg:px-6 h-full flex items-stretch gap-2">
        <div className="flex-1 min-w-0 flex items-stretch gap-0.5 xl:gap-1 overflow-x-auto no-scrollbar">
          <Link
            href="/tienda"
            className={`group cond relative flex items-center gap-1.5 xl:gap-2 px-2.5 xl:px-3.5 h-full shrink-0 text-[12px] xl:text-[13px] font-bold tracking-[0.12em] xl:tracking-[0.14em] transition-colors border-r ${
              light ? 'text-ink-700 hover:text-ink-900 border-ink-100' : 'text-white/80 hover:text-white border-white/10'
            } mr-1`}
          >
            <I.Grid className="h-4 w-4 shrink-0 text-gold/70 group-hover:text-gold transition-colors" />
            <span>TODAS LAS CATEGORÍAS</span>
            <I.Chevron className="h-3 w-3 opacity-50" />
          </Link>
          {CATS.map((c) => {
            const Icon = I[c.icon]
            const isActive = active === c.id
            const isPinned = pinned === c.id
            return (
              <button
                key={c.id}
                onMouseEnter={() => onEnter(c.id)}
                onFocus={() => onEnter(c.id)}
                onClick={() => { setPinned((p) => (p === c.id ? null : c.id)); setHover(null) }}
                className={`group cond relative flex items-center gap-1.5 xl:gap-2 px-2.5 xl:px-3.5 h-full shrink-0 text-[12px] xl:text-[13px] font-bold tracking-[0.12em] xl:tracking-[0.14em] transition-colors
                  ${light ? (isActive ? 'text-ink-900' : 'text-ink-700 hover:text-ink-900') : (isActive ? 'text-white' : 'text-white/80 hover:text-white')}
                  ${isPinned ? (light ? 'bg-ink-50' : 'bg-white/[.04]') : ''}`}
                aria-expanded={isActive}
              >
                <Icon className={`h-4 w-4 shrink-0 ${isActive ? 'text-gold' : 'text-gold/70 group-hover:text-gold'} transition-colors`} />
                <span>{c.label.toUpperCase()}</span>
                <Badge kind={c.badge} />
                <I.Chevron className={`h-3 w-3 transition-transform ${isActive ? 'rotate-180 text-gold' : 'text-current opacity-50'}`} />
                <span className={`absolute left-3 right-3 bottom-0 h-[2px] bg-gold transition-transform origin-left ${isActive ? 'scale-x-100' : 'scale-x-0'}`} />
              </button>
            )
          })}
        </div>
        <Link href="/tienda" className="self-center flex items-center gap-1.5 xl:gap-2 pl-2.5 xl:pl-3 pr-1 py-1.5 rounded-md border border-gold/50 bg-gold/[.08] flash-pulse shrink-0" aria-label="Flash sale hoy 30% off">
          <I.Bolt className="h-4 w-4 text-gold flash-text shrink-0" />
          <span className="cond text-[11px] xl:text-[12px] font-bold tracking-[0.14em] xl:tracking-[0.16em] text-gold flash-text whitespace-nowrap">
            <span className="hidden xl:inline">FLASH SALE HOY · </span>30% OFF
          </span>
          <span className="cond text-[10px] xl:text-[11px] font-bold tracking-[0.16em] xl:tracking-[0.18em] bg-gold text-black px-2 xl:px-2.5 py-1 rounded-sm hover:bg-gold-300 transition-colors whitespace-nowrap">VER OFERTA</span>
        </Link>
      </div>
      {active && CATS.find((c) => c.id === active) && (
        <div onMouseEnter={() => onEnter(active)}>
          <MegaMenu
            cat={CATS.find((c) => c.id === active)!}
            light={light}
            pinned={!!pinned}
            onClose={() => { setPinned(null); setHover(null) }}
          />
        </div>
      )}
    </div>
  )
}

// ── SearchOverlay ─────────────────────────────────────────────
const QUICK = [
  { text: 'Hohner Corona III Sol Do Fa', badge: 'MÁS BUSCADO' },
  { text: 'Estuche rígido acordeón',     badge: 'TOP' },
  { text: 'Afinación profesional',       badge: null },
  { text: 'Voces Hohner repuesto',       badge: null },
  { text: 'Cursos vallenato online',     badge: null },
]

function SearchOverlay({ open, onClose, light }: { open: boolean; onClose: () => void; light: boolean }) {
  const [query, setQuery] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 50)
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
      setQuery('')
    }
    return () => { document.body.style.overflow = '' }
  }, [open])

  const doSearch = useCallback(() => {
    if (!query.trim()) return
    window.location.href = `/buscar?q=${encodeURIComponent(query.trim())}`
    onClose()
  }, [query, onClose])

  if (!open) return null
  return (
    <div className="fixed inset-0 z-[70] flex flex-col px-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className={`relative mx-auto w-full max-w-[700px] mt-16 sm:mt-24 rounded-xl shadow-2xl mega-enter ${light ? 'bg-white' : 'bg-ink-900 border border-white/10'}`}>
        <div className="flex items-stretch p-2 gap-2">
          <div className={`flex-1 flex items-center gap-3 px-3 rounded-lg ${light ? 'bg-ink-50' : 'bg-white/[.05]'}`}>
            <I.Search className={`h-5 w-5 shrink-0 ${light ? 'text-ink-400' : 'text-white/50'}`} />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') doSearch(); if (e.key === 'Escape') onClose() }}
              placeholder="Busca acordeones, repuestos, cursos…"
              className={`flex-1 h-12 bg-transparent text-[15px] outline-none ${light ? 'text-ink-900 placeholder-ink-400' : 'text-white placeholder-white/45'}`}
            />
            {query && <button onClick={() => setQuery('')} className="opacity-60 hover:opacity-100 transition-opacity"><I.Close className="h-4 w-4" /></button>}
          </div>
          <button onClick={doSearch} className="cond px-5 bg-gold text-black font-bold tracking-[0.16em] text-[13px] rounded-lg hover:bg-gold-300 transition-colors">BUSCAR</button>
        </div>
        <div className={`px-4 py-3 border-t ${light ? 'border-ink-100' : 'border-white/[.06]'}`}>
          <div className={`cond text-[10px] tracking-[0.22em] font-bold mb-2.5 ${light ? 'text-ink-400' : 'text-white/45'}`}>BÚSQUEDAS POPULARES</div>
          <div className="space-y-0.5">
            {QUICK.map((s, i) => (
              <button key={i} onClick={() => { setQuery(s.text); inputRef.current?.focus() }} className={`w-full flex items-center gap-3 py-2 px-2 rounded-md text-left transition-colors ${light ? 'hover:bg-ink-50 text-ink-700' : 'hover:bg-white/[.04] text-white/80'}`}>
                <I.Search className="h-3.5 w-3.5 opacity-50 shrink-0" />
                <span className="text-[14px] flex-1">{s.text}</span>
                {s.badge && <span className="cond text-[9px] tracking-[0.16em] font-bold bg-gold/20 text-gold px-2 py-0.5 rounded-sm">{s.badge}</span>}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Encabezado ────────────────────────────────────────────────
export default function Encabezado() {
  const { tema, alternarTema } = useTema()
  const { totalItems } = useCarrito()
  const { contadorFavoritos } = useFavoritos()
  const { usuario } = useAuth()

  const light = tema === 'light'
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [carritoOpen, setCarritoOpen] = useState(false)
  const [favoritosOpen, setFavoritosOpen] = useState(false)
  const [notifOpen, setNotifOpen] = useState(false)

  useEffect(() => {
    const sentinel = document.createElement('div')
    sentinel.style.cssText = 'position:absolute;top:80px;height:1px;width:1px;pointer-events:none;visibility:hidden;left:0'
    document.body.prepend(sentinel)
    const obs = new IntersectionObserver(
      ([entry]) => setScrolled(!entry.isIntersecting),
      { threshold: 0 }
    )
    obs.observe(sentinel)
    return () => { obs.disconnect(); sentinel.remove() }
  }, [])

  useEffect(() => {
    const fn = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); setSearchOpen(true) }
    }
    document.addEventListener('keydown', fn)
    return () => document.removeEventListener('keydown', fn)
  }, [])

  const bg = light
    ? (scrolled ? 'bg-white/90 hairline-light' : 'bg-white hairline-light')
    : (scrolled ? 'bg-black/85 hairline' : 'bg-black hairline')

  return (
    <>
      <header className={`sticky top-0 z-40 transition-all ${scrolled ? 'nav-shadow' : ''}`}>
        <TopBar light={light} onToggle={alternarTema} />

        <div className={`${bg} backdrop-blur-md transition-all`}>
          <div className={`max-w-[1400px] mx-auto px-3 sm:px-4 lg:px-6 ${scrolled ? 'h-[60px] lg:h-[64px]' : 'h-[64px] lg:h-[72px]'} flex items-center gap-2 sm:gap-3 lg:gap-6 transition-all`}>
            <button
              onClick={() => setMenuOpen(true)}
              className={`lg:hidden h-10 w-10 -ml-1 rounded-md flex items-center justify-center shrink-0 ${light ? 'text-ink-900 hover:bg-ink-100' : 'text-white hover:bg-white/10'}`}
              aria-label="Abrir menú"
            >
              <I.Menu className="h-6 w-6" />
            </button>

            <Logo light={light} />

            <div className="flex-1 hidden lg:block max-w-[760px] mx-auto">
              <SearchBar light={light} onOpen={() => setSearchOpen(true)} />
            </div>

            <div className="ml-auto flex items-center gap-0.5 sm:gap-1">
              <IconBtn
                icon="User"
                label={{ up: 'HOLA,', down: usuario ? 'PERFIL' : 'CUENTA' }}
                light={light}
                hideOnMobile
                onClick={() => { window.location.href = usuario ? '/perfil' : '/login' }}
              />
              <IconBtn
                icon="Bell"
                label={{ up: 'ALERTAS', down: 'NOTIF.' }}
                light={light}
                hideOnMobile
                onClick={() => setNotifOpen(true)}
              />
              <IconBtn
                icon="Heart" filledIcon="HeartFill"
                label={{ up: 'FAVORITOS', down: contadorFavoritos > 0 ? `${contadorFavoritos} GUARDADOS` : 'VACÍO' }}
                count={contadorFavoritos}
                light={light}
                hideOnMobile
                active={contadorFavoritos > 0}
                bumpKey={contadorFavoritos}
                onClick={() => setFavoritosOpen(true)}
              />
              <IconBtn
                icon="Cart"
                label={{ up: 'CARRITO', down: totalItems > 0 ? `${totalItems} ITEM${totalItems > 1 ? 'S' : ''}` : 'VACÍO' }}
                count={totalItems}
                light={light}
                bumpKey={totalItems}
                onClick={() => setCarritoOpen(true)}
              />
            </div>
          </div>

          <div className="lg:hidden px-3 sm:px-4 pb-3">
            <SearchBar light={light} onOpen={() => setSearchOpen(true)} />
          </div>
        </div>

        <CategoryBar light={light} scrolled={scrolled} />
      </header>

      <MenuMovil
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
        light={light}
        onOpenCart={() => setCarritoOpen(true)}
        onOpenFavoritos={() => setFavoritosOpen(true)}
        onOpenNotif={() => setNotifOpen(true)}
      />
      <SearchOverlay open={searchOpen} onClose={() => setSearchOpen(false)} light={light} />
      <CarritoDrawer open={carritoOpen} onClose={() => setCarritoOpen(false)} light={light} />
      <FavoritosDrawer open={favoritosOpen} onClose={() => setFavoritosOpen(false)} light={light} />
      <NotificacionesDrawer open={notifOpen} onClose={() => setNotifOpen(false)} light={light} />
    </>
  )
}
