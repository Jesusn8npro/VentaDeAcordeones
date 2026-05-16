import React, { useState, useEffect, useCallback, useRef } from 'react'
import './FormularioProducto.css'
import { usarCategorias } from '../../../../hooks/usarCategorias'
import FormularioProductoUI from './FormularioProductoUI'

const FormularioProducto = ({
  datosProducto = {},
  actualizarDatosProducto,
  modo = 'crear',
  onGuardar,
  cargando = false
}) => {
  const [errores, setErrores] = useState({})
  const [camposJSON, setCamposJSON] = useState({})
  const slugGeneradoRef = useRef(false)

  const { categorias } = usarCategorias()

  // Generar slug automáticamente - SOLO UNA VEZ
  useEffect(() => {
    if (datosProducto.nombre && modo === 'crear' && !slugGeneradoRef.current && !datosProducto.slug) {
      const slug = datosProducto.nombre
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim()

      slugGeneradoRef.current = true
      actualizarDatosProducto({ slug })
    }
  }, [datosProducto.nombre, modo])

  const manejarAtajo = useCallback((e) => {
    if (e.ctrlKey && e.key === 'Enter') {
      e.preventDefault()
      if (onGuardar && !cargando) {
        onGuardar()
      }
    }
  }, [onGuardar, cargando])

  useEffect(() => {
    document.addEventListener('keydown', manejarAtajo)
    return () => document.removeEventListener('keydown', manejarAtajo)
  }, [manejarAtajo])

  const manejarCambio = useCallback((campo, valor) => {
    actualizarDatosProducto({ [campo]: valor })
    if (errores[campo]) {
      setErrores(prev => ({ ...prev, [campo]: null }))
    }
  }, [errores])

  const manejarCambioArray = useCallback((campo, valor) => {
    const array = valor.split('\n').filter(item => item.trim())
    actualizarDatosProducto({ [campo]: array })
  }, [])

  const manejarCambioJSON = useCallback((campo, valor) => {
    setCamposJSON(prev => ({ ...prev, [campo]: valor }))
    try {
      const objetoJSON = JSON.parse(valor)
      actualizarDatosProducto({ [campo]: objetoJSON })
    } catch {
      actualizarDatosProducto({ [campo]: valor })
    }
  }, [])

  const obtenerValorJSON = useCallback((campo) => {
    if (camposJSON[campo] !== undefined) {
      return camposJSON[campo]
    }
    const valor = datosProducto[campo]
    if (typeof valor === 'object' && valor !== null) {
      return JSON.stringify(valor, null, 2)
    }
    return valor || ''
  }, [camposJSON, datosProducto])

  const manejarCambioNumerico = useCallback((campo, valor) => {
    if (valor === '') {
      actualizarDatosProducto({ [campo]: '' })
      return
    }
    const numero = parseFloat(valor)
    if (!isNaN(numero)) {
      actualizarDatosProducto({ [campo]: numero })
    }
    if (errores[campo]) {
      setErrores(prev => ({ ...prev, [campo]: null }))
    }
  }, [errores])

  const manejarCambioEntero = useCallback((campo, valor) => {
    if (valor === '') {
      actualizarDatosProducto({ [campo]: '' })
      return
    }
    const entero = parseInt(valor, 10)
    if (!isNaN(entero)) {
      actualizarDatosProducto({ [campo]: entero })
    }
    if (errores[campo]) {
      setErrores(prev => ({ ...prev, [campo]: null }))
    }
  }, [errores])

  const validarFormulario = useCallback(() => {
    const nuevosErrores: Record<string, string> = {}

    if (!datosProducto.nombre?.trim()) {
      nuevosErrores.nombre = 'El nombre es obligatorio'
    }
    if (!datosProducto.descripcion?.trim()) {
      nuevosErrores.descripcion = 'La descripción es obligatoria'
    }
    if (!datosProducto.precio || datosProducto.precio <= 0) {
      nuevosErrores.precio = 'El precio debe ser mayor a 0'
    }
    if (!datosProducto.categoria_id) {
      nuevosErrores.categoria_id = 'Selecciona una categoría'
    }
    if (datosProducto.descuento && (datosProducto.descuento < 0 || datosProducto.descuento > 100)) {
      nuevosErrores.descuento = 'El descuento debe estar entre 0 y 100'
    }
    if (datosProducto.stock && datosProducto.stock < 0) {
      nuevosErrores.stock = 'El stock no puede ser negativo'
    }
    if (datosProducto.stock_minimo && datosProducto.stock_minimo < 0) {
      nuevosErrores.stock_minimo = 'El stock mínimo no puede ser negativo'
    }
    if (datosProducto.garantia_meses && datosProducto.garantia_meses < 0) {
      nuevosErrores.garantia_meses = 'Los meses de garantía no pueden ser negativos'
    }
    if (datosProducto.calificacion_promedio && (datosProducto.calificacion_promedio < 0 || datosProducto.calificacion_promedio > 5)) {
      nuevosErrores.calificacion_promedio = 'La calificación debe estar entre 0 y 5'
    }

    setErrores(nuevosErrores)
    return Object.keys(nuevosErrores).length === 0
  }, [datosProducto.nombre, datosProducto.descripcion, datosProducto.precio, datosProducto.categoria_id, datosProducto.descuento, datosProducto.stock, datosProducto.stock_minimo, datosProducto.garantia_meses, datosProducto.calificacion_promedio])

  const descargarJSON = () => {
    const datosCompletos = {
      ...datosProducto,
      timestamp: new Date().toISOString(),
      modo,
      errores
    }
    const dataStr = JSON.stringify(datosCompletos, null, 2)
    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr)
    const linkElement = document.createElement('a')
    linkElement.setAttribute('href', dataUri)
    linkElement.setAttribute('download', `producto-debug-${new Date().toISOString().slice(0, 10)}.json`)
    linkElement.click()
  }

  const manejarEnvio = useCallback((e) => {
    e.preventDefault()
    if (validarFormulario() && onGuardar) {
      onGuardar()
    }
  }, [validarFormulario, onGuardar])

  return (
    <FormularioProductoUI
      datosProducto={datosProducto}
      cargando={cargando}
      modo={modo}
      categorias={categorias}
      errores={errores}
      manejarCambio={manejarCambio}
      manejarCambioArray={manejarCambioArray}
      manejarCambioNumerico={manejarCambioNumerico}
      manejarCambioEntero={manejarCambioEntero}
      manejarEnvio={manejarEnvio}
      descargarJSON={descargarJSON}
    />
  )
}

export default FormularioProducto
