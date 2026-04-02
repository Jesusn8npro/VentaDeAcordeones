import FormularioTarea from './FormularioTarea'

function ModalTarea({ abierto, tarea, onCerrar, onGuardar, onEliminar }) {
  if (!abierto) return null
  const esEdicion = !!(tarea && tarea.id)
  return (
    <div className="modal-backdrop" onClick={onCerrar}>
      <div className="modal-contenido" onClick={(e) => e.stopPropagation()}>
        <div className="modal-encabezado">
          <h2>{esEdicion ? 'Editar tarea' : 'Nueva tarea'}</h2>
          <button className="btn" onClick={onCerrar}>Cerrar</button>
        </div>
        <div className="modal-cuerpo">
          <FormularioTarea valoresIniciales={tarea || {}} onSubmit={onGuardar} />
        </div>
        <div className="modal-acciones">
          {esEdicion && (
            <button className="btn btn-peligro" onClick={() => onEliminar(tarea.id)}>Eliminar</button>
          )}
        </div>
      </div>
    </div>
  )
}

export default ModalTarea