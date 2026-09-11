const brlFormatter = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
})

const dateFormatter = new Intl.DateTimeFormat('pt-BR', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
})

export const formatBRL = (cents: number): string => brlFormatter.format(cents / 100)

export const formatDate = (isoDate: string): string => {
  const date = new Date(isoDate)
  if (Number.isNaN(date.getTime())) return ''
  return dateFormatter.format(date)
}

export const discountPercent = (originalDebt: number, offerPrice: number): number => {
  if (originalDebt <= 0) return 0
  return Math.max(0, Math.round((1 - offerPrice / originalDebt) * 100))
}
