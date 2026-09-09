import { useEffect, useMemo, useState } from 'react'
import { pb } from '../../lib/pocketbase'
import { useAuth } from '../../context/AuthContext'
import Modal from '../../components/Modal'

function inicioDoDiaISO() {
  const d = new Date()
  d.setHours(0, 0, 0, 0)
  return d.toISOString()
}

export default function Caixa() {
  const { sessao } = useAuth()
  const [movimentos, setMovimentos] = useState([])
  const [carregando, setCarregando] = useState(true)
  const [modalAberto, setModalAberto] = useState(false)
  const [tipo, setTipo] = useState('entrada')
  const [descricao, setDescricao] = useState('')
  const [valor, setValor] = useState('')
  const [formaPagamento, setFormaPagamento] = useState('dinheiro')
  const [salvando, setSalvando] = useState(false)

  useEffect(() => {
    carregar()
  }, [])

  async function carregar() {
    setCarregando(true)
    try {
      const lista = await pb.collection('caixa_movimentos').getFullList({
        filter: `created >= "${inicioDoDiaISO()}"`,
        sort: '-created',
        expand: 'colaborador,quarto',
      })
      setMovimentos(lista)
    } finally {
      setCarregando(false)
    }
  }

  const totais = useMemo(() => {
    const entradas = movimentos.filter((m) => m.tipo === 'entrada').reduce((s, m) => s + Number(m.valor), 0)
    const saidas = movimentos.filter((m) => m.tipo === 'saida').reduce((s, m) => s + Number(m.valor), 0)
    return { entradas, saidas, saldo: entradas - saidas }
  }, [movimentos])

  async function salvarMovimento(e) {
    e.preventDefault()
    setSalvando(true)
    const valorNumerico = parseFloat(valor.replace(',', '.')) || 0

    await pb.collection('caixa_movimentos').create({
      tipo,
      descricao,
      valor: valorNumerico,
      forma_pagamento: formaPagamento,
      colaborador: sessao.colaboradorId ?? null,
    })

    setSalvando(false)
    setModalAberto(false)
    setDescricao('')
    setValor('')
    carregar()
  }

  return (
    <div>
      <div className="grid grid-cols-3 gap-3 mb-6">
        <Total label="Entradas" valor={totais.entradas} cor="text-livre" />
        <Total label="Saídas" valor={totais.saidas} cor="text-ocupado" />
        <Total label="Saldo do dia" valor={totais.saldo} cor="text-gold-soft" />
      </div>

      <div className="flex items-center justify-between mb-3">
        <h2 className="text-xs uppercase tracking-wider text-muted">Movimentos de hoje</h2>
        <button
          onClick={() => setModalAberto(true)}
          className="text-sm px-3 py-1.5 rounded-md bg-gold text-bg font-semibold hover:bg-gold-soft transition-colors"
        >
          + Novo movimento
        </button>
      </div>

      {carregando ? (
        <p className="text-muted text-sm">Carregando...</p>
      ) : movimentos.length === 0 ? (
        <p className="text-muted text-sm">Nenhum movimento registrado hoje.</p>
      ) : (
        <div className="flex flex-col gap-2">
          {movimentos.map((m) => (
            <div key={m.id} className="flex items-center justify-between rounded-lg border border-border bg-surface px-4 py-3">
              <div>
                <div className="text-cream text-sm font-medium">{m.descricao}</div>
                <div className="text-xs text-muted mt-0.5">
                  {new Date(m.created).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                  {m.expand?.colaborador?.nome ? ` · ${m.expand.colaborador.nome}` : ''}
                  {m.expand?.quarto?.nome ? ` · ${m.expand.quarto.nome}` : ''}
                </div>
              </div>
              <span className={`text-sm font-semibold ${m.tipo === 'entrada' ? 'text-livre' : 'text-ocupado'}`}>
                {m.tipo === 'entrada' ? '+' : '-'} R$ {Number(m.valor).toFixed(2).replace('.', ',')}
              </span>
            </div>
          ))}
        </div>
      )}

      {modalAberto && (
        <Modal titulo="Novo movimento de caixa" onClose={() => setModalAberto(false)}>
          <form onSubmit={salvarMovimento} className="flex flex-col gap-3">
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
              placeholder="Descrição"
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              className="px-4 py-3 rounded-lg border border-border bg-surface-2 text-cream placeholder:text-muted outline-none focus:border-gold"
            />
            <input
              required
              type="text"
              inputMode="decimal"
              placeholder="Valor (R$)"
              value={valor}
              onChange={(e) => setValor(e.target.value)}
              className="px-4 py-3 rounded-lg border border-border bg-surface-2 text-cream placeholder:text-muted outline-none focus:border-gold"
            />
            <select
              value={formaPagamento}
              onChange={(e) => setFormaPagamento(e.target.value)}
              className="px-4 py-3 rounded-lg border border-border bg-surface-2 text-cream outline-none focus:border-gold"
            >
              <option value="dinheiro">Dinheiro</option>
              <option value="pix">Pix</option>
              <option value="cartao_credito">Cartão de crédito</option>
              <option value="cartao_debito">Cartão de débito</option>
            </select>

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

function Total({ label, valor, cor }) {
  return (
    <div className="rounded-xl border border-border bg-surface px-4 py-3">
      <div className={`text-lg font-display ${cor}`}>R$ {valor.toFixed(2).replace('.', ',')}</div>
      <div className="text-xs text-muted mt-0.5">{label}</div>
    </div>
  )
}
