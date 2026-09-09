import PocketBase from 'pocketbase'

const url = import.meta.env.VITE_POCKETBASE_URL

if (!url) {
  console.warn(
    '[Hotel Aconchego] Variável VITE_POCKETBASE_URL não configurada. ' +
    'Copie .env.example para .env e preencha com a URL do seu servidor PocketBase.'
  )
}

export const pb = new PocketBase(url)

// Evita que o React StrictMode (que roda efeitos duas vezes em dev)
// dispare avisos de "auto-cancellation" em requisições GET repetidas.
pb.autoCancellation(false)
