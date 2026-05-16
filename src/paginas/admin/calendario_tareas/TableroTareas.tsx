import { useEffect, useMemo, useState } from 'react'
import './CalendarioTareas.css'
import { listarTareas, cambiarEstado, crearTarea, actualizarTarea, borrarTarea } from '../../../servicios/tareasServicio'
import ModalTarea from './componentes/ModalTarea'
import TarjetaTarea from './componentes/TarjetaTarea'

const ESTADOS = ['pendiente', 'en_progreso', 'bloqueado', 'completada']

function Columna({ estado, tareas, onDropTarea, onAgregar, onEditarTarea }) {
  const permitirSoltar = (e) => e.preventDefault()
  const manejarSoltar = (e) => {
    const id = e.dataTransfer.getData('text/tarea-id')
    if (id) onDropTarea(Number(id), estado)
  }
  return (
    <div className="kanban-col" onDragOver={permitirSoltar} onDrop={manejarSoltar}>
      <div className={`kanban-col-header estado-${estado}`}>
        <div className="kanban-col-header-left">
          <span className="kanban-col-titulo">{estado.replace('_', ' ')}</span>
          <span className="kanban-col-contador">{tareas.length}</span>
        </div>
        <button type="button" className="kanban-col-add" title="Agregar tarea" onClick={() => onAgregar && onAgregar(estado)}>+</button>
      </div>
      <div className="kanban-col-cuerpo">
        {tareas.map((t) => (
          <TarjetaTarea key={t.id} tarea={t} onEditar={onEditarTarea} />
        ))}
      </div>
    </div>
  )
}

function TableroTareas() {
  const [tareas, setTareas] = useState([])
  const [cargando, setCargando] = useState(false)
  const [error, setError] = useState('')
  const [modalAbierto, setModalAbierto] = useState(false)
  const [tareaActual, setTareaActual] = useState(null)
  const [estadoActivo, setEstadoActivo] = useState('') // '' = todos

  const cargar = async () => {
    try { setCargando(true); setError(''); const data = await listarTareas(); setTareas(data) } catch (e) { setError(e.message) } finally { setCargando(false) }
  }
  useEffect(() => { cargar() }, [])

  const porEstado = (estado) => tareas.filter((t) => t.estado === estado)

  const conteosPorEstado = useMemo(() => {
    const mapa = { pendiente: 0, en_progreso: 0, bloqueado: 0, completada: 0 }
    for (const t of tareas) { if (mapa[t.estado] !== undefined) mapa[t.estado]++ }
    return mapa
  }, [tareas])

  // vistas adicionales eliminadas; mantenemos tablero por estado

  const onDropTarea = async (id, nuevoEstado) => {
    try { await cambiarEstado(id, nuevoEstado); await cargar() } catch (e) { setError(e.message) }
  }

  const abrirNueva = () => { setTareaActual({ titulo: '', descripcion: '', tipo: 'campaña', estado: 'pendiente', prioridad: 'media' }); setModalAbierto(true) }
  const abrirNuevaEnEstado = (estado) => { setTareaActual({ titulo: '', descripcion: '', tipo: 'campaña', estado, prioridad: 'media' }); setModalAbierto(true) }
  const abrirEdicion = (t) => { setTareaActual(t); setModalAbierto(true) }
  const onGuardar = async (datos) => {
    try { if (datos.id) await actualizarTarea(datos.id, datos); else await crearTarea(datos); setModalAbierto(false); setTareaActual(null); await cargar() } catch (e) { setError(e.message) }
  }
  const onEliminar = async (id) => { if (!window.confirm('¿Eliminar esta tarea?')) return; try { await borrarTarea(id); setModalAbierto(false); setTareaActual(null); await cargar() } catch (e) { setError(e.message) } }

  return (
    <div className="tablero-tareas">
      <div className="kanban-header">
        <div className="kanban-header-left">
          <h1 className="kanban-title">Kanban Dashboard</h1>
          {/* Tabs eliminados por solicitud */}
          <div className="kanban-status-tabs">
            <button className={`status-tab ${estadoActivo === '' ? 'active' : ''}`} onClick={() => setEstadoActivo('')}>Todos</button>
            <button className={`status-tab ${estadoActivo === 'pendiente' ? 'active' : ''}`} onClick={() => setEstadoActivo('pendiente')}>Pendiente <span className="badge">{conteosPorEstado.pendiente}</span></button>
            <button className={`status-tab ${estadoActivo === 'en_progreso' ? 'active' : ''}`} onClick={() => setEstadoActivo('en_progreso')}>En progreso <span className="badge">{conteosPorEstado.en_progreso}</span></button>
            <button className={`status-tab ${estadoActivo === 'bloqueado' ? 'active' : ''}`} onClick={() => setEstadoActivo('bloqueado')}>Bloqueado <span className="badge">{conteosPorEstado.bloqueado}</span></button>
            <button className={`status-tab ${estadoActivo === 'completada' ? 'active' : ''}`} onClick={() => setEstadoActivo('completada')}>Completada <span className="badge">{conteosPorEstado.completada}</span></button>
          </div>
        </div>
        <div className="kanban-header-right">
          {cargando && <span className="chip">Cargando…</span>}
          {error && <span className="chip chip-error">{error}</span>}
          <select className="ordenar-select" defaultValue="nuevo">
            <option value="nuevo">Ordenar: Nuevos</option>
            <option value="antiguo">Ordenar: Antiguos</option>
          </select>
          <button className="btn btn-primario" onClick={abrirNueva}>Nueva tarea</button>
        </div>
      </div>

      <div className={`kanban ${estadoActivo ? 'kanban--single' : ''}`}>
          {(estadoActivo ? [estadoActivo] : ESTADOS).map((estado) => (
          <Columna
            key={estado}
            estado={estado}
            tareas={porEstado(estado)}
            onDropTarea={onDropTarea}
            onAgregar={abrirNuevaEnEstado}
            onEditarTarea={abrirEdicion}
          />
        ))}
      </div>

      <ModalTarea abierto={modalAbierto} tarea={tareaActual} onCerrar={() => { setModalAbierto(false); setTareaActual(null) }} onGuardar={onGuardar} onEliminar={onEliminar} />
    </div>
  )
}

export default TableroTareas