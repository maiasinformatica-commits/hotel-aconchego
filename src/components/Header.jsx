import { useAuth } from '../context/AuthContext'

const ABAS = [
  { id: 'painel', label: 'Painel' },
  { id: 'caixa', label: 'Caixa do dia' },
  { id: 'relatorios', label: 'Relatórios' },
  { id: 'estoque', label: 'Estoque' },
  { id: 'gestao', label: 'Gestão', somenteAdmin: true },
  { id: 'suporte', label: 'Suporte' },
]

export default function Header({ abaAtiva, onMudarAba }) {
  const { sessao, sair } = useAuth()
  const ehAdmin = sessao?.tipo === 'administrador'

  return (
    <header className="border-b border-border bg-surface">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6">
        <div className="flex items-center gap-3">
          <img src="/logo-aconchego.svg" alt="" className="w-9 h-9 rounded-md" />
          <div>
            <div className="font-display text-sm text-cream leading-tight">Hotel Aconchego</div>
            <div className="text-xs text-muted leading-tight">
              {sessao?.tipo === 'administrador' ? 'Administrador' : sessao?.nome}
            </div>
          </div>
        </div>

        <nav className="flex flex-wrap gap-1 flex-1">
          {ABAS.filter((a) => !a.somenteAdmin || ehAdmin).map((a) => (
            <button
              key={a.id}
              onClick={() => onMudarAba(a.id)}
              className={`px-3 py-1.5 rounded-md text-sm transition-colors ${
                abaAtiva === a.id
                  ? 'bg-gold text-bg font-semibold'
                  : 'text-muted hover:text-cream hover:bg-surface-2'
              }`}
            >
              {a.label}
            </button>
          ))}
        </nav>

        <button onClick={sair} className="text-sm text-muted hover:text-cream transition-colors self-start sm:self-auto">
          Trocar usuário
        </button>
      </div>
    </header>
  )
}
