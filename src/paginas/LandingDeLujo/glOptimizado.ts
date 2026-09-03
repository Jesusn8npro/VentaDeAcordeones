// Copia local de `esPantallaExigente` (en AcademiaNext vive en AcordeonProMax/Modos/glOptimizado).
// Pantallas de alta densidad o táctiles: se desactiva el MSAA porque el DPR alto ya suaviza bordes
// y el antialias en un móvil es lo que dispara el coste de la página.
export function esPantallaExigente(): boolean {
  if (typeof window === 'undefined') return false
  const dprAlto = (window.devicePixelRatio || 1) > 1.5
  const tactil = 'ontouchstart' in window || (navigator.maxTouchPoints || 0) > 0
  return dprAlto || tactil
}
