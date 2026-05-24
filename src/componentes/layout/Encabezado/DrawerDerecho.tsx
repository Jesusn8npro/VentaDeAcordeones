'use client'

import { useState, useEffect, type ReactNode } from 'react'
import { I } from '../navIconos'
import './Encabezado.css'

interface Props {
  open: boolean
  onClose: () => void
  title: string
  subtitle?: string
  children: ReactNode
  footer?: ReactNode
  accentBadge?: number | null
  light: boolean
}

export default function DrawerDerecho({ open, onClose, title, subtitle, children, footer, accentBadge, light }: Props) {
  const [exiting, setExiting] = useState(false)

  useEffect(() => {
    if (open) {
      setExiting(false)
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [open])

  const handleClose = () => {
    setExiting(true)
    setTimeout(() => { onClose(); setExiting(false) }, 260)
  }

  if (!open && !exiting) return null

  const surface = light ? 'bg-white text-ink-900' : 'bg-ink-900 text-white'
  const hair = light ? 'border-ink-100' : 'border-white/10'

  return (
    <div className="fixed inset-0 z-[70]">
      <div
        className={`absolute inset-0 bg-black/60 backdrop-blur-sm ${exiting ? 'fade-out' : 'fade-in'}`}
        onClick={handleClose}
      />
      <aside
        className={`absolute right-0 top-0 h-full w-full sm:w-[420px] lg:w-[460px] ${surface} flex flex-col shadow-2xl ${exiting ? 'drawer-right-out' : 'drawer-right-in'}`}
        role="dialog"
        aria-modal="true"
        aria-label={title}
      >
        <header className={`px-5 sm:px-6 py-4 border-b ${hair} flex items-start justify-between gap-3`}>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h2 className="cond text-[20px] sm:text-[22px] font-extrabold tracking-[0.06em]">{title}</h2>
              {accentBadge != null && (
                <span className="cond text-[11px] font-bold tracking-[0.16em] bg-gold text-black px-2 py-0.5 rounded-sm">
                  {accentBadge}
                </span>
              )}
            </div>
            {subtitle && (
              <p className={`text-[12px] mt-0.5 ${light ? 'text-ink-500' : 'text-white/55'}`}>{subtitle}</p>
            )}
          </div>
          <button
            onClick={handleClose}
            className={`h-10 w-10 rounded-full border ${light ? 'border-ink-200 hover:border-ink-900' : 'border-white/15 hover:border-gold hover:text-gold'} flex items-center justify-center transition-colors active:scale-95 shrink-0`}
            aria-label="Cerrar"
          >
            <I.Close className="h-5 w-5" />
          </button>
        </header>
        <div className="flex-1 overflow-y-auto">{children}</div>
        {footer && <footer className={`border-t ${hair}`}>{footer}</footer>}
      </aside>
    </div>
  )
}
