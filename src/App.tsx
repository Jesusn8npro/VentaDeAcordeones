import React, { Suspense, lazy } from 'react'
import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { ComponenteSeguridad } from './componentes/seguridad/ComponenteSeguridad'
import ChatEnVivo from './componentes/chat/ChatEnVivo'
import BotonWhatsapp from './componentes/BotonWhatsapp/BotonWhatsapp'
import NotificacionCarritoWrapper from './componentes/ui/NotificacionCarritoWrapper'
import HeaderPrincipal from './componentes/layout/HeaderPrincipal'
import FooterPrincipal from './componentes/layout/FooterPrincipal'
import FavoritosProvider from './contextos/FavoritosContext'
import { CarritoProvider } from './contextos/CarritoContext'
import { ChatProvider } from './contextos/ChatContext'
import { RutasAdmin } from './rutas/RutasAdmin'
import ErrorBoundary from './componentes/sistema/ErrorBoundary'
import CargandoPagina from './componentes/sistema/CargandoPagina'

// E-commerce
const PaginaInicio           = lazy(() => import('./paginas/ecommerce/PaginaInicio/PaginaInicio'))
const PaginaProducto         = lazy(() => import('./paginas/ecommerce/PaginaProducto/PaginaProducto'))
const PaginaCategoria        = lazy(() => import('./paginas/ecommerce/PaginaCategoria/PaginaCategoria'))
const PaginaTienda           = lazy(() => import('./paginas/ecommerce/PaginaTienda/PaginaTienda'))
const PaginaCarrito          = lazy(() => import('./paginas/ecommerce/PaginaCarrito/PaginaCarrito'))
const PaginaFavoritos        = lazy(() => import('./paginas/ecommerce/PaginaFavoritos/PaginaFavoritos'))
const PaginaRespuestaEpayco  = lazy(() => import('./paginas/ecommerce/PaginaRespuestaEpayco/PaginaRespuestaEpayco'))
const ConfirmacionEpayco     = lazy(() => import('./paginas/ecommerce/ConfirmacionEpayco'))
const LandingProducto        = lazy(() => import('./paginas/LandingProducto'))

// Autenticación
const PaginaLogin              = lazy(() => import('./paginas/autenticacion/PaginaLogin/PaginaLogin'))
const PaginaRegistro           = lazy(() => import('./paginas/autenticacion/PaginaRegistro/PaginaRegistro'))
const PaginaPerfil             = lazy(() => import('./paginas/autenticacion/PaginaPerfil/PaginaPerfil'))
const PaginaRestablecerClave   = lazy(() => import('./paginas/autenticacion/PaginaResetPassword/PaginaResetPassword'))
const PaginaSesionCerrada      = lazy(() => import('./paginas/autenticacion/PaginaSesionCerrada/PaginaSesionCerrada'))

// Empresa y legal
const Contacto            = lazy(() => import('./paginas/empresa/Contacto/Contacto'))
const QuienesSomos        = lazy(() => import('./paginas/empresa/QuienesSomos/QuienesSomos'))
const TrabajaConNosotros  = lazy(() => import('./paginas/empresa/TrabajaConNosotros/TrabajaConNosotros'))
const SobreLaTienda       = lazy(() => import('./paginas/empresa/SobreLaTienda/SobreLaTienda'))
const TerminosCondiciones  = lazy(() => import('./paginas/legal/TerminosCondiciones/TerminosCondiciones'))
const PoliticaPrivacidad   = lazy(() => import('./paginas/legal/PoliticaPrivacidad/PoliticaPrivacidad'))
const PreguntasFrecuentes  = lazy(() => import('./paginas/legal/PreguntasFrecuentes/PreguntasFrecuentes'))
const PoliticaEnvio        = lazy(() => import('./paginas/legal/PoliticaEnvio/PoliticaEnvio'))
const CambiosDevoluciones  = lazy(() => import('./paginas/legal/CambiosDevoluciones/CambiosDevoluciones'))

// Acordeones personalizados
const AcordeonesPersonalizados = lazy(() => import('./paginas/AcordeonesPersonalizados/AcordeonesPersonalizados'))

// Blog y sistema
const PaginaBlog         = lazy(() => import('./paginas/blog/PaginaBlog'))
const ArticuloBlog       = lazy(() => import('./paginas/blog/ArticuloBlog'))
const Ayuda              = lazy(() => import('./paginas/ayuda/Ayuda'))
const PaginaNoEncontrada = lazy(() => import('./paginas/sistema/PaginaNoEncontrada/PaginaNoEncontrada'))

