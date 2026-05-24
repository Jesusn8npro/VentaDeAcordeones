'use client'

import { useState } from 'react'
import DrawerDerecho from './DrawerDerecho'
import { I } from '../navIconos'

function timeAgo(t: number) {
  const s = Math.floor((Date.now() - t) / 1000)
  if (s < 60) return 'ahora'
  if (s < 3600) return `hace ${Math.floor(s / 60)} min`
  if (s < 86400) return `hace ${Math.floor(s / 3600)} h`
  return `hace ${Math.floor(s / 86400)} d`
}

const NOTIFS_INICIALES = [
  { id: 'n1', kind: 'order',  title: 'Pedido #VA-8421 enviado',             body: 'Llegó al centro de distribución Bogotá.',         time: Date.now() - 1000*60*8,    read: false },
  { id: 'n2', kind: 'promo',  title: '30% OFF en repuestos hoy',             body: 'Solo por hoy en fuelles, voces y tornillería.',   time: Date.now() - 1000*60*55,   read: false },
  { id: 'n3', kind: 'system', title: 'Acordeón Hohner Corona III en stock',  body: 'Vuelve a estar disponible la tonalidad Sol Do Fa.', time: Date.now() - 1000*60*60*3, read: false },
  { id: 'n4', kind: 'order',  title: 'Reseña pendiente · Pedido #VA-8211',  body: '¿Qué tal tu nuevo estuche rígido?',               time: Date.now() - 1000*60*60*22, read: true },
  { id: 'n5', kind: 'promo',  title: 'Curso Vallenato · cohorte abierta',   body: 'Faltan 4 cupos para la cohorte de mayo.',         time: Date.now() - 1000*60*60*48, read: true },
]

const KIND_META: Record<string, { icon: keyof typeof I; label: string; tone: string }> = {
  order:  { icon: 'Truck', label: 'Pedido',  tone: 'text-blue-400' },
  promo:  { icon: 'Bolt',  label: 'Oferta',  tone: 'text-gold' },
  system: { icon: 'Bell',  label: 'Sistema', tone: 'text-emerald-400' },
}

interface Props { open: boolean; onClose: () => void; light: boolean }

export default function NotificacionesDrawer({ open, onClose, light }: Props) {
  const [notifs, setNotifs] = useState(NOTIFS_INICIALES)
  const [filter, setFilter] = useState('all')

  const unread = notifs.filter((n) => !n.read).length
  const filtered = notifs.filter((n) =>
    filter === 'all' ? true : filter === 'unread' ? !n.read : n.kind === filter
  )
  const hair = light ? 'border-ink-100' : 'border-white/[.06]'

  const markAllRead = () => setNotifs((prev) => prev.map((n) => ({ ...n, read: true })))
  const toggleRead  = (id: string) => setNotifs((prev) => prev.map((n) => n.id === id ? { ...n, read: !n.read } : n))
  const removeNotif = (id: string) => setNotifs((prev) => prev.filter((n) => n.id !== id))

  const FILTERS = [
    { id: 'all',    label: 'Todas' },
    { id: 'unread', label: `No leídas · ${unread}` },
    { id: 'order',  label: 'Pedidos' },
    { id: 'promo',  label: 'Ofertas' },
  ]

  return (
    <DrawerDerecho
      open={open}
      onClose={onClose}
      title="NOTIFICACIONES"
      subtitle={unread > 0 ? `${unread} sin leer` : 'Estás al día'}
      accentBadge={unread > 0 ? unread : null}
      light={light}
    >
      <div className={`px-5 py-3 border-b ${hair} flex items-center gap-1.5 overflow-x-auto no-scrollbar`}>
        {FILTERS.map((f) => {
          const active = filter === f.id
          return (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              className={`cond text-[11px] font-bold tracking-[0.14em] px-3 py-1.5 rounded-full whitespace-nowrap transition-colors
                ${active
                  ? 'bg-gold text-black'
                  : light
                    ? 'bg-ink-100 text-ink-700 hover:bg-ink-200'
                    : 'bg-white/[.05] text-white/70 hover:bg-white/[.08]'}`}
            >
              {f.label.toUpperCase()}
            </button>
          )
        })}
        <button
          onClick={markAllRead}
          className={`ml-auto cond text-[11px] font-bold tracking-[0.14em] whitespace-nowrap shrink-0 ${light ? 'text-ink-500 hover:text-ink-900' : 'text-white/55 hover:text-gold'}`}
        >
          MARCAR TODO LEÍDO
        </button>
      </div>

      {filtered.length === 0 ? (
        <div className="px-6 py-14 text-center">
          <div className={`mx-auto h-20 w-20 rounded-full flex items-center justify-center ${light ? 'bg-ink-100' : 'bg-white/[.05]'}`}>
            <I.Bell className={`h-9 w-9 ${light ? 'text-ink-300' : 'text-white/30'}`} />
          </div>
          <h3 className="cond mt-5 text-[18px] font-extrabold tracking-[0.06em]">SIN NOTIFICACIONES</h3>
          <p className={`mt-1.5 text-[13px] max-w-xs mx-auto ${light ? 'text-ink-500' : 'text-white/55'}`}>
            Cuando tengas actualizaciones de pedidos u ofertas aparecerán aquí.
          </p>
        </div>
      ) : (
        <ul>
          {filtered.map((n) => {
            const meta = KIND_META[n.kind] || KIND_META.system
            const Icon = I[meta.icon]
            return (
              <li
                key={n.id}
                className={`group relative px-5 py-4 border-b ${hair} ${!n.read ? 'bg-gold/[.04]' : ''} transition-colors`}
              >
                <div className="flex gap-3">
                  <div className={`h-9 w-9 shrink-0 rounded-md flex items-center justify-center ${light ? 'bg-ink-100' : 'bg-white/[.05]'}`}>
                    <Icon className={`h-4 w-4 ${meta.tone}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`cond text-[10px] tracking-[0.18em] font-bold ${meta.tone}`}>
                        {meta.label.toUpperCase()}
                      </span>
                      <span className={`text-[11px] ${light ? 'text-ink-400' : 'text-white/40'}`}>·</span>
                      <span className={`text-[11px] ${light ? 'text-ink-400' : 'text-white/40'}`}>{timeAgo(n.time)}</span>
                      {!n.read && <span className="ml-auto h-2 w-2 rounded-full bg-gold animate-pulse" />}
                    </div>
                    <div className={`mt-0.5 text-[14px] font-semibold leading-snug ${light ? 'text-ink-900' : 'text-white'}`}>
                      {n.title}
                    </div>
                    <div className={`mt-0.5 text-[13px] ${light ? 'text-ink-500' : 'text-white/60'}`}>{n.body}</div>
                    <div className="mt-2 flex items-center gap-3">
                      <button
                        onClick={() => toggleRead(n.id)}
                        className={`text-[11px] cond tracking-[0.14em] font-semibold ${light ? 'text-ink-500 hover:text-ink-900' : 'text-white/55 hover:text-gold'}`}
                      >
                        {n.read ? 'MARCAR NO LEÍDA' : 'MARCAR LEÍDA'}
                      </button>
                      <button
                        onClick={() => removeNotif(n.id)}
                        className={`text-[11px] cond tracking-[0.14em] font-semibold ${light ? 'text-ink-400 hover:text-red-600' : 'text-white/40 hover:text-red-400'}`}
                      >
                        ELIMINAR
                      </button>
                    </div>
                  </div>
                </div>
              </li>
            )
          })}
        </ul>
      )}
    </DrawerDerecho>
  )
}
