import { useEffect, useState } from 'react'
import { pb } from '../../lib/pocketbase'
import { useAuth } from '../../context/AuthContext'
import Modal from '../../components/Modal'

export default function Estoque() {
  const { sessao } = useAuth()
  const [itens, setItens] = useState([])
  const [carregando, setCarregando] = useState(true)
  const [modal, setModal] = useState(null) // item selecionado
  const [tipo, setTipo] = useState('saida')
  const [quantidade, setQuantidade] = useState('')
  const [motivo, setMotivo] = useState('')
  const [salvando, setSalvando] = useState(false)

  useEffect(() => {
    carregar()
  }, [])

  async function carregar() {
    setCarregando(true)
    try {
      const lista = await pb.collection('estoque_itens').getFullList({ sort: 'nome' })
      setItens(lista)
    } finally {
      setCarregando(false)
    }
  }

  function abrirModal(item) {
    setTipo('saida')
    setQuantidade('')
    setMotivo('')
    setModal(item)
  }

  async function salvarMovimento(e) {
    e.preventDefault()
    setSalvando(true)
    const qtd = parseFloat(quantidade.replace(',', '.')) || 0

    await pb.collection('estoque_movimentos').create({
      item: modal.id,
      tipo,
      quantidade: qtd,
      motivo,
      colaborador: sessao.colaboradorId ?? null,
    })

    const novaQuantidade = tipo === 'entrada' ? Number(modal.quantidade) + qtd : Number(modal.quantidade) - qtd

    await pb.collection('estoque_itens').update(modal.id, {
      quantidade: Math.max(0, novaQuantidade),
    })

    setSalvando(false)
    setModal(null)
    carregar()
  }

  return (
    <div>
      <h2 className="text-xs uppercase tracking-wider text-muted mb-3">Itens em estoque</h2>

      {carregando ? (
        <p className="text-muted text-sm">Carregando estoque...</p>
      ) : itens.length === 0 ? (
        <p className="text-muted text-sm">Nenhum item cadastrado ainda. Cadastre em Gestão.</p>
      ) : (
        <div className="flex flex-col gap-2">
          {itens.map((item) => {
            const baixo = Number(item.quantidade) <= Number(item.quantidade_minima)
            return (
              <button
                key={item.id}
                onClick={() => abrirModal(item)}
                className="flex items-center justify-between rounded-lg border border-border bg-surface px-4 py-3 text-left hover:border-gold transition-colors"
              >
                <div>
                  <div className="text-cream text-sm font-medium">{item.nome}</div>
                  {baixo && <div className="text-xs text-manutencao mt-0.5">Estoque baixo</div>}
                </div>
                <span className="text-sm text-cream font-semibold">
                  {item.quantidade} {item.unidade}
                </span>
              </button>
            )
          })}
        </div>
      )}

      {modal && (
        <Modal titulo={modal.nome} onClose={() => setModal(null)}>
          <form onSubmit={salvarMovimento} className="flex flex-col gap-3">
            <p className="text-sm text-muted">
              Quantidade atual: {modal.quantidade} {modal.unidade}
            </p>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setTipo('entrada')}
                className={`flex-1 px-4 py-2 rounded-lg border text-sm font-medium transition-colors ${
                  tipo === 'entrada' ? 'border-livre text-livre bg-livre/10' : 'border-border text-muted'
                }`}
              >
                Entrada
              </button>
              <button
                type="button"
                onClick={() => setTipo('saida')}
                className={`flex-1 px-4 py-2 rounded-lg border text-sm font-medium transition-colors ${
                  tipo === 'saida' ? 'border-ocupado text-ocupado bg-ocupado/10' : 'border-border text-muted'
                }`}
              >
                Saída
              </button>
            </div>

            <input
              required
              type="text"
              inputMode="decimal"
              placeholder={`Quantidade (${modal.unidade})`}
              value={quantidade}
              onChange={(e) => setQuantidade(e.target.value)}
              className="px-4 py-3 rounded-lg border border-border bg-surface-2 text-cream placeholder:text-muted outline-none focus:border-gold"
            />
            <input
              type="text"
              placeholder="Motivo (opcional)"
              value={motivo}
              onChange={(e) => setMotivo(e.target.value)}
              className="px-4 py-3 rounded-lg border border-border bg-surface-2 text-cream placeholder:text-muted outline-none focus:border-gold"
            />

            <button
              type="submit"
              disabled={salvando}
              className="mt-1 px-4 py-3 rounded-lg bg-gold text-bg font-semibold hover:bg-gold-soft transition-colors disabled:opacity-60"
            >
              {salvando ? 'Salvando...' : 'Registrar movimento'}
            </button>
          </form>
        </Modal>
      )}
    </div>
  )
}
