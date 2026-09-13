export default function Suporte() {
  return (
    <div className="max-w-md">
      <h2 className="text-xs uppercase tracking-wider text-muted mb-3">Suporte</h2>
      <div className="rounded-xl border border-border bg-surface p-5 flex flex-col gap-3">
        <div className="text-sm text-cream">
          <p className="font-medium">Precisa de ajuda com o sistema?</p>
          <p className="mt-1 text-muted">Nossa equipe de suporte está à disposição para ajudar você.</p>
        </div>
        <a
          href="https://wa.me/5591992710037"
          target="_blank"
          rel="noreferrer"
          className="text-sm px-4 py-2.5 rounded-lg bg-gold text-bg font-semibold hover:bg-gold-soft transition-colors text-center"
        >
          Chamar suporte pelo WhatsApp
        </a>
        <p className="text-xs text-muted">
          Atendimento: Segunda a sexta, 08:00 às 18:00.
        </p>
      </div>
    </div>
  )
}
