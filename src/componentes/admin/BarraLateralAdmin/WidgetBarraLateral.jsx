export default function WidgetBarraLateral() {
  return (
    <div className="widget-barra-lateral">
      <h3 className="widget-titulo">
        Panel Admin de la Tienda
      </h3>
      <p className="widget-descripcion">
        Gestión integral de productos, imágenes, pedidos y reportes para "ME LLEVO ESTO".
      </p>
      <a
        href="/admin"
        target="_self"
        rel="nofollow"
        className="widget-boton"
      >
        Ir al Panel
      </a>
    </div>
  )
}
