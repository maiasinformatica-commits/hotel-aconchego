import { useEffect, useState } from 'react'
import { pb } from '../lib/pocketbase'
import { useAuth } from '../context/AuthContext'

export default function SelectColaborador({ onVoltar }) {
  const { entrarComoColaborador } = useAuth()
  const [colaboradores, setColaboradores] = useState([])
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState(null)

  useEffect(() => {
    let ativo = true
    async function carregar() {
      try {
        const lista = await pb.collection('colaboradores').getFullList({
          filter: 'ativo = true',
          sort: 'nome',
        })
        if (ativo) setColaboradores(lista)
      } catch (err) {
        if (ativo) setErro(err.message)
      } finally {
        if (ativo) setCarregando(false)
      }
    }
    carregar()
    return () => { ativo = false }
  }, [])

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 py-16">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center mb-8">
          <img src="/logo-aconchego.svg" alt="Hotel Aconchego" className="w-32 h-32 mb-2" />
        </div>

        <h1 className="font-display text-xl text-cream mb-1">Quem está acessando?</h1>
        <p className="text-sm text-muted mb-5">Selecione seu nome</p>

        {carregando && <p className="text-muted text-sm">Carregando...</p>}
        {erro && (
          <p className="text-ocupado text-sm mb-4">
            Não foi possível carregar os colaboradores: {erro}
          </p>
        )}

        <div className="flex flex-col gap-2 max-h-80 overflow-y-auto scrollbar-thin">
          {colaboradores.map((c) => (
            <button
              key={c.id}
              onClick={() => entrarComoColaborador(c)}
              className="w-full text-left px-5 py-3 rounded-lg border border-border bg-surface-2 text-cream font-medium hover:border-gold transition-colors"
            >
              {c.nome}
            </button>
          ))}
          {!carregando && !erro && colaboradores.length === 0 && (
            <p className="text-muted text-sm">
              Nenhum colaborador cadastrado ainda. Peça a um administrador para cadastrar em Gestão.
            </p>
          )}
        </div>

        <button onClick={onVoltar} className="mt-6 text-sm text-muted hover:text-cream transition-colors">
          ← Voltar
        </button>
      </div>
    </div>
  )
}
