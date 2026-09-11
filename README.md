# Ofertas Express

Aplicação frontend para visualização e renegociação de dívidas com desconto.

O fluxo permite realizar um login demonstrativo, visualizar ofertas disponíveis, adicioná-las ao carrinho e concluir um acordo. O comportamento do checkout é controlado pela feature flag `checkoutV2` e, quando habilitada, permite finalizar o pagamento por Pix ou boleto.

A aplicação também conta com histórico de acordos concluídos, perfil do usuário e navegação responsiva.

## Tecnologias

- **Next.js 16** com App Router
- **React 19**
- **TypeScript**
- **Material UI**
- **TanStack React Query**
- **Zustand**
- **MSW (Mock Service Worker)**
- **Vitest**
- **Testing Library**
- **ESLint**
- **Prettier**

## Pré-requisitos

Para executar o projeto localmente é necessário ter:

- Node.js 20+
- npm

## Instalação

Clone o repositório e instale as dependências:

```bash
npm install
```

## Executando a aplicação

Inicie o ambiente de desenvolvimento:

```bash
npm run dev
```

A aplicação estará disponível em:

`http://localhost:3000`

O primeiro acesso direciona para a tela de login.

O login é demonstrativo e não possui autenticação real. Qualquer combinação de usuário e senha permite acessar a aplicação.

### API simulada

Não é necessário executar um backend.

Durante o desenvolvimento, as chamadas para a API são interceptadas pelo **MSW (Mock Service Worker)** e respondidas localmente.

O service worker necessário já está disponível em:

```text
public/mockServiceWorker.js
```

As principais rotas simuladas incluem ofertas, feature flag e checkout.

> O MSW é iniciado apenas no ambiente de desenvolvimento e nos testes. Ao executar a aplicação em modo de produção com `npm start`, é necessário um backend real para responder às requisições.

### Variáveis de ambiente para testes manuais

O comportamento do checkout é controlado pela feature flag `checkoutV2`, que vem **habilitada por padrão**, e os mocks do MSW permitem simular falhas da API.

O arquivo [`.env.example`](./.env.example) reúne as variáveis disponíveis com a descrição de cada uma.

- `NEXT_PUBLIC_CHECKOUT_V2=false` — desliga o fluxo novo (Pix/boleto) e exibe o fluxo antigo de confirmação direta;
- `NEXT_PUBLIC_MOCK_OFFERS_ERROR=500` — o `GET /api/offers` passa a responder com o erro, e a home exibe o estado de falha com botão de tentar novamente;
- `NEXT_PUBLIC_MOCK_CHECKOUT_ERROR=500` — o `POST /api/checkout` passa a responder com o erro, e o checkout exibe o `Alert` "Erro ao confirmar o acordo. Tente novamente mais tarde." mantendo o carrinho intacto.

Defina apenas o que deseja testar. Como as variáveis são `NEXT_PUBLIC_*`, é necessário **reiniciar o servidor** a cada mudança.

Para voltar ao fluxo normal sem erros, comente todas as envs novamente.

```bash
npm run dev
```

## Rotas

| Rota         | Descrição                           |
| ------------ | ----------------------------------- |
| `/login`     | Login demonstrativo                 |
| `/home`      | Lista de ofertas disponíveis        |
| `/carrinho`  | Ofertas selecionadas                |
| `/checkout`  | Confirmação e finalização do acordo |
| `/historico` | Histórico de acordos concluídos     |
| `/perfil`    | Informações do usuário              |

As rotas internas são protegidas pela sessão demonstrativa. Sem uma sessão ativa, o usuário é redirecionado para `/login`.

## Build de produção

Para gerar a versão de produção:

```bash
npm run build
```

Para executar o build:

```bash
npm start
```

O processo de build também realiza a validação de tipos do projeto.

## Testes

A suíte de testes utiliza **Vitest**, **Testing Library**, **jsdom** e **MSW em Node**.

Para executar todos os testes:

```bash
npm test
```

Durante o desenvolvimento:

```bash
npm run test:watch
```

