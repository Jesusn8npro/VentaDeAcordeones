'use client'

import { useState } from 'react'
import DrawerDerecho from './DrawerDerecho'
import { useCarrito } from '@/contextos/CarritoContext'
import { I } from '../navIconos'

function formatCOP(n: number) {
  if (n >= 1_000_000) return '$ ' + (n / 1_000_000).toFixed(n % 1_000_000 === 0 ? 0 : 2).replace(/\.?0+$/, '') + 'M'
  return '$ ' + new Intl.NumberFormat('es-CO').format(n)
}
function formatCOPFull(n: number) { return '$ ' + new Intl.NumberFormat('es-CO').format(n) + ' COP' }

const FREE_SHIP_THRESHOLD = 2_000_000

function ItemCarrito({ item, light }: { item: any; light: boolean }) {
  const { actualizarCantidad, eliminarDelCarrito } = useCarrito()
  const [leaving, setLeaving] = useState(false)
  const nombre = item.productos?.nombre || 'Producto'
  const cantidad = item.cantidad
  const precio = item.precio_unitario
  const hair = light ? 'border-ink-100' : 'border-white/[.06]'
  const img = item.productos?.producto_imagenes?.[0]?.imagen_principal || null

  const handleRemove = () => {
    setLeaving(true)
    setTimeout(() => eliminarDelCarrito(item.id), 260)
  }

  return (
    <div className={`${leaving ? 'cart-item-leave' : 'cart-item-enter'} grid grid-cols-[64px_1fr_auto] gap-3 sm:gap-4 p-4 sm:p-5 border-b ${hair}`}>
      <div className={`h-16 w-16 rounded-md overflow-hidden shrink-0 ${!img ? (light ? 'stripe-placeholder-light' : 'stripe-placeholder') : ''} flex items-center justify-center cond font-extrabold text-gold/80 text-[18px]`}>
        {img
          ? <img src={img} alt={nombre} className="h-full w-full object-cover" />
          : nombre.charAt(0)}
      </div>
      <div className="min-w-0">
        <div className={`text-[14px] font-semibold leading-tight truncate ${light ? 'text-ink-900' : 'text-white'}`}>{nombre}</div>
        <div className={`text-[12px] mt-0.5 ${light ? 'text-ink-500' : 'text-white/55'}`}>{item.productos?.slug || ''}</div>
        <div className={`mt-2 inline-flex items-center border ${light ? 'border-ink-200' : 'border-white/15'} rounded-md overflow-hidden`}>
          <button
            onClick={() => actualizarCantidad(item.id, cantidad - 1)}
            className={`h-8 w-8 cond font-bold ${light ? 'hover:bg-ink-100' : 'hover:bg-white/10'} active:scale-95 transition-transform`}
            aria-label="Disminuir"
          >−</button>
          <span className="cond w-8 text-center text-[14px] font-bold tabular-nums">{cantidad}</span>
          <button
            onClick={() => actualizarCantidad(item.id, cantidad + 1)}
            className={`h-8 w-8 cond font-bold ${light ? 'hover:bg-ink-100' : 'hover:bg-white/10'} active:scale-95 transition-transform`}
            aria-label="Aumentar"
          >+</button>
        </div>
      </div>
      <div className="flex flex-col items-end justify-between">
        <button
          onClick={handleRemove}
          className={`text-[11px] cond tracking-[0.16em] font-semibold ${light ? 'text-ink-400 hover:text-red-600' : 'text-white/40 hover:text-red-400'} transition-colors`}
        >QUITAR</button>
        <div className="cond text-gold font-extrabold text-[15px] tabular-nums">{formatCOP(cantidad * precio)}</div>
      </div>
    </div>
  )
}

interface Props { open: boolean; onClose: () => void; light: boolean }

