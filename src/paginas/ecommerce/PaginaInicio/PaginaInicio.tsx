import React from 'react'
import { useTituloPagina } from '../../../hooks/useTitulosPagina'
import HeroSeccion from '../../../componentes/inicio/HeroSeccion'
import SeccionCategorias from '../../../componentes/inicio/SeccionCategorias'
import SeccionDobleProductos from '../../../componentes/inicio/SeccionDobleProductos'
import SeccionBeneficios from '../../../componentes/inicio/SeccionBeneficios'
import './PaginaInicio.css'

export default function PaginaInicio() {
  useTituloPagina('Acordeones en Colombia')
  return (
    <div className="pagina-inicio">
      <HeroSeccion />
      <SeccionCategorias />
      <SeccionDobleProductos />
      <SeccionBeneficios />
    </div>
  )
}
