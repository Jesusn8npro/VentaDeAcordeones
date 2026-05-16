// Componente de input reutilizable
export default function Input({
  etiqueta,
  error,
  className = '',
  ...props
}) {
  const clasesBase = 'input'
  const clasesError = error ? 'input--error' : ''
  const clasesCompletas = `${clasesBase} ${clasesError} ${className}`.trim()

  return (
    <div className="input-contenedor">
      {etiqueta && <label className="input-etiqueta">{etiqueta}</label>}
      <input className={clasesCompletas} {...props} />
      {error && <span className="input-error">{error}</span>}
    </div>
  )
}




























