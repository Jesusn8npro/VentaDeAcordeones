import React, { Suspense, lazy } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom'
import { ComponenteSeguridad } from './componentes/seguridad/ComponenteSeguridad.jsx'

// Componente de carga para Suspense
const SuspenseLayout = ({ children }) => (
  <Suspense fallback={<div>Cargando...</div>}>
    {children}
  </Suspense>
);
import ChatEnVivo from './componentes/chat/ChatEnVivo';
import BotonWhatsapp from './componentes/BotonWhatsapp/BotonWhatsapp';
import NotificacionCarritoWrapper from './componentes/ui/NotificacionCarritoWrapper';
import HeaderPrincipal from './componentes/layout/HeaderPrincipal'
import RutaAdmin from './componentes/autenticacion/RutaAdmin'
import FavoritosProvider from './contextos/FavoritosContext'
import { CarritoProvider } from './contextos/CarritoContext'
import { ChatProvider } from './contextos/ChatContext'
// import ProteccionAvanzada from './componentes/ProteccionAvanzada' // Comentado temporalmente
const PaginaInicio = lazy(() => import('./paginas/ecommerce/PaginaInicio/PaginaInicio.jsx'));
const PaginaProducto = lazy(() => import('./paginas/ecommerce/PaginaProducto/PaginaProducto.jsx'));
const PaginaCategoria = lazy(() => import('./paginas/ecommerce/PaginaCategoria/PaginaCategoria.jsx'));
const PaginaCarrito = lazy(() => import('./paginas/ecommerce/PaginaCarrito/PaginaCarrito.jsx'));
const PaginaFavoritos = lazy(() => import('./paginas/ecommerce/PaginaFavoritos/PaginaFavoritos.jsx'));
const PaginaCheckout = lazy(() => import('./paginas/ecommerce/PaginaCheckout/PaginaCheckout.jsx'));
const PaginaLogin = lazy(() => import('./paginas/autenticacion/PaginaLogin/PaginaLogin.jsx'));
const PaginaRegistro = lazy(() => import('./paginas/autenticacion/PaginaRegistro/PaginaRegistro.jsx'));
const PaginaPerfil = lazy(() => import('./paginas/autenticacion/PaginaPerfil/PaginaPerfil.jsx'));
const PaginaRestablecerContrasena = lazy(() => import('./paginas/autenticacion/PaginaResetPassword/PaginaResetPassword.jsx'));
const PaginaSesionCerrada = lazy(() => import('./paginas/autenticacion/PaginaSesionCerrada/PaginaSesionCerrada.jsx'));
import PaginaNoEncontrada from './paginas/sistema/PaginaNoEncontrada/PaginaNoEncontrada'
import PaginaRespuestaEpayco from './paginas/ecommerce/PaginaRespuestaEpayco/PaginaRespuestaEpayco'
import ConfirmacionEpayco from './paginas/ecommerce/ConfirmacionEpayco'
import Contacto from './paginas/empresa/Contacto/Contacto'
import QuienesSomos from './paginas/empresa/QuienesSomos/QuienesSomos'
import TerminosCondiciones from './paginas/legal/TerminosCondiciones/TerminosCondiciones'
import PoliticaPrivacidad from './paginas/legal/PoliticaPrivacidad/PoliticaPrivacidad'
import PruebaDeProducto from './paginas/ecommerce/PruebaDeProducto/PruebaDeProducto'
import PreguntasFrecuentes from './paginas/legal/PreguntasFrecuentes/PreguntasFrecuentes'
import TrabajaConNosotros from './paginas/empresa/TrabajaConNosotros/TrabajaConNosotros'
const DashboardAdmin = lazy(() => import('./paginas/admin/DashboardAdmin/DashboardAdmin.jsx'));
const DisposicionAdmin = lazy(() => import('./componentes/admin/DisposicionAdmin/DisposicionAdmin'));
const ListaProductos = lazy(() => import('./paginas/admin/productos/ListaProductos.jsx'));
const GestionProductos = lazy(() => import('./paginas/admin/GestionProductos/GestionProductos.jsx'));
const CreadorProductosPR = lazy(() => import('./paginas/admin/CreadorDeProductosPR/CreadorProductosPR.jsx'));
const CreadorArticulos = lazy(() => import('./paginas/admin/Blog/CreadorArticulos.jsx'));
const EditarProducto = lazy(() => import('./paginas/admin/PaginaEditarProducto/EditarProducto.jsx'));
const Categorias = lazy(() => import('./paginas/admin/Categorias/Categorias.jsx'));
const Pedidos = lazy(() => import('./paginas/admin/Pedidos/Pedidos.jsx'));
const Inventario = lazy(() => import('./paginas/admin/Inventario/Inventario.jsx'));
const Usuarios = lazy(() => import('./paginas/admin/Usuarios/Usuarios.jsx'));
const AdminChats = lazy(() => import('./paginas/admin/ManejoDeChats/AdminChats.jsx'));
const ImagenesIA = lazy(() => import('./paginas/admin/ImagenesIA/ImagenesIA.jsx'));
const VideosIA = lazy(() => import('./paginas/admin/VideosIA/VideosIA.jsx'));
const PanelFeedMeta = lazy(() => import('./paginas/admin/FeedMeta/PanelFeedMeta.jsx'));
const GenericaAdmin = lazy(() => import('./paginas/admin/GenericaAdmin.jsx'));
const CalendarioTareas = lazy(() => import('./paginas/admin/calendario_tareas/CalendarioTareas.jsx'));
const TableroTareas = lazy(() => import('./paginas/admin/calendario_tareas/TableroTareas.jsx'));
const AdminBlog = lazy(() => import('./paginas/admin/Blog/AdminBlog.jsx'));
const ManejoCupones = lazy(() => import('./paginas/admin/ManejoCupones/ManejoCupones.jsx'));
const LandingProducto = lazy(() => import('./paginas/LandingProducto.jsx'));
const PlantillaTemu = lazy(() => import('./componentes/landing/plantillas/PlantillaTemu/PlantillaTemu.jsx'));
const PaginaTienda = lazy(() => import('./paginas/ecommerce/PaginaTienda/PaginaTienda.jsx'));
const PaginaBlog = lazy(() => import('./paginas/blog/PaginaBlog'));
const ArticuloBlog = lazy(() => import('./paginas/blog/ArticuloBlog'));
const Ayuda = lazy(() => import('./paginas/ayuda/Ayuda'));

