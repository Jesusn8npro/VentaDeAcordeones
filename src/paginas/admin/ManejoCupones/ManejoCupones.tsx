import React, { useState, useEffect } from 'react'
import { Plus, Search, Tag, CheckCircle, AlertCircle, RefreshCw, X } from 'lucide-react'
import { clienteSupabase } from '../../../configuracion/supabase'
import { formatearPrecioCOP } from '../../../utilidades/formatoPrecio'
import ModalCupon from './ModalCupon'
import TablaCupones from './TablaCupones'
import './ManejoCupones.css'

const ManejoCupones = () => {
  const [cupones, setCupones] = useState<any[]>([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')
  const [busqueda, setBusqueda] = useState('')
  const [filtroEstado, setFiltroEstado] = useState('todos')
  const [filtroTipo, setFiltroTipo] = useState('todos')

  // Modal
  const [modalAbierto, setModalAbierto] = useState(false)
  const [cuponEditando, setCuponEditando] = useState<any>(null)
  const [modoModal, setModoModal] = useState('crear')

  // Formulario
  const [formulario, setFormulario] = useState({
    codigo: '', nombre: '', descripcion: '', tipoDescuento: 'porcentaje',
    valorDescuento: '', montoMinimoCompra: '', descuentoMaximo: '',
    usosPorUsuario: 1, usosMaximos: '', soloprimeraCompra: false,
    fechaInicio: '', fechaFin: '', activo: true
  })

  // Bulk ops
  const [seleccionados, setSeleccionados] = useState<string[]>([])
  const [aplicandoBulk, setAplicandoBulk] = useState(false)

  useEffect(() => { cargarCupones() }, [])

  const cargarCupones = async () => {
    try {
      setCargando(true)
      const { data, error } = await clienteSupabase
        .from('codigos_descuento')
        .select('*')
        .order('creado_el', { ascending: false })
      if (error) throw error
      setCupones(data || [])
      setSeleccionados([])
    } catch {
      setError('Error al cargar los cupones')
    } finally {
      setCargando(false)
    }
  }

  const cuponesFiltrados = cupones.filter(cupon => {
    const coincideBusqueda =
      cupon.codigo.toLowerCase().includes(busqueda.toLowerCase()) ||
      cupon.nombre.toLowerCase().includes(busqueda.toLowerCase())
    const coincideEstado = filtroEstado === 'todos' ||
      (filtroEstado === 'activo' && cupon.activo) ||
      (filtroEstado === 'inactivo' && !cupon.activo)
    const coincideTipo = filtroTipo === 'todos' || cupon.tipo_descuento === filtroTipo
    return coincideBusqueda && coincideEstado && coincideTipo
  })

  const abrirModal = (modo: string, cupon: any = null) => {
    setModoModal(modo)
    setCuponEditando(cupon)
    if (modo === 'crear') {
      setFormulario({
        codigo: '', nombre: '', descripcion: '', tipoDescuento: 'porcentaje',
        valorDescuento: '', montoMinimoCompra: '', descuentoMaximo: '',
        usosPorUsuario: 1, usosMaximos: '', soloprimeraCompra: false,
        fechaInicio: '', fechaFin: '', activo: true
      })
    } else if (cupon) {
      setFormulario({
        codigo: cupon.codigo, nombre: cupon.nombre, descripcion: cupon.descripcion || '',
        tipoDescuento: cupon.tipo_descuento, valorDescuento: cupon.valor_descuento.toString(),
        montoMinimoCompra: cupon.monto_minimo_compra?.toString() || '',
        descuentoMaximo: cupon.descuento_maximo?.toString() || '',
        usosPorUsuario: cupon.usos_por_usuario || 1,
        usosMaximos: cupon.usos_maximos?.toString() || '',
        soloprimeraCompra: cupon.solo_primera_compra || false,
        fechaInicio: cupon.fecha_inicio ? cupon.fecha_inicio.split('T')[0] : '',
        fechaFin: cupon.fecha_fin ? cupon.fecha_fin.split('T')[0] : '',
        activo: cupon.activo
      })
    }
    setModalAbierto(true)
  }

  const cerrarModal = () => { setModalAbierto(false); setCuponEditando(null); setModoModal('crear') }

  const manejarCambioFormulario = (campo: string, valor: any) => {
    setFormulario(prev => ({ ...prev, [campo]: valor }))
  }

  const guardarCupon = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const datosCupon = {
        codigo: formulario.codigo.toUpperCase().trim(),
        nombre: formulario.nombre.trim(),
        descripcion: formulario.descripcion.trim(),
        tipo_descuento: formulario.tipoDescuento,
        valor_descuento: parseFloat(formulario.valorDescuento),
        monto_minimo_compra: formulario.montoMinimoCompra ? parseFloat(formulario.montoMinimoCompra) : null,
        descuento_maximo: formulario.descuentoMaximo ? parseFloat(formulario.descuentoMaximo) : null,
        usos_por_usuario: parseInt(String(formulario.usosPorUsuario)),
        usos_maximos: formulario.usosMaximos ? parseInt(formulario.usosMaximos) : null,
        solo_primera_compra: formulario.soloprimeraCompra,
        fecha_inicio: formulario.fechaInicio || null,
        fecha_fin: formulario.fechaFin || null,
        activo: formulario.activo
      }
      const resultado = modoModal === 'crear'
        ? await clienteSupabase.from('codigos_descuento').insert([datosCupon])
        : await clienteSupabase.from('codigos_descuento').update(datosCupon).eq('id', cuponEditando.id)
      if (resultado.error) throw resultado.error
      await cargarCupones()
      cerrarModal()
      setError('')
    } catch {
      setError('Error al guardar el cupón')
    }
  }

  const eliminarCupon = async (id: string) => {
    if (!confirm('¿Eliminar este cupón?')) return
    try {
      const { error } = await clienteSupabase.from('codigos_descuento').delete().eq('id', id)
      if (error) throw error
      await cargarCupones()
      setError('')
    } catch {
      setError('Error al eliminar el cupón')
    }
  }

  const cambiarEstadoCupon = async (id: string, nuevoEstado: boolean) => {
    try {
      const { error } = await clienteSupabase.from('codigos_descuento').update({ activo: nuevoEstado }).eq('id', id)
      if (error) throw error
      await cargarCupones()
      setError('')
    } catch {
      setError('Error al cambiar el estado del cupón')
    }
  }

  const copiarCodigo = (codigo: string) => { navigator.clipboard.writeText(codigo) }

  const formatearFecha = (fecha?: string) => {
    if (!fecha) return 'Sin límite'
    return new Date(fecha).toLocaleDateString('es-CO')
  }

  const obtenerEstadoCupon = (cupon: any) => {
    if (!cupon.activo) return { texto: 'Inactivo', clase: 'cup-inactivo' }
    const ahora = new Date()
    const fechaInicio = cupon.fecha_inicio ? new Date(cupon.fecha_inicio) : null
    const fechaFin    = cupon.fecha_fin    ? new Date(cupon.fecha_fin)    : null
    if (fechaInicio && ahora < fechaInicio) return { texto: 'Programado', clase: 'cup-programado' }
    if (fechaFin && ahora > fechaFin)       return { texto: 'Expirado',   clase: 'cup-expirado' }
    return { texto: 'Activo', clase: 'cup-activo' }
  }

  // Bulk helpers
  const todosSeleccionados = cuponesFiltrados.length > 0 && seleccionados.length === cuponesFiltrados.length
  const toggleTodos = () => setSeleccionados(todosSeleccionados ? [] : cuponesFiltrados.map(c => c.id))
  const toggleUno = (id: string) => setSeleccionados(prev =>
    prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
  )

  const bulkCambiarEstado = async (activo: boolean) => {
    if (!seleccionados.length) return
    if (!confirm(`¿${activo ? 'Activar' : 'Desactivar'} ${seleccionados.length} cupón(es)?`)) return
    setAplicandoBulk(true)
    try {
      const { error } = await clienteSupabase
        .from('codigos_descuento').update({ activo }).in('id', seleccionados)
      if (error) throw error
      await cargarCupones()
    } catch { setError('Error al actualizar cupones') }
    setAplicandoBulk(false)
  }

  const bulkEliminar = async () => {
    if (!seleccionados.length) return
    if (!confirm(`¿Eliminar ${seleccionados.length} cupón(es)? Esta acción no se puede deshacer.`)) return
    setAplicandoBulk(true)
    try {
      const { error } = await clienteSupabase
        .from('codigos_descuento').delete().in('id', seleccionados)
      if (error) throw error
      await cargarCupones()
    } catch { setError('Error al eliminar cupones') }
    setAplicandoBulk(false)
  }

  // Stats
  const activos   = cupones.filter(c => obtenerEstadoCupon(c).clase === 'cup-activo').length
  const expirados = cupones.filter(c => obtenerEstadoCupon(c).clase === 'cup-expirado').length
  const inactivos = cupones.filter(c => !c.activo).length

  return (
    <div className="cup-contenedor">
      {/* Header */}
      <div className="cup-header">
        <div>
          <h1 className="cup-titulo">Cupones <span className="cup-total-badge">{cupones.length}</span></h1>
          <p className="cup-subtitulo">
            <span className="cup-stat-ok">{activos} activos</span>
            {expirados > 0 && <span className="cup-stat-exp"> · {expirados} expirados</span>}
            {inactivos > 0 && <span className="cup-stat-inac"> · {inactivos} inactivos</span>}
          </p>
        </div>
        <div className="cup-header-acciones">
          <button className="cup-btn-sec" onClick={cargarCupones} disabled={cargando}>
            <RefreshCw size={15} className={cargando ? 'girando' : ''} /> Actualizar
          </button>
          <button className="cup-btn-prim" onClick={() => abrirModal('crear')}>
            <Plus size={15} /> Nuevo Cupón
          </button>
        </div>
      </div>

      {/* Filtros */}
      <div className="cup-toolbar">
        <div className="cup-buscador">
          <Search size={15} />
          <input
            type="text"
            placeholder="Buscar por código o nombre..."
            value={busqueda}
            onChange={e => setBusqueda(e.target.value)}
          />
          {busqueda && <button className="cup-clear" onClick={() => setBusqueda('')}><X size={13} /></button>}
        </div>
        <div className="cup-filtros-grupo">
          <select value={filtroEstado} onChange={e => setFiltroEstado(e.target.value)}>
            <option value="todos">Todos los estados</option>
            <option value="activo">Activos</option>
            <option value="inactivo">Inactivos</option>
          </select>
          <select value={filtroTipo} onChange={e => setFiltroTipo(e.target.value)}>
            <option value="todos">Todos los tipos</option>
            <option value="porcentaje">Porcentaje</option>
            <option value="monto_fijo">Monto fijo</option>
          </select>
        </div>
      </div>

      {error && (
        <div className="cup-error">
          <AlertCircle size={16} /> {error}
          <button className="cup-clear" onClick={() => setError('')}><X size={13} /></button>
        </div>
      )}

      {/* Tabla */}
      <div className="cup-tabla-wrap">
        <TablaCupones
          cargando={cargando}
          cuponesFiltrados={cuponesFiltrados}
          busqueda={busqueda}
          filtroEstado={filtroEstado}
          filtroTipo={filtroTipo}
          obtenerEstadoCupon={obtenerEstadoCupon}
          formatearFecha={formatearFecha}
          copiarCodigo={copiarCodigo}
          abrirModal={abrirModal}
          cambiarEstadoCupon={cambiarEstadoCupon}
          eliminarCupon={eliminarCupon}
          seleccionados={seleccionados}
          toggleUno={toggleUno}
          todosSeleccionados={todosSeleccionados}
          toggleTodos={toggleTodos}
        />
      </div>

      {/* Bulk flotante */}
      {seleccionados.length > 0 && (
        <div className="barra-acciones-bulk">
          <span className="cup-bulk-info">{seleccionados.length} seleccionado(s)</span>
          <button className="cup-bulk-btn cup-bulk-ok" onClick={() => bulkCambiarEstado(true)} disabled={aplicandoBulk}>Activar</button>
          <button className="cup-bulk-btn cup-bulk-warn" onClick={() => bulkCambiarEstado(false)} disabled={aplicandoBulk}>Desactivar</button>
          <button className="cup-bulk-btn cup-bulk-del" onClick={bulkEliminar} disabled={aplicandoBulk}>Eliminar</button>
          <button className="cup-bulk-cancel" onClick={() => setSeleccionados([])}><X size={14} /></button>
        </div>
      )}

      {modalAbierto && (
        <ModalCupon
          modoModal={modoModal}
          formulario={formulario}
          onCambio={manejarCambioFormulario}
          onGuardar={guardarCupon}
          onCerrar={cerrarModal}
        />
      )}
    </div>
  )
}

export default ManejoCupones
