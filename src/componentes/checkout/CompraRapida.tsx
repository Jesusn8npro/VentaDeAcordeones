'use client'

import { useEffect, useMemo, useState } from 'react'
import { createPortal } from 'react-dom'
import Image from 'next/image'
import { X, ShoppingCart, ShieldCheck, Truck, Loader2 } from 'lucide-react'
import { useAuth } from '@/contextos/ContextoAutenticacion'
import { useCarrito } from '@/contextos/CarritoContext'
import { formatearPrecioCOP } from '@/utilidades/formatoPrecio'
import { abrirPagoConSesion } from '@/hooks/usarEpayco'
import './CompraRapida.css'

/**
 * Compra rápida: comprar un producto sin pasar por el carrito ni por los cuatro pasos
 * del checkout. Un solo formulario, los datos imprescindibles y a pagar.
 *
 * El pedido y la sesión de pago los crea el servidor (app/api/pedidos/crear): aquí solo
 * se recogen los datos de envío. El importe nunca se calcula en el navegador.
 *
 * Quien prefiera seguir mirando tiene, en el mismo sitio, el botón de añadir al carrito.
 */

const DEPARTAMENTOS = [
  'Amazonas', 'Antioquia', 'Arauca', 'Atlántico', 'Bogotá D.C.', 'Bolívar', 'Boyacá', 'Caldas',
  'Caquetá', 'Casanare', 'Cauca', 'Cesar', 'Chocó', 'Córdoba', 'Cundinamarca', 'Guainía',
  'Guaviare', 'Huila', 'La Guajira', 'Magdalena', 'Meta', 'Nariño', 'Norte de Santander',
  'Putumayo', 'Quindío', 'Risaralda', 'San Andrés y Providencia', 'Santander', 'Sucre',
  'Tolima', 'Valle del Cauca', 'Vaupés', 'Vichada', 'Otro país',
]

const VACIO = {
  nombre: '', apellido: '', email: '', telefono: '',
  tipoDocumento: 'CC', numeroDocumento: '',
  direccion: '', ciudad: '', departamento: '',
}

interface Props {
  producto: any
  abierto: boolean
  alCerrar: () => void
  cantidadInicial?: number
}

