import { useEffect, useMemo, useState } from 'react'
import { pb } from '../../lib/pocketbase'
import { useAuth } from '../../context/AuthContext'
import RoomCard from '../../components/RoomCard'
import Modal from '../../components/Modal'

export default function Painel() {
  const { sessao } = useAuth()
  const [quartos, setQuartos] = useState([])
  const [carregando, setCarregando] = useState(true)
  const [modal, setModal] = useState(null) // { tipo: 'ocupar' | 'finalizar', quarto }
  const [valor, setValor] = useState('')
  const [formaPagamento, setFormaPagamento] = useState('dinheiro')
  const [salvando, setSalvando] = useState(false)

  useEffect(() => {
    let ativo = true
    carregarQuartos()

    let unsubscribe
    pb.collection('quartos').subscribe('*', () => {
      if (ativo) carregarQuartos()
    }).then((fn) => { unsubscribe = fn })

    return () => {
      ativo = false
      unsubscribe?.()
    }
  }, [])

  async function carregarQuartos() {
    try {
      const lista = await pb.collection('quartos').getFullList({ sort: 'nome' })
      setQuartos(lista)
    } finally {
      setCarregando(false)
    }
  }

  const contagens = useMemo(() => {
    return quartos.reduce(
      (acc, q) => {
        acc[q.status] = (acc[q.status] ?? 0) + 1
        return acc
      },
      { livre: 0, ocupado: 0, limpeza: 0, manutencao: 0 }
    )
  }, [quartos])

  function abrirAcaoPrincipal(quarto) {
    if (quarto.status === 'livre') {
      setValor('')
      setFormaPagamento('dinheiro')
      setModal({ tipo: 'ocupar', quarto })
    } else if (quarto.status === 'ocupado') {
      setValor('')
      setFormaPagamento('dinheiro')
      setModal({ tipo: 'finalizar', quarto })
    } else {
      // limpeza ou manutencao -> concluir e voltar para livre
      atualizarStatusQuarto(quarto.id, 'livre')
    }
  }

  async function marcarManutencao(quarto) {
    await atualizarStatusQuarto(quarto.id, 'manutencao')
  }

  async function atualizarStatusQuarto(quartoId, status) {
    await pb.collection('quartos').update(quartoId, { status })
  }

  async function confirmarOcupar() {
    setSalvando(true)
    const { quarto } = modal
    await pb.collection('estadias').create({
      quarto: quarto.id,
      colaborador: sessao.colaboradorId ?? null,
      check_in: new Date().toISOString(),
      status: 'aberta',
    })
    await atualizarStatusQuarto(quarto.id, 'ocupado')
    setSalvando(false)
    setModal(null)
  }

  async function confirmarFinalizar() {
    setSalvando(true)
    const { quarto } = modal
    const valorNumerico = parseFloat(valor.replace(',', '.')) || 0

    const estadiaAberta = await pb.collection('estadias').getFirstListItem(
      `quarto = "${quarto.id}" && status = "aberta"`,
      { sort: '-check_in' }
    ).catch(() => null)

    if (estadiaAberta) {
      await pb.collection('estadias').update(estadiaAberta.id, {
        check_out: new Date().toISOString(),
        valor: valorNumerico,
        forma_pagamento: formaPagamento,
        status: 'fechada',
      })
    }

    if (valorNumerico > 0) {
      await pb.collection('caixa_movimentos').create({
        tipo: 'entrada',
        descricao: `Estadia ${quarto.nome}`,
        valor: valorNumerico,
        forma_pagamento: formaPagamento,
        colaborador: sessao.colaboradorId ?? null,
        quarto: quarto.id,
      })
    }

    await atualizarStatusQuarto(quarto.id, 'limpeza')
    setSalvando(false)
    setModal(null)
  }

  return (
    <div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        <Contador label="Livres" valor={contagens.livre} cor="text-livre" />
        <Contador label="Ocupados" valor={contagens.ocupado} cor="text-ocupado" />
        <Contador label="Em limpeza" valor={contagens.limpeza} cor="text-limpeza" />
        <Contador label="Manutenção" valor={contagens.manutencao} cor="text-manutencao" />
      </div>

      <h2 className="text-xs uppercase tracking-wider text-muted mb-3">Quartos</h2>

      {carregando ? (
        <p className="text-muted text-sm">Carregando quartos...</p>
      ) : quartos.length === 0 ? (
        <p className="text-muted text-sm">
          Nenhum quarto cadastrado ainda. Cadastre em Gestão.
        </p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {quartos.map((q) => (
            <RoomCard
              key={q.id}
              quarto={q}
              onAcaoPrincipal={abrirAcaoPrincipal}
              onMarcarManutencao={marcarManutencao}
            />
          ))}
        </div>
      )}

      {modal?.tipo === 'ocupar' && (
        <Modal titulo={`Ocupar ${modal.quarto.nome}`} onClose={() => setModal(null)}>
          <p className="text-sm text-muted mb-4">
            O quarto será marcado como ocupado. Você registra o valor recebido na finalização.
          </p>
          <button
            onClick={confirmarOcupar}
            disabled={salvando}
            className="w-full px-4 py-3 rounded-lg bg-gold text-bg font-semibold hover:bg-gold-soft transition-colors disabled:opacity-60"
          >
            {salvando ? 'Salvando...' : 'Confirmar ocupação'}
          </button>
        </Modal>
      )}

      {modal?.tipo === 'finalizar' && (
        <Modal titulo={`Finalizar ${modal.quarto.nome}`} onClose={() => setModal(null)}>
          <div className="flex flex-col gap-3">
            <label className="text-sm text-muted">
              Valor recebido (R$)
              <input
                type="text"
                inputMode="decimal"
                value={valor}
                onChange={(e) => setValor(e.target.value)}
                placeholder="0,00"
                className="mt-1 w-full px-4 py-3 rounded-lg border border-border bg-surface-2 text-cream outline-none focus:border-gold"
              />
            </label>
            <label className="text-sm text-muted">
              Forma de pagamento
              <select
                value={formaPagamento}
                onChange={(e) => setFormaPagamento(e.target.value)}
                className="mt-1 w-full px-4 py-3 rounded-lg border border-border bg-surface-2 text-cream outline-none focus:border-gold"
              >
                <option value="dinheiro">Dinheiro</option>
                <option value="pix">Pix</option>
                <option value="cartao_credito">Cartão de crédito</option>
                <option value="cartao_debito">Cartão de débito</option>
              </select>
            </label>
            <button
              onClick={confirmarFinalizar}
              disabled={salvando}
              className="mt-1 w-full px-4 py-3 rounded-lg bg-gold text-bg font-semibold hover:bg-gold-soft transition-colors disabled:opacity-60"
            >
              {salvando ? 'Salvando...' : 'Finalizar e enviar para limpeza'}
            </button>
          </div>
        </Modal>
      )}
    </div>
  )
}

function Contador({ label, valor, cor }) {
  return (
    <div className="rounded-xl border border-border bg-surface px-4 py-3">
      <div className={`text-2xl font-display ${cor}`}>{valor}</div>
      <div className="text-xs text-muted mt-0.5">{label}</div>
    </div>
  )
}
