interface Props {
  variante?: string
}

export default function MiniAcordeon({ variante = '' }: Props) {
  return (
    <div className={`mini-acc var-${variante}`}>
      <div className="h t" />
      <div className="b" />
      <div className="h b" />
    </div>
  )
}
