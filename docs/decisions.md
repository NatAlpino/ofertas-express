# Decisões de arquitetura — Ofertas Express

Aqui eu explico, com minhas palavras, as decisões que tomamos (eu e quem revisou comigo) ao organizar esse projeto. A ideia é que qualquer pessoa que abra o repositório entenda o porquê de cada escolha sem precisar adivinhar.

## Por que o `app/` é tão magro?

O Next.js com App Router pede que as rotas vivam em `src/app/`, mas a gente não queria que a estrutura do framework virasse a estrutura da aplicação. Então o `app/` ficou com a única coisa que é dele: roteamento, layout raiz, metadata e os providers. Cada `page.tsx` de lá tem cinco linhas — importa a tela de `src/screens/` e a renderiza. Nada de lógica de tela, estilo ou composição nessa pasta.

O ganho prático: se um dia migrarmos de Next, ou quisermos renderizar uma dessas telas em outro contexto (Storybook, outro framework), a tela não depende de nada do framework. O acoplamento fica nos adapters de cinco linhas.

## Por que `src/screens/` e não `src/pages/`?

A tentação natural era chamar a pasta de telas de `pages/`, mas o Next.js detecta automaticamente qualquer pasta `src/pages` como o Pages Router — o roteamento antigo — e não existe configuração para desligar isso. Qualquer arquivo lá dentro viraria uma rota, e os arquivos de estilo e componentes auxiliares quebrariam o build por não terem `default export`.

Como a aplicação é 100% App Router, manter `src/pages/` traria um segundo sistema de rotas fantasmas só pelo nome da pasta. Escolhemos `src/screens/`, com uma pasta por tela (`home`, `cart`, `checkout`, `login`, `history`, `profile`), cada uma com seu `index.tsx`, seu `style.ts` e os arquivos específicos que ela precisar.

## Como as telas se organizam dentro de `src/screens/`

Cada tela é dona da sua composição: o `index.tsx` monta o layout com `Grid` do Material UI (de propósito — nada de `div` solta para estrutura de página), o `style.ts` concentra os objetos de estilo usados via prop `sx`, e arquivos auxiliares ficam ao lado. O checkout, por exemplo, tem seu `payment-instructions-dialog.tsx` ao lado do `index.tsx`, porque aquele modal só faz sentido no contexto do checkout.

## Por que Material UI (e não Tailwind)?

O desafio pedia uma UI fiel a mockups e com comportamento responsivo — drawer lateral, modais, badges, grids. O Material UI entrega isso pronto e acessível: o menu lateral é um `Drawer` dele, o modal de pagamento é um `Dialog`, e cada componente já vem com os papéis ARIA corretos. Componentes próprios com Tailwind dariam o mesmo visual, mas a gente teria que reinventar acessibilidade, animações e responsividade de biblioteca madura. A versão 9 do MUI também trouxe uma API de `Grid` mais simples (`container` + `size`), que usamos em toda parte.

Uma pegadinha que encontramos: no MUI v9 as props de sistema (`fontWeight`, `justifyContent` etc.) saíram da tipagem de componentes como `Typography` e `Stack` — tudo que é estilo agora vai na prop `sx`. Vale lembrar ao mexer nos componentes.

## Onde mora cada tipo de código

- `src/content/` — todos os textos que o usuário vê, em português, separados por contexto (`offers`, `cart`, `checkout`, `payment`, `navigation`, `common`, `login`, `history`, `profile`). Nenhuma string de interface fica hardcoded em tela ou componente.
- `src/theme/` — a única fonte de cor e tipografia. Botões, menu ativo, títulos: tudo herda daqui. Nenhum hexadecimal solto nas telas.
- `src/hooks/` — a ponte com o React Query: ofertas, feature flag e confirmação do checkout.
- `src/services/` — o cliente HTTP tipado (`apiFetch` e `ApiError`).
- `src/stores/` — estado global com Zustand: o carrinho (`cart`), as ofertas concluídas (`offers`), a sessão (`session`) e o histórico de acordos (`history`).
- `src/types/` — os contratos compartilhados, incluindo as instruções de pagamento Pix/boleto.
- `src/utils/` — formatação de moeda (`formatBRL`) e data (`formatDate`), em pt-BR via `Intl`. Simples, sem biblioteca de i18n.
- `src/mocks/` — o MSW: os mesmos handlers atendem o desenvolvimento (service worker no navegador) e os testes (Node).
- `src/components/` — só o que é reutilizável entre telas: o `app-shell` (menu lateral + cabeçalho) e o `back-button`.

Repare na regra de idiomas: o que o usuário lê é português (e vive em `content/`), mas pastas, arquivos, variáveis e mensagens de código são inglês. Documentos como este ficam em português de propósito.

## Convenções de estilo de código

Algumas regras que seguimos para o código ficar uniforme:

- **Só arrow functions** — de componentes a helpers de módulo.
- **Lógica antes do componente** — helpers puros ficam na linha acima da declaração do componente e recebem parâmetros; dentro do componente só os handlers que dependem de estado.
- **Imports agrupados** — bibliotecas, depois `@/components`, `@/services`, `@/utils`, as demais camadas internas e por fim a raiz da pasta (`./`). Uma linha em branco separa cada grupo e, dentro do grupo, as linhas seguem em ordem crescente de tamanho.
- **Prettier manda** — aspas simples, sem ponto e vírgula, tudo validado por `npm run format:check`.

