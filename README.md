# Ofertas Express

Aplicação de renegociação de dívidas com desconto: o usuário entra por uma tela de login visual (qualquer usuário e senha), visualiza uma lista de ofertas, adiciona-as a um carrinho e fecha um acordo em um checkout que muda de comportamento conforme uma _feature flag_ (`checkoutV2`) — com finalização por Pix (QR code) ou boleto. O menu lateral dá acesso ainda ao histórico de acordos pagos e a um perfil simples.

## Documentação

- **[Decisões de arquitetura](docs/decisions.md)** — por que o projeto está organizado assim (camadas, telas, conteúdo, tema, pagamento), explicado em português e em primeira pessoa.
- **[Como subir, testar e cuidar do código](docs/running-and-testing.md)** — comandos de dev, testes, lint, formatação e checklist antes de commitar.

## Como rodar

Pré-requisitos: Node.js 20+ e npm.

```bash
npm install     # instala as dependências
npm run dev     # sobe o app em http://localhost:3000
npm run build   # gera a versão de produção (type check incluído)
npm start       # serve a versão de produção
```

Não é necessário nenhum backend: em desenvolvimento a API é simulada no navegador pelo [MSW](https://mswjs.io) (service worker gerado em `public/mockServiceWorker.js`).

## Como executar os testes

```bash
npm test              # roda a suíte uma vez (Vitest, jsdom, Testing Library + MSW)
npm run test:watch    # modo observação
npm run test:coverage # com cobertura
```

Nos testes o MSW roda em Node e intercepta as mesmas rotas da API simulada. A suíte cobre os fluxos de checkout (flag desligada, flag ligada com Pix e boleto, cancelamento do modal, erro de API e fallback da flag), a gravação do histórico de acordos, o login/logout e a guarda de rotas, o carrinho e os stores Zustand, a formatação de moeda/data e o cliente HTTP. O guia [Como subir, testar e cuidar do código](docs/running-and-testing.md) ainda ensina a rodar partes da suíte e a **simular erros** (nos testes e no navegador).

## Qualidade de código

```bash
npm run lint          # ESLint (deve sair zerado)
npm run lint:fix      # corrige o que for automaticamente corrigível
npm run format        # Prettier
npm run format:check
```

## Especificação da stack

| Camada           | Escolha                  | Por quê                                                                                                        |
| ---------------- | ------------------------ | -------------------------------------------------------------------------------------------------------------- |
| Framework        | Next.js 16 (App Router)  | Rotas por tela (`/`, `/carrinho`, `/checkout`), layouts compartilhados e direção atual do ecossistema          |
| Linguagem        | TypeScript               | Tipagem de ponta a ponta, do modelo de dados aos componentes                                                   |
| UI               | React 19 + Material UI 9 | Componentes acessíveis e responsivos prontos (Drawer, Dialog, Grid), fiéis aos mockups                         |
| Dados da API     | TanStack React Query     | Cache, estados de loading/erro e retries centralizados para ofertas, flag e checkout                           |
| Estado global    | Zustand                  | Carrinho, ofertas concluídas, sessão e histórico — estado simples, sem boilerplate, acessível de qualquer tela |
| Simulação de API | MSW                      | Os mesmos mocks no desenvolvimento (service worker) e nos testes (Node)                                        |
| Testes           | Vitest + Testing Library | Testes de comportamento escritos do ponto de vista do usuário                                                  |

## Estrutura do projeto

```
src/
  app/            # só o Next.js: rotas (adapters finos), layout, metadata, providers
  screens/        # telas: home (/), cart (/carrinho), checkout (/checkout), login (/login), history (/historico), profile (/perfil)
  components/     # reutilizáveis: app-shell (menu lateral + cabeçalho) e back-button
  content/        # todos os textos da interface, em português, por contexto
  hooks/          # integração com React Query (ofertas, flag, confirmação)
  services/       # cliente HTTP tipado (apiFetch, ApiError)
  stores/         # estado global Zustand (carrinho, ofertas concluídas, sessão, histórico)
  types/          # contratos compartilhados (oferta, pagamento, checkout)
  utils/          # formatação de moeda e data (pt-BR)
  theme/          # tema do Material UI — única fonte de cor e tipografia
  mocks/          # dados e handlers do MSW (dev e testes)
  tests/          # configuração do Vitest e testes de fluxo
```

## Limitações conhecidas

- Carrinho, ofertas concluídas, sessão e histórico não sobrevivem a um refresh da página (estado de sessão apenas; o Zustand facilita adicionar persistência depois).
- O login é propositalmente sem validação — qualquer usuário e senha entram (telas de demonstração, não autenticação real).
- Em produção (`npm start`) o MSW não roda — sem um backend real, o app não tem de onde buscar os dados.
