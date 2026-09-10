import { useState } from 'react'
import { pb } from '../lib/pocketbase'
import { useAuth } from '../context/AuthContext'

export default function AdminLogin({ onVoltar }) {
  const { entrarComoAdministrador } = useAuth()
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [carregando, setCarregando] = useState(false)
  const [erro, setErro] = useState(null)

  async function handleSubmit(e) {
    e.preventDefault()
    setCarregando(true)
    setErro(null)

    try {
      const { record } = await pb.collection('administradores').authWithPassword(email, senha)
      entrarComoAdministrador(record.nome || record.email)
    } catch {
      setErro('E-mail ou senha inválidos.')
    } finally {
      setCarregando(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 py-16">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center mb-8">
          <img src="/logo-aconchego.svg" alt="Hotel Aconchego" className="w-32 h-32 mb-2" />
        </div>

        <h1 className="font-display text-xl text-cream mb-1">Acesso do administrador</h1>
        <p className="text-sm text-muted mb-6">Entre com seu e-mail e senha para acessar o sistema.</p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <input
            type="email"
            required
            placeholder="E-mail"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="px-4 py-3 rounded-lg border border-border bg-surface-2 text-cream placeholder:text-muted outline-none focus:border-gold"
          />
          <input
            type="password"
            required
            placeholder="Senha"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            className="px-4 py-3 rounded-lg border border-border bg-surface-2 text-cream placeholder:text-muted outline-none focus:border-gold"
          />

          {erro && <p className="text-ocupado text-sm">{erro}</p>}

          <button
            type="submit"
            disabled={carregando}
            className="mt-1 px-5 py-3 rounded-lg bg-gold text-bg font-semibold hover:bg-gold-soft transition-colors disabled:opacity-60"
          >
            {carregando ? 'Entrando...' : 'Entrar'}
          </button>
        </form>

        <button onClick={onVoltar} className="mt-6 text-sm text-muted hover:text-cream transition-colors">
          ← Voltar
        </button>
      </div>
    </div>
  )
}
