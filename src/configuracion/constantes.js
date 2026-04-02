// Constantes de la aplicación
export const CONFIGURACION = {
  nombreTienda: 'ME LLEVO ESTO',
  descripcionTienda: 'La tienda más vendedora del mercado',
  urlBase: import.meta.env.VITE_URL_BASE || 'http://localhost:3000',
  limiteProductosPorPagina: 12,
  limiteProductosCarrito: 99,
  moneda: 'COP',
  simboloMoneda: '$',
  formatoMoneda: 'es-CO'
}

// Roles de usuario
export const ROLES = {
  CLIENTE: 'cliente',
  ADMIN: 'admin',
  VENDEDOR: 'vendedor'
}

// Estados de pedidos
export const ESTADOS_PEDIDO = {
  PENDIENTE: 'pendiente',
  CONFIRMADO: 'confirmado',
  ENVIADO: 'enviado',
  ENTREGADO: 'entregado',
  CANCELADO: 'cancelado'
}

// Rutas de la aplicación
export const RUTAS = {
  INICIO: '/',
  PRODUCTO: '/producto',
  CATEGORIA: '/categoria',
  CARRITO: '/carrito',
  CHECKOUT: '/checkout',
  LOGIN: '/login',
  REGISTRO: '/registro',
  PERFIL: '/perfil',
  ADMIN: '/admin'
}

// Configuración de ePayco
export const EPAYCO_CONFIG = {
  PUBLIC_KEY: import.meta.env.VITE_EPAYCO_PUBLIC_KEY, // Credencial pública desde .env
  PRIVATE_KEY: undefined, // No se usa en el frontend por seguridad
  CUSTOMER_ID: undefined, // No se expone en el frontend
  P_KEY: undefined, // No se expone en el frontend
  TEST_MODE: import.meta.env.VITE_EPAYCO_TEST_MODE === 'true', // Modo prueba desde .env
  COUNTRY: "CO", // Colombia
  CURRENCY: "COP", // Peso colombiano
  RESPONSE_URL: import.meta.env.VITE_EPAYCO_URL_RESPONSE || "http://localhost:3002/respuesta-epayco",
  CONFIRMATION_URL: import.meta.env.VITE_EPAYCO_URL_CONFIRMATION || "http://localhost:3002/confirmacion-epayco"
}




























