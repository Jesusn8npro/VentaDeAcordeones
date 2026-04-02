import { ProveedorBarraLateral, useBarraLateral } from '../../../contextos/ContextoBarraLateral'
import EncabezadoAdmin from '../EncabezadoAdmin/EncabezadoAdmin'
import BarraLateralAdmin from '../BarraLateralAdmin/BarraLateralAdmin'
import '../AdminTema.css'
import './DisposicionAdmin.css'

const ContenidoDisposicion = ({ children }) => {
  const { estaExpandida, estaEnHover, movilAbierto, alternarBarraLateralMovil } = useBarraLateral()

  return (
    <div className="admin-theme disposicion-admin">
      <div>
        <BarraLateralAdmin />
        <div
          className={`fondo-admin ${movilAbierto ? 'fondo-admin-mostrar' : 'fondo-admin-ocultar'}`}
          onClick={alternarBarraLateralMovil}
        ></div>
      </div>
      <div
        className={`disposicion-admin-contenido ${
          estaExpandida || estaEnHover ? 'disposicion-contenido-expandido' : 'disposicion-contenido-colapsado'
        } ${movilAbierto ? 'disposicion-contenido-movil' : ''}`}
      >
        <EncabezadoAdmin />
        <div className="disposicion-admin-principal">
          {children}
        </div>
      </div>
    </div>
  )
}

const DisposicionAdmin = ({ children }) => {
  return (
    <ProveedorBarraLateral>
      <ContenidoDisposicion>{children}</ContenidoDisposicion>
    </ProveedorBarraLateral>
  )
}

export default DisposicionAdmin
