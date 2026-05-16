import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { clienteSupabase } from '../../configuracion/supabase'
import './SeccionCategorias.css'

interface Categoria {
  id: string
  nombre: string
  slug: string
  icono: string
  descripcion: string
}

export default function SeccionCategorias() {
  const [categorias, setCategorias] = useState<Categoria[]>([])
  const [cargando, setCargando] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    async function cargarCategorias() {
      const { data } = await clienteSupabase
        .from('categorias')
        .select('id, nombre, slug, icono, descripcion')
        .eq('activo', true)
        .order('orden', { ascending: true })
        .limit(6)

      setCategorias(data ?? [])
      setCargando(false)
    }

    cargarCategorias()
  }, [])

  if (!cargando && categorias.length === 0) return null

  return (
    <section className="sc-seccion">
      <div className="sc-contenedor">
        <div className="sc-encabezado">
          <h2 className="sc-titulo">Explora por categoría</h2>
          <p className="sc-subtitulo">Encuentra el acordeón perfecto para tu estilo</p>
        </div>

        {cargando ? (
          <div className="sc-grid">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="sc-card sc-card--skeleton" />
            ))}
          </div>
        ) : (
          <div className="sc-grid">
            {categorias.map((cat) => (
              <button
                key={cat.id}
                className="sc-card"
                onClick={() => navigate(`/tienda/categoria/${cat.slug}`)}
              >
                <span className="sc-icono">{cat.icono}</span>
                <span className="sc-nombre">{cat.nombre}</span>
                {cat.descripcion && (
                  <span className="sc-desc">{cat.descripcion}</span>
                )}
                <span className="sc-flecha">
                  <ArrowRight size={16} />
                </span>
              </button>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
