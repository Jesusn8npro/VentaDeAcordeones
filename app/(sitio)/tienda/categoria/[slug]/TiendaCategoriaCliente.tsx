'use client'

// Recibe del servidor la categoría ya resuelta y se la pasa a PaginaTienda, para que el
// H1 y la descripción salgan en el HTML de la primera respuesta y no después de un
// fetch del navegador (que Google no espera).
import PaginaTienda from '@/paginas/ecommerce/PaginaTienda/PaginaTienda'

export default PaginaTienda
