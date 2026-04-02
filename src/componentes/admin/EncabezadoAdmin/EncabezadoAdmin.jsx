import { useEffect, useRef, useState } from 'react'
import './EncabezadoAdmin.css'
import { Link, useNavigate } from 'react-router-dom'
import { useBarraLateral } from '../../../contextos/ContextoBarraLateral'
import { useAuth } from '../../../contextos/ContextoAutenticacion'
import { BotonAlternarTema } from '../BotonAlternarTema/BotonAlternarTema'

const EncabezadoAdmin = () => {
  const [menuAplicacionAbierto, setMenuAplicacionAbierto] = useState(false)
  const [menuUsuarioAbierto, setMenuUsuarioAbierto] = useState(false)
  const [notificacionesAbiertas, setNotificacionesAbiertas] = useState(false)

  const { movilAbierto, alternarBarraLateral, alternarBarraLateralMovil } = useBarraLateral()
  const { usuario, cerrarSesion } = useAuth()
  const navigate = useNavigate()

  const manejarAlternar = () => {
    if (window.innerWidth >= 1024) {
      alternarBarraLateral()
    } else {
      alternarBarraLateralMovil()
    }
  }

  const alternarMenuAplicacion = () => {
    setMenuAplicacionAbierto(!menuAplicacionAbierto)
  }

  const manejarCerrarSesion = async () => {
    try {
      const resultado = await cerrarSesion()
      if (resultado.success) {
        navigate('/sesion-cerrada')
      }
    } catch (error) {
      console.error('Error al cerrar sesión:', error)
    }
  }

  const refEntrada = useRef(null)

  useEffect(() => {
    const manejarTeclaAbajo = (evento) => {
      if ((evento.metaKey || evento.ctrlKey) && evento.key === 'k') {
        evento.preventDefault()
        refEntrada.current?.focus()
      }
    }

    document.addEventListener('keydown', manejarTeclaAbajo)

    return () => {
      document.removeEventListener('keydown', manejarTeclaAbajo)
    }
  }, [])


  return (
    <header className="encabezado-admin">
      <div className="encabezado-admin-contenedor">
        <div className="encabezado-admin-izquierda">
          <button
            className="encabezado-boton-alternar"
            onClick={manejarAlternar}
            aria-label="Alternar Barra Lateral"
          >
            {movilAbierto ? (
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M6.21967 7.28131C5.92678 6.98841 5.92678 6.51354 6.21967 6.22065C6.51256 5.92775 6.98744 5.92775 7.28033 6.22065L11.999 10.9393L16.7176 6.22078C17.0105 5.92789 17.4854 5.92788 17.7782 6.22078C18.0711 6.51367 18.0711 6.98855 17.7782 7.28144L13.0597 12L17.7782 16.7186C18.0711 17.0115 18.0711 17.4863 17.7782 17.7792C17.4854 18.0721 17.0105 18.0721 16.7176 17.7792L11.999 13.0607L7.28033 17.7794C6.98744 18.0722 6.51256 18.0722 6.21967 17.7794C5.92678 17.4865 5.92678 17.0116 6.21967 16.7187L10.9384 12L6.21967 7.28131Z"
                  fill="currentColor"
                />
              </svg>
            ) : (
              <svg width="16" height="12" viewBox="0 0 16 12" fill="none">
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M0.583252 1C0.583252 0.585788 0.919038 0.25 1.33325 0.25H14.6666C15.0808 0.25 15.4166 0.585786 15.4166 1C15.4166 1.41421 15.0808 1.75 14.6666 1.75L1.33325 1.75C0.919038 1.75 0.583252 1.41422 0.583252 1ZM0.583252 11C0.583252 10.5858 0.919038 10.25 1.33325 10.25L14.6666 10.25C15.0808 10.25 15.4166 10.5858 15.4166 11C15.4166 11.4142 15.0808 11.75 14.6666 11.75L1.33325 11.75C0.919038 11.75 0.583252 11.4142 0.583252 11ZM1.33325 5.25C0.919038 5.25 0.583252 5.58579 0.583252 6C0.583252 6.41421 0.919038 6.75 1.33325 6.75L7.99992 6.75C8.41413 6.75 8.74992 6.41421 8.74992 6C8.74992 5.58579 8.41413 5.25 7.99992 5.25L1.33325 5.25Z"
                  fill="currentColor"
                />
              </svg>
            )}
          </button>

          <Link to="/admin" className="encabezado-logo-movil">
            <span className="encabezado-logo-texto">ME LLEVO ESTO</span>
          </Link>

          <button
            onClick={alternarMenuAplicacion}
            className="encabezado-boton-menu-app"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M5.99902 10.4951C6.82745 10.4951 7.49902 11.1667 7.49902 11.9951V12.0051C7.49902 12.8335 6.82745 13.5051 5.99902 13.5051C5.1706 13.5051 4.49902 12.8335 4.49902 12.0051V11.9951C4.49902 11.1667 5.1706 10.4951 5.99902 10.4951ZM17.999 10.4951C18.8275 10.4951 19.499 11.1667 19.499 11.9951V12.0051C19.499 12.8335 18.8275 13.5051 17.999 13.5051C17.1706 13.5051 16.499 12.8335 16.499 12.0051V11.9951C16.499 11.1667 17.1706 10.4951 17.999 10.4951ZM13.499 11.9951C13.499 11.1667 12.8275 10.4951 11.999 10.4951C11.1706 10.4951 10.499 11.1667 10.499 11.9951V12.0051C10.499 12.8335 11.1706 13.5051 11.999 13.5051C12.8275 13.5051 13.499 12.8335 13.499 12.0051V11.9951Z"
                fill="currentColor"
              />
            </svg>
          </button>

          <div className="encabezado-contenedor-busqueda">
            <form>
              <div className="encabezado-envoltorio-busqueda">
                <span className="encabezado-icono-busqueda">
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <path
                      fillRule="evenodd"
                      clipRule="evenodd"
                      d="M3.04175 9.37363C3.04175 5.87693 5.87711 3.04199 9.37508 3.04199C12.8731 3.04199 15.7084 5.87693 15.7084 9.37363C15.7084 12.8703 12.8731 15.7053 9.37508 15.7053C5.87711 15.7053 3.04175 12.8703 3.04175 9.37363ZM9.37508 1.54199C5.04902 1.54199 1.54175 5.04817 1.54175 9.37363C1.54175 13.6991 5.04902 17.2053 9.37508 17.2053C11.2674 17.2053 13.003 16.5344 14.357 15.4176L17.177 18.238C17.4699 18.5309 17.9448 18.5309 18.2377 18.238C18.5306 17.9451 18.5306 17.4703 18.2377 17.1774L15.418 14.3573C16.5365 13.0033 17.2084 11.2669 17.2084 9.37363C17.2084 5.04817 13.7011 1.54199 9.37508 1.54199Z"
                      fill="currentColor"
                    />
                  </svg>
                </span>
                <input
                  ref={refEntrada}
                  type="text"
                  placeholder="Buscar o escribir comando..."
                  className="encabezado-entrada-busqueda"
                />
                <button className="encabezado-atajo-busqueda">
                  <span>⌘</span>
                  <span>K</span>
                </button>
              </div>
            </form>
          </div>
        </div>

        <div className={`encabezado-admin-derecha ${menuAplicacionAbierto ? 'encabezado-admin-derecha-abierto' : 'encabezado-admin-derecha-cerrado'}`}>
          <div className="encabezado-acciones">
            {/* Alternar Tema */}
            <BotonAlternarTema />

            {/* Notificaciones */}
            <div className="encabezado-contenedor-desplegable">
              <button 
                className="encabezado-boton-accion encabezado-boton-notificacion"
                onClick={() => setNotificacionesAbiertas(!notificacionesAbiertas)}
              >
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <path d="M8.33333 15.8333C8.33333 16.7538 9.07952 17.5 10 17.5C10.9205 17.5 11.6667 16.7538 11.6667 15.8333M15 6.66667C15 5.34058 14.4732 4.06881 13.5355 3.13115C12.5979 2.19348 11.3261 1.66667 10 1.66667C8.67392 1.66667 7.40215 2.19348 6.46447 3.13115C5.52678 4.06881 5 5.34058 5 6.66667C5 12.5 2.5 14.1667 2.5 14.1667H17.5C17.5 14.1667 15 12.5 15 6.66667Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <span className="encabezado-insignia-notificacion">3</span>
              </button>

              {notificacionesAbiertas && (
                <div className="encabezado-desplegable">
                  <div className="encabezado-desplegable-encabezado">
                    <h3>Notificaciones</h3>
                    <span className="encabezado-contador-notificaciones">3 nuevas</span>
                  </div>
                  <div className="encabezado-desplegable-contenido">
                    <div className="encabezado-item-notificacion">
                      <div className="encabezado-contenido-notificacion">
                        <p>Nuevo pedido recibido</p>
                        <span>Hace 5 minutos</span>
                      </div>
                    </div>
                    <div className="encabezado-item-notificacion">
                      <div className="encabezado-contenido-notificacion">
                        <p>Usuario registrado</p>
                        <span>Hace 1 hora</span>
                      </div>
                    </div>
                    <div className="encabezado-item-notificacion">
                      <div className="encabezado-contenido-notificacion">
                        <p>Producto agotado</p>
                        <span>Hace 2 horas</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Usuario */}
          <div className="encabezado-contenedor-desplegable">
            <button 
              className="encabezado-boton-usuario"
              onClick={() => setMenuUsuarioAbierto(!menuUsuarioAbierto)}
            >
              <div className="encabezado-avatar-usuario">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <path d="M10 10C12.7614 10 15 7.76142 15 5C15 2.23858 12.7614 0 10 0C7.23858 0 5 2.23858 5 5C5 7.76142 7.23858 10 10 10ZM10 12.5C6.66667 12.5 0 14.1667 0 17.5V20H20V17.5C20 14.1667 13.3333 12.5 10 12.5Z" fill="currentColor"/>
                </svg>
              </div>
              <div className="encabezado-info-usuario">
                <span className="encabezado-nombre-usuario">
                  {
                    (() => {
                      if (!usuario) return 'Usuario';
                      
                      // Si usuario.nombre es un string válido y no contiene JSON
                      if (typeof usuario.nombre === 'string' && usuario.nombre.trim() && !usuario.nombre.includes('{')) {
                        return usuario.nombre;
                      }
                      
                      // Si usuario.nombre contiene JSON, intentar extraer el nombre
                      if (typeof usuario.nombre === 'string' && usuario.nombre.includes('{')) {
                        try {
                          const parsed = JSON.parse(usuario.nombre);
                          if (parsed.nombre) return parsed.nombre;
                          if (parsed.apellido) return parsed.apellido;
                        } catch (e) {
                          // Si no se puede parsear, continuar con otras opciones
                        }
                      }
                      
                      // Fallback a email o user_metadata
                      return usuario.email?.split('@')[0] || 
                             usuario.user_metadata?.nombre || 
                             'Usuario';
                    })()
                  }
                </span>
                <span className="encabezado-rol-usuario">{usuario?.rol || 'admin'}</span>
              </div>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M4 6L8 10L12 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>

            {menuUsuarioAbierto && (
              <div className="encabezado-desplegable">
                <div className="encabezado-desplegable-contenido">
                  <button className="encabezado-item-usuario">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <path d="M8 8C10.2091 8 12 6.20914 12 4C12 1.79086 10.2091 0 8 0C5.79086 0 4 1.79086 4 4C4 6.20914 5.79086 8 8 8ZM8 10C5.33333 10 0 11.3333 0 14V16H16V14C16 11.3333 10.6667 10 8 10Z" fill="currentColor"/>
                    </svg>
                    <span>Mi Perfil</span>
                  </button>
                  <button className="encabezado-item-usuario">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <path d="M2.66667 2.66667H3.33333L5.33333 10.6667H12L13.3333 5.33333H4.66667" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      <circle cx="6" cy="13.3333" r="0.666667" stroke="currentColor" strokeWidth="1.5"/>
                      <circle cx="11.3333" cy="13.3333" r="0.666667" stroke="currentColor" strokeWidth="1.5"/>
                    </svg>
                    <span>Mis Pedidos</span>
                  </button>
                  <button className="encabezado-item-usuario">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <path d="M8 1.33333V8L10.6667 10.6667" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      <circle cx="8" cy="8" r="6.66667" stroke="currentColor" strokeWidth="1.5"/>
                    </svg>
                    <span>Configuración</span>
                  </button>
                  <div className="encabezado-divider"></div>
                  <button 
                    className="encabezado-boton-cerrar-sesion"
                    onClick={manejarCerrarSesion}
                  >
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <path d="M6 14H3.33333C2.97971 14 2.64057 13.8595 2.39052 13.6095C2.14048 13.3594 2 13.0203 2 12.6667V3.33333C2 2.97971 2.14048 2.64057 2.39052 2.39052C2.64057 2.14048 2.97971 2 3.33333 2H6M10.6667 11.3333L14 8M14 8L10.6667 4.66667M14 8H6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    <span>Cerrar Sesión</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}

export default EncabezadoAdmin