import { useState, useCallback } from 'react';
import { sanitizarEntrada, validarEmail, validarContrasena, manejarError } from '../configuracion/seguridad.js';

/**
 * Hook personalizado para manejo seguro de formularios
 * Proporciona validación y sanitización automática
 */
export const useFormularioSeguro = (configuracionInicial = {}) => {
  const [datos, setDatos] = useState(configuracionInicial);
  const [errores, setErrores] = useState({});
  const [estaCargando, setEstaCargando] = useState(false);

  // Sanitizar y actualizar campo
  const actualizarCampo = useCallback((campo, valor) => {
    const valorSanitizado = sanitizarEntrada(valor);
    setDatos(prev => ({ ...prev, [campo]: valorSanitizado }));
    
    // Limpiar error del campo si existe
    if (errores[campo]) {
      setErrores(prev => {
        const nuevosErrores = { ...prev };
        delete nuevosErrores[campo];
        return nuevosErrores;
      });
    }
  }, [errores]);

  // Validar campo específico
  const validarCampo = useCallback((campo, valor) => {
    const validaciones = {
      email: (v) => validarEmail(v) ? null : 'Email inválido',
      contrasena: (v) => validarContrasena(v) ? null : 'La contraseña debe tener al menos 8 caracteres, incluir mayúsculas, minúsculas y números',
      telefono: (v) => /^\d{7,15}$/.test(v) ? null : 'Teléfono inválido',
      nombre: (v) => v.length >= 2 && v.length <= 50 ? null : 'Nombre debe tener entre 2 y 50 caracteres',
      texto: (v) => v.length <= 1000 ? null : 'Texto demasiado largo (máx. 1000 caracteres)',
      numero: (v) => !isNaN(v) && v >= 0 ? null : 'Número inválido',
      dinero: (v) => !isNaN(v) && v >= 0 && v <= 1000000 ? null : 'Monto inválido'
    };

    const validacion = validaciones[campo];
    if (validacion) {
      return validacion(valor);
    }
    
    return null;
  }, []);

  // Validar todo el formulario
  const validarFormulario = useCallback(() => {
    const nuevosErrores = {};
    
    Object.keys(datos).forEach(campo => {
      const error = validarCampo(campo, datos[campo]);
      if (error) {
        nuevosErrores[campo] = error;
      }
    });
    
    setErrores(nuevosErrores);
    return Object.keys(nuevosErrores).length === 0;
  }, [datos, validarCampo]);

  // Manejar envío seguro del formulario
  const manejarEnvio = useCallback(async (callbackEnvio) => {
    setEstaCargando(true);
    
    try {
      if (!validarFormulario()) {
        throw new Error('Por favor, corrige los errores del formulario');
      }

      const resultado = await callbackEnvio(datos);
      return { exito: true, datos: resultado };
      
    } catch (error) {
      const errorManejado = manejarError(error, false);
      setErrores(prev => ({ ...prev, general: errorManejado.mensaje }));
      return { exito: false, error: errorManejado };
      
    } finally {
      setEstaCargando(false);
    }
  }, [datos, validarFormulario]);

  // Limpiar formulario
  const limpiarFormulario = useCallback(() => {
    setDatos(configuracionInicial);
    setErrores({});
    setEstaCargando(false);
  }, [configuracionInicial]);

  return {
    datos,
    errores,
    estaCargando,
    actualizarCampo,
    validarCampo,
    validarFormulario,
    manejarEnvio,
    limpiarFormulario,
    setDatos,
    setErrores
  };
};

/**
 * Hook para protección contra doble envío de formularios
 */
export const useProteccionDobleEnvio = () => {
  const [estaEnviando, setEstaEnviando] = useState(false);

  const protegerEnvio = useCallback(async (callback) => {
    if (estaEnviando) return { exito: false, error: 'El formulario ya se está procesando' };
    
    setEstaEnviando(true);
    try {
      const resultado = await callback();
      return { exito: true, datos: resultado };
    } catch (error) {
      return { exito: false, error: manejarError(error, false) };
    } finally {
      // Pequeño delay para prevenir envíos rápidos
      setTimeout(() => setEstaEnviando(false), 1000);
    }
  }, [estaEnviando]);

  return { estaEnviando, protegerEnvio };
};

/**
 * Hook para validación de archivo seguro
 */
export const useValidacionArchivo = () => {
  const [archivo, setArchivo] = useState(null);
  const [errorArchivo, setErrorArchivo] = useState(null);

  const validarArchivo = useCallback((archivoSeleccionado) => {
    const validacion = validarArchivo(archivoSeleccionado);
    
    if (validacion.valido) {
      setArchivo(archivoSeleccionado);
      setErrorArchivo(null);
      return true;
    } else {
      setErrorArchivo(validacion.error);
      setArchivo(null);
      return false;
    }
  }, []);

  return {
    archivo,
    errorArchivo,
    validarArchivo,
    setArchivo,
    setErrorArchivo
  };
};