export default function Login({ onEscolher }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 py-16">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center mb-10">
          <img src="/logo-aconchego.svg" alt="Hotel Aconchego" className="w-40 h-40 mb-2" />
        </div>

        <h1 className="font-display text-xl text-center text-cream mb-8">
          Quem está acessando?
        </h1>

        <div className="flex flex-col gap-3">
          <button
            onClick={() => onEscolher('colaborador')}
            className="w-full text-left px-5 py-4 rounded-lg border border-border bg-surface-2 text-cream font-medium hover:border-gold transition-colors"
          >
            Colaborador
          </button>
          <button
            onClick={() => onEscolher('administrador')}
            className="w-full text-left px-5 py-4 rounded-lg border border-gold/70 bg-surface-2 text-gold-soft font-medium hover:border-gold transition-colors"
          >
            Administrador
          </button>
        </div>

        <p className="text-center text-xs text-muted mt-10">
          Hotel Aconchego · Sistema interno de recepção
        </p>
      </div>
    </div>
  )
}
