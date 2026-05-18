import React, { lazy } from 'react'
import { Route } from 'react-router-dom'
import RutaAdmin from '../componentes/autenticacion/RutaAdmin'

const DashboardAdmin    = lazy(() => import('../paginas/admin/DashboardAdmin/DashboardAdmin'))
const DisposicionAdmin  = lazy(() => import('../componentes/admin/DisposicionAdmin/DisposicionAdmin'))
const GestionProductos  = lazy(() => import('../paginas/admin/GestionProductos/GestionProductos'))
const ListaProductos    = lazy(() => import('../paginas/admin/productos/ListaProductos'))
const CreadorProductos  = lazy(() => import('../paginas/admin/CreadorDeProductosPR/CreadorProductosPR'))
const EditarProducto    = lazy(() => import('../paginas/admin/PaginaEditarProducto/EditarProducto'))
const CreadorArticulos  = lazy(() => import('../paginas/admin/Blog/CreadorArticulos'))
const AdminBlog         = lazy(() => import('../paginas/admin/Blog/AdminBlog'))
const Categorias        = lazy(() => import('../paginas/admin/Categorias/Categorias'))
const ManejoCupones     = lazy(() => import('../paginas/admin/ManejoCupones/ManejoCupones'))
const Pedidos           = lazy(() => import('../paginas/admin/Pedidos/Pedidos'))
const Inventario        = lazy(() => import('../paginas/admin/Inventario/Inventario'))
const Usuarios          = lazy(() => import('../paginas/admin/Usuarios/Usuarios'))
const ImagenesIA        = lazy(() => import('../paginas/admin/ImagenesIA/ImagenesIA'))
const VideosIA          = lazy(() => import('../paginas/admin/VideosIA/VideosIA'))
const PanelFeedMeta     = lazy(() => import('../paginas/admin/FeedMeta/PanelFeedMeta'))
const AdminChats        = lazy(() => import('../paginas/admin/ManejoDeChats/AdminChats'))
const CalendarioTareas  = lazy(() => import('../paginas/admin/calendario_tareas/CalendarioTareas'))
const TableroTareas     = lazy(() => import('../paginas/admin/calendario_tareas/TableroTareas'))

const Admin = ({ children }) => (
  <RutaAdmin>
    <DisposicionAdmin>{children}</DisposicionAdmin>
  </RutaAdmin>
)

export function RutasAdmin() {
  return (
    <>
      <Route path="/admin" element={<RutaAdmin><DashboardAdmin /></RutaAdmin>} />
      <Route path="/admin/productos" element={<Admin><ListaProductos /></Admin>} />
      <Route path="/admin/gestion-productos" element={<Admin><GestionProductos /></Admin>} />
      <Route path="/admin/productos/agregar" element={<Admin><CreadorProductos /></Admin>} />
      <Route path="/admin/productos/creador-pr" element={<Admin><CreadorProductos /></Admin>} />
      <Route path="/admin/productos/editar/:slug" element={<Admin><EditarProducto /></Admin>} />
      <Route path="/admin/blog" element={<Admin><AdminBlog /></Admin>} />
      <Route path="/admin/blog/crear" element={<Admin><CreadorArticulos /></Admin>} />
      <Route path="/admin/blog/editar/:slug" element={<Admin><CreadorArticulos /></Admin>} />
      <Route path="/admin/categorias" element={<Admin><Categorias /></Admin>} />
      <Route path="/admin/cupones" element={<Admin><ManejoCupones /></Admin>} />
      <Route path="/admin/pedidos" element={<Admin><Pedidos /></Admin>} />
      <Route path="/admin/inventario" element={<Admin><Inventario /></Admin>} />
      <Route path="/admin/usuarios" element={<Admin><Usuarios /></Admin>} />
      <Route path="/admin/imagenes-ia" element={<Admin><ImagenesIA /></Admin>} />
      <Route path="/admin/videos" element={<Admin><VideosIA /></Admin>} />
      <Route path="/admin/feed-meta" element={<Admin><PanelFeedMeta /></Admin>} />
      <Route path="/admin/chats" element={<Admin><AdminChats /></Admin>} />
      <Route path="/admin/calendario-tareas" element={<Admin><CalendarioTareas /></Admin>} />
      <Route path="/admin/tablero-tareas" element={<Admin><TableroTareas /></Admin>} />
    </>
  )
}
