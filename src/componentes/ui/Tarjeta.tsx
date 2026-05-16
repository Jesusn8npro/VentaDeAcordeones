// Componente de tarjeta reutilizable
export default function Tarjeta({ 
  children, 
  variante = 'default',
  className = '',
  ...props 
}) {
  const clasesBase = 'tarjeta'
  const clasesVariante = `tarjeta--${variante}`
  const clasesCompletas = `${clasesBase} ${clasesVariante} ${className}`.trim()

  return (
    <div className={clasesCompletas} {...props}>
      {children}
    </div>
  )
}




























