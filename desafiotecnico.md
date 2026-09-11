# DESAFIO TÉCNICO

### O que você vai construir:

Um app chamado Ofertas Express, feito em Next.js (App Router ou Pages Router, à sua escolha) + React + TypeScript.
Ele deve permitir:
• ver uma lista de ofertas
• adicionar ofertas a um carrinho
• fechar um checkout simples

O checkout muda conforme uma feature flag:
• flag desligada: fluxo curto, só confirmar
• flag ligada: aparece a escolha de pagamento (Pix ou boleto) antes de confirmar
Vamos enviar também um design de referência (imagem/mockup) pra servir de guia visual. Não precisa ficar idêntico pixel a
pixel, mas a tela deve seguir a mesma ideia de layout e hierarquia.

### O que pedimos na entrega:

• Next.js + React + TypeScript
• React Query para dados da API (lista de ofertas, flag, checkout)
• Zustand para o carrinho (estado global)
• Estado local onde fizer sentido (modal, loading de botão, seleção de pagamento etc.)
• Acessibilidade
• MSW para simular a API no desenvolvimento e nos testes
• 2 a 3 testes de comportamento (Testing Library + MSW)
• tratamento de erro no checkout (ex.: API retornando 500)
• se a API da feature flag falhar, usar o fluxo antigo (flag off) como padrão seguro
• responsividade: o app precisa funcionar bem em mobile e desktop (não só uma largura). No celular, a experiência
deve continuar confortável; no desktop, o conteúdo não pode “quebrar” nem ficar espremido no canto

### O que não precisa

• login / autenticação real
• monorepo
• deploy
• custom server (Express)

### Entrega

Por favor, envie:

1. link do repositório
2. instruções de como rodar (install, dev, test)
3. um README curto com suas decisões (ex.: por que Zustand no carrinho e React Query nas ofertas
