export const navigationContent = {
  menuButtonAria: 'Abrir menu',
  cartAria: 'Carrinho',
  offers: 'Ofertas',
  cart: 'Carrinho',
  history: 'Histórico',
  profile: 'Perfil',
  exit: 'Sair',
  cartBadge: (count: number) =>
    count > 0 ? `Carrinho com ${count} ${count === 1 ? 'oferta' : 'ofertas'}` : 'Carrinho vazio',
} as const