Para gerar o relatório de cobertura:

```bash
npm run test:coverage
```

Também é possível executar um arquivo específico:

```bash
npx vitest run src/tests/session-history.test.tsx
```

Ou filtrar um cenário pelo nome:

```bash
npx vitest run -t "short checkout records"
```

### Principais cenários cobertos

A suíte valida, entre outros comportamentos:

- checkout com a feature flag habilitada e desabilitada;
- pagamento por Pix e boleto;
- cancelamento da finalização do pagamento;
- erros da API e fallback da feature flag;
- gravação do histórico de acordos;
- login, logout e proteção das rotas;
- limpeza do estado entre sessões;
- remoção de ofertas já concluídas;
- carrinho e stores Zustand;
- formatação de moeda e data;
- cliente HTTP e tratamento de erros.

## Simulação de erros

Para testar o tratamento de erro das telas (home e checkout), utilize as variáveis `NEXT_PUBLIC_MOCK_OFFERS_ERROR` e `NEXT_PUBLIC_MOCK_CHECKOUT_ERROR` descritas em [Variáveis de ambiente para testes manuais](#variáveis-de-ambiente-para-testes-manuais).

Nos testes automatizados, o MSW permite substituir a resposta de uma rota com `server.use(...)`, o que viabiliza cenários como erro no checkout ou indisponibilidade do serviço de feature flags.

## Qualidade de código

O projeto possui scripts para lint e formatação:

```bash
npm run lint
npm run lint:fix
npm run format
npm run format:check
```

O Prettier está configurado para utilizar:

- aspas simples;
- ausência de ponto e vírgula;
- largura máxima de 100 caracteres.

Antes de um commit, a validação completa pode ser executada com:

```bash
npm run lint && npm test && npm run build && npm run format:check
```

## Estrutura do projeto

```text
src/
├── app/          # rotas, layout, metadata e providers do Next.js
├── screens/      # composição das telas da aplicação
├── components/   # componentes reutilizáveis
├── content/      # textos exibidos na interface
├── hooks/        # integração da aplicação com React Query
├── services/     # comunicação HTTP e tratamento de erros
├── stores/       # estado global com Zustand
├── types/        # contratos e tipos compartilhados
├── utils/        # funções utilitárias
├── theme/        # configuração visual do Material UI
├── mocks/        # dados e handlers do MSW
└── tests/        # configuração e testes da aplicação
```

Mantive `src/app` focado nas responsabilidades do App Router e concentrei a composição das telas em `src/screens`.

Os detalhes e motivos dessa e de outras decisões estão documentados em [`TECHNICAL_DECISIONS.md`](./TECHNICAL_DECISIONS.md).

## Responsividade

A navegação se adapta ao tamanho da viewport.

Em telas maiores, o menu lateral permanece visível. Abaixo do breakpoint `md` do Material UI (`900px`), a navegação passa a ser acessada por um menu hambúrguer.

Para uma validação visual rápida, o **Toggle device toolbar** do DevTools pode ser utilizado para alternar entre diferentes dimensões de tela.

## Limitações conhecidas

O projeto foi desenvolvido como uma aplicação demonstrativa para o desafio técnico. Por isso, algumas decisões foram mantidas deliberadamente dentro desse escopo:

- o login não realiza autenticação real;
- carrinho, sessão, histórico e ofertas concluídas são mantidos em memória e não persistem após um refresh;
- o perfil utiliza informações fictícias derivadas do usuário informado no login;
- o MSW é utilizado somente em desenvolvimento e nos testes;
- não existe backend real para o ambiente de produção.

Esses pontos foram mantidos como decisões de escopo, evitando adicionar complexidade que não era necessária para demonstrar os fluxos propostos.

## Decisões técnicas

A arquitetura, as escolhas de bibliotecas, a organização das responsabilidades, o gerenciamento de estado, o uso da feature flag, a estratégia de mocks e os principais trade-offs estão documentados em:
[`TECHNICAL_DECISIONS.md`](./TECHNICAL_DECISIONS.md)

