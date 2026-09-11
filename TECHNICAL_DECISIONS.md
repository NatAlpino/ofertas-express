# Decisões técnicas — Ofertas Express

Este documento reúne as principais decisões técnicas que tomei durante o desenvolvimento do Ofertas Express.

Meu objetivo foi manter uma arquitetura simples, previsível e fácil de evoluir, sem adicionar abstrações que não trouxessem benefício real para o escopo do desafio.

## Arquitetura

Optei por organizar a aplicação separando as responsabilidades do framework das responsabilidades das telas e da lógica da aplicação.

A estrutura principal ficou dividida entre:

- `app/` — roteamento e responsabilidades específicas do Next.js;
- `screens/` — composição das telas;
- `components/` — componentes reutilizáveis;
- `hooks/` — integração entre a interface e as consultas/mutações;
- `services/` — comunicação HTTP;
- `stores/` — estados globais da aplicação;
- `content/` — textos exibidos na interface;
- `types/` — contratos compartilhados;
- `utils/` — funções utilitárias;
- `theme/` — identidade visual;
- `mocks/` — simulação da API;
- `tests/` — testes de comportamento e fluxo.

A intenção foi manter cada camada com uma responsabilidade clara e evitar concentrar regras de negócio, acesso a dados e apresentação dentro dos mesmos componentes.

## App Router e `src/screens`

O projeto utiliza o App Router do Next.js, portanto as rotas ficam em `src/app`.

Mantive os arquivos `page.tsx` dessa camada como adapters pequenos, responsáveis principalmente por importar e renderizar suas respectivas telas.

A composição das páginas fica em `src/screens`.

Optei por `screens` em vez de `pages` porque o Next.js reconhece automaticamente `src/pages` como parte do Pages Router. Como a aplicação utiliza exclusivamente o App Router, manter uma pasta `src/pages` criaria um segundo mecanismo de roteamento sem necessidade.

Com essa separação, `src/app` permanece ligado ao framework enquanto as telas ficam menos acopladas às convenções de roteamento do Next.js.

## Organização das telas

Cada tela possui sua própria pasta dentro de `src/screens`, mantendo próximos os arquivos que pertencem ao mesmo contexto.

Por exemplo:

```text id="bcpk39"
screens/
└── checkout/
    ├── index.tsx
    ├── style.ts
    └── payment-instructions-dialog.tsx
```

O `index.tsx` concentra a composição da tela, enquanto os estilos utilizados com a prop `sx` ficam organizados em `style.ts`.

Componentes específicos de uma única tela permanecem próximos ao contexto em que são utilizados. Só movo um componente para `src/components` e o torno genérico, quando existe uma necessidade real de reutilização em diferentes partes da aplicação.

Essa decisão segue um princípio que sempre procuro aplicar na organização de um código desde o início: **a arquitetura precisa nascer preparada para crescer, mas as abstrações devem surgir quando passam a resolver um problema real**.

Por isso, defini desde o início uma estrutura de pastas pensando na evolução do projeto e na separação de responsabilidades. Já os componentes compartilhados seguem outro critério: não transformo um elemento em reutilizável apenas porque ele poderá ser usado em outro lugar no futuro. Essa abstração acontece quando a reutilização de fato aparece, normalmente a partir do segundo uso.

Prefiro evitar abstrações prematuras. Isso mantém o código menor, mais fácil de navegar e evita criar uma pasta de componentes genéricos que, na prática, pertence a apenas uma funcionalidade.

## Material UI

Escolhi o Material UI como biblioteca de interface porque o desafio exige componentes responsivos e interativos, como menu lateral, diálogos, grids, botões e elementos de feedback.

Além de acelerar a construção da interface, a biblioteca fornece comportamentos e recursos de acessibilidade já consolidados.

Centralizei cores e tipografia em `src/theme`, evitando espalhar valores visuais pela aplicação e mantendo uma única fonte para as principais definições da interface.

Os estilos específicos das telas utilizam a prop `sx`, mantendo a implementação alinhada à API do Material UI utilizada no projeto.

## Conteúdo da interface

Os textos apresentados ao usuário ficam centralizados em `src/content`, separados por contexto.

Essa decisão evita strings de interface espalhadas pelos componentes e facilita a manutenção da linguagem utilizada pela aplicação.

