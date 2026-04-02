import { useEffect } from 'react';
import { verificarRateLimit, manejarError } from '../../configuracion/seguridad.js';

/**
 * Componente de seguridad que envuelve la aplicación
 * Proporciona protección contra ataques comunes
 */
export const ComponenteSeguridad = ({ children }) => {
  useEffect(() => {
    // Protección contra clickjacking
    if (window.top !== window.self) {
      window.top.location = window.self.location;
    }

    // Prevenir inyección de scripts desde la URL
    const urlParams = new URLSearchParams(window.location.search);
    for (const value of urlParams.values()) {
      if (value.includes('<script>') || value.includes('javascript:')) {
        window.location.href = window.location.pathname;
        return;
      }
    }

    // Verificar rate limit para esta IP/sesión
    const identificador = obtenerIdentificadorUsuario();
    const rateLimit = verificarRateLimit(identificador);
    
    if (!rateLimit.permitido) {
      manejarError(new Error('Rate limit excedido'), false);
      // Redirigir a página de error o mostrar mensaje
      window.location.href = '/error?tipo=rate_limit';
    }

    // Limpiar datos sensibles del almacenamiento al cerrar sesión
    const manejarCierreSesion = () => {
      sessionStorage.clear();
      localStorage.removeItem('sb-*'); // Limpiar datos de Supabase
    };

    window.addEventListener('beforeunload', manejarCierreSesion);
    
    return () => {
      window.removeEventListener('beforeunload', manejarCierreSesion);
    };
  }, []);

  return children;
};

/**
 * Hook para proteger formularios sensibles
 */
export const useProteccionFormulario = (formularioId) => {
  useEffect(() => {
    const formulario = document.getElementById(formularioId);
    if (!formulario) return;

    const manejarEnvio = (evento) => {
      // Verificar que el formulario no haya sido manipulado
      const camposOcultos = formulario.querySelectorAll('input[type="hidden"]');
      for (const campo of camposOcultos) {
        if (campo.value.includes('<') || campo.value.includes('>')) {
          evento.preventDefault();
          manejarError(new Error('Campo oculto manipulado detectado'), false);
          return;
        }
      }

      // Verificar que no se esté enviando demasiado rápido
      const ultimoEnvio = sessionStorage.getItem(`ultimo_envio_${formularioId}`);
      const ahora = Date.now();
      
      if (ultimoEnvio && (ahora - parseInt(ultimoEnvio)) < 1000) {
        evento.preventDefault();
        manejarError(new Error('Envío demasiado rápido'), false);
        return;
      }
      
      sessionStorage.setItem(`ultimo_envio_${formularioId}`, ahora.toString());
    };

    formulario.addEventListener('submit', manejarEnvio);
    
    return () => {
      formulario.removeEventListener('submit', manejarEnvio);
    };
  }, [formularioId]);
};

/**
 * Función para obtener identificador único del usuario
 */
function obtenerIdentificadorUsuario() {
  // Intentar obtener de sessionStorage primero
  let identificador = sessionStorage.getItem('identificador-seguridad');
  
  if (!identificador) {
    // Crear uno nuevo basado en características del navegador
    const caracteristicas = [
      navigator.userAgent,
      navigator.language,
      screen.width,
      screen.height,
      new Date().getTimezoneOffset()
    ].join('|');
    
    identificador = btoa(caracteristicas).slice(0, 32);
    sessionStorage.setItem('identificador-seguridad', identificador);
  }
  
  return identificador;
}

/**
 * Componente para mostrar errores de seguridad de forma segura
 */
export const ErrorSeguridad = ({ tipo, mensaje }) => {
  const mensajesSeguros = {
    rate_limit: 'Has excedido el límite de intentos. Por favor, espera unos minutos.',
    xss_detectado: 'Contenido no permitido detectado.',
    csrf_detectado: 'Solicitud no válida detectada.',
    default: 'Ha ocurrido un error. Por favor, intenta nuevamente.'
  };

  return (
    <div className="error-seguridad">
      <h2>Error de Seguridad</h2>
      <p>{mensajesSeguros[tipo] || mensajesSeguros.default}</p>
      {mensaje && <small>{mensaje}</small>}
    </div>
  );
};