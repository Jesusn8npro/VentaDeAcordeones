'use client'

import React from 'react'
import { useRouter } from 'next/navigation'
import { formatearPrecioCOP } from '../../../../utilidades/formatoPrecio'
import { ArrowLeft, Package, AlertCircle, Eye, Tag } from 'lucide-react'
import PlantillaCatalogoDetalle from './PlantillaCatalogoDetalle'

const PlantillaCatalogo = ({ producto, config, reviews, notificaciones }) => {
  const router = useRouter()

  if (!producto) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '50vh',
        flexDirection: 'column',
        gap: '1rem'
      }}>
        <AlertCircle size={48} color="#e74c3c" />
        <h2>Producto no encontrado</h2>
        <p>El producto que buscas no existe o no está disponible</p>
        <button 
          onClick={() => router.push('/')}
          style={{
            padding: '0.75rem 1.5rem',
            backgroundColor: '#3498db',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}
        >
          <ArrowLeft size={20} />
          Volver al inicio
        </button>
      </div>
    )
  }

  return (
    <div style={{ 
      maxWidth: '1200px', 
      margin: '0 auto', 
      padding: '2rem',
      fontFamily: 'Arial, sans-serif'
    }}>
      {/* Header con navegación */}
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: '1rem', 
        marginBottom: '2rem',
        paddingBottom: '1rem',
        borderBottom: '1px solid #eee'
      }}>
        <button 
          onClick={() => router.back()}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.5rem 1rem',
            backgroundColor: '#f8f9fa',
            border: '1px solid #dee2e6',
            borderRadius: '6px',
            cursor: 'pointer'
          }}
        >
          <ArrowLeft size={20} />
          Volver
        </button>
        
        <div>
          <h1 style={{ margin: 0, fontSize: '2rem', color: '#2c3e50' }}>
            {producto.nombre}
          </h1>
          <p style={{ margin: '0.5rem 0 0 0', color: '#7f8c8d' }}>
            Slug: {producto.slug}
          </p>
          <p style={{ margin: '0.25rem 0 0 0', color: '#95a5a6', fontSize: '0.9rem' }}>
            📋 Plantilla: Catálogo Estándar
          </p>
        </div>
      </div>

      {/* Contenido principal */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '3rem' }}>
        
        {/* Columna izquierda - Imágenes */}
        <div>
          <h3 style={{ color: '#2c3e50', marginBottom: '1rem' }}>
            <Eye style={{ display: 'inline', marginRight: '0.5rem' }} />
            Imágenes del Producto
          </h3>
          
          {/* Imagen principal */}
          {producto.fotos_principales && producto.fotos_principales.length > 0 ? (
            <div style={{ marginBottom: '1rem', position: 'relative' }}>
              <img 
                src={producto.fotos_principales[0]} 
                alt={producto.nombre}
                style={{ 
                  width: '100%', 
                  maxHeight: '400px', 
                  objectFit: 'cover',
                  borderRadius: '8px',
                  border: '1px solid #dee2e6'
                }}
              />
              {/* Etiqueta VENDIDO */}
              {producto?.estado === 'vendido' && (
                <div style={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  background: 'linear-gradient(135deg, #e74c3c, #c0392b)',
                  color: 'white',
                  padding: '15px 30px',
                  borderRadius: '8px',
                  fontWeight: '900',
                  fontSize: '20px',
                  textAlign: 'center',
                  boxShadow: '0 8px 24px rgba(231, 76, 60, 0.6)',
                  zIndex: 10,
                  border: '3px solid white',
                  letterSpacing: '2px'
                }}>
                  VENDIDO
                </div>
              )}
            </div>
          ) : (
            <div style={{ 
              width: '100%', 
              height: '400px', 
              backgroundColor: '#f8f9fa',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: '8px',
              border: '1px solid #dee2e6',
              marginBottom: '1rem',
              position: 'relative'
            }}>
              <Package size={64} color="#6c757d" />
              {/* Etiqueta VENDIDO para placeholder */}
              {producto?.estado === 'vendido' && (
                <div style={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  background: 'linear-gradient(135deg, #e74c3c, #c0392b)',
                  color: 'white',
                  padding: '15px 30px',
                  borderRadius: '8px',
                  fontWeight: '900',
                  fontSize: '20px',
                  textAlign: 'center',
                  boxShadow: '0 8px 24px rgba(231, 76, 60, 0.6)',
                  zIndex: 10,
                  border: '3px solid white',
                  letterSpacing: '2px'
                }}>
                  VENDIDO
                </div>
              )}
            </div>
          )}

          {/* Galería de imágenes secundarias */}
          {producto.fotos_secundarias && producto.fotos_secundarias.length > 0 && (
            <div>
              <h4>Más imágenes:</h4>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', gap: '0.5rem' }}>
                {producto.fotos_secundarias.map((foto, index) => (
                  <img 
                    key={index}
                    src={foto} 
                    alt={`${producto.nombre} - ${index + 1}`}
                    style={{ 
                      width: '100%', 
                      height: '100px', 
                      objectFit: 'cover',
                      borderRadius: '4px',
                      border: '1px solid #dee2e6'
                    }}
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Columna derecha - Información */}
        <div>
          {/* Información básica */}
          <div style={{ 
            backgroundColor: '#f8f9fa', 
            padding: '1.5rem', 
            borderRadius: '8px',
            marginBottom: '2rem',
            border: '1px solid #dee2e6'
          }}>
            <h3 style={{ color: '#2c3e50', marginBottom: '1rem' }}>
              <Tag style={{ display: 'inline', marginRight: '0.5rem' }} />
              Información Básica
            </h3>
            
            <div style={{ display: 'grid', gap: '0.75rem' }}>
              <div><strong>ID:</strong> {producto.id}</div>
              <div><strong>Nombre:</strong> {producto.nombre}</div>
              <div><strong>Slug:</strong> {producto.slug}</div>
              
              {producto.categorias && (
                <div>
                  <strong>Categoría:</strong> 
                  <span style={{ 
                    marginLeft: '0.5rem',
                    padding: '0.25rem 0.75rem',
                    backgroundColor: '#e3f2fd',
                    borderRadius: '20px',
                    fontSize: '0.875rem'
                  }}>
                    {producto.categorias.icono} {producto.categorias.nombre}
                  </span>
                </div>
              )}
              
              <div>
                <strong>Estado:</strong> 
                {producto?.estado === 'vendido' ? (
                  <span style={{ 
                    marginLeft: '0.5rem',
                    padding: '0.5rem 1rem',
                    background: 'linear-gradient(135deg, #e74c3c, #c0392b)',
                    color: 'white',
                    borderRadius: '20px',
                    fontSize: '0.875rem',
                    fontWeight: 'bold',
                    letterSpacing: '1px',
                    boxShadow: '0 2px 8px rgba(231, 76, 60, 0.3)'
                  }}>
                    🚫 VENDIDO
                  </span>
                ) : (
                  <span style={{ 
                    marginLeft: '0.5rem',
                    padding: '0.25rem 0.75rem',
                    backgroundColor: producto.activo ? '#d4edda' : '#f8d7da',
                    color: producto.activo ? '#155724' : '#721c24',
                    borderRadius: '20px',
                    fontSize: '0.875rem'
                  }}>
                    {producto.activo ? '✅ Activo' : '❌ Inactivo'}
                  </span>
                )}
              </div>
              
              <div>
                <strong>Destacado:</strong> {producto.destacado ? '⭐ Sí' : 'No'}
              </div>
            </div>
          </div>

          {/* Precios */}
          <div style={{ 
            backgroundColor: '#fff3cd', 
            padding: '1.5rem', 
            borderRadius: '8px',
            marginBottom: '2rem',
            border: '1px solid #ffeaa7'
          }}>
            <h3 style={{ color: '#856404', marginBottom: '1rem' }}>
              💰 Precios
            </h3>
            
            <div style={{ display: 'grid', gap: '0.75rem' }}>
              <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#27ae60' }}>
                <strong>Precio actual:</strong> {formatearPrecioCOP(producto.precio)}
              </div>
              
              {producto.precio_original && producto.precio_original !== producto.precio && (
                <div>
                  <strong>Precio original:</strong> 
                  <span style={{ textDecoration: 'line-through', color: '#e74c3c', marginLeft: '0.5rem' }}>
                    {formatearPrecioCOP(producto.precio_original)}
                  </span>
                </div>
              )}
              
              {producto.descuento && (
                <div style={{ color: '#e74c3c', fontWeight: 'bold' }}>
                  <strong>Descuento:</strong> {producto.descuento}%
                </div>
              )}
            </div>
          </div>

          {/* Stock e inventario */}
          <div style={{ 
            backgroundColor: '#e8f5e8', 
            padding: '1.5rem', 
            borderRadius: '8px',
            marginBottom: '2rem',
            border: '1px solid #c3e6c3'
          }}>
            <h3 style={{ color: '#2d5a2d', marginBottom: '1rem' }}>
              <Package style={{ display: 'inline', marginRight: '0.5rem' }} />
              Inventario
            </h3>
            
            <div style={{ display: 'grid', gap: '0.75rem' }}>
              <div>
                <strong>Stock disponible:</strong> 
                <span style={{ 
                  marginLeft: '0.5rem',
                  fontSize: '1.25rem',
                  fontWeight: 'bold',
                  color: producto.stock > 10 ? '#27ae60' : producto.stock > 0 ? '#f39c12' : '#e74c3c'
                }}>
                  {producto.stock || 0} unidades
                </span>
              </div>
              
              <div><strong>Stock mínimo:</strong> {producto.stock_minimo || 0} unidades</div>
              
              <div>
                <strong>Estado del stock:</strong>
                <span style={{ 
                  marginLeft: '0.5rem',
                  padding: '0.25rem 0.75rem',
                  backgroundColor: producto.stock > 10 ? '#d4edda' : producto.stock > 0 ? '#fff3cd' : '#f8d7da',
                  color: producto.stock > 10 ? '#155724' : producto.stock > 0 ? '#856404' : '#721c24',
                  borderRadius: '20px',
                  fontSize: '0.875rem'
                }}>
                  {producto.stock > 10 ? '✅ En stock' : producto.stock > 0 ? '⚠️ Poco stock' : '❌ Agotado'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <PlantillaCatalogoDetalle producto={producto} />

    </div>
  )
}

export default PlantillaCatalogo














