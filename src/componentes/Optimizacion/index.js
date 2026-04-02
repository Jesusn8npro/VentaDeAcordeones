/**
 * Índice de Componentes de Optimización de Imágenes Supabase
 * Exporta todos los componentes de optimización para facilitar su uso
 * 
 * @author: Sistema de Optimización Supabase
 * @version: 1.0.0
 */

// Componentes principales
export { default as SupabaseImageOptimizer } from './SupabaseImageOptimizer'
export { default as SupabaseImagePreloader } from './SupabaseImagePreloader'
export { default as EjemploOptimizacionSupabase } from './EjemploOptimizacionSupabase'
export { default as PruebasRendimientoOptimizacion } from './PruebasRendimientoOptimizacion'

// Optimizador rápido para implementación inmediata
export { 
  default as OptimizadorRapidoSupabase,
  optimizarMultiplesImagenes,
  conOptimizacionImagen,
  MigradorImagenSupabase,
  CONFIGURACIONES_RAPIDAS
} from './OptimizadorRapidoSupabase'

// Hooks personalizados
export { default as useSupabaseImageOptimizer } from '../../hooks/useSupabaseImageOptimizer'

// Utilidades
export { default as ImagePerformanceMonitor, obtenerMonitorGlobal } from '../../utils/ImagePerformanceMonitor'

// Constantes y tipos
export { ESTRATEGIAS_PRECARGA } from './SupabaseImagePreloader'

// Estilos (se importan automáticamente con los componentes)
import './SupabaseImageOptimizer.css'
import './EjemploOptimizacionSupabase.css'
import './PruebasRendimientoOptimizacion.css'