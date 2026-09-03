// Serializa JSON-LD para <script type="application/ld+json"> de forma segura.
// JSON.stringify no escapa "<", así que un texto de la BD que contenga "</script>" rompería el
// documento (XSS). Se escapan <, > y & como secuencias \u00XX, que siguen siendo JSON válido.
export function serializarJsonLd(datos: unknown): string {
  return JSON.stringify(datos)
    .replace(/</g, '\\u003c')
    .replace(/>/g, '\\u003e')
    .replace(/&/g, '\\u0026')
}
