import { useEffect, useState } from 'react'
import { pb } from '../../lib/pocketbase'

function diasAtras(n) {
  const d = new Date()
  d.setDate(d.getDate() - n)
  d.setHours(0, 0, 0, 0)
  return d
}

export default function Relatorios() {
  const [porDia, setPorDia] = useState([])
  const [porQuarto, setPorQuarto] = useState([])
  const [carregando, setCarregando] = useState(true)

  useEffect(() => {
    carregar()
  }, [])

  async function carregar() {
    setCarregando(true)
    const desde = diasAtras(6).toISOString()

    const [movimentos, estadias] = await Promise.all([
      pb.collection('caixa_movimentos').getFullList({
        filter: `created >= "${desde}"`,
      }),
      pb.collection('estadias').getFullList({
        filter: `status = "fechada" && check_in >= "${desde}"`,
        expand: 'quarto',
      }),
    ])

    // Agrupar faturamento (entradas) por dia, últimos 7 dias
    const dias = []
    for (let i = 6; i >= 0; i--) {
      const d = diasAtras(i)
      dias.push({ chave: d.toDateString(), label: d.toLocaleDateString('pt-BR', { weekday: 'short' }), total: 0 })
    }
    movimentos
      .filter((m) => m.tipo === 'entrada')
      .forEach((m) => {
        const chave = new Date(m.created).toDateString()
        const dia = dias.find((d) => d.chave === chave)
        if (dia) dia.total += Number(m.valor)
      })
    setPorDia(dias)

    // Agrupar por quarto
    const mapa = {}
    estadias.forEach((e) => {
      const nome = e.expand?.quarto?.nome ?? 'Sem quarto'
      mapa[nome] = (mapa[nome] ?? 0) + Number(e.valor ?? 0)
    })
    setPorQuarto(Object.entries(mapa).sort((a, b) => b[1] - a[1]))

    setCarregando(false)
  }

  const maxDia = Math.max(1, ...porDia.map((d) => d.total))
  const maxQuarto = Math.max(1, ...porQuarto.map(([, v]) => v))

  if (carregando) return <p className="text-muted text-sm">Carregando relatórios...</p>

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h2 className="text-xs uppercase tracking-wider text-muted mb-3">Faturamento · últimos 7 dias</h2>
        <div className="rounded-xl border border-border bg-surface p-5">
          <div className="flex items-end gap-3 h-40">
            {porDia.map((d) => (
              <div key={d.chave} className="flex-1 flex flex-col items-center gap-2">
                <div
                  className="w-full rounded-t-md bg-gold"
                  style={{ height: `${Math.max(4, (d.total / maxDia) * 100)}%` }}
                  title={`R$ ${d.total.toFixed(2)}`}
                />
                <span className="text-[11px] text-muted capitalize">{d.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div>
        <h2 className="text-xs uppercase tracking-wider text-muted mb-3">Faturamento por quarto · últimos 7 dias</h2>
        {porQuarto.length === 0 ? (
          <p className="text-muted text-sm">Sem estadias finalizadas no período.</p>
        ) : (
          <div className="flex flex-col gap-3">
            {porQuarto.map(([nome, total]) => (
              <div key={nome}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-cream">{nome}</span>
                  <span className="text-muted">R$ {total.toFixed(2).replace('.', ',')}</span>
                </div>
                <div className="h-2 rounded-full bg-surface-2 overflow-hidden">
                  <div className="h-full bg-gold" style={{ width: `${(total / maxQuarto) * 100}%` }} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