const ConHeader = ({ children }: { children: React.ReactNode }) => (
  <>
    <HeaderPrincipal />
    <main className="contenido-principal">{children}</main>
    <FooterPrincipal />
  </>
)

const RUTAS_SIN_FLOTANTES = ['/landing/', '/producto/', '/admin', '/acordeones-personalizados']

function App() {
  const { pathname } = useLocation()
  const sinFlotantes = RUTAS_SIN_FLOTANTES.some(r => pathname.startsWith(r))

  return (
    <ComponenteSeguridad>
      <ChatProvider>
        <CarritoProvider>
          <FavoritosProvider>
            <div className="app">
              {!sinFlotantes && <ChatEnVivo />}
              {!sinFlotantes && <BotonWhatsapp />}
              <ErrorBoundary>
              <Suspense fallback={<CargandoPagina />}>
                <Routes>
                  {RutasAdmin()}

                  <Route path="/landing/:slug" element={<LandingProducto />} />
                  <Route path="/acordeones-personalizados" element={<AcordeonesPersonalizados />} />

                  {/* Tienda */}
                  <Route path="/" element={<ConHeader><PaginaInicio /></ConHeader>} />
                  <Route path="/tienda" element={<ConHeader><PaginaTienda /></ConHeader>} />
                  <Route path="/tienda/categoria/:slug" element={<ConHeader><PaginaTienda /></ConHeader>} />
                  <Route path="/producto/:slug" element={<ConHeader><PaginaProducto /></ConHeader>} />
                  <Route path="/categoria/:slug" element={<ConHeader><PaginaCategoria /></ConHeader>} />
                  <Route path="/carrito" element={<ConHeader><PaginaCarrito /></ConHeader>} />
                  <Route path="/favoritos" element={<ConHeader><PaginaFavoritos /></ConHeader>} />
                  <Route path="/checkout" element={<Navigate to="/carrito" replace />} />
                  <Route path="/respuesta-epayco" element={<ConHeader><PaginaRespuestaEpayco /></ConHeader>} />
                  <Route path="/confirmacion-epayco" element={<ConHeader><ConfirmacionEpayco /></ConHeader>} />

                  {/* Autenticación */}
                  <Route path="/login" element={<ConHeader><PaginaLogin /></ConHeader>} />
                  <Route path="/registro" element={<ConHeader><PaginaRegistro /></ConHeader>} />
                  <Route path="/perfil/*" element={<ConHeader><PaginaPerfil /></ConHeader>} />
                  <Route path="/restablecer-contrasena" element={<ConHeader><PaginaRestablecerClave /></ConHeader>} />
                  <Route path="/sesion-cerrada" element={<ConHeader><PaginaSesionCerrada /></ConHeader>} />

                  {/* Empresa */}
                  <Route path="/contacto" element={<ConHeader><Contacto /></ConHeader>} />
                  <Route path="/quienes-somos" element={<ConHeader><QuienesSomos /></ConHeader>} />
                  <Route path="/trabaja-con-nosotros" element={<ConHeader><TrabajaConNosotros /></ConHeader>} />
                  <Route path="/sobre-la-tienda" element={<ConHeader><SobreLaTienda /></ConHeader>} />

                  {/* Legal */}
                  <Route path="/terminos-condiciones" element={<ConHeader><TerminosCondiciones /></ConHeader>} />
                  <Route path="/politica-privacidad" element={<ConHeader><PoliticaPrivacidad /></ConHeader>} />
                  <Route path="/preguntas-frecuentes" element={<ConHeader><PreguntasFrecuentes /></ConHeader>} />
                  <Route path="/politica-envio" element={<ConHeader><PoliticaEnvio /></ConHeader>} />
                  <Route path="/cambios-devoluciones" element={<ConHeader><CambiosDevoluciones /></ConHeader>} />

                  {/* Blog */}
                  <Route path="/blog" element={<ConHeader><PaginaBlog /></ConHeader>} />
                  <Route path="/blog/:slug" element={<ConHeader><ArticuloBlog /></ConHeader>} />
                  <Route path="/ayuda" element={<ConHeader><Ayuda /></ConHeader>} />

                  {/* 404 */}
                  <Route path="*" element={<ConHeader><PaginaNoEncontrada /></ConHeader>} />
                </Routes>
              </Suspense>
              </ErrorBoundary>
              <NotificacionCarritoWrapper />
            </div>
          </FavoritosProvider>
        </CarritoProvider>
      </ChatProvider>
    </ComponenteSeguridad>
  )
}

export default App
