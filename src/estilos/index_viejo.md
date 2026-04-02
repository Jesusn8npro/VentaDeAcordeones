/* Estilos base de ME LLEVO ESTO - Tienda Ultra Vendedora */

/* Reset y variables CSS */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

:root {
  /* Colores principales */
  --color-primario: #ff6b35;
  --color-primario-hover: #e55a2b;
  --color-secundario: #2c3e50;
  --color-secundario-hover: #34495e;
  
  /* Colores de estado */
  --color-exito: #27ae60;
  --color-error: #e74c3c;
  --color-advertencia: #f39c12;
  --color-info: #3498db;
  
  /* Colores neutros */
  --color-blanco: #ffffff;
  --color-gris-claro: #f8f9fa;
  --color-gris-medio: #6c757d;
  --color-gris-oscuro: #343a40;
  --color-negro: #000000;
  
  /* Colores de fondo */
  --fondo-principal: #ffffff;
  --fondo-secundario: #f8f9fa;
  --fondo-oscuro: #2c3e50;
  
  /* Tipografía */
  --fuente-principal: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  --fuente-secundaria: 'Poppins', sans-serif;
  
  /* Tamaños de fuente */
  --texto-xs: 0.75rem;
  --texto-sm: 0.875rem;
  --texto-base: 1rem;
  --texto-lg: 1.125rem;
  --texto-xl: 1.25rem;
  --texto-2xl: 1.5rem;
  --texto-3xl: 1.875rem;
  --texto-4xl: 2.25rem;
  
  /* Espaciado */
  --espacio-xs: 0.25rem;
  --espacio-sm: 0.5rem;
  --espacio-md: 1rem;
  --espacio-lg: 1.5rem;
  --espacio-xl: 2rem;
  --espacio-2xl: 3rem;
  
  /* Bordes */
  --radio-sm: 0.25rem;
  --radio-md: 0.5rem;
  --radio-lg: 0.75rem;
  --radio-xl: 1rem;
  
  /* Sombras */
  --sombra-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  --sombra-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  --sombra-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
  --sombra-xl: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
  
  /* Transiciones */
  --transicion-rapida: 0.15s ease-in-out;
  --transicion-normal: 0.3s ease-in-out;
  --transicion-lenta: 0.5s ease-in-out;
  
  /* Z-index */
  --z-dropdown: 1000;
  --z-sticky: 1020;
  --z-fixed: 1030;
  --z-modal-backdrop: 1040;
  --z-modal: 1050;
  --z-popover: 1060;
  --z-tooltip: 1070;
}

