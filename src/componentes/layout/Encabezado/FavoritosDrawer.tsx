'use client'

import DrawerDerecho from './DrawerDerecho'
import { useFavoritos } from '@/contextos/FavoritosContext'
import { useCarrito } from '@/contextos/CarritoContext'
import { I } from '../navIconos'

function formatCOP(n: number) {
  if (n >= 1_000_000) return '$ ' + (n / 1_000_000).toFixed(n % 1_000_000 === 0 ? 0 : 2).replace(/\.?0+$/, '') + 'M'
  return '$ ' + new Intl.NumberFormat('es-CO').format(n)
}

interface Props { open: boolean; onClose: () => void; light: boolean }

export default function FavoritosDrawer({ open, onClose, light }: Props) {
  const { favoritos, quitarFavorito, contadorFavoritos } = useFavoritos()
  const { agregarAlCarrito } = useCarrito() as any
  const hair = light ? 'border-ink-100' : 'border-white/[.06]'

  return (
    <DrawerDerecho
      open={open}
      onClose={onClose}
      title="MIS FAVORITOS"
      subtitle={favoritos.length === 0 ? 'Aún no guardas favoritos' : `${favoritos.length} producto${favoritos.length === 1 ? '' : 's'} guardados`}
      accentBadge={contadorFavoritos > 0 ? contadorFavoritos : null}
      light={light}
    >
      {favoritos.length === 0 ? (
        <div className="px-6 py-14 text-center">
          <div className={`mx-auto h-20 w-20 rounded-full flex items-center justify-center ${light ? 'bg-ink-100' : 'bg-white/[.05]'}`}>
            <I.Heart className={`h-9 w-9 ${light ? 'text-ink-300' : 'text-white/30'}`} />
          </div>
          <h3 className="cond mt-5 text-[20px] font-extrabold tracking-[0.06em]">SIN FAVORITOS</h3>
          <p className={`mt-1.5 text-[13px] max-w-xs mx-auto ${light ? 'text-ink-500' : 'text-white/55'}`}>
            Marca el ícono de corazón en los productos que te gusten para guardarlos aquí.
          </p>
        </div>
      ) : (
        <ul>
          {(favoritos as any[]).map((fav) => (
            <li key={fav.producto_id} className={`flex items-center gap-4 p-4 border-b ${hair}`}>
              <div className={`h-14 w-14 rounded-md overflow-hidden shrink-0 ${!fav.imagen_principal ? (light ? 'stripe-placeholder-light' : 'stripe-placeholder') : ''} flex items-center justify-center cond font-extrabold text-gold/80`}>
                {fav.imagen_principal
                  ? <img src={fav.imagen_principal} alt={fav.producto_nombre || ''} className="h-full w-full object-cover" />
                  : (fav.producto_nombre?.charAt(0) || '?')}
              </div>
              <div className="flex-1 min-w-0">
                <div className={`text-[14px] font-semibold truncate ${light ? 'text-ink-900' : 'text-white'}`}>
                  {fav.producto_nombre || 'Producto'}
                </div>
                <div className={`text-[12px] ${light ? 'text-ink-500' : 'text-white/55'}`}>{fav.slug || ''}</div>
                <div className="cond text-gold font-bold text-[14px] tabular-nums">{formatCOP(fav.precio || 0)}</div>
              </div>
              <div className="flex flex-col gap-2 shrink-0">
                <button
                  onClick={() => agregarAlCarrito({
                    id: fav.producto_id,
                    nombre: fav.producto_nombre,
                    precio: fav.precio,
                    activo: fav.producto_activo ?? true,
                    stock: fav.stock ?? 1,
                    slug: fav.slug,
                    imagen_principal: fav.imagen_principal,
                  })}
                  className="cond text-[11px] tracking-[0.14em] font-bold bg-gold text-black px-3 py-2 rounded-sm hover:bg-gold-300 transition-colors"
                >AL CARRITO</button>
                <button
                  onClick={() => quitarFavorito(fav.producto_id)}
                  className={`cond text-[11px] tracking-[0.14em] font-bold ${light ? 'text-ink-400 hover:text-red-600' : 'text-white/40 hover:text-red-400'} transition-colors`}
                >QUITAR</button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </DrawerDerecho>
  )
}
