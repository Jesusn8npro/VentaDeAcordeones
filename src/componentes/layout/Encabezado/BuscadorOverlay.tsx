'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { I } from '../navIconos'

const QUICK = [
  { text: 'Hohner Corona III Sol Do Fa', badge: 'MÁS BUSCADO' },
  { text: 'Estuche rígido acordeón',     badge: 'TOP' },
  { text: 'Afinación profesional',       badge: null },
  { text: 'Voces Hohner repuesto',       badge: null },
  { text: 'Cursos vallenato online',     badge: null },
]

export default function BuscadorOverlay({ open, onClose, light }: { open: boolean; onClose: () => void; light: boolean }) {
  const [query, setQuery] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

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

  // /buscar no existe: la tienda es el buscador real y lee el filtro desde ?q= (filtrosTienda.ts).
  // router.push en vez de window.location.href para no recargar toda la app (SPA, sin perder el carrito en memoria).
  const doSearch = useCallback(() => {
    if (!query.trim()) return
    router.push(`/tienda?q=${encodeURIComponent(query.trim())}`)
    onClose()
  }, [query, onClose, router])

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
