function PanelFiltros({ filtros, onChange }) {
  const set = (campo, valor) => onChange({ ...filtros, [campo]: valor })
  return (
    <div className="panel-filtros">
      <div>
        <label>Estado</label>
        <select value={filtros.estado} onChange={(e) => set('estado', e.target.value)}>
          <option value="">Todos</option>
          <option value="pendiente">Pendiente</option>
          <option value="en_progreso">En progreso</option>
          <option value="bloqueado">Bloqueado</option>
          <option value="completada">Completada</option>
        </select>
      </div>
      <div>
        <label>Prioridad</label>
        <select value={filtros.prioridad} onChange={(e) => set('prioridad', e.target.value)}>
          <option value="">Todas</option>
          <option value="alta">Alta</option>
          <option value="media">Media</option>
          <option value="baja">Baja</option>
        </select>
      </div>
      <div>
        <label>Tipo</label>
        <select value={filtros.tipo} onChange={(e) => set('tipo', e.target.value)}>
          <option value="">Todos</option>
          <option value="campaña">Campaña</option>
          <option value="contenido">Contenido</option>
          <option value="inventario">Inventario</option>
          <option value="logística">Logística</option>
          <option value="otro">Otro</option>
        </select>
      </div>
      <div>
        <label>Búsqueda</label>
        <input type="text" placeholder="Título…" value={filtros.texto || ''} onChange={(e) => set('texto', e.target.value)} />
      </div>
    </div>
  )
}

export default PanelFiltros