Também adotei uma separação de idioma intencional: textos da interface e documentação permanecem em português, enquanto nomes de arquivos, variáveis, funções, tipos e demais elementos do código são escritos em inglês.

A escolha mantém cada contexto consistente. O conteúdo voltado ao usuário acompanha o idioma da aplicação, enquanto o código segue uma convenção amplamente utilizada no ecossistema das bibliotecas e ferramentas adotadas no projeto. Além de evitar a mistura de idiomas na base de código, isso torna nomes e conceitos técnicos mais próximos das APIs e da documentação das próprias dependências.

## Comunicação com a API

A comunicação HTTP fica centralizada em `src/services`.

Criei um cliente tipado por meio de `apiFetch`, acompanhado de `ApiError` para representar de forma consistente os erros provenientes das requisições.

Essa abstração concentra em um único ponto as responsabilidades comuns da comunicação HTTP, como execução do `fetch`, interpretação da resposta e normalização de erros. Dessa forma, as demais camadas não precisam repetir essa lógica nem depender diretamente dos detalhes da API nativa do navegador.

Além de reduzir duplicação, essa separação mantém as telas e os hooks focados em suas próprias responsabilidades: eles consomem dados ou tratam o resultado da operação, enquanto a camada de serviço cuida de como a comunicação HTTP acontece. Caso essa implementação precise evoluir, a mudança fica concentrada nessa camada em vez de se espalhar pela aplicação.

Os hooks em `src/hooks` fazem a ponte entre essa camada e a interface utilizando TanStack React Query.

## TanStack React Query

Utilizei React Query para os dados provenientes da API, como ofertas, feature flag e confirmação do checkout.

A escolha permite concentrar comportamentos relacionados a requisições, como:

- loading;
- erro;
- cache;
- retries;
- invalidação e atualização de consultas.

Com isso, evito transformar estados de servidor em estados globais manuais e mantenho a interface focada no consumo desses dados.

## Zustand

Utilizei Zustand para estados globais que pertencem à experiência da aplicação e precisam ser compartilhados entre telas.

Os stores representam:

- carrinho;
- sessão;
- histórico de acordos;
- ofertas concluídas.

Mantive esses estados separados do cache do React Query porque representam estado de sessão da interface, e não simplesmente respostas vindas da API.

Para este desafio, optei por manter os stores em memória. Portanto, um refresh reinicia esses estados.

A persistência poderia ser adicionada posteriormente, mas considerei que implementá-la agora aumentaria a complexidade sem ser necessária para demonstrar os fluxos solicitados.

## Sessão e proteção das rotas

O login é demonstrativo e não representa uma autenticação real. Qualquer combinação de usuário e senha inicia uma sessão local.

Centralizei a proteção das telas internas no `AppShell`. Quando não existe uma sessão ativa, a navegação para uma área interna redireciona o usuário para `/login`.

Preferi concentrar essa verificação no shell em vez de repetir a mesma lógica em cada tela.

Ao realizar logout ou iniciar uma nova sessão, os stores relacionados à sessão são reiniciados e o cache do React Query é limpo.

Essa decisão é voltada à consistência da experiência: mesmo utilizando uma autenticação fictícia, uma nova sessão não deve herdar carrinho, histórico ou dados temporários da sessão anterior.

Ela não representa uma medida de segurança, já que não existe autenticação real neste projeto.

## Navegação e responsividade

O `AppShell` concentra a estrutura compartilhada das telas internas, incluindo cabeçalho e navegação lateral.

Em telas maiores, o menu permanece visível. Abaixo do breakpoint `md` do Material UI, a navegação passa para um drawer acionado por um botão hambúrguer.

Utilizo o mesmo breakpoint para dispositivos móveis e janelas de desktop reduzidas, fazendo com que o comportamento seja determinado pelo espaço disponível, e não pelo tipo de dispositivo.

Também criei um botão de retorno reutilizável para as telas internas.

Quando existe histórico de navegação dentro da aplicação, preservo o comportamento natural de voltar. Em um acesso direto, utilizo a lista de ofertas como fallback, evitando direcionar o usuário para fora da aplicação ou deixá-lo sem um destino previsível.

## Feature flag e checkout

