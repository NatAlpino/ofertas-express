export const cartContent = {
  title: 'Seu carrinho',
  subtitle: 'Confira suas ofertas selecionadas.',
  offerLabel: 'Oferta',
  totalLabel: 'Total',
  empty: 'Seu carrinho está vazio.',
  emptyCta: 'Ver ofertas disponíveis',
  checkoutCta: 'Ir para o checkout',
  removeAria: (offerTitle: string) => `Remover ${offerTitle}`,
} as const
