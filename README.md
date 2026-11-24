# Weliton Dev — Portfólio

Portfólio de José Weliton de Lima, de Picos (PI). Construo automações e agentes com LLMs, n8n e Python, e as interfaces para usá-los no dia a dia.

Online: **https://weliton-dev.vercel.app**

## Projetos

| Projeto | O que é | Código |
| --- | --- | --- |
| **EspIAn** | Telemetria e alertas deste próprio portfólio: cada visita vira um relatório no Telegram e uma linha no banco, com painel privado e demo pública com dados fictícios. | este repositório |
| **InteraMed** | App mobile-first que ajuda a enfermagem a checar interações entre medicamentos. A IA lê a receita, mas a gravidade vem de regras, da base do OpenFDA e de um dicionário próprio. | [interamed-v-2-0](https://github.com/jwelitonlima/interamed-v-2-0) |
| **FreteAI** | Agente no n8n que analisa risco de atraso em fretes e avisa o gestor pelo Telegram, com dashboard em React. Projeto acadêmico com dados públicos do Kaggle. | [frete-ai-agent](https://github.com/jwelitonlima/frete-ai-agent) |
| **Dashboard Insights** | Pipeline em Python e Pandas com dashboard em Streamlit, e um LLM que escreve o relatório executivo. Dados públicos do Kaggle. | [projeto-delivery-data](https://github.com/jwelitonlima/projeto-delivery-data) |

## EspIAn, em resumo

1. Um rastreador leve no navegador envia os eventos da visita para `api/collect.ts` (função serverless na Vercel).
2. A função grava no Supabase (PostgreSQL com segurança por linha) e avisa pelo Telegram.
3. O reconhecimento de aparelhos que voltam usa cookie assinado e características do navegador. O IP é guardado apenas como hash.
4. O painel privado (`/admin`) usa Supabase Auth, e só o e-mail do administrador enxerga os dados.
5. Todo dia de manhã, `api/report.ts` roda por cron e envia o resumo do dia anterior.
6. A demonstração pública, em `/projetos/espian`, roda o mesmo painel com dados 100% fictícios.

Transparência: este site coleta dados de visita (aparelho, cidade aproximada, páginas e cliques) para o EspIAn.

## Tecnologias

- **Front-end:** React, TypeScript, Vite, Tailwind CSS, shadcn/ui, Framer Motion, React Router
- **Back-end:** Vercel Functions, Supabase (PostgreSQL, Auth e RLS), Telegram Bot API
- **Hospedagem:** Vercel

## Rodando localmente

```bash
git clone https://github.com/jwelitonlima/WelitonDev.git
cd WelitonDev
npm install
npm run dev
```

Abra o endereço mostrado no terminal (geralmente http://localhost:8080).

### Variáveis de ambiente

Crie um `.env.local` na raiz (nunca versione esse arquivo). Os valores não estão no repositório.

| Onde | Variáveis |
| --- | --- |
| Front-end (build) | `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` (chave publishable), `VITE_N8N_WEBHOOK_URL` (opcional, demo do FreteAI) |
| Servidor (Vercel) | `SUPABASE_URL`, `SUPABASE_SERVICE_KEY`, `TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHAT_ID`, `ESPIAN_SALT`, `CRON_SECRET`, `ADMIN_URL` |

As tabelas e as políticas de acesso do EspIAn estão em `supabase/phase2.sql`.

## Estrutura

```text
api/                       funções serverless (collect.ts, report.ts)
src/pages/                 páginas (Home, Projetos, Sobre, Contato, Admin, FreteAI)
src/components/espian/     painel do EspIAn (usado no /admin e na demo)
src/data/                  textos e catálogo dos projetos
supabase/                  SQL do banco
```

## Deploy

Hospedado na Vercel, com deploy pela CLI (`vercel --prod`).

## Licença

Uso pessoal. Fique à vontade para se inspirar no código, mas, por favor, não copie os textos nem os projetos.

Desenvolvido por Weliton Lima.
