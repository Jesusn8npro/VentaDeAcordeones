import React from 'react'

interface Props {
  usuario: { nombre?: string } | null
  cargando: boolean
  onCerrar: () => void
  onConfirmar: () => void
}

export default function ModalConfirmacionEliminar({ usuario, cargando, onCerrar, onConfirmar }: Props) {
  return (
    <div className="modal-overlay" onClick={onCerrar}>
      <div className="modal-confirmacion" onClick={(e) => e.stopPropagation()}>
        <div className="confirmacion-icono">⚠</div>
        <h3>¿Eliminar Usuario?</h3>
        <p>
          ¿Estás seguro de que deseas eliminar a <strong>{usuario?.nombre}</strong>?
          Esta acción no se puede deshacer.
        </p>
        <div className="confirmacion-acciones">
          <button className="btn-cancelar-confirmacion" onClick={onCerrar}>
            Cancelar
          </button>
          <button className="btn-confirmar-eliminacion" onClick={onConfirmar} disabled={cargando}>
            {cargando ? 'Eliminando...' : 'Sí, Eliminar'}
          </button>
        </div>
      </div>
    </div>
  )
}
