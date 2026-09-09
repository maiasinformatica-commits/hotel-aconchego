import { createContext, useContext, useEffect, useState } from 'react'
import { pb } from '../lib/pocketbase'

const AuthContext = createContext(null)
const STORAGE_KEY = 'aconchego_colaborador'

export function AuthProvider({ children }) {
  const [sessao, setSessao] = useState(null)
  const [carregando, setCarregando] = useState(true)

  useEffect(() => {
    // 1) Administrador: PocketBase já guarda a sessão sozinho (pb.authStore)
    if (pb.authStore.isValid && pb.authStore.record) {
      setSessao({
        tipo: 'administrador',
        nome: pb.authStore.record.nome || pb.authStore.record.email,
      })
      setCarregando(false)
      return
    }

    // 2) Colaborador: guardamos só o nome/id escolhido, sem senha
    const salvo = window.localStorage.getItem(STORAGE_KEY)
    if (salvo) {
      try {
        setSessao(JSON.parse(salvo))
      } catch {
        window.localStorage.removeItem(STORAGE_KEY)
      }
    }

    setCarregando(false)

    const removerListener = pb.authStore.onChange((token, record) => {
      if (record) {
        setSessao({ tipo: 'administrador', nome: record.nome || record.email })
      }
    })

    return () => removerListener()
  }, [])

  function entrarComoColaborador(colaborador) {
    const nova = { tipo: 'colaborador', nome: colaborador.nome, colaboradorId: colaborador.id }
    setSessao(nova)
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(nova))
  }

  function entrarComoAdministrador(nomeOuEmail) {
    setSessao({ tipo: 'administrador', nome: nomeOuEmail })
  }

  function sair() {
    pb.authStore.clear()
    window.localStorage.removeItem(STORAGE_KEY)
    setSessao(null)
  }

  return (
    <AuthContext.Provider value={{ sessao, carregando, entrarComoColaborador, entrarComoAdministrador, sair }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth precisa estar dentro de <AuthProvider>')
  return ctx
}
