const STATUS = {
  livre: { label: 'Livre', dot: 'bg-livre', text: 'text-livre' },
  ocupado: { label: 'Ocupado', dot: 'bg-ocupado', text: 'text-ocupado' },
  limpeza: { label: 'Em limpeza', dot: 'bg-limpeza', text: 'text-limpeza' },
  manutencao: { label: 'Manutenção', dot: 'bg-manutencao', text: 'text-manutencao' },
}

export default function RoomCard({ quarto, onAcaoPrincipal, onMarcarManutencao }) {
  const info = STATUS[quarto.status] ?? STATUS.livre

  const acaoPrincipalLabel = {
    livre: 'Ocupar',
    ocupado: 'Finalizar',
    limpeza: 'Concluir limpeza',
    manutencao: 'Concluir manutenção',
  }[quarto.status]

  return (
    <div className="rounded-xl border border-border bg-surface p-5 flex flex-col gap-3">
      <div className="flex items-start justify-between">
        <span className="font-display text-base text-cream tracking-wide">{quarto.nome}</span>
        <span className={`w-2.5 h-2.5 rounded-full mt-1.5 ${info.dot}`} />
      </div>

      <span className={`text-sm font-medium ${info.text}`}>{info.label}</span>

      <div className="flex flex-col gap-1.5 mt-1">
        <button
          onClick={() => onAcaoPrincipal(quarto)}
          className="text-sm px-3 py-2 rounded-md bg-surface-2 border border-border text-cream hover:border-gold transition-colors"
        >
          {acaoPrincipalLabel}
        </button>
        {quarto.status !== 'manutencao' && (
          <button
            onClick={() => onMarcarManutencao(quarto)}
            className="text-xs text-muted hover:text-gold-soft transition-colors text-left"
          >
            Marcar manutenção
          </button>
        )}
      </div>
    </div>
  )
}
