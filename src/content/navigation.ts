export const navigationContent = {
  menuButtonAria: 'Abrir menu',
  closeMenuAria: 'Fechar menu',
  cartAria: 'Carrinho',
  offers: 'Ofertas',
  cart: 'Carrinho',
  cartBadge: (count: number) =>
    count > 0 ? `Carrinho com ${count} ${count === 1 ? 'oferta' : 'ofertas'}` : 'Carrinho vazio',
} as const
