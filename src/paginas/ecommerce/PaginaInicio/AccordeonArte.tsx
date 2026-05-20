interface Props {
  variante?: string
  className?: string
  style?: React.CSSProperties
}

export default function AccordeonArte({ variante = '', className = '', style }: Props) {
  return (
    <div className={`acc${variante ? ' var-' + variante : ''}${className ? ' ' + className : ''}`} style={style}>
      <div className="acc-body">
        <div className="acc-head top">
          <div className="keys">
            {Array.from({ length: 15 }).map((_, i) => <i key={i} />)}
          </div>
        </div>
        <div className="acc-bellows">
          <span className="strap l" />
          <span className="strap r" />
        </div>
        <div className="acc-head bottom">
          <div className="keys">
            {Array.from({ length: 12 }).map((_, i) => <i key={i} />)}
          </div>
        </div>
      </div>
    </div>
  )
}
