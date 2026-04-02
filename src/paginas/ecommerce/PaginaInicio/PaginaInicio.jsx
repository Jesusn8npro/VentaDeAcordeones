import React from 'react'
import HeroSeccion from '../../../componentes/inicio/HeroSeccion'
import SeccionDobleProductos from '../../../componentes/inicio/SeccionDobleProductos';
import './PaginaInicio.css'

// Página de inicio - Landing ultra vendedora
export default function PaginaInicio() {
  return (
    <div className="pagina-inicio">
      <HeroSeccion />
      <SeccionDobleProductos />
    </div>
  )
}
