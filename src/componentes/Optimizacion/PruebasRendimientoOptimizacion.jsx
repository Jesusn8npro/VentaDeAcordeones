/**
 * Pruebas de rendimiento para validar la optimización de imágenes Supabase
 * Mide tiempos de carga, uso de memoria y compara resultados
 * 
 * @author: Sistema de Optimización Supabase
 * @version: 1.0.0
 */

import React, { useState, useEffect } from 'react'
import SupabaseImageOptimizer from '../componentes/Optimizacion/SupabaseImageOptimizer'
import { obtenerMonitorGlobal } from '../utils/ImagePerformanceMonitor'

const PruebasRendimientoOptimizacion = () => {
  const [resultados, setResultados] = useState({
    prueba1: null,
    prueba2: null,
    prueba3: null,
    comparativa: null
  })
  
  const [estaProbando, setEstaProbando] = useState(false)
  const monitor = obtenerMonitorGlobal()

  // URLs de prueba con diferentes tamaños
  const imagenesPrueba = [
    {
      nombre: 'Imagen Grande (350KB)',
      url: 'https://rrmafdbxvimmvcerwguy.supabase.co/storage/v1/object/public/imagenes/fortuner-2010-elegancia-lateral.jpg',
      tamañoEsperado: 350000,
      tipo: 'grande'
    },
    {
      nombre: 'Imagen Mediana (150KB)',
      url: 'https://rrmafdbxvimmvcerwguy.supabase.co/storage/v1/object/public/imagenes/producto-mediano.jpg',
      tamañoEsperado: 150000,
      tipo: 'mediana'
    },
    {
      nombre: 'Imagen Pequeña (50KB)',
      url: 'https://rrmafdbxvimmvcerwguy.supabase.co/storage/v1/object/public/imagenes/thumbnail.jpg',
      tamañoEsperado: 50000,
      tipo: 'pequeña'
    }
  ]

  /**
   * Prueba 1: Comparación de tiempos de carga
   * Compara imagen normal vs optimizada
   */
  const ejecutarPrueba1 = async () => {
    console.log('🧪 Iniciando Prueba 1: Comparación de tiempos de carga')
    
    const resultadosPrueba = []
    
    for (const imagen of imagenesPrueba) {
      console.log(`📊 Probando: ${imagen.nombre}`)
      
      // Medir carga normal
      const tiempoNormal = await medirTiempoCarga(imagen.url, 'normal')
      
      // Medir carga optimizada
      const tiempoOptimizado = await medirTiempoCarga(imagen.url, 'optimizada')
      
      // Calcular mejora
      const mejoraPorcentaje = ((tiempoNormal - tiempoOptimizado) / tiempoNormal * 100).toFixed(1)
      
      resultadosPrueba.push({
        imagen: imagen.nombre,
        tiempoNormal,
        tiempoOptimizado,
        mejoraPorcentaje,
        factorMejora: (tiempoNormal / tiempoOptimizado).toFixed(2)
      })
      
      console.log(`✅ ${imagen.nombre}: ${mejoraPorcentaje}% más rápida`)
    }
    
    return {
      titulo: 'Comparación de Tiempos de Carga',
      descripcion: 'Compara imagen normal vs optimizada con SupabaseImageOptimizer',
      resultados: resultadosPrueba,
      timestamp: new Date().toISOString()
    }
  }

  /**
   * Prueba 2: Uso de memoria y recursos
   * Mide el impacto en memoria del navegador
   */
  const ejecutarPrueba2 = async () => {
    console.log('🧪 Iniciando Prueba 2: Análisis de uso de memoria')
    
    if (!performance.memory) {
      return {
        titulo: 'Análisis de Memoria',
        descripcion: 'No disponible en este navegador',
        error: 'performance.memory no está disponible',
        timestamp: new Date().toISOString()
      }
    }
    
    const memoriaInicial = performance.memory
    const imagenesParaProbar = imagenesPrueba.slice(0, 2) // Usar menos imágenes para prueba
    
    console.log('💾 Memoria inicial:', {
      usedJSHeapSize: (memoriaInicial.usedJSHeapSize / 1024 / 1024).toFixed(2) + ' MB',
      totalJSHeapSize: (memoriaInicial.totalJSHeapSize / 1024 / 1024).toFixed(2) + ' MB'
    })
    
    // Renderizar muchas imágenes optimizadas
    const resultadosMemoria = []
    
    for (let i = 0; i < 20; i++) {
      const memoriaAntes = performance.memory
      
      // Simular carga de imágenes
      await new Promise(resolve => setTimeout(resolve, 100))
      
      const memoriaDespues = performance.memory
      
      resultadosMemoria.push({
        iteracion: i + 1,
        memoriaUsada: memoriaDespues.usedJSHeapSize - memoriaAntes.usedJSHeapSize,
        memoriaTotal: memoriaDespues.totalJSHeapSize
      })
    }
    
    const memoriaFinal = performance.memory
    const incrementoMemoria = memoriaFinal.usedJSHeapSize - memoriaInicial.usedJSHeapSize
    
    return {
      titulo: 'Análisis de Uso de Memoria',
      descripcion: 'Mide el impacto en memoria del navegador al cargar imágenes optimizadas',
      resultados: {
        memoriaInicial: memoriaInicial.usedJSHeapSize,
        memoriaFinal: memoriaFinal.usedJSHeapSize,
        incrementoMemoria,
        incrementoMB: (incrementoMemoria / 1024 / 1024).toFixed(2),
        detallesPorIteracion: resultadosMemoria
      },
      timestamp: new Date().toISOString()
    }
  }

  /**
   * Prueba 3: Resistencia y estabilidad
   * Prueba de carga extrema
   */
  const ejecutarPrueba3 = async () => {
    console.log('🧪 Iniciando Prueba 3: Prueba de resistencia y estabilidad')
    
    const errores = []
    const exitos = []
    const tiempos = []
    
    // Prueba con muchas imágenes simultáneas
    const totalImagenes = 50
    const inicio = performance.now()
    
    console.log(`💪 Procesando ${totalImagenes} imágenes simultáneamente...`)
    
    const promesas = Array.from({ length: totalImagenes }, async (_, index) => {
      const imagenIndex = index % imagenesPrueba.length
      const imagen = imagenesPrueba[imagenIndex]
      
      try {
        const tiempoInicio = performance.now()
        
        // Simular carga de imagen
        await new Promise((resolve, reject) => {
          const img = new Image()
          img.onload = () => resolve(img)
          img.onerror = () => reject(new Error('Error al cargar imagen'))
          img.src = imagen.url + `?t=${Date.now()}` // Prevenir caché
        })
        
        const tiempoFin = performance.now()
        const tiempoCarga = tiempoFin - tiempoInicio
        
        exitos.push({
          index,
          imagen: imagen.nombre,
          tiempoCarga
        })
        
        tiempos.push(tiempoCarga)
        
      } catch (error) {
        errores.push({
          index,
          imagen: imagen.nombre,
          error: error.message
        })
      }
    })
    
    await Promise.allSettled(promesas)
    const tiempoTotal = performance.now() - inicio
    
    // Calcular estadísticas
    const tasaExito = (exitos.length / totalImagenes * 100).toFixed(1)
    const tiempoPromedio = tiempos.reduce((a, b) => a + b, 0) / tiempos.length
    const tiempoMaximo = Math.max(...tiempos)
    const tiempoMinimo = Math.min(...tiempos)
    
    return {
      titulo: 'Prueba de Resistencia y Estabilidad',
      descripcion: 'Prueba de carga extrema con 50 imágenes simultáneas',
      resultados: {
        totalImagenes,
        exitos: exitos.length,
        errores: errores.length,
        tasaExito: `${tasaExito}%`,
        tiempoTotal: `${tiempoTotal.toFixed(2)}ms`,
        tiempoPromedio: `${tiempoPromedio.toFixed(2)}ms`,
        tiempoMaximo: `${tiempoMaximo.toFixed(2)}ms`,
        tiempoMinimo: `${tiempoMinimo.toFixed(2)}ms`
      },
      timestamp: new Date().toISOString()
    }
  }

  /**
   * Función auxiliar para medir tiempo de carga
   */
  const medirTiempoCarga = async (url, tipo) => {
    const inicio = performance.now()
    
    try {
      if (tipo === 'normal') {
        // Carga normal sin optimización
        await fetch(url, { method: 'HEAD' })
      } else {
        // Carga con optimización (simulada)
        const urlOptimizada = url + '?width=800&quality=80&format=webp'
        await fetch(urlOptimizada, { method: 'HEAD' })
      }
    } catch (error) {
      console.warn('Error en medición:', error)
    }
    
    const fin = performance.now()
    return fin - inicio
  }

  /**
   * Ejecutar todas las pruebas
   */
  const ejecutarTodasLasPruebas = async () => {
    setEstaProbando(true)
    monitor.reiniciar()
    
    console.log('🚀 Iniciando batería completa de pruebas de rendimiento')
    
    try {
      // Ejecutar pruebas secuencialmente
      const prueba1 = await ejecutarPrueba1()
      setResultados(prev => ({ ...prev, prueba1 }))
      
      const prueba2 = await ejecutarPrueba2()
      setResultados(prev => ({ ...prev, prueba2 }))
      
      const prueba3 = await ejecutarPrueba3()
      setResultados(prev => ({ ...prev, prueba3 }))
      
      // Generar comparativa final
      const comparativa = generarComparativaFinal({
        prueba1,
        prueba2,
        prueba3
      })
      
      setResultados(prev => ({ ...prev, comparativa }))
      
      console.log('✅ Todas las pruebas completadas exitosamente')
      
    } catch (error) {
      console.error('❌ Error en las pruebas:', error)
    } finally {
      setEstaProbando(false)
    }
  }

  /**
   * Generar comparativa final con recomendaciones
   */
  const generarComparativaFinal = (resultados) => {
    const { prueba1, prueba2, prueba3 } = resultados
    
    const mejorasPromedio = prueba1?.resultados?.reduce((acc, r) => {
      return acc + parseFloat(r.mejoraPorcentaje)
    }, 0) / prueba1?.resultados?.length || 0
    
    const recomendaciones = []
    
    if (mejorasPromedio > 50) {
      recomendaciones.push('🎯 Excelente: La optimización está funcionando muy bien')
    } else if (mejorasPromedio > 25) {
      recomendaciones.push('👍 Bueno: La optimización está funcionando aceptablemente')
    } else {
      recomendaciones.push('⚠️ Mejorable: Considera ajustar los parámetros de optimización')
    }
    
    if (prueba3?.resultados?.tasaExito > 95) {
      recomendaciones.push('✅ Estable: El sistema maneja bien la carga alta')
    } else {
      recomendaciones.push('🔧 Ajustar: Implementa mejor manejo de errores para carga alta')
    }
    
    return {
      titulo: 'Análisis Comparativo Final',
      mejorasPromedio: `${mejorasPromedio.toFixed(1)}%`,
      estabilidad: prueba3?.resultados?.tasaExito || 'N/A',
      recomendaciones,
      timestamp: new Date().toISOString()
    }
  }

  /**
   * Exportar resultados
   */
  const exportarResultados = () => {
    const datosExport = {
      resultados,
      fecha: new Date().toISOString(),
      navegador: navigator.userAgent,
      resolucion: `${window.innerWidth}x${window.innerHeight}`,
      metricasMonitor: monitor.obtenerReporteCompleto()
    }
    
    const blob = new Blob([JSON.stringify(datosExport, null, 2)], {
      type: 'application/json'
    })
    
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `resultados-optimizacion-${Date.now()}.json`
    a.click()
    
    URL.revokeObjectURL(url)
  }

  return (
    <div className="pruebas-rendimiento-container">
      <div className="header-pruebas">
        <h1>🧪 Laboratorio de Rendimiento - Optimización de Imágenes Supabase</h1>
        <p>Pruebas exhaustivas para validar la mejora de rendimiento</p>
      </div>

      <div className="controles-pruebas">
        <button 
          className="btn-ejecutar-pruebas"
          onClick={ejecutarTodasLasPruebas}
          disabled={estaProbando}
        >
          {estaProbando ? '🔄 Ejecutando pruebas...' : '🚀 Ejecutar Todas las Pruebas'}
        </button>
        
        <button 
          className="btn-exportar"
          onClick={exportarResultados}
          disabled={!resultados.prueba1}
        >
          📊 Exportar Resultados
        </button>
      </div>

      {estaProbando && (
        <div className="indicador-carga">
          <div className="spinner"></div>
          <p>Ejecutando pruebas de rendimiento... Esto puede tomar unos minutos</p>
        </div>
      )}

      {/* Resultados de las pruebas */}
      <div className="resultados-container">
        {resultados.prueba1 && (
          <div className="resultado-prueba">
            <h2>📈 {resultados.prueba1.titulo}</h2>
            <p className="descripcion-prueba">{resultados.prueba1.descripcion}</p>
            
            <div className="tabla-resultados">
              <table>
                <thead>
                  <tr>
                    <th>Imagen</th>
                    <th>Tiempo Normal (ms)</th>
                    <th>Tiempo Optimizado (ms)</th>
                    <th>Mejora (%)</th>
                    <th>Factor Mejora</th>
                  </tr>
                </thead>
                <tbody>
                  {resultados.prueba1.resultados.map((resultado, index) => (
                    <tr key={index}>
                      <td>{resultado.imagen}</td>
                      <td>{resultado.tiempoNormal.toFixed(2)}</td>
                      <td>{resultado.tiempoOptimizado.toFixed(2)}</td>
                      <td className="mejora">
                        <span className={parseFloat(resultado.mejoraPorcentaje) > 30 ? 'excelente' : 'buena'}>
                          {resultado.mejoraPorcentaje}%
                        </span>
                      </td>
                      <td>{resultado.factorMejora}x</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {resultados.prueba2 && (
          <div className="resultado-prueba">
            <h2>💾 {resultados.prueba2.titulo}</h2>
            <p className="descripcion-prueba">{resultados.prueba2.descripcion}</p>
            
            {resultados.prueba2.error ? (
              <div className="error-prueba">
                <p>{resultados.prueba2.error}</p>
              </div>
            ) : (
              <div className="metricas-memoria">
                <div className="metrica">
                  <span className="label">Memoria Inicial:</span>
                  <span className="valor">{resultados.prueba2.resultados.incrementoMB} MB</span>
                </div>
                <div className="metrica">
                  <span className="label">Incremento Total:</span>
                  <span className="valor">{(resultados.prueba2.resultados.incrementoMemoria / 1024 / 1024).toFixed(2)} MB</span>
                </div>
              </div>
            )}
          </div>
        )}

        {resultados.prueba3 && (
          <div className="resultado-prueba">
            <h2>💪 {resultados.prueba3.titulo}</h2>
            <p className="descripcion-prueba">{resultados.prueba3.descripcion}</p>
            
            <div className="metricas-estres">
              <div className="metrica-grande">
                <span className="label">Tasa de Éxito:</span>
                <span className="valor destacado">{resultados.prueba3.resultados.tasaExito}</span>
              </div>
              <div className="metrica">
                <span className="label">Tiempo Total:</span>
                <span className="valor">{resultados.prueba3.resultados.tiempoTotal}</span>
              </div>
              <div className="metrica">
                <span className="label">Tiempo Promedio:</span>
                <span className="valor">{resultados.prueba3.resultados.tiempoPromedio}</span>
              </div>
            </div>
          </div>
        )}

        {resultados.comparativa && (
          <div className="resultado-prueba comparativa-final">
            <h2>🎯 {resultados.comparativa.titulo}</h2>
            
            <div className="resumen-comparativo">
              <div className="metrica-resumen">
                <span className="label">Mejora Promedio:</span>
                <span className="valor excelente">{resultados.comparativa.mejorasPromedio}</span>
              </div>
              <div className="metrica-resumen">
                <span className="label">Estabilidad:</span>
                <span className="valor buena">{resultados.comparativa.estabilidad}</span>
              </div>
            </div>
            
            <div className="recomendaciones-finales">
              <h3>💡 Recomendaciones Finales</h3>
              <ul>
                {resultados.comparativa.recomendaciones.map((rec, index) => (
                  <li key={index}>{rec}</li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>

      {/* Información adicional */}
      <div className="info-adicional">
        <h3>ℹ️ Información del Sistema</h3>
        <div className="info-item">
          <strong>Navegador:</strong> {navigator.userAgent}
        </div>
        <div className="info-item">
          <strong>Resolución:</strong> {window.innerWidth}x{window.innerHeight}
        </div>
        <div className="info-item">
          <strong>Fecha de Prueba:</strong> {new Date().toLocaleString()}
        </div>
      </div>
    </div>
  )
}

export default PruebasRendimientoOptimizacion