function TarjetaTarea({ tarea, onEditar }) {
  const onDragStart = (e) => {
    e.dataTransfer.setData('text/tarea-id', String(tarea.id))
  }
  const editar = (e) => { e.stopPropagation(); if (onEditar) onEditar(tarea) }
  return (
    <div className="kanban-tarjeta" draggable onDragStart={onDragStart} onDoubleClick={editar}>
      <div className="kanban-card-actions">
        <button type="button" className="kanban-edit-btn" title="Editar" onClick={editar}>✎</button>
      </div>
      <div className="kanban-metas">
        <span className={`kanban-chip estado-${tarea.estado}`}>{tarea.estado.replace('_',' ')}</span>
        <span className={`kanban-chip prioridad-${tarea.prioridad}`}>{tarea.prioridad}</span>
        <span className={`kanban-chip tipo-${tarea.tipo}`}>{tarea.tipo}</span>
      </div>
      <div className="kanban-titulo">{tarea.titulo}</div>
      {tarea.descripcion && <div className="kanban-descripcion">{tarea.descripcion}</div>}
      {(tarea.producto_id || tarea.categoria_id) && (
        <div className="kanban-referencias">
          {tarea.producto_id && <span className="kanban-ref">Prod: {tarea.producto_id}</span>}
          {tarea.categoria_id && <span className="kanban-ref">Cat: {tarea.categoria_id}</span>}
        </div>
      )}
    </div>
  )
}

export default TarjetaTarea