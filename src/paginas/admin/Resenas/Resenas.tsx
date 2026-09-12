'use client'

import React, { useCallback, useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import {
  AlertCircle,
  BadgeCheck,
  Check,
  Database,
  EyeOff,
  MessageSquare,
  RefreshCw,
  Star,
  Trash2,
} from 'lucide-react'
import { clienteSupabase } from '../../../configuracion/supabase'
import './Resenas.css'

// ── PANEL DE MODERACIÓN DE RESEÑAS ───────────────────────────────────────────
// POR QUÉ existe: las reseñas verificadas nacen con `aprobada = false`. Sin esta
// pantalla habría que publicarlas escribiendo SQL en Supabase una por una, así que
// no se publicaría ninguna y la sección de opiniones quedaría muerta.
//
// Se pinta como tarjetas y no como tabla porque aquí se LEE un texto largo y se
// decide; una tabla obligaría a abrir un modal por reseña y a hacer scroll lateral
// en el móvil.

const ESTADOS = [
  { valor: 'pendientes', etiqueta: 'Pendientes' },
  { valor: 'aprobadas', etiqueta: 'Publicadas' },
  { valor: 'todas', etiqueta: 'Todas' },
] as const

type Estado = (typeof ESTADOS)[number]['valor']

type Resena = {
  id: string
  calificacion: number
  titulo: string | null
  comentario: string
  nombre_autor: string
  ciudad: string | null
  verificada: boolean
  aprobada: boolean
  respuesta_tienda: string | null
  creado_el: string | null
  moderado_el: string | null
  producto: { id: string; nombre: string; slug: string | null; imagen: string | null }
  cliente: { nombre: string | null; email: string | null }
}

type Conteos = { pendientes: number; aprobadas: number; total: number }

const MAX_RESPUESTA = 1000

function formatearFecha(valor: string | null): string {
  if (!valor) return '—'
  try {
    return new Date(valor).toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' })
  } catch {
    return '—'
  }
}

/** Estrellas pintadas, no un número suelto: se lee de un vistazo al moderar. */
function Estrellas({ valor }: { valor: number }) {
  return (
    <span className="res-adm-estrellas" aria-label={`${valor} de 5 estrellas`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <Star key={n} size={15} className={n <= valor ? 'res-adm-estrella-llena' : 'res-adm-estrella-vacia'} />
      ))}
      <span className="res-adm-estrellas-num">{valor}/5</span>
    </span>
  )
}

