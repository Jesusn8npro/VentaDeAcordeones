import { Clock, Truck, CheckCircle, XCircle } from 'lucide-react'

const FORMATO_MONEDA = new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 })

export function formatearPrecio(valor = 0) {
  try { return FORMATO_MONEDA.format(Number(valor || 0)) } catch { return `$${valor}` }
}

export function formatearFecha(iso: string) {
  if (!iso) return '—'
  const f = new Date(iso)
  return f.toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' })
}

export function formatearFechaHora(iso: string) {
  if (!iso) return '—'
  const f = new Date(iso)
  const hora = f.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })
  return `${f.toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' })} · ${hora}`
}

export const ESTADOS_CONFIG: Record<string, { etiqueta: string; clase: string; icono: any; color: string }> = {
  pendiente:  { etiqueta: 'Pendiente',  clase: 'badge-pendiente', icono: Clock,       color: 'advertencia' },
  en_proceso: { etiqueta: 'En proceso', clase: 'badge-pendiente', icono: Clock,       color: 'advertencia' },
  enviado:    { etiqueta: 'Enviado',    clase: 'badge-enviado',   icono: Truck,       color: 'info' },
  entregado:  { etiqueta: 'Entregado',  clase: 'badge-entregado', icono: CheckCircle, color: 'exito' },
  cancelado:  { etiqueta: 'Cancelado',  clase: 'badge-cancelado', icono: XCircle,     color: 'error' },
}

export const FILTROS_RAPIDOS = [
  { valor: 'todos',     etiqueta: 'Todos' },
  { valor: 'pendiente', etiqueta: 'Pendientes' },
  { valor: 'enviado',   etiqueta: 'Enviados' },
  { valor: 'entregado', etiqueta: 'Entregados' },
  { valor: 'cancelado', etiqueta: 'Cancelados' },
]

export const ESTADOS_OPCIONES = ['pendiente', 'en_proceso', 'enviado', 'entregado', 'cancelado']
