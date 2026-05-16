import React from 'react'

const TIPOS_CONSULTA = [
  { valor: 'general',   texto: 'Consulta general' },
  { valor: 'productos', texto: 'Información sobre productos' },
  { valor: 'precios',   texto: 'Precios y ofertas' },
  { valor: 'envios',    texto: 'Envíos y entregas' },
  { valor: 'devolucion',texto: 'Devoluciones' },
  { valor: 'tecnico',   texto: 'Soporte técnico' },
  { valor: 'otro',      texto: 'Otro tema' },
]

interface DatosUsuario { nombre: string; email: string; whatsapp: string; tipoConsulta: string }
interface Props {
  datos: DatosUsuario
  onChange: (datos: DatosUsuario) => void
  onGuardar: (datos: DatosUsuario) => void
  onCancelar: () => void
}

export default function ModalDatosChat({ datos, onChange, onGuardar, onCancelar }: Props) {
  const campo = (campo: keyof DatosUsuario) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    onChange({ ...datos, [campo]: e.target.value })

  return (
    <div className="modal-overlay">
      <div className="modal-contenido">
        <h3>Cuéntanos sobre ti</h3>
        <form onSubmit={(e) => { e.preventDefault(); onGuardar(datos) }}>
          <div className="grupo-input">
            <label>Nombre completo</label>
            <input type="text" value={datos.nombre} onChange={campo('nombre')} required />
          </div>
          <div className="grupo-input">
            <label>Email</label>
            <input type="email" value={datos.email} onChange={campo('email')} required />
          </div>
          <div className="grupo-input">
            <label>WhatsApp</label>
            <input type="tel" value={datos.whatsapp} onChange={campo('whatsapp')} placeholder="3001234567" required />
          </div>
          <div className="grupo-input">
            <label>Tipo de consulta</label>
            <select value={datos.tipoConsulta} onChange={campo('tipoConsulta')} required>
              {TIPOS_CONSULTA.map(t => <option key={t.valor} value={t.valor}>{t.texto}</option>)}
            </select>
          </div>
          <div className="botones-modal">
            <button type="button" onClick={onCancelar} className="boton-modal boton-secundario">Cancelar</button>
            <button type="submit" className="boton-modal boton-primario">Continuar</button>
          </div>
        </form>
      </div>
    </div>
  )
}
