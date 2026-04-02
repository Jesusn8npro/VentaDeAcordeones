import React from 'react';
import CarruselProductos from './CarruselProductos';
import './SeccionDobleProductos.css';

const SeccionDobleProductos = () => {
  return (
    <section className="seccion-doble-productos">
      <div className="columna-carrusel">
        <CarruselProductos 
          titulo="Nuevos Productos"
          orden="nuevos"
        />
      </div>
      <div className="columna-carrusel">
        <CarruselProductos 
          titulo="Productos Destacados"
          orden="destacados"
        />
      </div>
    </section>
  );
};

export default SeccionDobleProductos;