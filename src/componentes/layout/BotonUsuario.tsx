import React from 'react'
import {
  User,
  ChevronDown,
  UserCircle,
  Heart,
  Package,
  ShoppingCart,
  Settings,
  LogOut
} from 'lucide-react'

interface Props {
  sesionInicializada: boolean
  usuario: any
  menuUsuarioAbierto: boolean
  setMenuUsuarioAbierto: (v: boolean) => void
  esAdmin: (() => boolean) | undefined
  obtenerNombreUsuario: () => string
  navegarAAdmin: () => void
  navegarAProductosAdmin: () => void
  navegarAAgregarProducto: () => void
  navegarAPerfil: () => void
  navegarAFavoritos: () => void
  manejarCerrarSesion: () => void
  onAbrirAutenticacion: () => void
}

const BotonUsuario = ({
  sesionInicializada,
  usuario,
  menuUsuarioAbierto,
  setMenuUsuarioAbierto,
  esAdmin,
  obtenerNombreUsuario,
  navegarAAdmin,
  navegarAProductosAdmin,
  navegarAAgregarProducto,
  navegarAPerfil,
  navegarAFavoritos,
  manejarCerrarSesion,
  onAbrirAutenticacion
}: Props) => {
  if (!sesionInicializada) {
    return (
      <div className="usuario-logueado">
        <button className="accion-item" disabled>
          <User className="icono-usuario-header" />
          <div className="usuario-info">
            <span className="usuario-texto">Cargando…</span>
            <span className="usuario-subtexto">Mi Cuenta</span>
          </div>
        </button>
      </div>
    )
  }

  if (usuario) {
    return (
      <div className="usuario-logueado">
        <button className="accion-item" onClick={() => setMenuUsuarioAbierto(!menuUsuarioAbierto)}>
          <User className="icono-usuario-header" />
          <div className="usuario-info">
            <span className="usuario-texto">{obtenerNombreUsuario()}</span>
            <span className="usuario-subtexto">Mi Cuenta</span>
          </div>
          <ChevronDown size={12} className={`flecha-usuario ${menuUsuarioAbierto ? 'rotado' : ''}`} />
        </button>

        {menuUsuarioAbierto && (
          <div className="dropdown-usuario">
            {esAdmin?.() ? (
              <>
                <button className="dropdown-item" onClick={navegarAAdmin}>
                  <Settings size={16} />Panel Admin
                </button>
                <button className="dropdown-item" onClick={navegarAProductosAdmin}>
                  <ShoppingCart size={16} />Productos
                </button>
                <button className="dropdown-item" onClick={navegarAAgregarProducto}>
                  <Package size={16} />Agregar Producto
                </button>
                <div className="dropdown-divider"></div>
              </>
            ) : (
              <>
                <button className="dropdown-item" onClick={navegarAPerfil}>
                  <UserCircle size={16} />Perfil
                </button>
                <button className="dropdown-item" onClick={navegarAFavoritos}>
                  <Heart size={16} />Favoritos
                </button>
                <div className="dropdown-divider"></div>
              </>
            )}
            <button className="dropdown-item logout-item" onClick={manejarCerrarSesion}>
              <LogOut size={16} />Cerrar Sesión
            </button>
          </div>
        )}
      </div>
    )
  }

  return (
    <button className="accion-item usuario-enlace" onClick={onAbrirAutenticacion}>
      <User className="icono-usuario-header" />
      <div className="usuario-info">
        <span className="usuario-texto">Iniciar Sesión</span>
        <span className="usuario-subtexto">Registrarse</span>
      </div>
    </button>
  )
}

export default BotonUsuario
