import React from 'react'
import ConvertidorAJson from './ConvertidorAJson'

interface SeccionesProductoJSONProps {
  datosProducto: Record<string, any>
  manejarCambio: (campo: string, valor: any) => void
}

const SECCIONES = [
  { campo: 'caracteristicas', titulo: '⚙️ Características', desc: 'Características técnicas del producto', label: 'Características', tipo: 'caracteristicas' },
  { campo: 'banner_animado', titulo: '🎨 Banner Animado', desc: 'Mensajes rotativos para el banner principal', label: 'Banner Animado', tipo: 'banner_animado' },
  { campo: 'puntos_dolor', titulo: '🩹 Puntos de Dolor', desc: 'Problemas que enfrenta tu cliente y cómo los resuelves', label: 'Puntos de Dolor', tipo: 'puntos_dolor' },
  { campo: 'testimonios', titulo: '👥 Testimonios', desc: 'Reseñas y opiniones de clientes', label: 'Testimonios', tipo: 'testimonios' },
  { campo: 'faq', titulo: '❓ FAQ', desc: 'Preguntas frecuentes sobre el producto', label: 'FAQ', tipo: 'faq' },
  { campo: 'garantias', titulo: '🛡️ Garantías', desc: 'Garantías y políticas de devolución', label: 'Garantías', tipo: 'garantias' },
  { campo: 'cta_final', titulo: '🚀 Call to Action Final', desc: 'Sección final para impulsar la compra', label: 'CTA Final', tipo: 'cta_final' },
  { campo: 'promociones', titulo: '🎁 Promociones por Cantidad', desc: 'Configura descuentos automáticos por cantidad de productos', label: 'Promociones', tipo: 'promociones' },
]

const SeccionesProductoJSON: React.FC<SeccionesProductoJSONProps> = ({ datosProducto, manejarCambio }) => (
  <>
    {SECCIONES.map(({ campo, titulo, desc, label, tipo }) => (
      <section key={campo} className="seccion">
        <h3>{titulo}</h3>
        <p className="descripcion-json">{desc}</p>
        <div className="campo">
          <label>{label}</label>
          <ConvertidorAJson
            valor={datosProducto[campo]}
            onChange={(valor: any) => manejarCambio(campo, valor)}
            tipo={tipo}
          />
        </div>
      </section>
    ))}
  </>
)

export default SeccionesProductoJSON
