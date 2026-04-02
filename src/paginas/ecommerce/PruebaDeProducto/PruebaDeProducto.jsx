import React, { useEffect, useState } from 'react'
import { clienteSupabase } from '../../../configuracion/supabase'
import TarjetaProductoLujo from '../../../componentes/producto/TarjetaProductoLujo'
import { Loader, AlertCircle } from 'lucide-react'
import './PruebaDeProducto.css'

/**
 * PruebaDeProducto
 * \- Página para validar el nuevo componente premium con datos reales.
 * \- Carga productos desde Supabase y muestra un grid estilizado.
 * \- Base lista para extender campos adicionales (score, ventas, etiquetas).
 */
export default function PruebaDeProducto() {
  const [productos, setProductos] = useState([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => { cargarProductos() }, [])

  async function cargarProductos() {
    try {
      setCargando(true)
      setError(null)

      const { data, error: errorQuery } = await clienteSupabase
        .from('productos')
        .select(`
          *,
          categorias ( id, nombre, icono ),
          producto_imagenes (
            imagen_principal,
            imagen_secundaria_1,
            imagen_secundaria_2,
            imagen_secundaria_3,
            imagen_secundaria_4
          )
        `)
        .eq('activo', true)
        .order('creado_el', { ascending: false })
        .limit(12)

      if (errorQuery) throw errorQuery

      setProductos(data || [])
    } catch (err) {
      console.error('Error cargando productos:', err)
      setError(err.message || 'Error cargando productos')
    } finally {
      setCargando(false)
    }
  }

  return (
    <div className="pdp-contenedor">
      <header className="pdp-header">
        <h1 className="pdp-titulo">Prueba de Producto – Tarjetas Premium</h1>
        <p className="pdp-subtitulo">Diseño de lujo con alto rendimiento comercial y hover refinado</p>
      </header>

      {cargando ? (
        <div className="pdp-cargando">
          <Loader className="spinner" size={48} />
          <p>Cargando productos desde Supabase…</p>
        </div>
      ) : error ? (
        <div className="pdp-error">
          <AlertCircle size={20} />
          <span>{error}</span>
        </div>
      ) : (
        <div className="pdp-grid">
          {productos.map((p) => (
            <TarjetaProductoLujo key={p.id} producto={p} />
          ))}
        </div>
      )}
    </div>
  )
}