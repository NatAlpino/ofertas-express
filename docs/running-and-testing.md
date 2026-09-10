# Como subir, testar e cuidar do código

Um guia direto para rodar o projeto no seu máquina. Todos os comandos abaixo eu executei aqui e saíram zerados.

## Antes de começar

Você precisa de **Node.js 20+** e **npm**. Depois de clonar, instale as dependências:

```bash
npm install
```

Não existe backend para subir: a API é simulada pelo MSW. O service worker dele já está gerado em `public/mockServiceWorker.js` e é commitado no repositório, então nada mais precisa ser feito nesse sentido.

## Subindo a aplicação

```bash
npm run dev
```

Acesse **http://localhost:3000** — você cai direto na tela de login. É uma tela puramente visual: qualquer usuário e senha entram no sistema, não existe validação. Em desenvolvimento, o app liga o MSW no navegador e todas as chamadas a `/api/*` (ofertas, feature flag, checkout) são respondidas localmente. Rotas disponíveis:

- `/login` — entrada do sistema (fora do menu lateral, sem chrome)
- `/` — lista de ofertas
- `/carrinho` — carrinho
- `/checkout` — confirmação do acordo
- `/historico` — acordos já pagos (conta, data e forma de pagamento)
- `/perfil` — nome de usuário e e-mail (fictício, derivado do usuário logado)

### Build e produção

```bash
npm run build   # gera a versão de produção (type check incluído)
npm start       # serve a versão de produção
```

Uma observação importante: em produção (`npm start`) o MSW **não** é iniciado — os mocks são só para desenvolvimento e testes. Sem um backend real por trás, o app em modo produção não tem de onde buscar os dados.

## Rodando os testes

```bash
npm test              # suíte completa, uma vez
npm run test:watch    # recarrega enquanto você edita
npm run test:coverage # com relatório de cobertura
```

A suíte usa **Vitest** com ambiente **jsdom**, **Testing Library** para interagir como o usuário e **MSW em Node** para responder as mesmas rotas da API. Estão cobertos:

- fluxos de checkout ponta a ponta (flag desligada, flag ligada com Pix e com boleto, cancelamento do modal, erro de API, fallback da flag);
- gravação do histórico (Pix, boleto e acordo direto — cancelar o modal não grava nada);
- login, logout e a guarda de rotas (sem sessão, qualquer tela interna redireciona para `/login`);
- remoção das ofertas concluídas da lista;
- carrinho, sessão, histórico e store de ofertas concluídas (Zustand);
- formatação de moeda e data;
- cliente HTTP (`apiFetch`/`ApiError`).

## Testes usuais: rodar partes da suíte

Nem sempre você quer a suíte inteira. Para um arquivo só:

```bash
npx vitest run src/tests/session-history.test.tsx
```

Para filtrar pelo nome de um teste (útil quando você mexeu num fluxo só):

```bash
npx vitest run -t "short checkout records"
```

E no dia a dia o modo observação recarrega só o que mudou:

```bash
npm run test:watch
```

## Como simular erros

Isso é a parte mais útil de testar, e o projeto já vem com os padrões prontos.

**Nos testes.** O MSW permite trocar a resposta de qualquer rota por teste com `server.use(...)`. Os testes de checkout já mostram os dois jeitos clássicos:

```tsx
// erro 500 no checkout — a tela mostra o alerta e o carrinho continua intacto
server.use(
  http.post('/api/checkout', () =>
    HttpResponse.json({ message: 'Erro interno, tente mais tarde' }, { status: 500 })
  )
)

// feature flag fora do ar — o app cai no fluxo curto, que é o fallback seguro
server.use(
  http.get('/api/feature-flags/checkoutV2', () =>
    HttpResponse.json({ message: 'flag service down' }, { status: 500 })
  )
)
```

Para inventar um cenário novo, copie um desses blocos, troque a rota, o status e o corpo, e escreva o teste em cima — a tela deve continuar utilizável e informando o usuário em português.

**No navegador (dev).** Duas opções sem mexer no código:

- **Desligar a feature flag** — em `src/mocks/handlers.ts`, a rota `/api/feature-flags/checkoutV2` responde `{ enabled: true }`. Troque para `false`, salve, e o checkout volta ao fluxo curto (sem escolha de pagamento). É o jeito mais rápido de ver o comportamento antigo.
- **Simular queda de rede** — com o `npm run dev` no ar, abra o DevTools, vá na aba **Network** e troque a conectividade para **Offline**, depois tente confirmar o acordo. O app deve cair no fallback seguro (fluxo curto) em vez de travar.

## Lint e formatação

```bash
npm run lint          # ESLint — deve sair sem erros nem warnings
npm run lint:fix      # corrige automaticamente o que der
npm run format        # Prettier reescreve os arquivos no padrão
npm run format:check  # só verifica, sem escrever
```

O padrão de formatação (definido em `.prettierrc`): aspas simples, sem ponto e vírgula, largura de linha 100. Rode `npm run format` antes de commitar para não quebrar o `format:check`.

## Checklist antes de commitar

```bash
npm run lint && npm test && npm run build && npm run format:check
```

Se os quatro passarem, o código está no padrão do projeto.

## Verificação visual rápida

Com o `npm run dev` no ar, abra o DevTools do navegador e use o **Toggle device toolbar** para alternar entre uma largura de celular e de desktop. No desktop o menu lateral fica exposto; em telas estreitas (mobile ou desktop com a janela reduzida abaixo de 900px) ele vira um botão hambúrguer. Vale testar também o caminho feliz: adicionar ofertas, ir ao carrinho, checkout, escolher Pix ou boleto, confirmar, ver o modal e concluir — a oferta some da lista no final.
