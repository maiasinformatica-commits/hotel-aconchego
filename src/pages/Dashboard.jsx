import { useState } from 'react'
import Header from '../components/Header'
import Painel from './tabs/Painel'
import Caixa from './tabs/Caixa'
import Relatorios from './tabs/Relatorios'
import Estoque from './tabs/Estoque'
import Gestao from './tabs/Gestao'
import Suporte from './tabs/Suporte'

export default function Dashboard() {
  const [aba, setAba] = useState('painel')

  return (
    <div className="min-h-screen">
      <Header abaAtiva={aba} onMudarAba={setAba} />
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
        {aba === 'painel' && <Painel />}
        {aba === 'caixa' && <Caixa />}
        {aba === 'relatorios' && <Relatorios />}
        {aba === 'estoque' && <Estoque />}
        {aba === 'gestao' && <Gestao />}
        {aba === 'suporte' && <Suporte />}
      </main>
    </div>
  )
}
