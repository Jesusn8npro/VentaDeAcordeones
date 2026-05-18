import type { Metadata } from 'next'
import RespuestaEpaycoCliente from './RespuestaEpaycoCliente'

export const metadata: Metadata = {
  title: 'Respuesta de pago — VentaDeAcordeones.com',
  robots: { index: false, follow: false },
}

export default function PaginaRespuestaEpaycoRoute() {
  return <RespuestaEpaycoCliente />
}