export default function CarritoDrawer({ open, onClose, light }: Props) {
  const { items, totalItems, subtotal, envio, descuentos, total, limpiarCarrito } = useCarrito() as any
  const isEmpty = !items || items.length === 0
  const sub = subtotal || 0
  const freeShipDelta = Math.max(0, FREE_SHIP_THRESHOLD - sub)
  const freeShipPct = Math.min(100, (sub / FREE_SHIP_THRESHOLD) * 100)
  const hair = light ? 'border-ink-100' : 'border-white/[.06]'

  const footer = !isEmpty ? (
    <div className={`p-5 ${light ? 'bg-ink-50' : 'bg-black/40'} space-y-3`}>
      <div className="space-y-1.5 text-[13px]">
        <div className="flex justify-between">
          <span className={light ? 'text-ink-500' : 'text-white/60'}>Subtotal</span>
          <span className="cond font-bold tabular-nums">{formatCOPFull(sub)}</span>
        </div>
        <div className="flex justify-between">
          <span className={light ? 'text-ink-500' : 'text-white/60'}>Envío</span>
          <span className="cond font-bold tabular-nums">
            {(envio || 0) === 0
              ? <span className="text-gold">GRATIS</span>
              : formatCOPFull(envio || 0)}
          </span>
        </div>
        {(descuentos || 0) > 0 && (
          <div className="flex justify-between">
            <span className="text-gold">Descuento −10%</span>
            <span className="cond font-bold tabular-nums text-gold">− {formatCOPFull(descuentos || 0)}</span>
          </div>
        )}
        <div className={`pt-2 mt-1 border-t ${light ? 'border-ink-200' : 'border-white/10'} flex justify-between items-baseline`}>
          <span className="cond text-[12px] tracking-[0.18em] font-bold">TOTAL</span>
          <span className="cond text-[22px] font-extrabold text-gold tabular-nums">{formatCOPFull(total || 0)}</span>
        </div>
      </div>
      <button className="w-full cond bg-gold text-black font-bold tracking-[0.18em] text-[13px] py-3.5 rounded-sm hover:bg-gold-300 transition-colors inline-flex items-center justify-center gap-2 group">
        IR AL CHECKOUT
        <I.ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
      </button>
      <div className="flex items-center justify-between text-[11px]">
        <button
          onClick={() => limpiarCarrito()}
          className={`cond tracking-[0.16em] font-semibold ${light ? 'text-ink-400 hover:text-ink-900' : 'text-white/40 hover:text-white'}`}
        >VACIAR CARRITO</button>
        <span className={`flex items-center gap-1 ${light ? 'text-ink-500' : 'text-white/55'}`}>
          <I.Truck className="h-3.5 w-3.5 text-gold" /> Entrega en 3–6 días hábiles
        </span>
      </div>
    </div>
  ) : null

  return (
    <DrawerDerecho
      open={open}
      onClose={onClose}
      title="MI CARRITO"
      subtitle={isEmpty ? 'Tu carrito está vacío' : `${totalItems} producto${totalItems === 1 ? '' : 's'} listos para enviar`}
      accentBadge={!isEmpty ? totalItems : null}
      footer={footer}
      light={light}
    >
      {!isEmpty && (
        <div className={`px-5 py-4 border-b ${hair} ${light ? 'bg-ink-50/60' : 'bg-white/[.02]'}`}>
          {freeShipDelta > 0 ? (
            <div>
              <div className={`text-[12px] mb-2 ${light ? 'text-ink-700' : 'text-white/75'}`}>
                Te faltan <span className="cond font-bold text-gold">{formatCOPFull(freeShipDelta)}</span> para envío gratis
              </div>
              <div className={`h-1.5 rounded-full overflow-hidden ${light ? 'bg-ink-100' : 'bg-white/10'}`}>
                <div
                  className="h-full bg-gradient-to-r from-gold-300 to-gold rounded-full transition-all duration-700"
                  style={{ width: `${freeShipPct}%` }}
                />
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-[13px] text-gold cond font-semibold tracking-wide">
              <I.Truck className="h-4 w-4" /> ¡Tienes envío gratis a toda Colombia!
            </div>
          )}
        </div>
      )}

      {isEmpty ? (
        <div className="px-6 py-14 text-center">
          <div className={`mx-auto h-20 w-20 rounded-full flex items-center justify-center ${light ? 'bg-ink-100' : 'bg-white/[.05]'}`}>
            <I.Cart className={`h-9 w-9 ${light ? 'text-ink-300' : 'text-white/30'}`} />
          </div>
          <h3 className="cond mt-5 text-[20px] font-extrabold tracking-[0.06em]">TU CARRITO ESTÁ VACÍO</h3>
          <p className={`mt-1.5 text-[13px] max-w-xs mx-auto ${light ? 'text-ink-500' : 'text-white/55'}`}>
            Explora acordeones, repuestos y accesorios — agrega cualquier cosa con un solo clic.
          </p>
        </div>
      ) : (
        <div>{(items as any[]).map((item) => <ItemCarrito key={item.id} item={item} light={light} />)}</div>
      )}
    </DrawerDerecho>
  )
}
