import React from 'react'

const PASOS = [
  { num: '1', titulo: 'Accede a Commerce Manager', desc: 'Ve a business.facebook.com y selecciona tu catálogo' },
  { num: '2', titulo: 'Añade Productos', desc: 'Haz clic en "Añadir productos" y selecciona "Lista de datos"' },
  { num: '3', titulo: 'Configura el Feed', desc: 'Selecciona "Commerce Manager" como formato' },
  { num: '4', titulo: 'Usa URL del Feed', desc: 'Pega la URL de tu feed y selecciona actualización automática' },
  { num: '5', titulo: 'Programa Actualizaciones', desc: 'Configura actualización cada hora o diariamente' },
  { num: '✓', titulo: '¡Listo!', desc: 'Tus productos aparecerán automáticamente en Facebook', esUltimo: true },
]

const PasosConfiguracionMeta = () => (
  <div className="fm-card">
    <div className="fm-card-header">
      <div className="fm-card-title">📋 Pasos para Configurar en Facebook Commerce Manager</div>
      <p className="fm-card-description">Sigue estos pasos para conectar tu feed con Meta/Facebook</p>
    </div>
    <div className="fm-card-content">
      <div className="fm-pasos-container">
        <div className="fm-pasos-grid">
          <div className="fm-pasos-col">
            {PASOS.slice(0, 3).map((paso) => (
              <div key={paso.num} className="fm-paso">
                <div className="fm-paso-num">{paso.num}</div>
                <div>
                  <div className="fm-paso-titulo">{paso.titulo}</div>
                  <div className="fm-paso-desc">{paso.desc}</div>
                </div>
              </div>
            ))}
          </div>
          <div className="fm-pasos-col">
            {PASOS.slice(3).map((paso) => (
              <div key={paso.num} className="fm-paso">
                <div
                  className="fm-paso-num"
                  style={paso.esUltimo ? { background: 'var(--color-exito)' } : undefined}
                >
                  {paso.num}
                </div>
                <div>
                  <div className="fm-paso-titulo">{paso.titulo}</div>
                  <div className="fm-paso-desc">{paso.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  </div>
)

export default PasosConfiguracionMeta
