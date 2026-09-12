'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { CATS, type Cat } from './encabezadoDatos'
import { I } from '../navIconos'
import './Encabezado.css'

function Badge({ kind }: { kind: string | null }) {
  if (!kind) return null
  const tone = ({ HOT: 'bg-gold text-black', NEW: 'bg-white text-black dark:bg-gold dark:text-black', SEO: 'bg-transparent text-gold border border-gold/70' } as Record<string,string>)[kind] ?? 'bg-gold text-black'
  return <span className={`cond ${tone} text-[10px] leading-none font-bold tracking-[0.12em] px-1.5 py-[3px] rounded-sm ml-1.5 align-middle`}>{kind}</span>
}

function MegaMenu({ cat, light, onNavigate }: { cat: Cat; light: boolean; onNavigate: () => void }) {
  const { columns, feature, ctaLabel, ctaHref } = cat.mega
  return (
    <div
      className={`mega-enter absolute left-0 right-0 top-full z-30 ${
        light ? 'mega-bg-light text-ink-900 border-t border-ink-100' : 'mega-bg text-white border-t border-white/10'
      }`}
      role="region"
      aria-label={`Menú de ${cat.label}`}
    >
      <div className="max-w-[1400px] mx-auto px-4 lg:px-6 py-6 lg:py-8 grid grid-cols-12 gap-6 lg:gap-8">
        <div className="col-span-12 xl:col-span-8 grid grid-cols-3 gap-6 lg:gap-8">
          {columns.map((col) => (
            <div key={col.title}>
              <div className={`cond text-[11px] font-bold tracking-[0.22em] mb-3 flex items-center gap-2 ${light ? 'text-ink-400' : 'text-gold/80'}`}>
                <span className="h-px w-5 bg-gold inline-block" />
                {col.title.toUpperCase()}
              </div>
              <ul className="space-y-1.5">
                {col.items.map((it) => (
                  <li key={it.label}>
                    <Link
                      href={it.href}
                      onClick={onNavigate}
                      className={`group flex items-center justify-between text-[14px] py-1 transition-colors ${light ? 'text-ink-700 hover:text-ink-900' : 'text-white/85 hover:text-gold'}`}
                    >
                      <span>{it.label}</span>
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
            <Link href={feature.href} onClick={onNavigate} className="group relative block aspect-[4/3] overflow-hidden bg-black" aria-label={feature.title}>
              <Image
                src={feature.image}
                alt={feature.alt}
                fill
                sizes="(min-width: 1280px) 420px, 33vw"
                className="mega-feature-img"
                priority={false}
              />
              <span className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/70 to-transparent pointer-events-none" />
              <span className="absolute left-4 bottom-4 cond text-[10px] tracking-[0.22em] font-bold bg-gold text-black px-2 py-1 rounded-sm">{feature.tag.toUpperCase()}</span>
            </Link>
            <div className="p-4">
              <div className={`cond text-[11px] tracking-[0.2em] font-semibold mb-1 ${light ? 'text-ink-400' : 'text-white/45'}`}>DESTACADO</div>
              <Link href={feature.href} onClick={onNavigate} className={`block text-[15px] font-semibold leading-snug hover:text-gold transition-colors ${light ? 'text-ink-900' : 'text-white'}`}>
                {feature.title}
              </Link>
              <div className="mt-3 flex items-center justify-between gap-3">
                <div className="cond font-bold text-gold text-[18px] whitespace-nowrap">{feature.price}</div>
                <Link href={ctaHref} onClick={onNavigate} className="cond text-[12px] font-bold tracking-[0.18em] inline-flex items-center gap-1.5 px-4 py-2 rounded-sm bg-gold text-black hover:bg-gold-300 transition-colors whitespace-nowrap">
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

export default function BarraCategorias({ light, scrolled }: { light: boolean; scrolled: boolean }) {
  const [active, setActive] = useState<string | null>(null)
  const closeT = useRef<ReturnType<typeof setTimeout> | null>(null)
  const wrapRef = useRef<HTMLDivElement>(null)

  const cancelClose = () => { if (closeT.current) { clearTimeout(closeT.current); closeT.current = null } }
  const onEnter = (id: string) => { cancelClose(); setActive(id) }
  const onLeave = () => { cancelClose(); closeT.current = setTimeout(() => setActive(null), 140) }
  const close = () => { cancelClose(); setActive(null) }

  // Escape cierra el panel; salir del wrapper con el teclado también.
  useEffect(() => {
    if (!active) return
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') close() }
    const onFocusOut = (e: FocusEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.relatedTarget as Node)) close()
    }
    document.addEventListener('keydown', onKey)
    wrapRef.current?.addEventListener('focusout', onFocusOut)
    return () => {
      document.removeEventListener('keydown', onKey)
      wrapRef.current?.removeEventListener('focusout', onFocusOut)
    }
  }, [active])

  const activeCat = active ? CATS.find((c) => c.id === active) : undefined

  return (
    <div
      ref={wrapRef}
      className={`relative hidden lg:block ${light ? 'bg-white hairline-light' : 'bg-black hairline'} ${scrolled ? 'h-[44px]' : 'h-[52px]'} transition-all`}
      onMouseLeave={onLeave}
      onMouseEnter={cancelClose}
    >
      <div className="max-w-[1400px] mx-auto px-4 lg:px-6 h-full flex items-stretch gap-2">
        <div className="flex-1 min-w-0 flex items-stretch gap-0.5 xl:gap-1 overflow-x-auto no-scrollbar">
          <Link
            href="/tienda"
            onMouseEnter={close}
            className={`group cond relative flex items-center gap-1.5 xl:gap-2 px-2.5 xl:px-3 h-full shrink-0 text-[12px] xl:text-[13px] font-bold tracking-[0.12em] xl:tracking-[0.13em] transition-colors border-r ${
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
            return (
              <Link
                key={c.id}
                href={c.href}
                onMouseEnter={() => onEnter(c.id)}
                onFocus={() => onEnter(c.id)}
                onClick={close}
                className={`group cond relative flex items-center gap-1.5 xl:gap-2 px-2.5 xl:px-3 h-full shrink-0 text-[12px] xl:text-[13px] font-bold tracking-[0.12em] xl:tracking-[0.13em] transition-colors
                  ${light ? (isActive ? 'text-ink-900 bg-ink-50' : 'text-ink-700 hover:text-ink-900') : (isActive ? 'text-white bg-white/[.04]' : 'text-white/80 hover:text-white')}`}
                aria-expanded={isActive}
                aria-haspopup="true"
              >
                <Icon className={`h-4 w-4 shrink-0 ${isActive ? 'text-gold' : 'text-gold/70 group-hover:text-gold'} transition-colors`} />
                <span>{c.label.toUpperCase()}</span>
                <Badge kind={c.badge} />
                <I.Chevron className={`h-3 w-3 transition-transform ${isActive ? 'rotate-180 text-gold' : 'text-current opacity-50'}`} />
                <span className={`absolute left-3 right-3 bottom-0 h-[2px] bg-gold transition-transform origin-left ${isActive ? 'scale-x-100' : 'scale-x-0'}`} />
              </Link>
            )
          })}
        </div>
        {/* Antes decía "FLASH SALE HOY · 30% OFF": no existe esa promoción. Ahora enlaza al filtro
            real de la tienda (?oferta=1 → conDescuento, ver filtrosTienda.ts) y la cifra es el
            mayor descuento vigente en catálogo (fuelles $790.000 → $650.000 = 17,7%, se redondea
            a la baja). Si cambian los precios hay que recalcular este tope. */}
        <Link href="/tienda?oferta=1" onMouseEnter={close} className="self-center flex items-center gap-1.5 xl:gap-2 pl-2.5 xl:pl-3 pr-1 py-1.5 rounded-md border border-gold/50 bg-gold/[.08] flash-pulse shrink-0" aria-label="Ver productos con descuento">
          <I.Bolt className="h-4 w-4 text-gold flash-text shrink-0" />
          <span className="cond text-[11px] xl:text-[12px] font-bold tracking-[0.14em] xl:tracking-[0.16em] text-gold flash-text whitespace-nowrap">
            <span className="hidden 2xl:inline">OFERTAS VIGENTES · </span>HASTA -17%
          </span>
          <span className="cond text-[10px] xl:text-[11px] font-bold tracking-[0.16em] xl:tracking-[0.18em] bg-gold text-black px-2 xl:px-2.5 py-1 rounded-sm hover:bg-gold-300 transition-colors whitespace-nowrap">VER OFERTAS</span>
        </Link>
      </div>
      {activeCat && (
        <div onMouseEnter={cancelClose}>
          <MegaMenu cat={activeCat} light={light} onNavigate={close} />
        </div>
      )}
    </div>
  )
}
