export default function Suporte() {
  return (
    <div className="max-w-md">
      <h2 className="text-xs uppercase tracking-wider text-muted mb-3">Suporte</h2>
      <div className="rounded-xl border border-border bg-surface p-5 flex flex-col gap-3">
        <p className="text-sm text-cream">
          Precisa de ajuda com o sistema do Hotel Aconchego? Fale com quem cuida da manutenção do app.
        </p>
        <a
          href="https://wa.me/55"
          target="_blank"
          rel="noreferrer"
          className="text-sm px-4 py-2.5 rounded-lg bg-gold text-bg font-semibold hover:bg-gold-soft transition-colors text-center"
        >
          Chamar no WhatsApp
        </a>
        <p className="text-xs text-muted">
          Dica: troque o número acima em <code className="text-gold-soft">src/pages/tabs/Suporte.jsx</code> pelo seu contato real.
        </p>
      </div>
    </div>
  )
}
