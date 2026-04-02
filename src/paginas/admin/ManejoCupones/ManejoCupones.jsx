import React, { useState, useEffect } from 'react'
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Eye, 
  Filter,
  Calendar,
  Percent,
  DollarSign,
  Users,
  ShoppingCart,
  Tag,
  CheckCircle,
  XCircle,
  AlertCircle,
  Copy,
  Download,
  RefreshCw
} from 'lucide-react'
import { clienteSupabase } from '../../../configuracion/supabase'
import { formatearPrecioCOP } from '../../../utilidades/formatoPrecio'
import './ManejoCupones.css'

const ManejoCupones = () => {
  // Estados principales
  const [cupones, setCupones] = useState([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')
  const [busqueda, setBusqueda] = useState('')
  const [filtroEstado, setFiltroEstado] = useState('todos')
  const [filtroTipo, setFiltroTipo] = useState('todos')
  
  // Estados del modal
  const [modalAbierto, setModalAbierto] = useState(false)
  const [cuponEditando, setCuponEditando] = useState(null)
  const [modoModal, setModoModal] = useState('crear') // 'crear', 'editar', 'ver'
  
  // Estados del formulario
  const [formulario, setFormulario] = useState({
    codigo: '',
    nombre: '',
    descripcion: '',
    tipoDescuento: 'porcentaje',
    valorDescuento: '',
    montoMinimoCompra: '',
    descuentoMaximo: '',
    usosPorUsuario: 1,
    usosMaximos: '',
    soloprimeraCompra: false,
    fechaInicio: '',
    fechaFin: '',
    activo: true
  })

  // Cargar cupones al montar el componente
  useEffect(() => {
    cargarCupones()
  }, [])

  // Función para cargar cupones
  const cargarCupones = async () => {
    try {
      setCargando(true)
      const { data, error } = await clienteSupabase
        .from('codigos_descuento')
        .select('*')
        .order('creado_el', { ascending: false })

      if (error) throw error
      setCupones(data || [])
    } catch (error) {
      console.error('Error cargando cupones:', error)
      setError('Error al cargar los cupones')
    } finally {
      setCargando(false)
    }
  }

  // Función para filtrar cupones
  const cuponesFiltrados = cupones.filter(cupon => {
    const coincideBusqueda = cupon.codigo.toLowerCase().includes(busqueda.toLowerCase()) ||
                            cupon.nombre.toLowerCase().includes(busqueda.toLowerCase())
    
    const coincideEstado = filtroEstado === 'todos' || 
                          (filtroEstado === 'activo' && cupon.activo) ||
                          (filtroEstado === 'inactivo' && !cupon.activo)
    
    const coincideTipo = filtroTipo === 'todos' || cupon.tipo_descuento === filtroTipo

    return coincideBusqueda && coincideEstado && coincideTipo
  })

  // Función para abrir modal
  const abrirModal = (modo, cupon = null) => {
    setModoModal(modo)
    setCuponEditando(cupon)
    
    if (modo === 'crear') {
      setFormulario({
        codigo: '',
        nombre: '',
        descripcion: '',
        tipoDescuento: 'porcentaje',
        valorDescuento: '',
        montoMinimoCompra: '',
        descuentoMaximo: '',
        usosPorUsuario: 1,
        usosMaximos: '',
        soloprimeraCompra: false,
        fechaInicio: '',
        fechaFin: '',
        activo: true
      })
    } else if (cupon) {
      setFormulario({
        codigo: cupon.codigo,
        nombre: cupon.nombre,
        descripcion: cupon.descripcion || '',
        tipoDescuento: cupon.tipo_descuento,
        valorDescuento: cupon.valor_descuento.toString(),
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

  // Función para cerrar modal
  const cerrarModal = () => {
    setModalAbierto(false)
    setCuponEditando(null)
    setModoModal('crear')
  }

  // Función para manejar cambios en el formulario
  const manejarCambioFormulario = (campo, valor) => {
    setFormulario(prev => ({
      ...prev,
      [campo]: valor
    }))
  }

  // Función para guardar cupón
  const guardarCupon = async (e) => {
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
        usos_por_usuario: parseInt(formulario.usosPorUsuario),
        usos_maximos: formulario.usosMaximos ? parseInt(formulario.usosMaximos) : null,
        solo_primera_compra: formulario.soloprimeraCompra,
        fecha_inicio: formulario.fechaInicio || null,
        fecha_fin: formulario.fechaFin || null,
        activo: formulario.activo
      }

      let resultado
      if (modoModal === 'crear') {
        resultado = await clienteSupabase
          .from('codigos_descuento')
          .insert([datosCupon])
      } else {
        resultado = await clienteSupabase
          .from('codigos_descuento')
          .update(datosCupon)
          .eq('id', cuponEditando.id)
      }

      if (resultado.error) throw resultado.error

      await cargarCupones()
      cerrarModal()
      setError('')
    } catch (error) {
      console.error('Error guardando cupón:', error)
      setError('Error al guardar el cupón')
    }
  }

  // Función para eliminar cupón
  const eliminarCupon = async (id) => {
    if (!confirm('¿Estás seguro de que quieres eliminar este cupón?')) return

    try {
      const { error } = await clienteSupabase
        .from('codigos_descuento')
        .delete()
        .eq('id', id)

      if (error) throw error

      await cargarCupones()
      setError('')
    } catch (error) {
      console.error('Error eliminando cupón:', error)
      setError('Error al eliminar el cupón')
    }
  }

  // Función para cambiar estado del cupón
  const cambiarEstadoCupon = async (id, nuevoEstado) => {
    try {
      const { error } = await clienteSupabase
        .from('codigos_descuento')
        .update({ activo: nuevoEstado })
        .eq('id', id)

      if (error) throw error

      await cargarCupones()
      setError('')
    } catch (error) {
      console.error('Error cambiando estado:', error)
      setError('Error al cambiar el estado del cupón')
    }
  }

  // Función para copiar código
  const copiarCodigo = (codigo) => {
    navigator.clipboard.writeText(codigo)
    // Aquí podrías agregar una notificación de éxito
  }

  // Función para formatear fecha
  const formatearFecha = (fecha) => {
    if (!fecha) return 'Sin límite'
    return new Date(fecha).toLocaleDateString('es-ES')
  }

  // Función para obtener estado del cupón
  const obtenerEstadoCupon = (cupon) => {
    if (!cupon.activo) return { texto: 'Inactivo', clase: 'inactivo' }
    
    const ahora = new Date()
    const fechaInicio = cupon.fecha_inicio ? new Date(cupon.fecha_inicio) : null
    const fechaFin = cupon.fecha_fin ? new Date(cupon.fecha_fin) : null
    
    if (fechaInicio && ahora < fechaInicio) return { texto: 'Programado', clase: 'programado' }
    if (fechaFin && ahora > fechaFin) return { texto: 'Expirado', clase: 'expirado' }
    
    return { texto: 'Activo', clase: 'activo' }
  }

  return (
    <div className="manejo-cupones">
      <div className="contenedor-cupones">
        {/* Header */}
        <div className="header-cupones">
          <div className="titulo-seccion">
            <Tag size={32} />
            <div>
              <h1>Gestión de Cupones</h1>
              <p>Administra los códigos de descuento de tu tienda</p>
            </div>
          </div>
          
          <div className="acciones-header">
            <button 
              className="boton-refrescar"
              onClick={cargarCupones}
              disabled={cargando}
            >
              <RefreshCw size={18} className={cargando ? 'girando' : ''} />
              Actualizar
            </button>
            
            <button 
              className="boton-crear"
              onClick={() => abrirModal('crear')}
            >
              <Plus size={18} />
              Nuevo Cupón
            </button>
          </div>
        </div>

        {/* Filtros y búsqueda */}
        <div className="filtros-cupones">
          <div className="busqueda-cupones">
            <Search size={20} />
            <input
              type="text"
              placeholder="Buscar por código o nombre..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
            />
          </div>
          
          <div className="filtros-grupo">
            <select
              value={filtroEstado}
              onChange={(e) => setFiltroEstado(e.target.value)}
            >
              <option value="todos">Todos los estados</option>
              <option value="activo">Activos</option>
              <option value="inactivo">Inactivos</option>
            </select>
            
            <select
              value={filtroTipo}
              onChange={(e) => setFiltroTipo(e.target.value)}
            >
              <option value="todos">Todos los tipos</option>
              <option value="porcentaje">Porcentaje</option>
              <option value="monto_fijo">Monto fijo</option>
            </select>
          </div>
        </div>

        {/* Estadísticas rápidas */}
        <div className="estadisticas-cupones">
          <div className="estadistica">
            <div className="estadistica-icono activo">
              <CheckCircle size={24} />
            </div>
            <div className="estadistica-info">
              <span className="estadistica-numero">
                {cupones.filter(c => c.activo).length}
              </span>
              <span className="estadistica-label">Cupones Activos</span>
            </div>
          </div>
          
          <div className="estadistica">
            <div className="estadistica-icono total">
              <Tag size={24} />
            </div>
            <div className="estadistica-info">
              <span className="estadistica-numero">{cupones.length}</span>
              <span className="estadistica-label">Total Cupones</span>
            </div>
          </div>
          
          <div className="estadistica">
            <div className="estadistica-icono porcentaje">
              <Percent size={24} />
            </div>
            <div className="estadistica-info">
              <span className="estadistica-numero">
                {cupones.filter(c => c.tipo_descuento === 'porcentaje').length}
              </span>
              <span className="estadistica-label">Porcentaje</span>
            </div>
          </div>
          
          <div className="estadistica">
            <div className="estadistica-icono monto">
              <DollarSign size={24} />
            </div>
            <div className="estadistica-info">
              <span className="estadistica-numero">
                {cupones.filter(c => c.tipo_descuento === 'monto_fijo').length}
              </span>
              <span className="estadistica-label">Monto Fijo</span>
            </div>
          </div>
        </div>

        {/* Mensajes de error */}
        {error && (
          <div className="mensaje-error">
            <AlertCircle size={20} />
            {error}
          </div>
        )}

        {/* Lista de cupones */}
        <div className="lista-cupones">
          {cargando ? (
            <div className="cargando-cupones">
              <RefreshCw size={32} className="girando" />
              <p>Cargando cupones...</p>
            </div>
          ) : cuponesFiltrados.length === 0 ? (
            <div className="sin-cupones">
              <Tag size={48} />
              <h3>No se encontraron cupones</h3>
              <p>
                {busqueda || filtroEstado !== 'todos' || filtroTipo !== 'todos'
                  ? 'Intenta ajustar los filtros de búsqueda'
                  : 'Crea tu primer cupón de descuento'
                }
              </p>
              {!busqueda && filtroEstado === 'todos' && filtroTipo === 'todos' && (
                <button 
                  className="boton-crear-vacio"
                  onClick={() => abrirModal('crear')}
                >
                  <Plus size={18} />
                  Crear Primer Cupón
                </button>
              )}
            </div>
          ) : (
            <div className="cupones-tabla-contenedor">
              <table className="cupones-tabla">
                <thead>
                  <tr>
                    <th>Código</th>
                    <th>Nombre</th>
                    <th>Descuento</th>
                    <th>Usos</th>
                    <th>Vigencia</th>
                    <th>Estado</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {cuponesFiltrados.map((cupon) => {
                    const estado = obtenerEstadoCupon(cupon)
                    
                    return (
                      <tr key={cupon.id} className="cupones-fila">
                        <td>
                          <div className="cupones-codigo">
                            <span className="codigo-texto">{cupon.codigo}</span>
                            <button
                              className="boton-copiar"
                              onClick={() => copiarCodigo(cupon.codigo)}
                              title="Copiar código"
                            >
                              <Copy size={14} />
                            </button>
                          </div>
                        </td>
                        
                        <td>
                          <div className="cupones-nombre">
                            <h4 className="nombre-principal">{cupon.nombre}</h4>
                            {cupon.descripcion && (
                              <p className="descripcion-cupon">{cupon.descripcion}</p>
                            )}
                          </div>
                        </td>
                        
                        <td>
                          <div className="cupones-descuento">
                            <div className="descuento-valor">
                              {cupon.tipo_descuento === 'porcentaje' ? (
                                <>
                                  <Percent size={16} />
                                  {cupon.valor_descuento}%
                                </>
                              ) : (
                                <>
                                  <DollarSign size={16} />
                                  {formatearPrecioCOP(cupon.valor_descuento)}
                                </>
                              )}
                            </div>
                            {cupon.monto_minimo_compra && (
                              <span className="minimo-compra">
                                Mín: {formatearPrecioCOP(cupon.monto_minimo_compra)}
                              </span>
                            )}
                          </div>
                        </td>
                        
                        <td>
                          <div className="cupones-usos">
                            <span className="usos-actuales">{cupon.usos_actuales || 0}</span>
                            <span className="separador">/</span>
                            <span className="usos-maximos">
                              {cupon.usos_maximos || '∞'}
                            </span>
                          </div>
                        </td>
                        
                        <td>
                          <div className="cupones-vigencia">
                            <div className="fecha-inicio">
                              Desde: {formatearFecha(cupon.fecha_inicio)}
                            </div>
                            <div className="fecha-fin">
                              Hasta: {formatearFecha(cupon.fecha_fin)}
                            </div>
                          </div>
                        </td>
                        
                        <td>
                          <span className={`cupones-estado ${estado.clase}`}>
                            {estado.texto}
                          </span>
                        </td>
                        
                        <td>
                          <div className="cupones-acciones">
                            <button
                              className="cupones-accion"
                              onClick={() => abrirModal('ver', cupon)}
                              title="Ver detalles"
                            >
                              <Eye size={16} />
                            </button>
                            
                            <button
                              className="cupones-accion"
                              onClick={() => abrirModal('editar', cupon)}
                              title="Editar cupón"
                            >
                              <Edit size={16} />
                            </button>
                            
                            <button
                              className={`cupones-accion ${cupon.activo ? 'desactivar' : 'activar'}`}
                              onClick={() => cambiarEstadoCupon(cupon.id, !cupon.activo)}
                              title={cupon.activo ? 'Desactivar' : 'Activar'}
                            >
                              {cupon.activo ? <XCircle size={16} /> : <CheckCircle size={16} />}
                            </button>
                            
                            <button
                              className="cupones-accion eliminar"
                              onClick={() => eliminarCupon(cupon.id)}
                              title="Eliminar cupón"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Modal para crear/editar/ver cupón */}
      {modalAbierto && (
        <div className="modal-overlay" onClick={cerrarModal}>
          <div className="modal-cupon" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>
                {modoModal === 'crear' && 'Crear Nuevo Cupón'}
                {modoModal === 'editar' && 'Editar Cupón'}
                {modoModal === 'ver' && 'Detalles del Cupón'}
              </h2>
              <button className="boton-cerrar" onClick={cerrarModal}>
                <XCircle size={24} />
              </button>
            </div>
            
            <form onSubmit={guardarCupon} className="formulario-cupon">
              <div className="campos-formulario">
                {/* Información básica */}
                <div className="grupo-campos">
                  <h3>Información Básica</h3>
                  
                  <div className="fila-campos">
                    <div className="campo">
                      <label>Código del Cupón *</label>
                      <input
                        type="text"
                        value={formulario.codigo}
                        onChange={(e) => manejarCambioFormulario('codigo', e.target.value.toUpperCase())}
                        placeholder="Ej: DESCUENTO25"
                        required
                        disabled={modoModal === 'ver'}
                      />
                    </div>
                    
                    <div className="campo">
                      <label>Nombre del Cupón *</label>
                      <input
                        type="text"
                        value={formulario.nombre}
                        onChange={(e) => manejarCambioFormulario('nombre', e.target.value)}
                        placeholder="Ej: Descuento de Bienvenida"
                        required
                        disabled={modoModal === 'ver'}
                      />
                    </div>
                  </div>
                  
                  <div className="campo">
                    <label>Descripción</label>
                    <textarea
                      value={formulario.descripcion}
                      onChange={(e) => manejarCambioFormulario('descripcion', e.target.value)}
                      placeholder="Descripción opcional del cupón"
                      rows="3"
                      disabled={modoModal === 'ver'}
                    />
                  </div>
                </div>

                {/* Configuración del descuento */}
                <div className="grupo-campos">
                  <h3>Configuración del Descuento</h3>
                  
                  <div className="fila-campos">
                    <div className="campo">
                      <label>Tipo de Descuento *</label>
                      <select
                        value={formulario.tipoDescuento}
                        onChange={(e) => manejarCambioFormulario('tipoDescuento', e.target.value)}
                        disabled={modoModal === 'ver'}
                      >
                        <option value="porcentaje">Porcentaje (%)</option>
                        <option value="monto_fijo">Monto Fijo ($)</option>
                      </select>
                    </div>
                    
                    <div className="campo">
                      <label>
                        Valor del Descuento *
                        {formulario.tipoDescuento === 'porcentaje' ? ' (%)' : ' (COP)'}
                      </label>
                      <input
                        type="number"
                        value={formulario.valorDescuento}
                        onChange={(e) => manejarCambioFormulario('valorDescuento', e.target.value)}
                        placeholder={formulario.tipoDescuento === 'porcentaje' ? '25' : '50000'}
                        min="0"
                        max={formulario.tipoDescuento === 'porcentaje' ? '100' : undefined}
                        step={formulario.tipoDescuento === 'porcentaje' ? '0.01' : '1000'}
                        required
                        disabled={modoModal === 'ver'}
                      />
                    </div>
                  </div>
                  
                  <div className="fila-campos">
                    <div className="campo">
                      <label>Compra Mínima (COP)</label>
                      <input
                        type="number"
                        value={formulario.montoMinimoCompra}
                        onChange={(e) => manejarCambioFormulario('montoMinimoCompra', e.target.value)}
                        placeholder="100000"
                        min="0"
                        step="1000"
                        disabled={modoModal === 'ver'}
                      />
                    </div>
                    
                    {formulario.tipoDescuento === 'porcentaje' && (
                      <div className="campo">
                        <label>Descuento Máximo (COP)</label>
                        <input
                          type="number"
                          value={formulario.descuentoMaximo}
                          onChange={(e) => manejarCambioFormulario('descuentoMaximo', e.target.value)}
                          placeholder="50000"
                          min="0"
                          step="1000"
                          disabled={modoModal === 'ver'}
                        />
                      </div>
                    )}
                  </div>
                </div>

                {/* Limitaciones de uso */}
                <div className="grupo-campos">
                  <h3>Limitaciones de Uso</h3>
                  
                  <div className="fila-campos">
                    <div className="campo">
                      <label>Usos por Usuario</label>
                      <input
                        type="number"
                        value={formulario.usosPorUsuario}
                        onChange={(e) => manejarCambioFormulario('usosPorUsuario', e.target.value)}
                        min="1"
                        disabled={modoModal === 'ver'}
                      />
                    </div>
                    
                    <div className="campo">
                      <label>Usos Máximos Totales</label>
                      <input
                        type="number"
                        value={formulario.usosMaximos}
                        onChange={(e) => manejarCambioFormulario('usosMaximos', e.target.value)}
                        placeholder="Ilimitado"
                        min="1"
                        disabled={modoModal === 'ver'}
                      />
                    </div>
                  </div>
                  
                  <div className="campo-checkbox">
                    <label className="checkbox-label">
                      <input
                        type="checkbox"
                        checked={formulario.soloprimeraCompra}
                        onChange={(e) => manejarCambioFormulario('soloprimeraCompra', e.target.checked)}
                        disabled={modoModal === 'ver'}
                      />
                      <span className="checkbox-custom"></span>
                      Solo válido para primera compra
                    </label>
                  </div>
                </div>

                {/* Vigencia */}
                <div className="grupo-campos">
                  <h3>Vigencia del Cupón</h3>
                  
                  <div className="fila-campos">
                    <div className="campo">
                      <label>Fecha de Inicio</label>
                      <input
                        type="date"
                        value={formulario.fechaInicio}
                        onChange={(e) => manejarCambioFormulario('fechaInicio', e.target.value)}
                        disabled={modoModal === 'ver'}
                      />
                    </div>
                    
                    <div className="campo">
                      <label>Fecha de Fin</label>
                      <input
                        type="date"
                        value={formulario.fechaFin}
                        onChange={(e) => manejarCambioFormulario('fechaFin', e.target.value)}
                        disabled={modoModal === 'ver'}
                      />
                    </div>
                  </div>
                </div>

                {/* Estado */}
                <div className="grupo-campos">
                  <div className="campo-checkbox">
                    <label className="checkbox-label">
                      <input
                        type="checkbox"
                        checked={formulario.activo}
                        onChange={(e) => manejarCambioFormulario('activo', e.target.checked)}
                        disabled={modoModal === 'ver'}
                      />
                      <span className="checkbox-custom"></span>
                      Cupón activo
                    </label>
                  </div>
                </div>
              </div>
              
              {modoModal !== 'ver' && (
                <div className="acciones-modal">
                  <button type="button" className="boton-cancelar" onClick={cerrarModal}>
                    Cancelar
                  </button>
                  <button type="submit" className="boton-guardar">
                    {modoModal === 'crear' ? 'Crear Cupón' : 'Guardar Cambios'}
                  </button>
                </div>
              )}
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default ManejoCupones