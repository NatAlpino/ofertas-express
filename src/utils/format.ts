const brlFormatter = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
})

export function formatBRL(cents: number): string {
  return brlFormatter.format(cents / 100)
}

export function discountPercent(originalDebt: number, offerPrice: number): number {
  if (originalDebt <= 0) return 0
  return Math.round((1 - offerPrice / originalDebt) * 100)
}
