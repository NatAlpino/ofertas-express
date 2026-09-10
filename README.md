# Ofertas Express

Aplicação de renegociação de dívidas com desconto, desenvolvida como desafio técnico. O usuário visualiza uma lista de ofertas, adiciona-as a um carrinho e fecha um acordo em um checkout simples que muda de comportamento conforme uma _feature flag_ (`checkoutV2`).

## Como rodar

Pré-requisitos: Node.js 20+ e npm.

```bash
npm install     # instala as dependências
npm run dev     # sobe o app em http://localhost:3000
npm run build   # gera a versão de produção
npm start       # serve a versão de produção
```

Não é necessário nenhum backend: em desenvolvimento a API é simulada no navegador pelo [MSW](https://mswjs.io) (service worker gerado em `public/mockServiceWorker.js`).

## Como executar os testes

```bash
npm test            # roda a suíte uma vez (Vitest, jsdom, Testing Library + MSW)
npm run test:watch  # modo observação
npm run test:coverage # com cobertura
```

Nos testes o MSW roda em Node e intercepta as mesmas rotas da API simulada. A suíte cobre o carrinho (Zustand), a camada de API (cliente e hooks do React Query) e os fluxos de comportamento do checkout: flag desligada, flag ligada (escolha de pagamento), erro 500 na API e fallback da flag.

## Qualidade de código

```bash
npm run lint        # ESLint (deve sair zerado)
npm run lint:fix    # corrige o que for automaticamente corrigível
npm run format      # Prettier
npm run format:check
```

## Especificação da stack

| Camada           | Escolha                   | Por quê                                                                                                     |
| ---------------- | ------------------------- | ----------------------------------------------------------------------------------------------------------- |
| Framework        | Next.js 16 (App Router)   | Rotas por tela (`/`, `/carrinho`, `/checkout`), layouts compartilhados e direção atual do ecossistema React |
| Linguagem        | TypeScript                | Tipagem de ponta a ponta, do modelo de dados aos componentes                                                |
| UI               | React 19 + Tailwind CSS 4 | Componentes próprios fiéis ao mockup, sem peso de biblioteca de UI                                          |
| Dados da API     | TanStack React Query      | Cache, estados de loading/erro e retries centralizados para ofertas, flag e checkout                        |
| Carrinho         | Zustand                   | Estado global simples, sem boilerplate, acessível de qualquer tela                                          |
| Simulação de API | MSW                       | Os mesmos mocks no desenvolvimento (service worker) e nos testes (Node)                                     |
| Testes           | Vitest + Testing Library  | Testes de comportamento escritos do ponto de vista do usuário                                               |

## As decisões explicadas de forma simples

**Por que React Query nas ofertas e Zustand no carrinho?** São dois tipos diferentes de estado. As ofertas vêm de fora (uma API): têm tempo de carregamento, podem falhar e valem a pena guardar em cache — isso é o que o React Query faz bem. O carrinho é estado da própria aplicação: o usuário adiciona e remove itens, e qualquer tela precisa enxergar a mesma lista em tempo real — é o caso de uso clássico do Zustand, com muito menos código que alternativas como Contexto + Reducer.

**Por que MSW em vez de um backend de mentira?** O MSW intercepta as chamadas HTTP no próprio navegador (ou no Node, durante os testes). Assim, o código da aplicação faz requisições de verdade, exatamente como faria com um backend real — e os mesmos arquivos de mock atendem o desenvolvimento e a suíte de testes. Trocar por uma API real depois não exige mudar nada no app.

**O que é a feature flag `checkoutV2` e o "padrão seguro"?** A tela de checkout pergunta à API se a nova versão do fluxo está ligada. Ligada, o usuário escolhe a forma de pagamento (Pix ou boleto) antes de confirmar; desligada, confirma direto. Se essa pergunta falhar por qualquer motivo (rede fora, servidor com erro), o app assume que a flag está desligada e mostra o fluxo antigo — o comportamento mais simples e previsível, que nunca bloqueia o usuário.

**Por que App Router?** O desafio permitia escolher entre App Router e Pages Router. O App Router é a arquitetura atual do Next.js e permite compartilhar o cabeçalho (com o contador do carrinho) entre as telas de forma nativa.

**Por que commits pequenos e testes primeiro (TDD)?** Cada mudança foi acompanhada de testes escritos antes ou junto do código. Isso garante que o definition of done de cada tarefa fosse objetivo: teste passando, build compilando e linter zerado — condição para cada commit.

## Estrutura do projeto

```
src/
  app/            # telas: lista (/), carrinho (/carrinho), checkout (/checkout)
  components/     # componentes reutilizáveis (header, card de oferta, seleção de pagamento)
  services/       # cliente HTTP tipado e hooks do React Query
  store/          # carrinho global (Zustand)
  mocks/          # dados e handlers do MSW (dev e testes)
  utils/          # formatação de moeda e percentuais
  tests/          # configuração do Vitest e testes de fluxo
```

## Limitações conhecidas

- O carrinho não sobrevive a um refresh da página (persistência fora do escopo do desafio; o Zustand facilita adicioná-la depois).
- O layout segue a ideia e hierarquia do mockup de referência, sem ser idêntico pixel a pixel, como permitido no desafio.