O comportamento do checkout é controlado pela feature flag `checkoutV2`.

O valor padrão da flag nos mocks vem da variável de ambiente `NEXT_PUBLIC_CHECKOUT_V2`, e as variáveis `NEXT_PUBLIC_MOCK_*_ERROR` permitem simular falhas da API — ambas configuráveis via `.env.local`, conforme orientação no README. Nos testes, o helper `setCheckoutV2Override` grava um override no `localStorage` que tem precedência sobre o env.

Mantive dois fluxos:

### Flag desabilitada

O checkout segue o fluxo simplificado: o acordo é confirmado, o carrinho é limpo e o usuário retorna para a lista de ofertas.

Esse também é o fallback utilizado caso a consulta da feature flag falhe.

Preferi manter o fluxo anterior como comportamento seguro em vez de impedir a continuidade da jornada por causa da indisponibilidade do serviço de flags.

### Flag habilitada

Após a confirmação do acordo, o usuário pode escolher entre Pix e boleto.

As instruções de pagamento são apresentadas em um `Dialog` do Material UI.

No Pix, apresento o QR code e o código copia e cola.

No boleto, apresento o código de barras e a data de vencimento.

A conclusão do pagamento registra o acordo no histórico, marca as ofertas como concluídas, limpa o carrinho e retorna para a lista.

Cancelar o diálogo apenas interrompe a finalização naquele momento. O estado do acordo permanece disponível para que o usuário possa continuar o fluxo.

## Ofertas concluídas

Depois da conclusão de um acordo, as ofertas correspondentes precisam deixar de aparecer na listagem.

Considerei manter essa informação diretamente no cache do React Query, mas isso criaria um acoplamento maior entre a regra da aplicação e as chaves de cache.

Optei por um store Zustand específico para as ofertas concluídas.

Dessa forma, esse estado permanece disponível durante a navegação, pode ser testado isoladamente e não interfere na responsabilidade do React Query de gerenciar os dados recebidos da API.

Assim como os demais stores, esse estado existe apenas durante a sessão atual.

## Histórico

O histórico registra os acordos efetivamente concluídos.

Cada entrada mantém as informações necessárias para apresentação da operação, incluindo ofertas, valor, forma de pagamento e data de conclusão.

A gravação ocorre somente quando o fluxo chega ao ponto considerado concluído.

Por isso, cancelar o diálogo de pagamento não adiciona uma entrada ao histórico.

Mantive a tela responsável apenas pela apresentação e ordenação dos registros, reutilizando os utilitários existentes para formatação de moeda e data.

## MSW e simulação da API

Utilizei MSW para simular a API tanto no desenvolvimento quanto nos testes.

A aplicação continua realizando requisições HTTP normalmente para endpoints como:

```text id="m90jn1"
/api/offers
/api/feature-flags/checkoutV2
/api/checkout
```

No ambiente de desenvolvimento, essas chamadas são interceptadas pelo service worker no navegador.

Nos testes, os mesmos comportamentos são simulados pelo MSW em Node.

Essa abordagem mantém a camada de aplicação independente dos mocks. A substituição por um backend real não exige alterar as telas ou criar caminhos específicos para dados fictícios.

O MSW não é iniciado no build de produção.

## Tratamento de erros

Procurei tratar falhas mantendo a aplicação em um estado previsível para o usuário.

Um erro durante a confirmação do checkout, por exemplo, não deve limpar o carrinho nem registrar o acordo como concluído.

Da mesma forma, uma falha ao consultar a feature flag utiliza o fluxo simplificado como fallback.

A intenção foi evitar estados parcialmente concluídos e garantir que erros de infraestrutura não produzam alterações incorretas no estado da aplicação.

### Escolha do runner de testes

Durante a definição da estratégia de testes, considerei tanto Jest quanto Vitest.

O Jest seria uma escolha válida pela maturidade do ecossistema e pela ampla adoção em aplicações React, além da minha própria experiência em trabalhos anteriores. Como o projeto, porém, estava sendo iniciado do zero e não existia uma infraestrutura de testes anterior que precisasse ser preservada, optei pelo Vitest.

Para este contexto, ele atende aos cenários necessários com uma configuração mais enxuta, boa experiência com TypeScript e uma API próxima à do Jest, além de integrar sem dificuldade com Testing Library e MSW.

