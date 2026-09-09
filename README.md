# Hotel Aconchego — Sistema de Recepção

Sistema interno de gestão para o Hotel Aconchego: controle de quartos, caixa do dia,
relatórios, estoque e gestão de colaboradores — igual ao modelo da Pousada Glamour,
com marca própria.

Feito em **React + Vite + Tailwind**, com banco de dados e login no **PocketBase**
(hospedado no **Railway**), e frontend publicado no **Netlify**.

---

## 1. Colocar o PocketBase no ar (Railway)

O PocketBase é o "banco de dados + login" do sistema — sem ele, o app não funciona.
Vamos hospedá-lo no Railway, que tem um modelo pronto ("template") para isso.

1. Acesse **https://railway.com** e crie uma conta (dá para entrar com o GitHub).
2. Clique em **New Project** → procure o template **PocketBase** (ou acesse direto
   `railway.com/deploy/pocketbase-for-production`) → clique em **Deploy**.
3. Aguarde o deploy terminar (1–2 minutos). O Railway já cria um volume persistente
   automaticamente, então os dados não se perdem entre atualizações.
4. Clique no serviço criado → aba **Settings** → **Networking** → **Generate Domain**.
   Isso cria uma URL pública tipo `https://seu-app.up.railway.app` — é o endereço do
   seu PocketBase. Guarde essa URL.

**Sobre o custo:** o plano Hobby do Railway custa US$ 5/mês, mas já **inclui US$ 5 de
uso mensal de graça**. Um app pequeno como esse do Hotel Aconchego, com poucos
acessos por dia, tende a ficar dentro (ou muito perto) desse limite — ou seja, na
prática custa pouco ou nada. Dá para acompanhar o consumo no painel do Railway a
qualquer momento.

## 2. Importar as tabelas do sistema

1. Abra `https://SEU-APP.up.railway.app/_/` no navegador (o `/_/` no final abre o
   painel administrativo do PocketBase).
2. Na primeira vez, ele vai pedir para você criar a conta de **superusuário** —
   preencha um e-mail e senha (guarde bem, é o acesso master do banco).
3. Depois de entrar, vá em **Settings** (ícone de engrenagem) → **Import collections**.
4. Abra o arquivo `pocketbase/pb_schema.json` deste projeto, copie **todo o
   conteúdo**, cole na caixa de texto e clique em **Review** → **Import**.
   - Isso cria as 7 tabelas do sistema: colaboradores, quartos, estadias, caixa,
     estoque (itens e movimentos) e administradores. Já testei essa importação do
     zero antes de te entregar, então pode importar com confiança.

## 3. Criar o login do administrador do sistema

Esse é o login que a equipe vai usar no botão "Administrador" do app (diferente do
superusuário do passo 2, que é só para mexer no banco).

1. No painel do PocketBase, no menu lateral, clique na coleção **administradores**.
2. Clique em **+ New record**.
3. Preencha e-mail, senha (e confirme a senha), e o campo **nome** (ex.: "Gerência").
4. Marque **verified** como true, se aparecer essa opção.
5. Salve. Pronto — use esse e-mail/senha na tela "Administrador" do app.

## 4. Configurar o projeto localmente

1. Instale as dependências:
   ```bash
   npm install
   ```
2. Copie o arquivo de exemplo de variáveis de ambiente:
   ```bash
   cp .env.example .env
   ```
3. Abra o `.env` e cole a URL do seu PocketBase (a mesma do passo 1):
   ```
   VITE_POCKETBASE_URL=https://seu-app.up.railway.app
   ```
4. Rode o projeto localmente para testar:
   ```bash
   npm run dev
   ```
   Acesse o endereço mostrado no terminal (geralmente `http://localhost:5173`).
5. Entre como **Administrador** (login do passo 3) e vá na aba **Gestão** para
   cadastrar os quartos, colaboradores e itens de estoque reais do Hotel Aconchego.

## 5. Publicar no Netlify

1. Suba este projeto para um repositório no GitHub (pode ser privado).
2. Acesse **https://netlify.com** e crie uma conta.
3. Clique em **Add new site** → **Import an existing project** → conecte com o GitHub
   e escolha o repositório do Hotel Aconchego.
4. O Netlify detecta automaticamente as configurações (arquivo `netlify.toml` já
   incluso: build `npm run build`, pasta `dist`).
5. Antes de publicar, vá em **Site settings** → **Environment variables** e adicione:
   - `VITE_POCKETBASE_URL` = a URL do seu PocketBase no Railway
6. Clique em **Deploy site**. Em poucos minutos o link estará no ar.

---

## Estrutura do sistema

- **Painel** — grade de quartos com status (Livre / Ocupado / Em limpeza / Manutenção),
  contadores no topo, e ações para ocupar, finalizar (com valor e forma de pagamento),
  concluir limpeza e marcar manutenção. Atualiza em tempo real entre dispositivos
  (usando o realtime nativo do PocketBase).
- **Caixa do dia** — lista de entradas e saídas do dia, saldo automático, e registro de
  novos movimentos avulsos (ex.: compra de material, gorjeta, etc.).
- **Relatórios** — faturamento dos últimos 7 dias em gráfico simples e faturamento por
  quarto no período.
- **Estoque** — itens com quantidade atual, alerta de estoque baixo, e registro de
  entrada/saída de itens.
- **Gestão** *(somente Administrador)* — cadastrar/desativar colaboradores, cadastrar/
  remover quartos e itens de estoque.
- **Suporte** — canal de contato (edite o número de WhatsApp em
  `src/pages/tabs/Suporte.jsx`).

## Personalizando

- **Cores e fontes**: `src/index.css` (bloco `@theme`).
- **Logo**: `public/logo-aconchego.svg` e `public/favicon.svg`.
- **Quartos, colaboradores e estoque**: cadastre pela própria aba **Gestão**, logado
  como Administrador — não precisa mexer em nada técnico para isso.

## Observação de segurança

Para simplificar o acesso da equipe (sem senha para colaboradores, igual ao modelo
original), as tabelas do PocketBase estão com regras de acesso abertas (qualquer
pessoa com a URL do app consegue ler/escrever nelas, mas não consegue ver ou mexer
nas contas de **administradores** nem no painel `/_/` sem login). Isso é adequado
para uso interno da equipe. Se quiser reforçar a segurança mais adiante — por
exemplo, exigir login também dos colaboradores — me chame que ajusto as regras e o
fluxo de autenticação.

## Arquivos importantes

- `pocketbase/pb_schema.json` — schema das tabelas, pronto para importar (passo 2).
- `.env.example` — modelo do arquivo de variáveis de ambiente.
- `netlify.toml` — configuração de build/deploy do Netlify.