export default function Resenas() {
  const [estado, setEstado] = useState<Estado>('pendientes')
  const [resenas, setResenas] = useState<Resena[]>([])
  const [conteos, setConteos] = useState<Conteos>({ pendientes: 0, aprobadas: 0, total: 0 })
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState<string | null>(null)
  // `null` = todavía no sabemos; false = el SQL de reseñas no se ha ejecutado.
  const [tablaLista, setTablaLista] = useState<boolean | null>(null)
  const [trabajando, setTrabajando] = useState<string | null>(null)
  const [respondiendo, setRespondiendo] = useState<string | null>(null)
  const [borrador, setBorrador] = useState('')

  /** Token de la sesión: el endpoint vuelve a comprobar el rol en el servidor. */
  const obtenerToken = useCallback(async () => {
    const { data } = await clienteSupabase.auth.getSession()
    return data?.session?.access_token || null
  }, [])

  const cargar = useCallback(
    async (filtro: Estado) => {
      setCargando(true)
      setError(null)
      try {
        const token = await obtenerToken()
        const respuesta = await fetch(`/api/admin/resenas?estado=${filtro}`, {
          headers: token ? { Authorization: `Bearer ${token}` } : undefined,
          cache: 'no-store',
        })
        const datos = await respuesta.json().catch(() => ({}))
        if (!respuesta.ok) {
          setResenas([])
          setError(datos?.error || 'No pudimos cargar las reseñas.')
          return
        }
        setTablaLista(datos.tablaLista !== false)
        setResenas(Array.isArray(datos.resenas) ? datos.resenas : [])
        setConteos(datos.conteos || { pendientes: 0, aprobadas: 0, total: 0 })
      } catch {
        setError('No pudimos conectar con el servidor.')
      } finally {
        setCargando(false)
      }
    },
    [obtenerToken],
  )

  useEffect(() => {
    cargar(estado)
  }, [estado, cargar])

  /** Aprobar, quitar de la web o guardar la respuesta pública de la tienda. */
  const ejecutar = useCallback(
    async (id: string, accion: 'aprobar' | 'desaprobar' | 'responder', respuesta?: string) => {
      setTrabajando(id)
      setError(null)
      try {
        const token = await obtenerToken()
        const res = await fetch('/api/admin/resenas', {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify({ id, accion, respuesta }),
        })
        const datos = await res.json().catch(() => ({}))
        if (!res.ok) {
          setError(datos?.error || 'No pudimos guardar el cambio.')
          return
        }
        // Se recarga en vez de parchear en memoria: los contadores de la cabecera y
        // el filtro activo tienen que quedar coherentes tras cada decisión.
        setRespondiendo(null)
        await cargar(estado)
      } catch {
        setError('No pudimos conectar con el servidor.')
      } finally {
        setTrabajando(null)
      }
    },
    [cargar, estado, obtenerToken],
  )

  const borrar = useCallback(
    async (resena: Resena) => {
      const aviso = `¿Borrar para siempre la reseña de ${resena.nombre_autor}?\n\nSolo para spam o insultos: si únicamente no quieres publicarla, usa "Quitar de la web".`
      if (!window.confirm(aviso)) return
      setTrabajando(resena.id)
      setError(null)
      try {
        const token = await obtenerToken()
        const res = await fetch(`/api/admin/resenas?id=${encodeURIComponent(resena.id)}`, {
          method: 'DELETE',
          headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        })
        const datos = await res.json().catch(() => ({}))
        if (!res.ok) {
          setError(datos?.error || 'No pudimos borrar la reseña.')
          return
        }
        await cargar(estado)
      } catch {
        setError('No pudimos conectar con el servidor.')
      } finally {
        setTrabajando(null)
      }
    },
    [cargar, estado, obtenerToken],
  )

  const etiquetaFiltro = useMemo(
    () => ({
      pendientes: conteos.pendientes,
      aprobadas: conteos.aprobadas,
      todas: conteos.total,
    }),
    [conteos],
  )

  return (
    <div className="res-adm">
      {/* Cabecera: el contador de pendientes es lo primero que se ve */}
      <header className="res-adm-cabecera">
        <div className="res-adm-titulos">
          <h1 className="res-adm-titulo">
            Reseñas
            {conteos.pendientes > 0 && (
              <span className="res-adm-contador" title="Reseñas esperando tu revisión">
                {conteos.pendientes} sin revisar
              </span>
            )}
          </h1>
          <p className="res-adm-subtitulo">
            Solo opina quien compró. Nada se publica en la web hasta que lo apruebes aquí.
          </p>
        </div>
        <button
          type="button"
          className="res-adm-btn res-adm-btn-sec"
          onClick={() => cargar(estado)}
          disabled={cargando}
        >
          <RefreshCw size={15} className={cargando ? 'res-adm-girando' : undefined} />
          Refrescar
        </button>
      </header>

      {/* Filtros */}
      <div className="res-adm-filtros" role="tablist" aria-label="Estado de las reseñas">
        {ESTADOS.map((f) => (
          <button
            key={f.valor}
            type="button"
            role="tab"
            aria-selected={estado === f.valor}
            className={`res-adm-filtro${estado === f.valor ? ' activo' : ''}`}
            onClick={() => setEstado(f.valor)}
          >
            {f.etiqueta}
            <span className="res-adm-filtro-num">{etiquetaFiltro[f.valor]}</span>
          </button>
        ))}
      </div>

      {error && (
        <div className="res-adm-aviso res-adm-aviso-error" role="alert">
          <AlertCircle size={16} />
          <span>{error}</span>
          <button type="button" className="res-adm-btn res-adm-btn-sec" onClick={() => cargar(estado)}>
            Reintentar
          </button>
        </div>
      )}

      {cargando ? (
        <div className="res-adm-cargando">
          <span className="res-adm-spinner" aria-hidden="true" />
          Cargando reseñas…
        </div>
      ) : tablaLista === false ? (
        /* El SQL todavía no se ejecutó: se explica con calma, no con un error feo */
        <div className="res-adm-vacio">
          <Database size={30} className="res-adm-vacio-icono" />
          <h2 className="res-adm-vacio-titulo">Todavía no está creada la tabla de reseñas</h2>
          <p className="res-adm-vacio-texto">
            Abre Supabase → SQL Editor, pega el archivo{' '}
            <code className="res-adm-codigo">SQL_Para_SUPABASE/2026-09-11_resenas_verificadas.sql</code> y pulsa
            Run. Esta pantalla funcionará sola en cuanto exista la tabla.
          </p>
        </div>
      ) : resenas.length === 0 ? (
        /* Con un error arriba (sesión caducada, sin permiso…) no se pinta el vacío:
           decir "no hay nada por revisar" cuando en realidad no se pudo leer sería
           mentir y haría pensar que no hay reseñas esperando. */
        error ? null : (
        <div className="res-adm-vacio">
          <MessageSquare size={30} className="res-adm-vacio-icono" />
          <h2 className="res-adm-vacio-titulo">
            {estado === 'pendientes' ? 'No hay nada por revisar' : 'Aún no hay reseñas aquí'}
          </h2>
          <p className="res-adm-vacio-texto">
            Las reseñas aparecen en esta lista cuando un cliente que <strong>ya compró</strong> el producto
            escribe la suya desde la ficha. Nadie más puede opinar, por eso llegan de a pocas.
          </p>
        </div>
        )
      ) : (
        <ul className="res-adm-lista">
          {resenas.map((r) => {
            const ocupada = trabajando === r.id
            return (
              <li key={r.id} className={`res-adm-tarjeta${r.aprobada ? '' : ' pendiente'}`}>
                {/* Producto reseñado */}
                <div className="res-adm-producto">
                  {r.producto.imagen ? (
                    <img src={r.producto.imagen} alt="" className="res-adm-miniatura" loading="lazy" />
                  ) : (
                    <span className="res-adm-miniatura res-adm-miniatura-vacia" aria-hidden="true" />
                  )}
                  <div className="res-adm-producto-datos">
                    {r.producto.slug ? (
                      <Link href={`/producto/${r.producto.slug}`} className="res-adm-producto-nombre" target="_blank">
                        {r.producto.nombre}
                      </Link>
                    ) : (
                      <span className="res-adm-producto-nombre">{r.producto.nombre}</span>
                    )}
                    <span className="res-adm-fecha">{formatearFecha(r.creado_el)}</span>
                  </div>
                  <span className={`res-adm-chip ${r.aprobada ? 'res-adm-chip-ok' : 'res-adm-chip-espera'}`}>
                    {r.aprobada ? 'Publicada' : 'Sin revisar'}
                  </span>
                </div>

                {/* Contenido de la reseña */}
                <div className="res-adm-valoracion">
                  <Estrellas valor={r.calificacion} />
                  {r.verificada && (
                    <span className="res-adm-chip res-adm-chip-verificada">
                      <BadgeCheck size={13} /> Compra verificada
                    </span>
                  )}
                </div>

                {r.titulo && <h3 className="res-adm-resena-titulo">{r.titulo}</h3>}
                <p className="res-adm-comentario">{r.comentario}</p>

                <p className="res-adm-autor">
                  {r.nombre_autor}
                  {r.ciudad ? ` · ${r.ciudad}` : ''}
                  {r.cliente.email ? ` · ${r.cliente.email}` : ''}
                </p>

                {r.respuesta_tienda && respondiendo !== r.id && (
                  <div className="res-adm-respuesta">
                    <span className="res-adm-respuesta-etiqueta">Respuesta de la tienda</span>
                    <p className="res-adm-respuesta-texto">{r.respuesta_tienda}</p>
                  </div>
                )}

                {/* Editor de respuesta pública */}
                {respondiendo === r.id && (
                  <div className="res-adm-editor">
                    <label className="res-adm-editor-etiqueta" htmlFor={`respuesta-${r.id}`}>
                      Respuesta de la tienda (se publica debajo de la reseña)
                    </label>
                    <textarea
                      id={`respuesta-${r.id}`}
                      className="res-adm-textarea"
                      value={borrador}
                      maxLength={MAX_RESPUESTA}
                      rows={3}
                      autoFocus
                      onChange={(e) => setBorrador(e.target.value)}
                      placeholder="Gracias por tu compra y por contarlo…"
                    />
                    <div className="res-adm-editor-pie">
                      <span className="res-adm-contador-chars">
                        {borrador.length}/{MAX_RESPUESTA}
                      </span>
                      <button
                        type="button"
                        className="res-adm-btn res-adm-btn-sec"
                        onClick={() => setRespondiendo(null)}
                      >
                        Cancelar
                      </button>
                      <button
                        type="button"
                        className="res-adm-btn res-adm-btn-pri"
                        disabled={ocupada}
                        onClick={() => ejecutar(r.id, 'responder', borrador)}
                      >
                        Guardar respuesta
                      </button>
                    </div>
                  </div>
                )}

                {/* Acciones */}
                <div className="res-adm-acciones">
                  {r.aprobada ? (
                    <button
                      type="button"
                      className="res-adm-btn res-adm-btn-sec"
                      disabled={ocupada}
                      onClick={() => ejecutar(r.id, 'desaprobar')}
                    >
                      <EyeOff size={15} /> Quitar de la web
                    </button>
                  ) : (
                    <button
                      type="button"
                      className="res-adm-btn res-adm-btn-pri"
                      disabled={ocupada}
                      onClick={() => ejecutar(r.id, 'aprobar')}
                    >
                      <Check size={15} /> Publicar
                    </button>
                  )}

                  <button
                    type="button"
                    className="res-adm-btn res-adm-btn-sec"
                    disabled={ocupada}
                    onClick={() => {
                      setRespondiendo(respondiendo === r.id ? null : r.id)
                      setBorrador(r.respuesta_tienda || '')
                    }}
                  >
                    <MessageSquare size={15} /> {r.respuesta_tienda ? 'Editar respuesta' : 'Responder'}
                  </button>

                  <button
                    type="button"
                    className="res-adm-btn res-adm-btn-peligro"
                    disabled={ocupada}
                    onClick={() => borrar(r)}
                    title="Borrar definitivamente (spam o insultos)"
                  >
                    <Trash2 size={15} /> Borrar
                  </button>
                </div>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
