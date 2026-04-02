// Utilidades de validación

export const validarEmail = (email) => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return regex.test(email)
}

export const validarPassword = (password) => {
  // Regla mejorada: mínimo 8 caracteres, al menos una mayúscula, una minúscula, un número y un carácter especial
  const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/
  return regex.test(password)
}

export const validarTelefono = (telefono) => {
  // Formato colombiano: +57 300 123 4567 o 300 123 4567
  const regex = /^(\+57\s?)?[3][0-9]{2}\s?[0-9]{3}\s?[0-9]{4}$/
  return regex.test(telefono)
}

export const validarCedula = (cedula) => {
  // Cédula colombiana: 8-11 dígitos
  const regex = /^[0-9]{8,11}$/
  return regex.test(cedula)
}

export const validarNombre = (nombre) => {
  // Solo letras, espacios y acentos
  const regex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]{2,50}$/
  return regex.test(nombre)
}

export const validarDireccion = (direccion) => {
  // Mínimo 10 caracteres
  return direccion && direccion.trim().length >= 10
}

export const validarCodigoPostal = (codigo) => {
  // Código postal colombiano: 6 dígitos
  const regex = /^[0-9]{6}$/
  return regex.test(codigo)
}

export const obtenerMensajeError = (campo, valor) => {
  const mensajes = {
    email: 'Debe ser un email válido',
    password: 'Debe tener al menos 8 caracteres, una mayúscula, una minúscula, un número y un carácter especial (@$!%*?&)',
    telefono: 'Debe ser un teléfono válido (ej: 300 123 4567)',
    cedula: 'Debe ser una cédula válida (8-11 dígitos)',
    nombre: 'Debe contener solo letras y tener entre 2-50 caracteres',
    direccion: 'Debe tener al menos 10 caracteres',
    codigoPostal: 'Debe ser un código postal válido (6 dígitos)'
  }

  return mensajes[campo] || 'Campo inválido'
}




























