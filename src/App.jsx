import { useState } from 'react'
import { AuthProvider, useAuth } from './context/AuthContext'
import Login from './pages/Login'
import SelectColaborador from './pages/SelectColaborador'
import AdminLogin from './pages/AdminLogin'
import Dashboard from './pages/Dashboard'

function Conteudo() {
  const { sessao, carregando } = useAuth()
  const [tela, setTela] = useState('login') // 'login' | 'colaborador' | 'administrador'

  if (carregando) {
    return (
      <div className="min-h-screen flex items-center justify-center text-muted text-sm">
        Carregando...
      </div>
    )
  }

  if (sessao) return <Dashboard />

  if (tela === 'colaborador') return <SelectColaborador onVoltar={() => setTela('login')} />
  if (tela === 'administrador') return <AdminLogin onVoltar={() => setTela('login')} />

  return <Login onEscolher={setTela} />
}

export default function App() {
  return (
    <AuthProvider>
      <Conteudo />
    </AuthProvider>
  )
}