Caso o projeto já possuísse uma base consolidada em Jest ou padrões internos construídos sobre ele, eu evitaria uma migração sem benefício concreto. Neste caso, como não havia esse legado, preferi a alternativa mais simples para o escopo atual.

### Abordagem dos testes

Os testes utilizam Vitest, Testing Library e MSW.

Priorizei testes orientados ao comportamento da aplicação em vez de testar detalhes internos de implementação.

Entre os principais cenários estão:

- login e logout;
- proteção das rotas;
- fluxo de checkout com a feature flag habilitada e desabilitada;
- Pix e boleto;
- cancelamento da finalização;
- falhas da API;
- fallback da feature flag;
- gravação do histórico;
- remoção de ofertas concluídas;
- gerenciamento do carrinho;
- stores;
- formatação de moeda e data;
- cliente HTTP e tratamento de erros.

O MSW também permite alterar respostas por teste, o que facilita validar cenários de erro sem introduzir condicionais específicas no código da aplicação.

Sobre cobertura: o relatório de cobertura é gerado como informação (`npm run test:coverage`), mas não como exigência de 100% por arquivo. Em uma revisão posterior, removi testes que existiam apenas para cumprir threshold — testes de setters triviais de store, smoke tests e assertivas sobre constantes — mantendo apenas testes que protegem comportamento real. Cobertura menor com testes que fazem sentido é preferível ao inverso; branches defensivos (guards contra estado inválido) ficam deliberadamente sem teste dedicado.

## Convenções de código

Mantive algumas convenções para tornar o código previsível e uniforme:

- componentes e funções são escritos com arrow functions;
- helpers puros permanecem fora dos componentes quando não dependem do estado do React;
- imports são agrupados por origem e responsabilidade;
- os textos da interface ficam em `src/content`;
- estilos e tokens visuais ficam centralizados sempre que possível;
- o Prettier define a formatação final do código.

A configuração atual utiliza aspas simples, não utiliza ponto e vírgula e limita as linhas a 100 caracteres.

O objetivo dessas convenções é manter um padrão consistente de escrita e organização do código, evitando que preferências individuais gerem diferenças desnecessárias entre arquivos. Com uma base mais uniforme e previsível, a leitura e a compreensão do código se tornam mais simples.

## Decisões de escopo e trade-offs

Algumas funcionalidades poderiam ser mais completas em uma aplicação de produção, mas optei por não adicionar complexidade que não contribuísse diretamente para o objetivo do desafio.

### Autenticação

O login é apenas demonstrativo, conforme previsto no escopo do desafio.

Como foi explicitamente informado que não era necessário implementar uma autenticação real, optei por não adicionar complexidade a esse fluxo e concentrei o esforço de desenvolvimento nos requisitos funcionais e técnicos propostos.

Em uma aplicação real, essa camada exigiria autenticação no backend, gerenciamento seguro de sessão, autorização e tratamento adequado das credenciais.

### Persistência

Carrinho, sessão, histórico e ofertas concluídas são estados em memória.

Em um produto real, parte dessas informações provavelmente seria persistida no backend ou em outro mecanismo adequado ao requisito de negócio.

### Backend

O MSW representa os contratos necessários para o frontend, mas não substitui uma API real em produção.

### Perfil

As informações exibidas no perfil são fictícias e derivadas do usuário informado no login. Evitei criar um fluxo adicional de API apenas para sustentar uma funcionalidade demonstrativa.

### Complexidade arquitetural

Evitei criar camadas ou abstrações sem uso concreto.

Para o tamanho atual do projeto, considerei mais importante manter responsabilidades claras e código fácil de navegar do que introduzir padrões adicionais apenas para aumentar a quantidade de abstrações.

## Considerações finais

As decisões deste projeto foram orientadas principalmente por separação de responsabilidades, previsibilidade e simplicidade.

Busquei demonstrar não apenas a implementação dos fluxos solicitados, mas também uma estrutura que permita entender onde cada responsabilidade está localizada e como a aplicação poderia evoluir.

Quando precisei escolher entre uma solução mais sofisticada e uma solução mais simples que atendesse corretamente ao problema, priorizei a alternativa com menor complexidade e intenção mais clara.