export default function CompraRapida({ producto, abierto, alCerrar, cantidadInicial = 1 }: Props) {
  const { usuario } = useAuth()
  const { agregarAlCarrito } = useCarrito()
  const [datos, setDatos] = useState(VACIO)
  const [cantidad, setCantidad] = useState(cantidadInicial)
  const [enviando, setEnviando] = useState(false)
  const [error, setError] = useState<string | null>(null)
  // Pedido que no se puede cobrar en línea (ePayco no acepta importes por encima de
  // 5.000.000). Queda registrado igual y la venta se cierra por WhatsApp.
  const [pedidoWhatsapp, setPedidoWhatsapp] = useState<any>(null)
  const [montado, setMontado] = useState(false)

  useEffect(() => setMontado(true), [])

  // Con sesión iniciada, el formulario ya viene lleno: menos fricción, menos abandono.
  useEffect(() => {
    if (!usuario) return
    setDatos((d) => ({
      ...d,
      nombre: d.nombre || usuario.nombre || '',
      apellido: d.apellido || usuario.apellido || '',
      email: d.email || usuario.email || '',
      telefono: d.telefono || usuario.telefono || '',
    }))
  }, [usuario])

  // El teclado del móvil no debe empujar la página de detrás.
  useEffect(() => {
    if (!abierto) return
    const previo = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = previo }
  }, [abierto])

  useEffect(() => {
    if (!abierto) return
    const alPulsar = (e: KeyboardEvent) => { if (e.key === 'Escape') alCerrar() }
    window.addEventListener('keydown', alPulsar)
    return () => window.removeEventListener('keydown', alPulsar)
  }, [abierto, alCerrar])

  const precio = Number(producto?.precio) || 0
  const precioOriginal = Number(producto?.precio_original) || 0
  const stock = Number(producto?.stock ?? 0)
  const maximo = Math.max(1, Math.min(10, stock || 10))
  const imagen = producto?.fotos_principales?.[0] || producto?.imagenes?.imagen_principal || null

  // Orientativo: el total de verdad lo calcula y lo devuelve el servidor.
  const estimado = useMemo(() => {
    const sub = precio * cantidad
    const envio = sub >= 50000 ? 0 : 5000
    const descuento = sub >= 100000 ? Math.round(sub * 0.1) : 0
    return { sub, envio, descuento, total: sub + envio - descuento }
  }, [precio, cantidad])

  const cambiar = (campo: string, valor: string) => {
    setDatos((d) => ({ ...d, [campo]: valor }))
    if (error) setError(null)
  }

  const faltantes = () => {
    const obligatorios: Array<[string, string]> = [
      ['nombre', 'tu nombre'], ['apellido', 'tu apellido'], ['email', 'tu correo'],
      ['telefono', 'tu WhatsApp'], ['numeroDocumento', 'tu documento'],
      ['direccion', 'la dirección'], ['ciudad', 'la ciudad'], ['departamento', 'el departamento'],
    ]
    return obligatorios.filter(([campo]) => !String((datos as any)[campo]).trim()).map(([, etiqueta]) => etiqueta)
  }

  const pagar = async () => {
    const faltan = faltantes()
    if (faltan.length) {
      setError(`Nos falta ${faltan.slice(0, 3).join(', ')}${faltan.length > 3 ? ' y algún dato más' : ''}.`)
      return
    }
    setEnviando(true)
    setError(null)
    try {
      const respuesta = await fetch('/api/pedidos/crear', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: [{ producto_id: producto.id, cantidad }],
          cliente: datos,
          usuario_id: usuario?.id || null,
        }),
      })
      const pedido = await respuesta.json().catch(() => ({}))
      if (!respuesta.ok) throw new Error(pedido?.error || 'No pudimos registrar el pedido')

      // El pedido ya está guardado. Si la pasarela no puede cobrarlo (importe fuera de
      // su rango o caída), no se pierde la venta: se pasa a WhatsApp con el número delante.
      if (!pedido.sessionId) {
        setPedidoWhatsapp(pedido)
        return
      }
      await abrirPagoConSesion(pedido.sessionId)
      alCerrar()
    } catch (e: any) {
      setError(e?.message || 'No pudimos abrir el pago. Intenta de nuevo.')
    } finally {
      setEnviando(false)
    }
  }

  const alCarrito = async () => {
    try {
      await agregarAlCarrito(producto, cantidad)
      alCerrar()
    } catch (e: any) {
      setError(e?.message || 'No pudimos añadirlo al carrito.')
    }
  }

  if (!abierto || !montado) return null

  if (pedidoWhatsapp) {
    const motivo =
      pedidoWhatsapp.pagoEnLinea === 'monto_alto'
        ? `El pago en línea admite hasta ${formatearPrecioCOP(pedidoWhatsapp.limitePagoEnLinea || 5000000)} por transacción, así que este lo cerramos contigo directamente.`
        : 'La pasarela no está disponible en este momento, así que lo cerramos contigo directamente.'
    const texto = encodeURIComponent(
      `Hola, quiero completar mi pedido ${pedidoWhatsapp.numero_pedido}: ${producto.nombre}` +
        ` (${cantidad} ${cantidad === 1 ? 'unidad' : 'unidades'}) por ${formatearPrecioCOP(pedidoWhatsapp.total)}.`,
    )
    return createPortal(
      <div className="cr-fondo" role="dialog" aria-modal="true" onClick={alCerrar}>
        <div className="cr-panel cr-panel-wa" onClick={(e) => e.stopPropagation()}>
          <button className="cr-cerrar" onClick={alCerrar} aria-label="Cerrar"><X size={18} /></button>
          <div className="cr-encabezado">
            <span className="cr-eyebrow">Pedido {pedidoWhatsapp.numero_pedido}</span>
            <h2 className="cr-titulo">Tu pedido quedó reservado</h2>
          </div>
          <p className="cr-wa-texto">{motivo}</p>
          <p className="cr-wa-texto">
            Escríbenos y coordinamos el pago: transferencia, consignación, pago contra entrega o el
            enlace de pago que prefieras. Te responde un maestro acordeonero, no un robot.
          </p>
          <div className="cr-resumen">
            <div><span>{producto.nombre}</span><span>×{cantidad}</span></div>
            <div className="cr-total"><span>Total</span><span>{formatearPrecioCOP(pedidoWhatsapp.total)}</span></div>
          </div>
          <a className="cr-pagar cr-pagar-wa" href={`https://wa.me/573144865310?text=${texto}`} target="_blank" rel="noopener noreferrer">
            Continuar por WhatsApp
          </a>
          <button className="cr-carrito" onClick={alCerrar}>Seguir viendo la tienda</button>
        </div>
      </div>,
      document.body,
    )
  }

  return createPortal(
    <div className="cr-fondo" role="dialog" aria-modal="true" aria-label="Compra rápida" onClick={alCerrar}>
      <div className="cr-panel" onClick={(e) => e.stopPropagation()}>
        <button className="cr-cerrar" onClick={alCerrar} aria-label="Cerrar">
          <X size={18} />
        </button>

        <div className="cr-encabezado">
          <span className="cr-eyebrow">Compra rápida</span>
          <h2 className="cr-titulo">Termina en un paso</h2>
        </div>

        <div className="cr-producto">
          {imagen && (
            <div className="cr-foto">
              <Image src={imagen} alt={producto.nombre} width={120} height={120} sizes="120px" />
            </div>
          )}
          <div className="cr-producto-datos">
            <p className="cr-producto-nombre">{producto.nombre}</p>
            <div className="cr-precios">
              <strong>{formatearPrecioCOP(precio)}</strong>
              {precioOriginal > precio && <s>{formatearPrecioCOP(precioOriginal)}</s>}
            </div>
            <div className="cr-cantidad">
              <button type="button" onClick={() => setCantidad((c) => Math.max(1, c - 1))} aria-label="Quitar una unidad">−</button>
              <span aria-live="polite">{cantidad}</span>
              <button type="button" onClick={() => setCantidad((c) => Math.min(maximo, c + 1))} aria-label="Añadir una unidad">+</button>
            </div>
          </div>
        </div>

        <div className="cr-campos">
          <div className="cr-fila">
            <label>Nombre<input value={datos.nombre} onChange={(e) => cambiar('nombre', e.target.value)} autoComplete="given-name" /></label>
            <label>Apellido<input value={datos.apellido} onChange={(e) => cambiar('apellido', e.target.value)} autoComplete="family-name" /></label>
          </div>
          <div className="cr-fila">
            <label>Correo<input type="email" value={datos.email} onChange={(e) => cambiar('email', e.target.value)} autoComplete="email" inputMode="email" /></label>
            <label>WhatsApp<input type="tel" value={datos.telefono} onChange={(e) => cambiar('telefono', e.target.value)} autoComplete="tel" inputMode="tel" placeholder="300 123 4567" /></label>
          </div>
          <div className="cr-fila">
            <label className="cr-corto">Doc.
              <select value={datos.tipoDocumento} onChange={(e) => cambiar('tipoDocumento', e.target.value)}>
                <option value="CC">CC</option><option value="CE">CE</option>
                <option value="TI">TI</option><option value="PP">PP</option><option value="NIT">NIT</option>
              </select>
            </label>
            <label>Número<input value={datos.numeroDocumento} onChange={(e) => cambiar('numeroDocumento', e.target.value)} inputMode="numeric" /></label>
          </div>
          <label>Dirección de entrega<input value={datos.direccion} onChange={(e) => cambiar('direccion', e.target.value)} autoComplete="street-address" placeholder="Calle 123 #45-67, apto 8B" /></label>
          <div className="cr-fila">
            <label>Ciudad<input value={datos.ciudad} onChange={(e) => cambiar('ciudad', e.target.value)} autoComplete="address-level2" /></label>
            <label>Departamento
              <select value={datos.departamento} onChange={(e) => cambiar('departamento', e.target.value)}>
                <option value="">Elige…</option>
                {DEPARTAMENTOS.map((d) => <option key={d} value={d}>{d}</option>)}
              </select>
            </label>
          </div>
        </div>

        <div className="cr-resumen">
          <div><span>Subtotal</span><span>{formatearPrecioCOP(estimado.sub)}</span></div>
          {estimado.descuento > 0 && (
            <div className="cr-descuento"><span>Descuento por compra +$100.000 (10%)</span><span>−{formatearPrecioCOP(estimado.descuento)}</span></div>
          )}
          <div><span>Envío</span><span>{estimado.envio === 0 ? 'Gratis' : formatearPrecioCOP(estimado.envio)}</span></div>
          <div className="cr-total"><span>Total</span><span>{formatearPrecioCOP(estimado.total)}</span></div>
        </div>

        {error && <p className="cr-error" role="alert">{error}</p>}

        <button className="cr-pagar" onClick={pagar} disabled={enviando}>
          {enviando ? <><Loader2 size={18} className="cr-girando" /> Abriendo el pago…</> : <>Pagar {formatearPrecioCOP(estimado.total)}</>}
        </button>

        <button className="cr-carrito" onClick={alCarrito} disabled={enviando}>
          <ShoppingCart size={16} /> Añadir al carrito y seguir viendo
        </button>

        <div className="cr-confianza">
          <span><ShieldCheck size={14} /> Pago seguro con ePayco</span>
          <span><Truck size={14} /> Envío a toda Colombia</span>
        </div>
      </div>
    </div>,
    document.body,
  )
}
