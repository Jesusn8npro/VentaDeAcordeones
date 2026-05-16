import { useEffect, useMemo, useState } from 'react'
import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin from '@fullcalendar/interaction'
import './CalendarioTareas.css'
import {
  listarTareas,
  crearTarea,
  actualizarTarea,
  moverTareaFechas,
  borrarTarea,
  colorPorEstado,
  bordePorPrioridad,
} from '../../../servicios/tareasServicio'
import ModalTarea from './componentes/ModalTarea'
import PanelFiltros from './componentes/PanelFiltros'

function CalendarioTareas() {
  const [tareas, setTareas] = useState([])
  const [cargando, setCargando] = useState(false)
  const [error, setError] = useState('')
  const [filtros, setFiltros] = useState({ estado: '', prioridad: '', tipo: '', texto: '' })
  const [modalAbierto, setModalAbierto] = useState(false)
  const [tareaActual, setTareaActual] = useState(null)

  const cargar = async () => {
    try {
      setCargando(true)
      setError('')
      const data = await listarTareas(filtros)
      setTareas(data)
    } catch (e) {
      setError(e.message)
    } finally {
      setCargando(false)
    }
  }

  useEffect(() => { cargar() }, [filtros])

  const eventos = useMemo(() => {
    return tareas.map((t) => ({
      id: String(t.id),
      title: t.titulo,
      start: t.fecha_inicio,
      end: t.fecha_fin,
      color: colorPorEstado(t.estado),
      borderColor: bordePorPrioridad(t.prioridad),
      extendedProps: {
        estado: t.estado,
        prioridad: t.prioridad,
        tipo: t.tipo,
        producto_id: t.producto_id,
        categoria_id: t.categoria_id,
        descripcion: t.descripcion,
      },
    }))
  }, [tareas])

  const onSeleccionarRango = (seleccion) => {
    setTareaActual({
      titulo: '',
      descripcion: '',
      tipo: 'campaña',
      estado: 'pendiente',
      prioridad: 'media',
      fecha_inicio: seleccion.startStr,
      fecha_fin: seleccion.endStr,
      producto_id: null,
      categoria_id: null,
      etiquetas: [],
      dependencias: [],
    })
    setModalAbierto(true)
  }

  const onClickEvento = (info) => {
    const t = tareas.find((x) => String(x.id) === String(info.event.id))
    if (!t) return
    setTareaActual({ ...t })
    setModalAbierto(true)
  }

  const onDropEvento = async (info) => {
    try {
      await moverTareaFechas(Number(info.event.id), info.event.startStr, info.event.endStr)
      await cargar()
    } catch (e) { setError(e.message) }
  }

  const onResizeEvento = async (info) => {
    try {
      await moverTareaFechas(Number(info.event.id), info.event.startStr, info.event.endStr)
      await cargar()
    } catch (e) { setError(e.message) }
  }

  const cerrarModal = () => { setModalAbierto(false); setTareaActual(null) }

  const guardarTarea = async (datos) => {
    try {
      if (datos.id) {
        await actualizarTarea(datos.id, datos)
      } else {
        await crearTarea(datos)
      }
      cerrarModal()
      await cargar()
    } catch (e) { setError(e.message) }
  }

  const eliminarTarea = async (id) => {
    if (!window.confirm('¿Eliminar esta tarea?')) return
    try { await borrarTarea(id); cerrarModal(); await cargar() } catch (e) { setError(e.message) }
  }

  return (
    <div className="calendario-tareas">
      <div className="calendario-header">
        <h1>Calendario de Tareas</h1>
        <div className="estado-carga">
          {cargando && <span className="chip">Cargando…</span>}
          {error && <span className="chip chip-error">{error}</span>}
        </div>
      </div>

      <PanelFiltros filtros={filtros} onChange={setFiltros} />

      <FullCalendar
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        initialView="dayGridMonth"
        headerToolbar={{ left: 'prev,next today', center: 'title', right: 'dayGridMonth,timeGridWeek,timeGridDay' }}
        selectable
        editable
        selectMirror
        dayMaxEvents={true}
        locale="es"
        events={eventos}
        select={onSeleccionarRango}
        eventClick={onClickEvento}
        eventDrop={onDropEvento}
        eventResize={onResizeEvento}
        height="auto"
      />

      <ModalTarea
        abierto={modalAbierto}
        tarea={tareaActual}
        onCerrar={cerrarModal}
        onGuardar={guardarTarea}
        onEliminar={eliminarTarea}
      />
    </div>
  )
}

export default CalendarioTareas