function App() {
  const location = useLocation()

  // Rutas donde NO queremos mostrar los chats (páginas de productos)
  const rutasSinChats = [
    '/landing/', // Landing de productos
    '/producto/', // Páginas individuales de productos
    '/test-sticky', // Página de prueba con PlantillaTemu
    '/admin' // Ocultar chat y WhatsApp en todas las páginas de admin
  ]

  // Verificar si la ruta actual es una página de producto
  const esRutaDeProducto = rutasSinChats.some(ruta =>
    location.pathname.startsWith(ruta) || location.pathname === ruta
  )

  return (
    <ComponenteSeguridad>
      <ChatProvider>
        <CarritoProvider>
          <FavoritosProvider>
            <div className="app">
              {/* Chat flotante visible en toda la aplicación EXCEPTO en páginas de productos */}
              {!esRutaDeProducto && <ChatEnVivo />}
              {/* Botón de WhatsApp flotante súper vendedor EXCEPTO en páginas de productos */}
              {!esRutaDeProducto && <BotonWhatsapp />}
              {/* <ProteccionAvanzada /> */}
              <SuspenseLayout>
                <Routes>
                  {/* Admin Dashboard Real - Protegido por autenticación y rol */}
                  <Route path="/admin" element={
                    <RutaAdmin>
                      <DashboardAdmin />
                    </RutaAdmin>
                  } />

                  {/* Rutas de E-commerce Admin - Protegidas y con layout */}
                  <Route path="/admin/gestion-productos" element={
                    <RutaAdmin>
                      <DisposicionAdmin>
                        <GestionProductos />
                      </DisposicionAdmin>
                    </RutaAdmin>
                  } />
                  <Route path="/admin/productos" element={
                    <RutaAdmin>
                      <DisposicionAdmin>
                        <ListaProductos />
                      </DisposicionAdmin>
                    </RutaAdmin>
                  } />
                  <Route path="/admin/productos/agregar" element={
                    <RutaAdmin>
                      <DisposicionAdmin>
                        <CreadorProductosPR />
                      </DisposicionAdmin>
                    </RutaAdmin>
                  } />
                  <Route path="/admin/productos/creador-pr" element={
                    <RutaAdmin>
                      <DisposicionAdmin>
                        <CreadorProductosPR />
                      </DisposicionAdmin>
                    </RutaAdmin>
                  } />
                  <Route path="/admin/productos/editar/:slug" element={
                    <RutaAdmin>
                      <DisposicionAdmin>
                        <EditarProducto />
                      </DisposicionAdmin>
                    </RutaAdmin>
                  } />
                  <Route path="/admin/blog" element={
                    <RutaAdmin>
                      <DisposicionAdmin>
                        <AdminBlog />
                      </DisposicionAdmin>
                    </RutaAdmin>
                  } />
                  <Route path="/admin/blog/crear" element={
                    <RutaAdmin>
                      <DisposicionAdmin>
                        <CreadorArticulos />
                      </DisposicionAdmin>
                    </RutaAdmin>
                  } />
                  <Route path="/admin/blog/editar/:slug" element={
                    <RutaAdmin>
                      <DisposicionAdmin>
                        <CreadorArticulos />
                      </DisposicionAdmin>
                    </RutaAdmin>
                  } />
                  <Route path="/admin/categorias" element={
                    <RutaAdmin>
                      <DisposicionAdmin>
                        <Categorias />
                      </DisposicionAdmin>
                    </RutaAdmin>
                  } />
                  <Route path="/admin/cupones" element={
                    <RutaAdmin>
                      <DisposicionAdmin>
                        <ManejoCupones />
                      </DisposicionAdmin>
                    </RutaAdmin>
                  } />
                  <Route path="/admin/pedidos" element={
                    <RutaAdmin>
                      <DisposicionAdmin>
                        <Pedidos />
                      </DisposicionAdmin>
                    </RutaAdmin>
                  } />
                  <Route path="/admin/inventario" element={
                    <RutaAdmin>
                      <DisposicionAdmin>
                        <Inventario />
                      </DisposicionAdmin>
                    </RutaAdmin>
                  } />
                  <Route path="/admin/usuarios" element={
                    <RutaAdmin>
                      <DisposicionAdmin>
                        <Usuarios />
                      </DisposicionAdmin>
                    </RutaAdmin>
                  } />
                  <Route path="/admin/imagenes-ia" element={
                    <RutaAdmin>
                      <DisposicionAdmin>
                        <ImagenesIA />
                      </DisposicionAdmin>
                    </RutaAdmin>
                  } />
                  <Route path="/admin/feed-meta" element={
                    <RutaAdmin>
                      <DisposicionAdmin>
                        <PanelFeedMeta />
                      </DisposicionAdmin>
                    </RutaAdmin>
                  } />
                  <Route path="/admin/chats" element={
                    <RutaAdmin>
                      <DisposicionAdmin>
                        <AdminChats />
                      </DisposicionAdmin>
                    </RutaAdmin>
                  } />

                  <Route path="/admin/calendario-tareas" element={
                    <RutaAdmin>
                      <DisposicionAdmin>
                        <CalendarioTareas />
                      </DisposicionAdmin>
                    </RutaAdmin>
                  } />
                  <Route path="/admin/tablero-tareas" element={
                    <RutaAdmin>
                      <DisposicionAdmin>
                        <TableroTareas />
                      </DisposicionAdmin>
                    </RutaAdmin>
                  } />

                  {/* Rutas admin adicionales para navegación completa del sidebar */}
                  <Route path="/admin/calendario" element={
                    <RutaAdmin>
                      <DisposicionAdmin>
                        <GenericaAdmin titulo="Calendario" descripcion="Vista de calendario (pendiente)." />
                      </DisposicionAdmin>
                    </RutaAdmin>
                  } />
                  <Route path="/admin/perfil" element={
                    <RutaAdmin>
                      <DisposicionAdmin>
                        <GenericaAdmin titulo="Perfil de Usuario" descripcion="Gestión de perfil (pendiente)." />
                      </DisposicionAdmin>
                    </RutaAdmin>
                  } />
                  <Route path="/admin/elementos-formulario" element={
                    <RutaAdmin>
                      <DisposicionAdmin>
                        <GenericaAdmin titulo="Elementos de Formulario" descripcion="Componentes de formularios (pendiente)." />
                      </DisposicionAdmin>
                    </RutaAdmin>
                  } />
                  <Route path="/admin/tablas-basicas" element={
                    <RutaAdmin>
                      <DisposicionAdmin>
                        <GenericaAdmin titulo="Tablas Básicas" descripcion="Ejemplos de tablas (pendiente)." />
                      </DisposicionAdmin>
                    </RutaAdmin>
                  } />
                  <Route path="/admin/grafico-lineas" element={
                    <RutaAdmin>
                      <DisposicionAdmin>
                        <GenericaAdmin titulo="Gráfico de Líneas" descripcion="Demo de gráfico de líneas (pendiente)." />
                      </DisposicionAdmin>
                    </RutaAdmin>
                  } />
                  <Route path="/admin/grafico-barras" element={
                    <RutaAdmin>
                      <DisposicionAdmin>
                        <GenericaAdmin titulo="Gráfico de Barras" descripcion="Demo de gráfico de barras (pendiente)." />
                      </DisposicionAdmin>
                    </RutaAdmin>
                  } />
                  <Route path="/admin/alertas" element={
                    <RutaAdmin>
                      <DisposicionAdmin>
                        <GenericaAdmin titulo="Alertas" descripcion="Componentes de alerta (pendiente)." />
                      </DisposicionAdmin>
                    </RutaAdmin>
                  } />
                  <Route path="/admin/avatares" element={
                    <RutaAdmin>
                      <DisposicionAdmin>
                        <GenericaAdmin titulo="Avatares" descripcion="Componentes de avatar (pendiente)." />
                      </DisposicionAdmin>
                    </RutaAdmin>
                  } />
                  <Route path="/admin/insignias" element={
                    <RutaAdmin>
                      <DisposicionAdmin>
                        <GenericaAdmin titulo="Insignias" descripcion="Componentes de insignias (pendiente)." />
                      </DisposicionAdmin>
                    </RutaAdmin>
                  } />
                  <Route path="/admin/botones" element={
                    <RutaAdmin>
                      <DisposicionAdmin>
                        <GenericaAdmin titulo="Botones" descripcion="Componentes de botones (pendiente)." />
                      </DisposicionAdmin>
                    </RutaAdmin>
                  } />
                  <Route path="/admin/imagenes" element={
                    <RutaAdmin>
                      <DisposicionAdmin>
                        <GenericaAdmin titulo="Imágenes" descripcion="Componentes de imágenes (pendiente)." />
                      </DisposicionAdmin>
                    </RutaAdmin>
                  } />
                  <Route path="/admin/videos" element={
                    <RutaAdmin>
                      <DisposicionAdmin>
                        <VideosIA />
                      </DisposicionAdmin>
                    </RutaAdmin>
                  } />
                  <Route path="/admin/iniciar-sesion" element={
                    <RutaAdmin>
                      <DisposicionAdmin>
                        <GenericaAdmin titulo="Iniciar Sesión" descripcion="Pantalla de login demostrativa (pendiente)." />
                      </DisposicionAdmin>
                    </RutaAdmin>
                  } />
                  <Route path="/admin/registrarse" element={
                    <RutaAdmin>
                      <DisposicionAdmin>
                        <GenericaAdmin titulo="Registrarse" descripcion="Pantalla de registro demostrativa (pendiente)." />
                      </DisposicionAdmin>
                    </RutaAdmin>
                  } />

                  {/* TEST STICKY - PlantillaTemu con sticky funcional */}
                  <Route path="/test-sticky" element={<PlantillaTemu producto={{
                    id: 1,
                    nombre: "Smartphone Galaxy Pro Max 256GB",
                    precio: 2499000,
                    precio_original: 3199000,
                    stock: 15,
                    fotos_principales: [
                      "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=500&h=500&fit=crop",
                      "https://images.unsplash.com/photo-1565849904461-04a58ad377e0?w=500&h=500&fit=crop"
                    ],
                    descripcion: "El smartphone más avanzado del mercado con tecnología de última generación.",
                    marca: "TechPro",
                    color: "Negro",
                    material: "Aluminio Premium",
                    peso: 0.195,
                    garantia_meses: 24,
                    beneficios: ["Cámara 108MP", "Batería 5000mAh", "Pantalla AMOLED"],
                    ventajas: ["Procesador rápido", "Diseño premium", "5G ultrarrápido"]
                  }} />} />

                  {/* Landing Pages - Sin header para máxima conversión */}
                  <Route path="/landing/:slug" element={<LandingProducto />} />

                  {/* Página Principal de la Tienda */}
                  <Route path="/tienda" element={
                    <>
                      <HeaderPrincipal />
                      <PaginaTienda />
                    </>
                  } />

                  {/* Página de Tienda por Categoría - USA EL MISMO COMPONENTE */}
                  <Route path="/tienda/categoria/:slug" element={
                    <>
                      <HeaderPrincipal />
                      <PaginaTienda />
                    </>
                  } />

                  {/* Páginas principales con HeaderPrincipal */}
                  <Route path="/" element={
                    <>
                      <HeaderPrincipal />
                      <main className="contenido-principal">
                        <PaginaInicio />
                      </main>
                    </>
                  } />

                  <Route path="/producto/:slug" element={
                    <>
                      <HeaderPrincipal />
                      <main className="contenido-principal">
                        <PaginaProducto />
                      </main>
                    </>
                  } />

                  {/* Página de prueba para el nuevo componente premium */}
                  <Route path="/prueba-de-producto" element={
                    <>
                      <HeaderPrincipal />
                      <main className="contenido-principal">
                        <PruebaDeProducto />
                      </main>
                    </>
                  } />

                  <Route path="/categoria/:slug" element={
                    <>
                      <HeaderPrincipal />
                      <main className="contenido-principal">
                        <PaginaCategoria />
                      </main>
                    </>
                  } />

                  <Route path="/carrito" element={
                    <>
                      <HeaderPrincipal />
                      <main className="contenido-principal">
                        <PaginaCarrito />
                      </main>
                    </>
                  } />

                  <Route path="/favoritos" element={
                    <>
                      <HeaderPrincipal />
                      <main className="contenido-principal">
                        <PaginaFavoritos />
                      </main>
                    </>
                  } />

                  <Route path="/checkout" element={
                    <>
                      <HeaderPrincipal />
                      <main className="contenido-principal">
                        <PaginaCheckout />
                      </main>
                    </>
                  } />

                  {/* Páginas de ePayco */}
                  <Route path="/respuesta-epayco" element={
                    <>
                      <HeaderPrincipal />
                      <main className="contenido-principal">
                        <PaginaRespuestaEpayco />
                      </main>
                    </>
                  } />

                  <Route path="/confirmacion-epayco" element={
                    <>
                      <HeaderPrincipal />
                      <main className="contenido-principal">
                        <ConfirmacionEpayco />
                      </main>
                    </>
                  } />

                  {/* Autenticación */}
                  <Route path="/login" element={
                    <>
                      <HeaderPrincipal />
                      <main className="contenido-principal">
                        <PaginaLogin />
                      </main>
                    </>
                  } />

                  <Route path="/registro" element={
                    <>
                      <HeaderPrincipal />
                      <main className="contenido-principal">
                        <PaginaRegistro />
                      </main>
                    </>
                  } />

                  <Route path="/perfil/*" element={
                    <>
                      <HeaderPrincipal />
                      <main className="contenido-principal">
                        <PaginaPerfil />
                      </main>
                    </>
                  } />

                  <Route path="/restablecer-contrasena" element={
                    <>
                      <HeaderPrincipal />
                      <main className="contenido-principal">
                        <PaginaRestablecerContrasena />
                      </main>
                    </>
                  } />

                  <Route path="/sesion-cerrada" element={
                    <>
                      <HeaderPrincipal />
                      <main className="contenido-principal">
                        <PaginaSesionCerrada />
                      </main>
                    </>
                  } />

                  {/* Páginas de empresa */}
                  <Route path="/contacto" element={
                    <>
                      <HeaderPrincipal />
                      <main className="contenido-principal">
                        <Contacto />
                      </main>
                    </>
                  } />

                  <Route path="/quienes-somos" element={
                    <>
                      <HeaderPrincipal />
                      <main className="contenido-principal">
                        <QuienesSomos />
                      </main>
                    </>
                  } />

                  <Route path="/terminos-condiciones" element={
                    <>
                      <HeaderPrincipal />
                      <main className="contenido-principal">
                        <TerminosCondiciones />
                      </main>
                    </>
                  } />

                  <Route path="/politica-privacidad" element={
                    <>
                      <HeaderPrincipal />
                      <main className="contenido-principal">
                        <PoliticaPrivacidad />
                      </main>
                    </>
                  } />

                  <Route path="/preguntas-frecuentes" element={
                    <>
                      <HeaderPrincipal />
                      <main className="contenido-principal">
                        <PreguntasFrecuentes />
                      </main>
                    </>
                  } />

                  <Route path="/trabaja-con-nosotros" element={
                    <>
                      <HeaderPrincipal />
                      <main className="contenido-principal">
                        <TrabajaConNosotros />
                      </main>
                    </>
                  } />

                  {/* Rutas de categorías */}
                  <Route path="/ofertas" element={
                    <>
                      <HeaderPrincipal />
                      <main className="contenido-principal">
                        <PaginaCategoria />
                      </main>
                    </>
                  } />

                  <Route path="/electronica" element={
                    <>
                      <HeaderPrincipal />
                      <main className="contenido-principal">
                        <PaginaCategoria />
                      </main>
                    </>
                  } />

                  <Route path="/ropa" element={
                    <>
                      <HeaderPrincipal />
                      <main className="contenido-principal">
                        <PaginaCategoria />
                      </main>
                    </>
                  } />

                  <Route path="/hogar" element={
                    <>
                      <HeaderPrincipal />
                      <main className="contenido-principal">
                        <PaginaCategoria />
                      </main>
                    </>
                  } />

                  <Route path="/vehiculos" element={
                    <>
                      <HeaderPrincipal />
                      <main className="contenido-principal">
                        <PaginaCategoria />
                      </main>
                    </>
                  } />

                  <Route path="/deportes" element={
                    <>
                      <HeaderPrincipal />
                      <main className="contenido-principal">
                        <PaginaCategoria />
                      </main>
                    </>
                  } />

                  <Route path="/belleza" element={
                    <>
                      <HeaderPrincipal />
                      <main className="contenido-principal">
                        <PaginaCategoria />
                      </main>
                    </>
                  } />

                  <Route path="/juguetes" element={
                    <>
                      <HeaderPrincipal />
                      <main className="contenido-principal">
                        <PaginaCategoria />
                      </main>
                    </>
                  } />

                  {/* Blog */}
                  <Route path="/blog" element={
                    <>
                      <HeaderPrincipal />
                      <main className="contenido-principal">
                        <PaginaBlog />
                      </main>
                    </>
                  } />
                  <Route path="/blog/:slug" element={
                    <>
                      <HeaderPrincipal />
                      <main className="contenido-principal">
                        <ArticuloBlog />
                      </main>
                    </>
                  } />

                  {/* Páginas especiales */}

                  <Route path="/ayuda" element={
                    <>
                      <HeaderPrincipal />
                      <main className="contenido-principal">
                        <Ayuda />
                      </main>
                    </>
                  } />

                  {/* 404 */}
                  <Route path="*" element={
                    <>
                      <HeaderPrincipal />
                      <main className="contenido-principal">
                        <PaginaNoEncontrada />
                      </main>
                    </>
                  } />
                </Routes>
              </SuspenseLayout>
              <NotificacionCarritoWrapper />
            </div>
          </FavoritosProvider>
        </CarritoProvider>
      </ChatProvider>
    </ComponenteSeguridad>
  )
}

export default App
