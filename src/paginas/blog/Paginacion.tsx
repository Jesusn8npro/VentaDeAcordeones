import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import './Paginacion.css';

const Paginacion = ({ paginaActual, totalPaginas, onPageChange }) => {
  if (totalPaginas <= 1) {
    return null;
  }

  const cambiarPagina = (nuevaPagina) => {
    if (nuevaPagina >= 1 && nuevaPagina <= totalPaginas) {
      onPageChange(nuevaPagina);
    }
  };

  const renderizarNumerosPagina = () => {
    const numeros = [];
    for (let i = 1; i <= totalPaginas; i++) {
      numeros.push(
        <button
          key={i}
          onClick={() => cambiarPagina(i)}
          className={`btn-pagina ${paginaActual === i ? 'activo' : ''}`}
          aria-current={paginaActual === i ? 'page' : undefined}
        >
          {i}
        </button>
      );
    }
    return numeros;
  };

  return (
    <nav className="paginacion-nav" aria-label="Paginación de artículos">
      <button
        onClick={() => cambiarPagina(paginaActual - 1)}
        disabled={paginaActual === 1}
        className="btn-nav-pagina"
        aria-label="Página anterior"
      >
        <ChevronLeft size={20} />
        <span>Anterior</span>
      </button>

      <div className="numeros-pagina">
        {renderizarNumerosPagina()}
      </div>

      <button
        onClick={() => cambiarPagina(paginaActual + 1)}
        disabled={paginaActual === totalPaginas}
        className="btn-nav-pagina"
        aria-label="Página siguiente"
      >
        <span>Siguiente</span>
        <ChevronRight size={20} />
      </button>
    </nav>
  );
};

export default Paginacion;