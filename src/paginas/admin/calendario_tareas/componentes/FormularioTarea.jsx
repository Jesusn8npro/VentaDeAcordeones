import { useState, useEffect, useMemo } from 'react'
import { usarProductos } from '../../../../hooks/usarProductos'

function Campo({ label, children }) {
  return (
    <div style={{ marginBottom: 12 }}>
      <label style={{ display: 'block', fontSize: 12, color: '#334155', marginBottom: 4 }}>{label}</label>
      {children}
    </div>
  )
}

function FormularioTarea({ valoresIniciales, onSubmit }) {
  // Memoizar filtros para evitar re-render infinito del hook
  const filtrosProductos = useMemo(() => ({ limite: 200 }), [])
  const { productos, cargando: cargandoProductos, error: errorProductos } = usarProductos(filtrosProductos)

  // Convierte cualquier fecha (ISO o string) a formato compatible con input datetime-local (YYYY-MM-DDTHH:mm)
  const aInputDatetimeLocal = (valor) => {
    if (!valor) return ''
    const d = new Date(valor)
    if (isNaN(d.getTime())) return ''
    const pad = (n) => String(n).padStart(2, '0')
    const yyyy = d.getFullYear()
    const mm = pad(d.getMonth() + 1)
    const dd = pad(d.getDate())
    const hh = pad(d.getHours())
    const mi = pad(d.getMinutes())
    return `${yyyy}-${mm}-${dd}T${hh}:${mi}`
  }

  const [valores, setValores] = useState(() => {
    const base = valoresIniciales || {}
    return {
      ...base,
      fecha_inicio: aInputDatetimeLocal(base.fecha_inicio),
      fecha_fin: aInputDatetimeLocal(base.fecha_fin),
    }
  })
  useEffect(() => {
    const base = valoresIniciales || {}
    setValores({
      ...base,
      fecha_inicio: aInputDatetimeLocal(base.fecha_inicio),
      fecha_fin: aInputDatetimeLocal(base.fecha_fin),
    })
  }, [valoresIniciales])

  const set = (campo, valor) => setValores((v) => ({ ...v, [campo]: valor }))
  const submit = (e) => {
    e.preventDefault()
    // Convertir de datetime-local a ISO para guardar consistente en BD
    const preparar = { ...valores }
    preparar.fecha_inicio = valores.fecha_inicio ? new Date(valores.fecha_inicio).toISOString() : null
    preparar.fecha_fin = valores.fecha_fin ? new Date(valores.fecha_fin).toISOString() : null
    // Normalizar producto_id a número o null
    preparar.producto_id = preparar.producto_id ? Number(preparar.producto_id) : null
    onSubmit(preparar)
  }

  return (
    <form onSubmit={submit}>
      <Campo label="Título">
        <input value={valores.titulo || ''} onChange={(e) => set('titulo', e.target.value)} required style={{ width: '100%', padding: 8, border: '1px solid #cbd5e1', borderRadius: 8 }} />
      </Campo>
      <Campo label="Descripción">
        <textarea value={valores.descripcion || ''} onChange={(e) => set('descripcion', e.target.value)} rows={3} style={{ width: '100%', padding: 8, border: '1px solid #cbd5e1', borderRadius: 8 }} />
      </Campo>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12 }}>
        <Campo label="Tipo">
          <select value={valores.tipo || 'campaña'} onChange={(e) => set('tipo', e.target.value)} style={{ width: '100%', padding: 8, border: '1px solid #cbd5e1', borderRadius: 8 }}>
            <option value="campaña">Campaña</option>
            <option value="contenido">Contenido</option>
            <option value="inventario">Inventario</option>
            <option value="logística">Logística</option>
            <option value="otro">Otro</option>
          </select>
        </Campo>
        <Campo label="Estado">
          <select value={valores.estado || 'pendiente'} onChange={(e) => set('estado', e.target.value)} style={{ width: '100%', padding: 8, border: '1px solid #cbd5e1', borderRadius: 8 }}>
            <option value="pendiente">Pendiente</option>
            <option value="en_progreso">En progreso</option>
            <option value="bloqueado">Bloqueado</option>
            <option value="completada">Completada</option>
          </select>
        </Campo>
        <Campo label="Prioridad">
          <select value={valores.prioridad || 'media'} onChange={(e) => set('prioridad', e.target.value)} style={{ width: '100%', padding: 8, border: '1px solid #cbd5e1', borderRadius: 8 }}>
            <option value="alta">Alta</option>
            <option value="media">Media</option>
            <option value="baja">Baja</option>
          </select>
        </Campo>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 12 }}>
        <Campo label="Fecha inicio">
          <input type="datetime-local" value={valores.fecha_inicio || ''} onChange={(e) => set('fecha_inicio', e.target.value)} style={{ width: '100%', padding: 8, border: '1px solid #cbd5e1', borderRadius: 8 }} />
        </Campo>
        <Campo label="Fecha fin">
          <input type="datetime-local" value={valores.fecha_fin || ''} onChange={(e) => set('fecha_fin', e.target.value)} style={{ width: '100%', padding: 8, border: '1px solid #cbd5e1', borderRadius: 8 }} />
        </Campo>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 12 }}>
        <Campo label="Producto (opcional)">
          <select
            value={valores.producto_id || ''}
            onChange={(e) => set('producto_id', e.target.value)}
            style={{ width: '100%', padding: 8, border: '1px solid #cbd5e1', borderRadius: 8 }}
          >
            <option value="">Sin producto</option>
            {!cargandoProductos && productos.map((p) => (
              <option key={p.id} value={p.id}>{p.nombre}</option>
            ))}
          </select>
          {cargandoProductos && <div style={{ fontSize: 12, color: '#64748b', marginTop: 6 }}>Cargando productos…</div>}
          {!cargandoProductos && productos.length === 0 && !errorProductos && (
            <div style={{ fontSize: 12, color: '#64748b', marginTop: 6 }}>No hay productos disponibles</div>
          )}
          {errorProductos && (
            <div style={{ fontSize: 12, color: '#b91c1c', marginTop: 6 }}>Error cargando productos: {errorProductos}</div>
          )}
        </Campo>
        <Campo label="Categoría ID (opcional)">
          <input value={valores.categoria_id || ''} onChange={(e) => set('categoria_id', e.target.value)} style={{ width: '100%', padding: 8, border: '1px solid #cbd5e1', borderRadius: 8 }} />
        </Campo>
      </div>

      <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 8 }}>
        <button type="submit" className="btn btn-primario">Guardar</button>
      </div>
    </form>
  )
}

export default FormularioTarea