# Modal de Autenticación — Solución Definitiva de Estilos y Funcionalidad

## Problema
Tras refrescar la página, los estilos del modal se perdían y el formulario se desorganizaba. Los síntomas variaban entre inputs con estilos globales, paddings incorrectos y sombras/bordes alterados.

## Causas identificadas
- Orden de carga del CSS: hojas globales (frameworks/temas) se inyectaban después y pisaban reglas del modal.
- Especificidad insuficiente: selectores genéricos del sitio ganaban la cascada sobre inputs y botones del modal.
- Dependencias del bundler/refresh: en algunos flujos el módulo CSS del modal no se inyectaba a tiempo tras recarga.

## Solución aplicada
1. Encapsulamiento total con Shadow DOM:
   - El modal crea su propio host dinámico y adjunta `shadowRoot` en el `document.body` cuando se abre.
   - Los estilos críticos se inyectan dentro del `shadowRoot`, por lo que no pueden ser pisados por hojas globales del documento.
2. Ciclo de vida del host:
   - Al abrir, se crea el host y se monta el contenido; al cerrar, se elimina el host y se limpia el estado.
3. Mejora UX:
   - Logo reducido para evitar saltos y overflow.
   - `overflow-x: hidden` en overlay y contenedor para impedir scroll horizontal.

## Archivos relevantes
- `src/componentes/autenticacion/ModalAutenticacionShadow.jsx` (modal activo)
- Eliminados por limpieza (no usados):
  - `ModalAutenticacion.jsx`
  - `ModalAutenticacionAlt.jsx`
  - `ModalAutenticacionAlt.css`
  - `ModalAutenticacionAlt.module.css`

## Cómo funciona
- El header invoca `<ModalAutenticacionShadow abierto={estado} onCerrar={fn} />`.
- Cuando `abierto` es true:
  - Se crea un host `<div id="auth-shadow-host">` en `body`.
  - Se adjunta `shadowRoot` y se inyecta CSS crítico.
  - Se renderiza el contenido dentro del `shadowRoot` con `createPortal`.
- Al cerrar:
  - Se elimina el host del `body` y el `shadowRoot`.

## Pruebas realizadas
- Múltiples refrescos (Ctrl+F5): estilos permanecen consistentes.
- Funcionalidad JS estable: login, registro, recuperación y OAuth Google.
- Sin errores en consola.
- Móvil y escritorio: sin scroll horizontal, scroll interno correcto, sin zoom indeseado en inputs.

## Recomendaciones
- Si se requiere alternar modal por configuración, se puede añadir `VITE_MODAL_AUTH=shadow|legacy` y condicionar el import en `HeaderPrincipal.jsx`.
- Mantener imágenes de logo en `public` (`/MeLlevoEsto.Com Logo.png`) con fallback para robustez.

## Uso
Importado en `HeaderPrincipal.jsx`:
```
import ModalAutenticacionShadow from '../autenticacion/ModalAutenticacionShadow'
...
<ModalAutenticacionShadow abierto={modalAutenticacionAbierto} onCerrar={() => setModalAutenticacionAbierto(false)} />
```