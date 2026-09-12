'use client'

// Pantalla a la que vuelve el cliente después de pagar (/respuesta-epayco).
//
// Es el momento de más confianza de toda la compra, así que manda lo que el cliente necesita
// saber — qué pasó, cuál es su número de pedido, qué compró, qué sigue y cómo hablar con
// nosotros — y los códigos de ePayco quedan en un desplegable.
//
// Lógica de datos (igual que antes, más completa):
//   1. ePayco a veces devuelve sus x_* en la URL de retorno y a veces no (depende del medio de
//      pago). Si vienen, se registran con servicioEpayco y mandan sobre el estado.
//   2. Nuestro propio número de pedido SIEMPRE viaja en `ref` (lo pone /api/pedidos/crear), así
//      que consultamos /api/pedidos/estado con él para saber qué compró y cuánto pagó de verdad.
//      Antes, cuando ePayco sí mandaba los x_*, el resumen decía "Producto no encontrado".

import { useEffect, useRef, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { useCarrito } from '../../../contextos/CarritoContext'
import { formatearPrecioCOP } from '../../../utilidades/formatoPrecio'
import servicioEpayco from '../../../servicios/epayco/servicioEpayco'
import './PaginaRespuestaEpayco.css'

type EstadoPago = 'exitoso' | 'pendiente' | 'rechazado'

interface ProductoPedido { nombre?: string; cantidad?: number }

interface DatosPago {
  estado: EstadoPago
  numeroPedido: string | null
  total: number | null
  productos: ProductoPedido[]
  /* Sólo para el desplegable de detalles técnicos. */
  tecnicos: { etiqueta: string; valor: string }[]
  motivo: string | null
  prueba: boolean
}

const NUMERO_WA = '573144865310'
const wa = (texto: string) => `https://wa.me/${NUMERO_WA}?text=${encodeURIComponent(texto)}`

const COPIA: Record<EstadoPago, { tag: string; titulo: string; entrada: string }> = {
  exitoso: {
    tag: 'Pedido confirmado',
    titulo: 'Listo, tu pago quedó aprobado',
    entrada: 'Ya tenemos tu pedido y hoy mismo entra en preparación en el taller.',
  },
  pendiente: {
    tag: 'Pago en verificación',
    titulo: 'Tu pago está en verificación',
    entrada: 'Algunos medios de pago (PSE, transferencia, efectivo) tardan en confirmar. Apenas el banco responda, tu pedido entra en preparación.',
  },
  rechazado: {
    tag: 'Pago no aprobado',
    titulo: 'El banco no aprobó este pago',
    entrada: 'No se hizo ningún cobro. Pasa todos los días y casi siempre se resuelve al segundo intento o con otro medio de pago.',
  },
}

// Tiempos reales de /politica-envio. Si allá cambian, aquí también.
const PASOS = [
  { titulo: 'Pedido registrado', texto: 'Quedó guardado con el número de arriba. Con ese número te atendemos por WhatsApp y en el taller.' },
  { titulo: 'Preparación', texto: 'Revisamos y empacamos el instrumento antes de despacharlo. El procesamiento toma unas 24 horas hábiles.' },
  { titulo: 'Envío', texto: 'Ciudades principales: 48 a 72 horas hábiles. Intermedias: 3 a 5 días. Municipios: 5 a 8 días. Zonas rurales: 8 a 10 días.' },
]

const Icono = ({ d, tamano = 18 }: { d: string; tamano?: number }) => (
  <svg width={tamano} height={tamano} viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d={d} />
  </svg>
)
const D = {
  check: 'M20 6 9 17l-5-5',
  alerta: 'M12 8v5M12 17h.01M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z',
  reloj: 'M12 7v5l3 2M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18z',
  copiar: 'M9 9h10v10H9zM5 15H4a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v1',
  wa: 'M20.5 3.5A10 10 0 0 0 3.4 15.2L2 22l7-1.8A10 10 0 1 0 20.5 3.5zM9 8c.3 0 .6.4.8.9l.5 1.2c.1.3 0 .6-.2.8l-.5.5c.7 1.4 1.6 2.3 3 3l.5-.5c.2-.2.5-.3.8-.2l1.2.5c.5.2.9.5.9.8 0 1-.8 1.8-1.8 1.8A8.5 8.5 0 0 1 7.2 9.8C7.2 8.8 8 8 9 8z',
  flecha: 'M5 12h14M13 6l6 6-6 6',
  bolsa: 'M6 7h12l1 13H5zM9 7V5a3 3 0 0 1 6 0v2',
  chevron: 'M6 9l6 6 6-6',
  refrescar: 'M21 12a9 9 0 1 1-3-6.7M21 4v5h-5',
}

export default function PaginaRespuestaEpayco() {
  const searchParams = useSearchParams()
  const { limpiarCarrito } = useCarrito()
  const [datos, setDatos] = useState<DatosPago | null>(null)
  const [cargando, setCargando] = useState(true)
  const [copiado, setCopiado] = useState(false)
  const yaProcesado = useRef(false)

  useEffect(() => {
    // El objeto searchParams cambia de identidad en cada render: sin esta guarda se volvería
    // a registrar la misma transacción en ePayco más de una vez.
    if (yaProcesado.current) return
    yaProcesado.current = true

    const procesar = async () => {
      const p = (k: string) => searchParams.get(k)
      const refPayco = p('x_ref_payco') || p('ref_payco')
      const respuesta = p('x_response') || p('estado')
      const codRespuesta = p('x_cod_response')
      const numeroPedido = p('ref')

      // 1. Registrar la respuesta de ePayco cuando llega (no bloquea la pantalla si falla).
      if (refPayco) {
        try {
          await servicioEpayco.registrarTransaccion({
            referenciaPago: refPayco,
            estado: respuesta,
            tipo: 'response',
            respuestaCompleta: Object.fromEntries(searchParams.entries()),
          })
        } catch { /* la pantalla no depende de esto */ }
      }

      // 2. Pedirle al servidor lo que ePayco no manda: qué compró y por cuánto.
      let pedido: any = null
      if (numeroPedido) {
        try {
          const r = await fetch(`/api/pedidos/estado?ref=${encodeURIComponent(numeroPedido)}`)
          if (r.ok) pedido = await r.json()
        } catch { /* seguimos con lo que traiga la URL */ }
      }

      if (!refPayco && !pedido) { setCargando(false); return }

      // 3. Estado: manda ePayco si contestó; si no, lo que diga el pedido en base de datos.
      let estado: EstadoPago = 'pendiente'
      if (respuesta === 'Aceptada' || codRespuesta === '1') estado = 'exitoso'
      else if (respuesta === 'Rechazada' || respuesta === 'Fallida' || codRespuesta === '2' || codRespuesta === '4') estado = 'rechazado'
      else if (!respuesta && pedido) estado = pedido.estado === 'pagado' ? 'exitoso' : 'pendiente'

      const montoEpayco = p('x_amount') ? parseFloat(p('x_amount') as string) : null
      const tecnicos = [
        ['Referencia ePayco', refPayco],
        ['Código de autorización', p('x_approval_code')],
        ['ID de transacción', p('x_transaction_id')],
        ['Franquicia', p('x_franchise')],
        ['Banco', p('x_bank_name')],
        ['Fecha de la transacción', p('x_fecha_transaccion')],
        ['Recibo', p('x_receipt')],
        ['Medio de pago', pedido?.metodo_pago],
      ].filter(([, v]) => Boolean(v)).map(([etiqueta, valor]) => ({ etiqueta: etiqueta as string, valor: String(valor) }))

      setDatos({
        estado,
        numeroPedido: pedido?.numero_pedido || numeroPedido,
        total: pedido?.total ?? montoEpayco,
        productos: Array.isArray(pedido?.productos) ? pedido.productos.filter((x: ProductoPedido) => x?.nombre) : [],
        tecnicos,
        motivo: p('x_response_reason_text'),
        prueba: p('x_test_request') === 'TRUE',
      })

      if (estado === 'exitoso') limpiarCarrito()
      setCargando(false)
    }

    procesar()
  }, [searchParams, limpiarCarrito])

  const copiar = async (texto: string) => {
    try {
      await navigator.clipboard.writeText(texto)
    } catch {
      // Navegadores sin permiso de portapapeles (o http): selección manual como respaldo.
      const campo = document.createElement('textarea')
      campo.value = texto
      campo.style.position = 'fixed'
      campo.style.opacity = '0'
      document.body.appendChild(campo)
      campo.select()
      try { document.execCommand('copy') } catch { /* el número igual se ve en pantalla */ }
      document.body.removeChild(campo)
    }
    setCopiado(true)
    setTimeout(() => setCopiado(false), 2200)
  }

  if (cargando) {
    return (
      <main className="rp">
        <div className="rp-caja rp-cargando" role="status" aria-live="polite">
          <span className="rp-spinner" />
          <p>Confirmando tu pago…</p>
        </div>
      </main>
    )
  }

  // Sin datos: ni ePayco contestó ni encontramos el pedido. Nunca dejarlo en un callejón.
  if (!datos) {
    return (
      <main className="rp">
        <div className="rp-caja">
          <div className="rp-cabecera rp-pendiente">
            <span className="rp-icono"><Icono d={D.alerta} tamano={26} /></span>
            <div>
              <div className="rp-tag">Sin confirmación</div>
              <h1 className="rp-titulo">No pudimos leer los datos de este pago</h1>
              <p className="rp-entrada">
                Puede que el enlace se haya abierto incompleto. Si ya pagaste, tu pedido existe:
                escríbenos con tu nombre y te confirmamos en minutos en qué quedó.
              </p>
            </div>
          </div>
          <div className="rp-acciones">
            <a href={wa('Hola, acabo de pagar en la tienda y la página no me mostró la confirmación. ¿Me ayudan a verificar mi pedido?')} target="_blank" rel="noopener noreferrer" className="rp-btn rp-btn-wa">
              <Icono d={D.wa} tamano={16} /> Verificar por WhatsApp
            </a>
            <Link href="/tienda" className="rp-btn rp-btn-fantasma"><Icono d={D.bolsa} tamano={16} /> Volver a la tienda</Link>
          </div>
        </div>
      </main>
    )
  }

  const { estado, numeroPedido, total, productos, tecnicos, motivo, prueba } = datos
  const copia = COPIA[estado]
  const iconoEstado = estado === 'exitoso' ? D.check : estado === 'rechazado' ? D.alerta : D.reloj
  const textoWa = numeroPedido
    ? (estado === 'rechazado'
      ? `Hola, mi pago del pedido ${numeroPedido} fue rechazado. ¿Me ayudan a completarlo?`
      : `Hola, acabo de hacer el pedido ${numeroPedido}. Quiero confirmar el envío.`)
    : 'Hola, acabo de hacer un pedido en la tienda y quiero confirmarlo.'

  return (
    <main className="rp">
      <div className="rp-caja">
        {/* ── Qué pasó ── */}
        <header className={`rp-cabecera rp-${estado}`}>
          <span className="rp-icono"><Icono d={iconoEstado} tamano={26} /></span>
          <div>
            <div className="rp-tag">{copia.tag}</div>
            <h1 className="rp-titulo">{copia.titulo}</h1>
            <p className="rp-entrada">{copia.entrada}</p>
            {prueba ? <p className="rp-aviso-prueba">Transacción en modo de pruebas: no es una compra real.</p> : null}
          </div>
        </header>

        {/* ── Número de pedido ── */}
        {numeroPedido ? (
          <section className="rp-pedido" aria-labelledby="rp-pedido-t">
            <div>
              <div className="rp-etiqueta" id="rp-pedido-t">Tu número de pedido</div>
              <p className="rp-numero">{numeroPedido}</p>
              <p className="rp-pista">Guárdalo. Es con lo que te atendemos por WhatsApp y en el taller.</p>
            </div>
            <button type="button" className="rp-copiar" onClick={() => copiar(numeroPedido)} aria-live="polite">
              <Icono d={copiado ? D.check : D.copiar} tamano={15} />
              {copiado ? 'Copiado' : 'Copiar'}
            </button>
          </section>
        ) : null}

        {/* ── Qué compraste ── */}
        {(productos.length > 0 || total) ? (
          <section className="rp-bloque" aria-labelledby="rp-compra-t">
            <h2 className="rp-h2" id="rp-compra-t">Qué compraste</h2>
            {productos.length > 0 ? (
              <ul className="rp-productos">
                {productos.map((prod, i) => (
                  <li key={`${prod.nombre}-${i}`}>
                    <span className="rp-prod-nombre">{prod.nombre}</span>
                    <span className="rp-prod-cant">× {prod.cantidad || 1}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="rp-texto">El detalle completo de los artículos queda en tu pedido. Te lo confirmamos por WhatsApp cuando quieras.</p>
            )}
            {total ? (
              <div className="rp-total">
                <span>Total {estado === 'exitoso' ? 'pagado' : 'del pedido'}</span>
                <strong>{formatearPrecioCOP(total)}</strong>
              </div>
            ) : null}
          </section>
        ) : null}

        {/* ── Qué pasa ahora ── */}
        {estado !== 'rechazado' ? (
          <section className="rp-bloque" aria-labelledby="rp-ahora-t">
            <h2 className="rp-h2" id="rp-ahora-t">Qué pasa ahora</h2>
            <ol className="rp-pasos">
              {PASOS.map((paso, i) => (
                <li key={paso.titulo} className={estado === 'exitoso' && i === 0 ? 'rp-paso-hecho' : undefined}>
                  <div>
                    <h3>{paso.titulo}</h3>
                    <p>{paso.texto}</p>
                  </div>
                </li>
              ))}
            </ol>
            <p className="rp-texto rp-texto-fino">
              Los días hábiles van de lunes a viernes sin festivos, y los tiempos de la
              transportadora son estimados.{' '}
              <Link href="/politica-envio">Ver la política de envío completa</Link>.
            </p>
          </section>
        ) : (
          <section className="rp-bloque" aria-labelledby="rp-hacer-t">
            <h2 className="rp-h2" id="rp-hacer-t">Qué puedes hacer</h2>
            <ol className="rp-pasos">
              <li><div><h3>Inténtalo otra vez</h3><p>Tu carrito sigue como lo dejaste. Muchos rechazos son el cupo del día o un dato mal digitado.</p></div></li>
              <li><div><h3>Prueba con otro medio</h3><p>Puedes pagar con PSE, Nequi, otra tarjeta o pedir contra entrega donde esté disponible.</p></div></li>
              <li><div><h3>Escríbenos y lo resolvemos</h3><p>Si el banco sigue rechazando, te ayudamos a completar la compra por WhatsApp sin volver a intentar a ciegas.</p></div></li>
            </ol>
            {motivo ? <p className="rp-texto rp-texto-fino">Lo que reportó el banco: “{motivo}”.</p> : null}
          </section>
        )}

        {/* ── Acciones ── */}
        <div className="rp-acciones">
          <a href={wa(textoWa)} target="_blank" rel="noopener noreferrer" className="rp-btn rp-btn-wa">
            <Icono d={D.wa} tamano={16} />
            {estado === 'rechazado' ? 'Que me ayuden a pagar' : 'Escribir por WhatsApp'}
          </a>
          {estado === 'rechazado' ? (
            <Link href="/carrito" className="rp-btn rp-btn-primario"><Icono d={D.refrescar} tamano={16} /> Intentar de nuevo</Link>
          ) : null}
          {estado === 'pendiente' ? (
            <button type="button" onClick={() => window.location.reload()} className="rp-btn rp-btn-primario">
              <Icono d={D.refrescar} tamano={16} /> Actualizar estado
            </button>
          ) : null}
          <Link href="/perfil/pedidos" className="rp-btn rp-btn-fantasma"><Icono d={D.bolsa} tamano={16} /> Mis pedidos</Link>
          <Link href="/tienda" className="rp-btn rp-btn-fantasma"><Icono d={D.flecha} tamano={16} /> Seguir comprando</Link>
        </div>

        {/* ── Detalles técnicos, fuera del camino ── */}
        {tecnicos.length > 0 ? (
          <details className="rp-detalles">
            <summary>Detalles de la transacción <Icono d={D.chevron} tamano={15} /></summary>
            <dl>
              {tecnicos.map((t) => (
                <div key={t.etiqueta}>
                  <dt>{t.etiqueta}</dt>
                  <dd>{t.valor}</dd>
                </div>
              ))}
            </dl>
          </details>
        ) : null}

        {/* ── Siguiente paso útil ── */}
        <footer className="rp-pie">
          <span>Mientras esperas:</span>
          <Link href="/guia-tonalidades">Guía de tonalidades</Link>
          <Link href="/accesorios">Accesorios</Link>
          <Link href="/taller">Taller y afinación</Link>
          <Link href="/politica-envio">Política de envío</Link>
        </footer>
      </div>
    </main>
  )
}
