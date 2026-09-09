import { useEffect, useState } from 'react'
import { pb } from '../../lib/pocketbase'

export default function Gestao() {
  const [colaboradores, setColaboradores] = useState([])
  const [quartos, setQuartos] = useState([])
  const [itens, setItens] = useState([])

  const [novoColaborador, setNovoColaborador] = useState('')
  const [novoQuarto, setNovoQuarto] = useState('')
  const [novoItem, setNovoItem] = useState({ nome: '', quantidade: '', unidade: 'un', minima: '' })

  useEffect(() => {
    carregar()
  }, [])

  async function carregar() {
    const [c, q, i] = await Promise.all([
      pb.collection('colaboradores').getFullList({ sort: 'nome' }),
      pb.collection('quartos').getFullList({ sort: 'nome' }),
      pb.collection('estoque_itens').getFullList({ sort: 'nome' }),
    ])
    setColaboradores(c)
    setQuartos(q)
    setItens(i)
  }

  async function adicionarColaborador(e) {
    e.preventDefault()
    if (!novoColaborador.trim()) return
    await pb.collection('colaboradores').create({ nome: novoColaborador.trim(), ativo: true })
    setNovoColaborador('')
    carregar()
  }

  async function alternarColaborador(c) {
    await pb.collection('colaboradores').update(c.id, { ativo: !c.ativo })
    carregar()
  }

  async function adicionarQuarto(e) {
    e.preventDefault()
    if (!novoQuarto.trim()) return
    await pb.collection('quartos').create({ nome: novoQuarto.trim(), status: 'livre' })
    setNovoQuarto('')
    carregar()
  }

  async function removerQuarto(id) {
    await pb.collection('quartos').delete(id)
    carregar()
  }

  async function adicionarItem(e) {
    e.preventDefault()
    if (!novoItem.nome.trim()) return
    await pb.collection('estoque_itens').create({
      nome: novoItem.nome.trim(),
      quantidade: parseFloat(novoItem.quantidade) || 0,
      unidade: novoItem.unidade,
      quantidade_minima: parseFloat(novoItem.minima) || 0,
    })
    setNovoItem({ nome: '', quantidade: '', unidade: 'un', minima: '' })
    carregar()
  }

  async function removerItem(id) {
    await pb.collection('estoque_itens').delete(id)
    carregar()
  }

  return (
    <div className="flex flex-col gap-10">
      <Secao titulo="Colaboradores">
        <form onSubmit={adicionarColaborador} className="flex gap-2 mb-4">
          <input
            value={novoColaborador}
            onChange={(e) => setNovoColaborador(e.target.value)}
            placeholder="Nome do colaborador"
            className="flex-1 px-4 py-2.5 rounded-lg border border-border bg-surface-2 text-cream placeholder:text-muted outline-none focus:border-gold"
          />
          <button className="px-4 py-2.5 rounded-lg bg-gold text-bg font-semibold hover:bg-gold-soft transition-colors">
            Adicionar
          </button>
        </form>
        <div className="flex flex-col gap-2">
          {colaboradores.map((c) => (
            <div key={c.id} className="flex items-center justify-between rounded-lg border border-border bg-surface px-4 py-2.5">
              <span className={`text-sm ${c.ativo ? 'text-cream' : 'text-muted line-through'}`}>{c.nome}</span>
              <button onClick={() => alternarColaborador(c)} className="text-xs text-muted hover:text-gold-soft">
                {c.ativo ? 'Desativar' : 'Reativar'}
              </button>
            </div>
          ))}
        </div>
      </Secao>

      <Secao titulo="Quartos / Suítes">
        <form onSubmit={adicionarQuarto} className="flex gap-2 mb-4">
          <input
            value={novoQuarto}
            onChange={(e) => setNovoQuarto(e.target.value)}
            placeholder="Nome do quarto (ex.: SUÍTE 06)"
            className="flex-1 px-4 py-2.5 rounded-lg border border-border bg-surface-2 text-cream placeholder:text-muted outline-none focus:border-gold"
          />
          <button className="px-4 py-2.5 rounded-lg bg-gold text-bg font-semibold hover:bg-gold-soft transition-colors">
            Adicionar
          </button>
        </form>
        <div className="flex flex-col gap-2">
          {quartos.map((q) => (
            <div key={q.id} className="flex items-center justify-between rounded-lg border border-border bg-surface px-4 py-2.5">
              <span className="text-sm text-cream">{q.nome}</span>
              <button onClick={() => removerQuarto(q.id)} className="text-xs text-ocupado hover:opacity-80">
                Remover
              </button>
            </div>
          ))}
        </div>
      </Secao>

      <Secao titulo="Itens de estoque">
        <form onSubmit={adicionarItem} className="grid grid-cols-2 gap-2 mb-4">
          <input
            value={novoItem.nome}
            onChange={(e) => setNovoItem({ ...novoItem, nome: e.target.value })}
            placeholder="Nome do item"
            className="col-span-2 px-4 py-2.5 rounded-lg border border-border bg-surface-2 text-cream placeholder:text-muted outline-none focus:border-gold"
          />
          <input
            value={novoItem.quantidade}
            onChange={(e) => setNovoItem({ ...novoItem, quantidade: e.target.value })}
            placeholder="Quantidade inicial"
            inputMode="decimal"
            className="px-4 py-2.5 rounded-lg border border-border bg-surface-2 text-cream placeholder:text-muted outline-none focus:border-gold"
          />
          <input
            value={novoItem.unidade}
            onChange={(e) => setNovoItem({ ...novoItem, unidade: e.target.value })}
            placeholder="Unidade (un, kg...)"
            className="px-4 py-2.5 rounded-lg border border-border bg-surface-2 text-cream placeholder:text-muted outline-none focus:border-gold"
          />
          <input
            value={novoItem.minima}
            onChange={(e) => setNovoItem({ ...novoItem, minima: e.target.value })}
            placeholder="Estoque mínimo"
            inputMode="decimal"
            className="px-4 py-2.5 rounded-lg border border-border bg-surface-2 text-cream placeholder:text-muted outline-none focus:border-gold"
          />
          <button className="px-4 py-2.5 rounded-lg bg-gold text-bg font-semibold hover:bg-gold-soft transition-colors">
            Adicionar
          </button>
        </form>
        <div className="flex flex-col gap-2">
          {itens.map((i) => (
            <div key={i.id} className="flex items-center justify-between rounded-lg border border-border bg-surface px-4 py-2.5">
              <span className="text-sm text-cream">
                {i.nome} — {i.quantidade} {i.unidade}
              </span>
              <button onClick={() => removerItem(i.id)} className="text-xs text-ocupado hover:opacity-80">
                Remover
              </button>
            </div>
          ))}
        </div>
      </Secao>
    </div>
  )
}

function Secao({ titulo, children }) {
  return (
    <div>
      <h2 className="text-xs uppercase tracking-wider text-muted mb-3">{titulo}</h2>
      {children}
    </div>
  )
}
