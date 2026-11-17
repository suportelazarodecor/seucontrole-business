# SEUCONTROLE

Controle financeiro pessoal e empresarial — dashboard com estética de terminal financeiro corporativo, dois modos (**Business** e **Pessoal**) totalmente isolados por usuário.

## Stack

- React + Vite + TypeScript + TailwindCSS
- Recharts (gráficos)
- Supabase (Postgres + Auth + Row Level Security) para autenticação e dados isolados por usuário
- Zustand (estado: tema, modo, sessão)
- Deploy: Netlify

> **Modo demonstração:** se as variáveis `VITE_SUPABASE_URL`/`VITE_SUPABASE_ANON_KEY` não estiverem configuradas, a aplicação roda inteiramente no navegador (localStorage), com dados de exemplo pré-carregados, para você visualizar o produto sem precisar criar um projeto Supabase primeiro. Basta configurar o `.env` para ligar a um banco real.

## Rodando localmente

```bash
npm install
cp .env.example .env   # preencha com as credenciais do seu projeto Supabase (opcional em modo demo)
npm run dev
```

## Configurando o Supabase

1. Crie um projeto em [supabase.com](https://supabase.com).
2. No **SQL Editor**, rode o arquivo [`supabase/schema.sql`](supabase/schema.sql) inteiro. Ele cria:
   - As 6 tabelas: `profiles`, `categories`, `transactions`, `accounts_payable_receivable`, `goals`, `budgets`.
   - **Row Level Security (RLS)** habilitado em todas, com política `auth.uid() = user_id` cobrindo SELECT/INSERT/UPDATE/DELETE — isso garante isolamento real de dados por usuário **no banco**, não só no front-end.
   - Um trigger que cria automaticamente um `profile` para cada novo usuário cadastrado.
3. Em **Project Settings → API**, copie a `Project URL` e a `anon public key` para o seu `.env`:
   ```
   VITE_SUPABASE_URL=https://SEU-PROJETO.supabase.co
   VITE_SUPABASE_ANON_KEY=SUA-CHAVE-ANON-PUBLICA
   ```
4. (Opcional) Em **Authentication → Providers**, habilite login com Google se desejar.

## Assistente via WhatsApp

Com o número vinculado e verificado, o usuário pode enviar mensagens como:

- `Gasto mercado 12 reais` / `Paguei 45,90 na farmácia` → registra uma despesa
- `Recebimento 100 reais` / `recebi 100 de salário` → registra uma receita
- `saldo` → resumo do mês atual (receitas, despesas, saldo) no modo ativo
- `modo business` / `modo pessoal` → troca o modo ativo (mesmo campo `active_mode` usado pelo app)
- `ajuda` → lista os comandos

A integração usa a **API do WhatsApp da Twilio** (mais simples de configurar que a API oficial da Meta, que exige verificação de empresa) e uma **Netlify Function** (`netlify/functions/whatsapp.ts`) como webhook.

### 1. Crie uma conta na Twilio e ative o WhatsApp Sandbox

1. Crie uma conta em [twilio.com](https://www.twilio.com) (tem camada gratuita para testes).
2. Vá em **Messaging → Try it out → Send a WhatsApp message** para ativar o Sandbox.
3. No seu WhatsApp pessoal, envie a mensagem de ativação (`join <palavra-código>`) para o número de sandbox da Twilio.
   - Para produção com um número próprio, será necessário solicitar um WhatsApp Sender aprovado — o Sandbox é só para desenvolvimento/teste.

### 2. Configure o webhook

No console da Twilio, em **Messaging → Settings → WhatsApp Sandbox Settings**, defina em **"WHEN A MESSAGE COMES IN"**:

```
https://SEU-SITE.netlify.app/.netlify/functions/whatsapp
```

Método: `HTTP POST`.

### 3. Variáveis de ambiente (Netlify → Site settings → Environment variables)

| Variável | Onde encontrar |
|---|---|
| `SUPABASE_URL` | Mesma URL do `.env` do front-end |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase → Project Settings → API → **service_role** (⚠️ nunca use a chave `anon` aqui, e nunca a exponha no front-end/`.env` com prefixo `VITE_`) |
| `TWILIO_AUTH_TOKEN` | Twilio Console → Account Info → Auth Token (usado só para validar que a requisição realmente veio da Twilio) |

### 4. Vincule o número na conta

No app, vá em **Configurações → Assistente via WhatsApp**, informe o número no formato internacional (`+5511999999999`) e clique em **Vincular número**. Envie pelo WhatsApp, para o número da Twilio, a mensagem que aparecer na tela (`verificar 123456`). Pronto — o número está autorizado a lançar dados nessa conta.

> **Segurança:** a function usa a `service_role` key (que ignora RLS) porque não há uma sessão de usuário autenticada em uma mensagem de WhatsApp — por isso todo acesso é resolvido a partir do número verificado (`whatsapp_verified = true`) antes de qualquer leitura/escrita, e cada consulta é sempre filtrada por `user_id`. Sem essa verificação, a function nunca tem acesso aos dados de ninguém.

## Deploy na Netlify

1. Suba o repositório no GitHub/GitLab.
2. Na Netlify, crie um novo site a partir do repositório.
3. Configurações de build (já incluídas em `netlify.toml`):
   - **Build command:** `npm run build`
   - **Publish directory:** `dist`
4. Em **Site settings → Environment variables**, adicione:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
5. Deploy. O `netlify.toml` já inclui o redirect SPA (`/* → /index.html`) necessário para rotas do React Router funcionarem em refresh direto.

## Estrutura de pastas

```
src/
  components/       # UI, layout, gráficos reutilizáveis
  data/seed.ts       # gerador de dados de exemplo (modo demo)
  lib/               # supabase client, camada de dados (db.ts), métricas, formatação
  pages/
    auth/            # login, cadastro, recuperação de senha
    onboarding/       # onboarding de 3 passos
    dashboard/         # dashboards Business e Pessoal
    lancamentos/        # CRUD de receitas/despesas + import CSV
    contas/              # contas a pagar/receber (Business) ou fixas (Pessoal)
    fluxo-caixa/          # gráfico de fluxo de caixa + projeção
    relatorios/            # DRE simplificado (Business) / Orçamento (Pessoal)
    metas/                  # metas financeiras
    categorias/               # CRUD de categorias / centros de custo
    configuracoes/             # perfil, senha, exportação, exclusão de conta
  store/              # zustand: auth, ui (tema/modo), dados financeiros
  types/               # tipos TypeScript compartilhados
supabase/
  schema.sql            # schema completo com RLS
  migrations/            # migrações incrementais (ex: 001_whatsapp.sql)
netlify/
  functions/
    whatsapp.ts           # webhook do assistente de WhatsApp (Twilio)
    lib/                    # parser de mensagens, validação de assinatura, cliente admin
```

## Segurança e isolamento de dados

- Toda tabela tem `user_id` referenciando `auth.users`.
- RLS habilitado com política `auth.uid() = user_id` em todas as operações — o isolamento é garantido pelo banco, não pelo front-end.
- Senhas nunca trafegam em texto puro fora do fluxo padrão do Supabase Auth.
- Chaves sensíveis apenas via variáveis de ambiente (nunca commitadas).