/* Estilos base del body */
body {
  font-family: var(--fuente-principal);
  font-size: var(--texto-base);
  line-height: 1.6;
  color: var(--color-gris-oscuro);
  background-color: var(--fondo-principal);
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

/* Estilos de enlaces */
a {
  color: var(--color-primario);
  text-decoration: none;
  transition: color var(--transicion-rapida);
}

a:hover {
  color: var(--color-primario-hover);
}

/* Layout principal */
.layout-principal {
  overflow: visible;
  position: relative;
}

.contenido-principal {
  overflow: visible;
  position: relative;
}

/* Estilos de botones base */
.boton {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: var(--espacio-sm) var(--espacio-md);
  border: none;
  border-radius: var(--radio-md);
  font-family: var(--fuente-principal);
  font-size: var(--texto-base);
  font-weight: 600;
  cursor: pointer;
  transition: all var(--transicion-rapida);
  text-decoration: none;
  white-space: nowrap;
}

.boton--primario {
  background-color: var(--color-primario);
  color: var(--color-blanco);
}

.boton--primario:hover {
  background-color: var(--color-primario-hover);
  transform: translateY(-1px);
  box-shadow: var(--sombra-md);
}

.boton--secundario {
  background-color: var(--color-secundario);
  color: var(--color-blanco);
}

.boton--secundario:hover {
  background-color: var(--color-secundario-hover);
  transform: translateY(-1px);
  box-shadow: var(--sombra-md);
}

.boton--outline {
  background-color: transparent;
  color: var(--color-primario);
  border: 2px solid var(--color-primario);
}

.boton--outline:hover {
  background-color: var(--color-primario);
  color: var(--color-blanco);
}

.boton--pequeno {
  padding: var(--espacio-xs) var(--espacio-sm);
  font-size: var(--texto-sm);
}

.boton--grande {
  padding: var(--espacio-md) var(--espacio-xl);
  font-size: var(--texto-lg);
}

.boton--deshabilitado {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none !important;
  box-shadow: none !important;
}

.boton--cargando {
  position: relative;
  color: transparent;
}

.boton--cargando::after {
  content: '';
  position: absolute;
  width: 16px;
  height: 16px;
  border: 2px solid transparent;
  border-top: 2px solid currentColor;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* Estilos de tarjetas */
.tarjeta {
  background-color: var(--color-blanco);
  border-radius: var(--radio-lg);
  box-shadow: var(--sombra-sm);
  overflow: hidden;
  transition: all var(--transicion-normal);
}

.tarjeta:hover {
  box-shadow: var(--sombra-lg);
  transform: translateY(-2px);
}

.tarjeta--producto {
  border: 1px solid #e9ecef;
}

.tarjeta--producto:hover {
  border-color: var(--color-primario);
}

/* Estilos de inputs */
.input-contenedor {
  margin-bottom: var(--espacio-md);
}

.input-etiqueta {
  display: block;
  margin-bottom: var(--espacio-xs);
  font-weight: 600;
  color: var(--color-gris-oscuro);
}

.input {
  width: 100%;
  padding: var(--espacio-sm) var(--espacio-md);
  border: 2px solid #e9ecef;
  border-radius: var(--radio-md);
  font-family: var(--fuente-principal);
  font-size: var(--texto-base);
  transition: border-color var(--transicion-rapida);
}

.input:focus {
  outline: none;
  border-color: var(--color-primario);
  box-shadow: 0 0 0 3px rgba(255, 107, 53, 0.1);
}

.input--error {
  border-color: var(--color-error);
}

.input-error {
  display: block;
  margin-top: var(--espacio-xs);
  font-size: var(--texto-sm);
  color: var(--color-error);
}

/* Layout principal */
.layout-principal {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%);
}

.header-sticky {
  position: sticky;
  top: 0;
  z-index: var(--z-sticky);
  background-color: var(--color-blanco);
  box-shadow: var(--sombra-sm);
}

.contenido-principal {
  flex: 1;
  padding: 0;
  min-height: calc(100vh - 200px);
}

.footer {
  background-color: var(--color-secundario);
  color: var(--color-blanco);
  padding: var(--espacio-xl) 0;
  margin-top: auto;
}

/* Carrito flotante */
.carrito-flotante {
  position: fixed;
  bottom: var(--espacio-xl);
  right: var(--espacio-xl);
  z-index: var(--z-fixed);
  background-color: var(--color-primario);
  color: var(--color-blanco);
  padding: var(--espacio-md);
  border-radius: 50%;
  box-shadow: var(--sombra-lg);
  cursor: pointer;
  transition: all var(--transicion-normal);
}

.carrito-flotante:hover {
  transform: scale(1.1);
  box-shadow: var(--sombra-xl);
}

/* Animaciones */
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slideUp {
  from { 
    opacity: 0;
    transform: translateY(20px);
  }
  to { 
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes slideDown {
  from { 
    opacity: 0;
    transform: translateY(-20px);
  }
  to { 
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes shake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-5px); }
  75% { transform: translateX(5px); }
}

.animate-fade-in {
  animation: fadeIn 0.5s ease-in-out;
}

.animate-slide-up {
  animation: slideUp 0.5s ease-in-out;
}

.animate-slide-down {
  animation: slideDown 0.5s ease-in-out;
}

.animate-shake {
  animation: shake 0.5s ease-in-out;
}

/* Responsive */
@media (max-width: 768px) {
  .contenido-principal {
    padding: var(--espacio-md) 0;
  }
  
  .carrito-flotante {
    bottom: var(--espacio-md);
    right: var(--espacio-md);
  }
}

/* Utilidades */
.texto-centro { text-align: center; }
.texto-izquierda { text-align: left; }
.texto-derecha { text-align: right; }

.mb-xs { margin-bottom: var(--espacio-xs); }
.mb-sm { margin-bottom: var(--espacio-sm); }
.mb-md { margin-bottom: var(--espacio-md); }
.mb-lg { margin-bottom: var(--espacio-lg); }
.mb-xl { margin-bottom: var(--espacio-xl); }

.mt-xs { margin-top: var(--espacio-xs); }
.mt-sm { margin-top: var(--espacio-sm); }
.mt-md { margin-top: var(--espacio-md); }
.mt-lg { margin-top: var(--espacio-lg); }
.mt-xl { margin-top: var(--espacio-xl); }

.p-xs { padding: var(--espacio-xs); }
.p-sm { padding: var(--espacio-sm); }
.p-md { padding: var(--espacio-md); }
.p-lg { padding: var(--espacio-lg); }
.p-xl { padding: var(--espacio-xl); }

/* Contenedores */
.contenedor {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 var(--espacio-md);
}

.contenedor-fluido {
  width: 100%;
  padding: 0 var(--espacio-md);
}

/* Grid */
.grid {
  display: grid;
  gap: var(--espacio-md);
}

.grid-2 { grid-template-columns: repeat(2, 1fr); }
.grid-3 { grid-template-columns: repeat(3, 1fr); }
.grid-4 { grid-template-columns: repeat(4, 1fr); }
.grid-auto { grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); }

/* Flex */
.flex { display: flex; }
.flex-col { flex-direction: column; }
.flex-wrap { flex-wrap: wrap; }
.items-center { align-items: center; }
.items-start { align-items: flex-start; }
.items-end { align-items: flex-end; }
.justify-center { justify-content: center; }
.justify-between { justify-content: space-between; }
.justify-around { justify-content: space-around; }
.justify-start { justify-content: flex-start; }
.justify-end { justify-content: flex-end; }

/* Espaciado flex */
.gap-xs { gap: var(--espacio-xs); }
.gap-sm { gap: var(--espacio-sm); }
.gap-md { gap: var(--espacio-md); }
.gap-lg { gap: var(--espacio-lg); }
.gap-xl { gap: var(--espacio-xl); }

/* Visibilidad */
.oculto { display: none; }
.visible { display: block; }
.invisible { visibility: hidden; }

/* Responsive */
@media (max-width: 768px) {
  .grid-2, .grid-3, .grid-4 {
    grid-template-columns: 1fr;
  }
  
  .oculto-movil { display: none; }
  .visible-movil { display: block; }
}

@media (min-width: 769px) {
  .oculto-escritorio { display: none; }
  .visible-escritorio { display: block; }
}

/* Estados hover mejorados */
.hover-escala:hover {
  transform: scale(1.05);
  transition: transform var(--transicion-normal);
}

.hover-sombra:hover {
  box-shadow: var(--sombra-lg);
  transition: box-shadow var(--transicion-normal);
}

.hover-brillo:hover {
  filter: brightness(1.1);
  transition: filter var(--transicion-normal);
}

/* Gradientes */
.gradiente-primario {
  background: linear-gradient(135deg, var(--color-primario) 0%, #e55a2b 100%);
}

.gradiente-secundario {
  background: linear-gradient(135deg, var(--color-secundario) 0%, #34495e 100%);
}

.gradiente-vendedor {
  background: linear-gradient(135deg, #e53e3e 0%, #ff6b35 100%);
}

/* Bordes */
.borde { border: 1px solid #e9ecef; }
.borde-primario { border: 2px solid var(--color-primario); }
.borde-redondeado { border-radius: var(--radio-md); }
.borde-circular { border-radius: 50%; }

/* Sombras */
.sombra-sm { box-shadow: var(--sombra-sm); }
.sombra-md { box-shadow: var(--sombra-md); }
.sombra-lg { box-shadow: var(--sombra-lg); }
.sombra-xl { box-shadow: var(--sombra-xl); }

/* Estilos específicos para componentes */
.layout-principal header {
  background-color: var(--color-blanco);
  padding: var(--espacio-md) 0;
  box-shadow: var(--sombra-sm);
}

.layout-principal nav {
  display: flex;
  justify-content: space-between;
  align-items: center;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 var(--espacio-md);
}

.layout-principal nav h1 {
  color: var(--color-primario);
  font-size: var(--texto-2xl);
  font-weight: 700;
}

.layout-principal nav ul {
  display: flex;
  list-style: none;
  gap: var(--espacio-lg);
}

.layout-principal nav ul li a {
  color: var(--color-gris-oscuro);
  font-weight: 500;
  padding: var(--espacio-sm) var(--espacio-md);
  border-radius: var(--radio-md);
  transition: all var(--transicion-rapida);
}

.layout-principal nav ul li a:hover {
  background-color: var(--color-primario);
  color: var(--color-blanco);
}

.layout-principal main {
  flex: 1;
  padding: var(--espacio-2xl) var(--espacio-md);
  text-align: center;
}

.layout-principal main h2 {
  color: var(--color-secundario);
  font-size: var(--texto-3xl);
  margin-bottom: var(--espacio-md);
}

.layout-principal main p {
  color: var(--color-gris-medio);
  font-size: var(--texto-lg);
  max-width: 600px;
  margin: 0 auto;
}

.layout-principal footer {
  background-color: var(--color-secundario);
  color: var(--color-blanco);
  text-align: center;
  padding: var(--espacio-lg) 0;
}

.dashboard-admin {
  padding: var(--espacio-2xl) var(--espacio-md);
  text-align: center;
}

.dashboard-admin h1 {
  color: var(--color-secundario);
  font-size: var(--texto-3xl);
  margin-bottom: var(--espacio-md);
}

.dashboard-admin p {
  color: var(--color-gris-medio);
  font-size: var(--texto-lg);
}

/* ===== MARGEN INFERIOR PARA NAVEGACIÓN MÓVIL ===== */
/* Agregar margen inferior en dispositivos móviles para evitar que el menú tape el contenido */
@media (max-width: 767px) {
  body {
    padding-bottom: 90px; /* Altura del menú móvil + margen extra */
  }
  
  /* Asegurar que las páginas principales tengan margen inferior */
  .pagina-carrito,
  .pagina-tienda,
  .pagina-inicio,
  .pagina-producto,
  .pagina-categoria,
  .pagina-favoritos,
  .pagina-perfil {
    padding-bottom: 20px;
    margin-bottom: 0;
  }
  
  /* Contenedores principales */
  .layout-principal,
  .contenido-principal {
    padding-bottom: 20px;
  }
}