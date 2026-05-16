import React from 'react'
import { Globe, Calendar } from 'lucide-react'

interface Props {
  producto: any
}

const extraerTexto = (item: any): string => {
  if (typeof item === 'string') return item
  if (typeof item === 'object' && item !== null) {
    return item.texto || item.titulo || item.descripcion || item.nombre || JSON.stringify(item)
  }
  return String(item ?? '')
}

const PlantillaCatalogoDetalle = ({ producto }: Props) => {
  const beneficiosList = Array.isArray(producto.beneficios)
    ? producto.beneficios.map(extraerTexto)
    : Array.isArray(producto.beneficios?.items)
      ? producto.beneficios.items.map((b) => b.titulo || b.descripcion || '')
      : []

  const ventajasList = Array.isArray(producto.ventajas)
    ? producto.ventajas.map(extraerTexto)
    : Array.isArray(producto.ventajas?.items)
      ? producto.ventajas.items.map((v) => v.titulo || v.descripcion || '')
      : []

  return (
    <>
      {producto.descripcion && (
        <div style={{ backgroundColor: 'white', padding: '2rem', borderRadius: '8px', marginBottom: '2rem', border: '1px solid #dee2e6' }}>
          <h3 style={{ color: '#2c3e50', marginBottom: '1rem' }}>
            {typeof producto.descripcion === 'object' && producto.descripcion?.titulo
              ? producto.descripcion.titulo
              : '📝 Descripción'}
          </h3>
          <div style={{ lineHeight: '1.6', color: '#495057', whiteSpace: 'pre-wrap' }}>
            {typeof producto.descripcion === 'object' && producto.descripcion?.contenido
              ? producto.descripcion.contenido
              : producto.descripcion}
          </div>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem', marginBottom: '2rem' }}>
        {producto.ganchos && producto.ganchos.length > 0 && (
          <div style={{ backgroundColor: '#fff0f5', padding: '1.5rem', borderRadius: '8px', border: '1px solid #ffc0cb' }}>
            <h4 style={{ color: '#8b008b', marginBottom: '1rem' }}>🎯 Ganchos</h4>
            <ul style={{ margin: 0, paddingLeft: '1.5rem' }}>
              {producto.ganchos.map((gancho, index) => <li key={index} style={{ marginBottom: '0.5rem' }}>{extraerTexto(gancho)}</li>)}
            </ul>
          </div>
        )}

        {beneficiosList.length > 0 && (
          <div style={{ backgroundColor: '#f0fff0', padding: '1.5rem', borderRadius: '8px', border: '1px solid #90ee90' }}>
            <h4 style={{ color: '#006400', marginBottom: '1rem' }}>✅ Beneficios</h4>
            <ul style={{ margin: 0, paddingLeft: '1.5rem' }}>
              {beneficiosList.map((beneficio, index) => <li key={index} style={{ marginBottom: '0.5rem' }}>{beneficio}</li>)}
            </ul>
          </div>
        )}

        {ventajasList.length > 0 && (
          <div style={{ backgroundColor: '#f0f8ff', padding: '1.5rem', borderRadius: '8px', border: '1px solid #87ceeb' }}>
            <h4 style={{ color: '#4682b4', marginBottom: '1rem' }}>⭐ Ventajas</h4>
            <ul style={{ margin: 0, paddingLeft: '1.5rem' }}>
              {ventajasList.map((ventaja, index) => <li key={index} style={{ marginBottom: '0.5rem' }}>{ventaja}</li>)}
            </ul>
          </div>
        )}
      </div>

      <div style={{ backgroundColor: '#f8f9fa', padding: '2rem', borderRadius: '8px', marginBottom: '2rem', border: '1px solid #dee2e6' }}>
        <h3 style={{ color: '#2c3e50', marginBottom: '1.5rem' }}>🔧 Especificaciones Técnicas</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem' }}>
          {producto.marca && <div><strong>Marca:</strong> {producto.marca}</div>}
          {producto.modelo && <div><strong>Modelo:</strong> {producto.modelo}</div>}
          {producto.color && <div><strong>Color:</strong> {producto.color}</div>}
          {producto.talla && <div><strong>Talla:</strong> {producto.talla}</div>}
          {producto.material && <div><strong>Material:</strong> {producto.material}</div>}
          {producto.peso && <div><strong>Peso:</strong> {producto.peso} kg</div>}
          {producto.garantia_meses && <div><strong>Garantía:</strong> {producto.garantia_meses} meses</div>}
          {producto.origen_pais && <div><strong>País de origen:</strong> {producto.origen_pais}</div>}
        </div>
        {producto.dimensiones && (
          <div style={{ marginTop: '1rem' }}>
            <strong>Dimensiones:</strong>
            <pre style={{ backgroundColor: '#e9ecef', padding: '0.5rem', borderRadius: '4px', marginTop: '0.5rem', fontSize: '0.875rem' }}>
              {JSON.stringify(producto.dimensiones, null, 2)}
            </pre>
          </div>
        )}
      </div>

      <div style={{ backgroundColor: '#e6f3ff', padding: '2rem', borderRadius: '8px', marginBottom: '2rem', border: '1px solid #b3d9ff' }}>
        <h3 style={{ color: '#0066cc', marginBottom: '1.5rem' }}>
          <Globe style={{ display: 'inline', marginRight: '0.5rem' }} />
          SEO y Metadatos
        </h3>
        <div style={{ display: 'grid', gap: '1rem' }}>
          {producto.meta_title && <div><strong>Meta título:</strong> {producto.meta_title}</div>}
          {producto.meta_description && <div><strong>Meta descripción:</strong> {producto.meta_description}</div>}
          {producto.palabras_clave && producto.palabras_clave.length > 0 && (
            <div>
              <strong>Palabras clave:</strong>
              <div style={{ marginTop: '0.5rem' }}>
                {producto.palabras_clave.map((palabra, index) => (
                  <span key={index} style={{ display: 'inline-block', margin: '0.25rem 0.5rem 0.25rem 0', padding: '0.25rem 0.75rem', backgroundColor: '#cce7ff', borderRadius: '20px', fontSize: '0.875rem' }}>
                    {extraerTexto(palabra)}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <div style={{ backgroundColor: '#f5f5f5', padding: '1.5rem', borderRadius: '8px', border: '1px solid #ddd' }}>
        <h3 style={{ color: '#666', marginBottom: '1rem' }}>
          <Calendar style={{ display: 'inline', marginRight: '0.5rem' }} />
          Información del Sistema
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', fontSize: '0.875rem', color: '#666' }}>
          <div><strong>Creado:</strong> {new Date(producto.creado_el).toLocaleString('es-ES')}</div>
          <div><strong>Actualizado:</strong> {new Date(producto.actualizado_el).toLocaleString('es-ES')}</div>
          {producto.creado_por && <div><strong>Creado por:</strong> {producto.creado_por}</div>}
          {producto.landing_tipo && <div><strong>Tipo de landing:</strong> {producto.landing_tipo}</div>}
        </div>
      </div>
    </>
  )
}

export default PlantillaCatalogoDetalle