## O menu lateral e o botão voltar

O `app-shell.tsx` é o esqueleto de todas as telas: um `Drawer` do Material UI com os itens de navegação e um cabeçalho com o título da tela atual e o badge do carrinho. O comportamento responsivo usa um único breakpoint (`md`, 900px, lido do tema): acima dele o menu fica exposto permanentemente; abaixo, vira um botão hambúrguer que abre o menu sobre o conteúdo. Como desktop com a janela estreita cai no mesmo breakpoint, ele também recolhe — é o mesmo `useMediaQuery` governando os dois casos.

O item ativo usa a cor primária do tema, e clicar num item do menu mobile o fecha (e navega). As telas internas têm um botão "Voltar" reutilizável (`back-button.tsx`) que chama `router.back()`; a tela inicial não tem, por ser a porta de entrada da aplicação, e a de login fica fora desse esqueleto inteiro.

## Sessão, guarda de rotas e histórico

O menu pedia três coisas que não existiam: um Histórico com as contas pagas, um Perfil e um botão Sair que realmente deslogasse. Resolvi os três com dois stores Zustand em memória:

- `src/stores/session.ts` guarda só o `username` da sessão. O login é propositalmente visual — qualquer usuário e senha entram, sem validação, como o desafio pediu. A guarda mora no `AppShell`: se não existe sessão e a rota não é `/login`, ele redireciona para lá com `router.replace`. Como o guarda está no esqueleto, não precisa replicar lógica em cada tela, e a tela de login renderiza sem o menu lateral (ela é o próprio `children` cru quando a rota é `/login`).
- `src/stores/history.ts` guarda uma entrada por acordo concluído: id, títulos das ofertas, total, forma de pagamento (`pix`, `boleto` ou `direct` para o fluxo curto) e data de conclusão. Quem grava é o checkout, no momento do "Concluir" do modal ou no fluxo curto. Cancelar o modal não grava nada — o acordo nem chegou a ser pago. A tela de histórico só ordena por data decrescente e formata com o que já existia (`formatBRL`, `formatDate`).

Não persisti nenhum dos dois de propósito: o desafio trata tudo como estado de sessão, e um refresh restaurando o mundo é comportamento aceitável aqui — igual ao carrinho e às ofertas concluídas. Se um dia quiser persistir, o Zustand tem middleware de persistência pronto e a mudança se resume ao store.

O e-mail do Perfil é derivado do usuário logado (`joao silva` → `joao.silva@exemplo.com`) — fictício, mas consistente, sem precisar de mais um campo de estado.

## Como finalizei o fluxo de pagamento

Quando a flag `checkoutV2` está ligada e a confirmação dá certo, abre um `Dialog` central com as instruções, em vez de simplesmente redirecionar:

- **Pix** — QR code (renderizado com `react-qr-code`), o código copia-e-cola logo abaixo com um botão de copiar ao lado, e o aviso de que QR e código valem por 30 minutos. A cópia usa `navigator.clipboard` com um fallback para `execCommand` caso o navegador não ofereça a API (contexto inseguro).
- **Boleto** — código de barras, a data de vencimento (o mesmo dia, vindo da API) formatada em pt-BR, e o aviso de que o boleto leva até dois dias para compensar.

Os dois têm "Concluir" e "Cancelar". Cancelar só fecha o modal — o acordo fica intacto, o usuário continua no checkout. Concluir registra as ofertas do acordo como concluídas, esvazia o carrinho e volta para a lista de ofertas.

### Por que um store separado para as ofertas concluídas?

Ao concluir, as ofertas do acordo precisam sumir da lista. Pensei em três caminhos: mutar o cache do React Query (acopla a tela às chaves de cache), estado local com prop drilling (se perde entre as telas) ou um store Zustand pequeno (`src/stores/offers.ts`). Ganhou o store: sobrevive à navegação, é trivial de testar e não se mistura com o cache de dados da API. É estado de sessão — um refresh da página restaura a lista, o que achamos aceitável para o desafio.

### E com a flag desligada?

O fluxo curto continua como era: confirmou, esvaziou o carrinho, voltou para a lista com a mensagem de sucesso. Nenhum modal aparece. Se a pergunta da flag falhar, o app cai nesse fluxo antigo por padrão — o comportamento mais previsível, que nunca trava o usuário.

## Sobre os testes

Os testes de fluxo rodam com Vitest + Testing Library + MSW em Node. Dois arquivos cobrem os cenários: `src/tests/checkout-flows.test.tsx` (os dois mundos da flag: fluxo curto, escolha de pagamento, os dois modais, cancelamento, erros e fallbacks) e `src/tests/session-history.test.tsx` (login, logout, guarda de rotas e a gravação do histórico em cada forma de pagamento). Detalhe que pegamos: o `userEvent.setup()` substitui o `navigator.clipboard` do jsdom, então o mock da área de transferência precisa ser instalado depois dele nos testes de cópia.

## Sobre o MSW

O MSW intercepta as requisições onde elas acontecem: no navegador (service worker, só em desenvolvimento) e no Node (durante os testes). O app faz `fetch` de verdade contra `/api/offers`, `/api/feature-flags/checkoutV2` e `/api/checkout`, e os mesmos handlers atendem os dois ambientes. Trocar por um backend real depois não muda uma linha da aplicação — só desliga o worker.
