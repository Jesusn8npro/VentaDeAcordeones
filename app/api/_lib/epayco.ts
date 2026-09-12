/**
 * Sesión de pago de ePayco creada EN EL SERVIDOR (checkout v2).
 *
 * Es el mismo flujo que usa AcademiaNext y sustituye al viejo `checkout.js`:
 *   1. POST /login con Basic Auth (PUBLIC_KEY:PRIVATE_KEY) → un token
 *   2. POST /payment/session/create con ese token y el importe → sessionId
 *   3. El navegador solo recibe el sessionId y abre el modal con él
 *
 * Por qué importa: con el método anterior el navegador le pasaba a la pasarela el
 * importe, la referencia y los datos del comprador. Aquí el importe sale del pedido
 * que acaba de crear el servidor y el navegador no puede tocarlo. Además, la clave
 * privada nunca sale de aquí.
 *
 * (El `checkout.js` antiguo tiene otro problema conocido: abre un iframe contra
 * new-checkout.epayco.co, que responde con X-Frame-Options DENY, y el modal puede
 * quedarse en blanco. El v2 con sessionId no pasa por ahí.)
 */

const EPAYCO_API = 'https://apify.epayco.co'

export interface DatosSesionEpayco {
  referencia: string
  nombreProducto: string
  descripcion?: string
  total: number
  base: number
  iva: number
  nombre: string
  apellido?: string
  email: string
  telefono: string
  direccion?: string
  tipoDocumento: string
  numeroDocumento: string
  urlRespuesta: string
  urlConfirmacion: string
}

async function iniciarSesion(publicKey: string, privateKey: string): Promise<string> {
  const credenciales = Buffer.from(`${publicKey}:${privateKey}`).toString('base64')
  const res = await fetch(`${EPAYCO_API}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Basic ${credenciales}` },
    body: JSON.stringify({}),
  })
  if (!res.ok) throw new Error(`login ${res.status}`)
  const datos = await res.json()
  if (!datos?.token) throw new Error('login sin token')
  return datos.token
}

/**
 * Devuelve el sessionId, o `null` si la pasarela no responde o falta configuración.
 * Quien llama decide qué hacer con el null: aquí no se lanza para no tumbar la
 * creación del pedido, que ya está guardado.
 */
export async function crearSesionEpayco(datos: DatosSesionEpayco): Promise<string | null> {
  const publicKey = process.env.NEXT_PUBLIC_EPAYCO_PUBLIC_KEY || process.env.EPAYCO_PUBLIC_KEY
  const privateKey = process.env.EPAYCO_PRIVATE_KEY || process.env.EPAYCO_P_KEY
  if (!publicKey || !privateKey) {
    console.error('[epayco] Faltan EPAYCO_PUBLIC_KEY o EPAYCO_PRIVATE_KEY: no se puede crear la sesión')
    return null
  }

  try {
    const token = await iniciarSesion(publicKey, privateKey)
    const nombreCompleto = `${datos.nombre}${datos.apellido ? ` ${datos.apellido}` : ''}`.trim()

    // ePayco rechaza los importes como texto y también los campos sueltos *Billing:
    // solo admite el objeto `billing`.
    const cuerpo = {
      test: process.env.NEXT_PUBLIC_EPAYCO_TEST_MODE === 'true',
      checkout_version: '2',
      name: datos.nombreProducto.slice(0, 80),
      description: (datos.descripcion || datos.nombreProducto).slice(0, 120),
      currency: 'COP',
      amount: Math.round(datos.total),
      country: 'CO',
      lang: 'ES',
      invoice: datos.referencia,
      taxBase: Math.round(datos.base),
      tax: Math.round(datos.iva),
      response: datos.urlRespuesta,
      confirmation: datos.urlConfirmacion,
      billing: {
        email: datos.email,
        name: nombreCompleto,
        address: datos.direccion || '',
        typeDoc: datos.tipoDocumento,
        numberDoc: datos.numeroDocumento,
        callingCode: '+57',
        mobilePhone: datos.telefono.replace(/\D/g, '').replace(/^57/, ''),
      },
    }

    const res = await fetch(`${EPAYCO_API}/payment/session/create`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(cuerpo),
    })
    const respuesta = await res.json()
    const sessionId = respuesta?.data?.sessionId ?? respuesta?.sessionId
    if (!res.ok || !sessionId) {
      console.error('[epayco] Sesión rechazada:', res.status, JSON.stringify(respuesta).slice(0, 300))
      return null
    }
    return sessionId
  } catch (error: any) {
    // El detalle se queda en el log del servidor: los mensajes de ePayco llegan a
    // incluir credenciales y nombres de variables de entorno.
    console.error('[epayco] No se pudo crear la sesión:', error?.message)
    return null
  }
}

/**
 * Consulta el estado REAL de una transacción en la API pública de validación de ePayco.
 *
 * Por qué existe: la firma que ePayco manda en la confirmación se calcula con el
 * **P_KEY** del panel, que NO es el PRIVATE_KEY. Mientras el P_KEY no esté bien puesto,
 * la firma no cuadra y ningún pedido pasaría nunca a 'pagado' (el cliente pagaría y la
 * tienda no se enteraría). Esta consulta no usa ninguna clave: se le pide a ePayco, por
 * el ref de la transacción, qué pasó de verdad — y su respuesta manda sobre lo que diga
 * el navegador, que es manipulable.
 *
 * Devuelve los campos x_* tal cual los da ePayco, o `null` si no hay datos.
 */
export async function consultarTransaccionEpayco(refPayco: string): Promise<Record<string, any> | null> {
  const ref = String(refPayco || '').trim()
  if (!ref || !/^[A-Za-z0-9._-]{4,64}$/.test(ref)) return null

  try {
    const res = await fetch(`https://secure.epayco.co/validation/v1/reference/${encodeURIComponent(ref)}`, {
      cache: 'no-store',
      signal: AbortSignal.timeout(12_000),
    })
    if (!res.ok) {
      console.warn(`[epayco/validacion] HTTP ${res.status} para ref ${ref}`)
      return null
    }
    const cuerpo = await res.json()
    if (cuerpo?.success === false || !cuerpo?.data) return null
    return cuerpo.data as Record<string, any>
  } catch (error: any) {
    console.warn('[epayco/validacion] No se pudo consultar:', error?.message)
    return null
  }
}
